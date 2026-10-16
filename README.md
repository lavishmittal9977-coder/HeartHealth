# Heartwise — Heart Disease Logistic Regression Demo

A responsive HTML/CSS/JavaScript frontend connected to a Flask API that loads `models/Logisticmodel.pkl`.

## Important: confirm the feature names and order first

The uploaded model accepts **15 numeric features**, but the pickle file does not contain the original feature names. `feature_config.json` currently uses a reasonable, editable set of 15 health fields as a starting point. **Before relying on any prediction, replace these fields and their order with the exact columns used to create `X` during training**, excluding `HeartDiseaseorAttack`. Also confirm each field's encoding and ranges. A model can return a result even when the input columns are in the wrong order; that result would be meaningless.

## Run locally (Windows)

1. Extract the ZIP.
2. Open a terminal in this folder.
3. Create and activate a virtual environment (recommended):

   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Start the server:

   ```bash
   python app.py
   ```

6. Open `http://127.0.0.1:5000` in your browser.

## Files

- `app.py` — Flask routes, validation, model inference
- `models/Logisticmodel.pkl` — your uploaded model
- `feature_config.json` — editable fields, labels, allowed values, and feature order
- `templates/index.html` — page structure
- `static/style.css` — responsive design
- `static/script.js` — form validation and API request

## API

`POST /predict` accepts JSON with the feature keys from `feature_config.json`. It returns the predicted class, label, and class-1 probability when the model supports `predict_proba`.

## Medical disclaimer

This is an educational project, not a clinical tool. Do not use it to diagnose, rule out, or make treatment decisions about heart disease. Seek advice from a qualified healthcare professional for medical concerns.

## Model compatibility and safety

The pickle was created with scikit-learn 1.6.1; `requirements.txt` pins that version. Only load pickle files you trust, because deserializing untrusted pickle files can execute code.
