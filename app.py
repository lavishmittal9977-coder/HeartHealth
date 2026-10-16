from flask import Flask, render_template, request, jsonify
import json
import pickle
from pathlib import Path
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "Logisticmodel.pkl"
FEATURES_PATH = BASE_DIR / "feature_config.json"

app = Flask(__name__)

# Load only a model file you trust. Pickle files can execute code when loaded.
with FEATURES_PATH.open("r", encoding="utf-8") as f:
    FEATURES = json.load(f)

with MODEL_PATH.open("rb") as f:
    model = pickle.load(f)

EXPECTED_FEATURES = getattr(model, "n_features_in_", None)
if EXPECTED_FEATURES is not None and EXPECTED_FEATURES != len(FEATURES):
    raise RuntimeError(
        f"Model expects {EXPECTED_FEATURES} features, but feature_config.json "
        f"contains {len(FEATURES)}. Update the config to match training columns/order."
    )


def parse_values(payload):
    values = []
    errors = {}
    for feature in FEATURES:
        name = feature["name"]
        raw = payload.get(name, "")
        if raw is None or str(raw).strip() == "":
            errors[name] = "Please provide a value."
            continue
        try:
            value = float(raw)
        except (TypeError, ValueError):
            errors[name] = "Enter a valid number."
            continue

        if not np.isfinite(value):
            errors[name] = "Enter a finite number."
        if feature.get("type") == "select":
            allowed = [float(option["value"]) for option in feature.get("options", [])]
            if value not in allowed:
                errors[name] = "Choose one of the available options."
        else:
            if "min" in feature and value < feature["min"]:
                errors[name] = f"Minimum allowed value is {feature['min']}."
            if "max" in feature and value > feature["max"]:
                errors[name] = f"Maximum allowed value is {feature['max']}."
            if feature.get("step") == 1 and not value.is_integer():
                errors[name] = "Enter a whole number."
        values.append(value)
    return values, errors


@app.get("/")
def index():
    return render_template("index.html", features=FEATURES)


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) if request.is_json else request.form
    payload = payload or {}
    values, errors = parse_values(payload)
    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    try:
        row = np.asarray(values, dtype=float).reshape(1, -1)
        prediction = int(model.predict(row)[0])
        probability = None
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(row)[0]
            classes = list(model.classes_)
            if 1 in classes:
                probability = round(float(probabilities[classes.index(1)]) * 100, 1)
        return jsonify({
            "ok": True,
            "prediction": prediction,
            "label": "Higher likelihood indicated" if prediction == 1 else "Lower likelihood indicated",
            "probability": probability,
            "disclaimer": "Model-generated estimate based on the information provided."
        })
    except Exception as exc:
        app.logger.exception("Prediction failed")
        return jsonify({"ok": False, "message": "Prediction failed. Check that feature names, order, and encodings match model training."}), 500


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
