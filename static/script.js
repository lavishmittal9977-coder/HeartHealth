const form = document.getElementById('prediction-form');
const submitBtn = document.getElementById('submit-btn');
const resultCard = document.getElementById('result-card');
const resultTitle = document.getElementById('result-title');
const resultDescription = document.getElementById('result-description');
const resultDisclaimer = document.getElementById('result-disclaimer');
const resultIcon = document.getElementById('result-icon');
const probabilityWrap = document.getElementById('probability-wrap');
const probabilityValue = document.getElementById('probability-value');
const probabilityBar = document.getElementById('probability-bar');

function clearErrors() {
  document.querySelectorAll('.field').forEach(field => {
    field.classList.remove('invalid');
    field.querySelector('.field-error').textContent = '';
  });
}
function showErrors(errors) {
  clearErrors();
  Object.entries(errors || {}).forEach(([name, message]) => {
    const field = document.querySelector(`[data-field="${CSS.escape(name)}"]`);
    if (field) {
      field.classList.add('invalid');
      field.querySelector('.field-error').textContent = message;
    }
  });
}
function collectFormData() {
  const data = {};
  new FormData(form).forEach((value, key) => data[key] = value);
  return data;
}
function showResult(data) {
  resultCard.classList.remove('hidden', 'positive');
  resultIcon.textContent = data.prediction === 1 ? '!' : '✓';
  if (data.prediction === 1) {
    resultCard.classList.add('positive');
    resultTitle.textContent = 'Higher likelihood indicated';
    resultDescription.textContent = 'The model predicted class 1 for the values you entered. This does not mean you have heart disease.';
  } else {
    resultTitle.textContent = 'Lower likelihood indicated';
    resultDescription.textContent = 'The model predicted class 0 for the values you entered. This does not rule out heart disease or other health risks.';
  }
  if (typeof data.probability === 'number') {
    probabilityWrap.classList.remove('hidden');
    probabilityValue.textContent = `${data.probability}%`;
    probabilityBar.style.width = `${Math.max(0, Math.min(100, data.probability))}%`;
  } else {
    probabilityWrap.classList.add('hidden');
  }
  resultDisclaimer.textContent = data.disclaimer || 'Model-generated estimate based on the information provided.';
  resultCard.scrollIntoView({behavior: 'smooth', block: 'center'});
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  clearErrors();
  if (!form.reportValidity()) return;
  submitBtn.disabled = true;
  submitBtn.querySelector('span:first-child').textContent = 'Predicting…';
  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(collectFormData())
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      if (data.errors) showErrors(data.errors);
      else window.alert(data.message || 'Unable to run prediction. Please try again.');
      return;
    }
    showResult(data);
  } catch (error) {
    window.alert('Could not connect to the Flask server. Make sure app.py is running.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span:first-child').textContent = 'Run prediction';
  }
});
form.addEventListener('reset', () => {
  setTimeout(() => {
    clearErrors();
    resultCard.classList.add('hidden');
  }, 0);
});
document.querySelectorAll('.field input, .field select').forEach(input => {
  input.addEventListener('change', () => {
    const field = input.closest('.field');
    field.classList.remove('invalid');
    field.querySelector('.field-error').textContent = '';
  });
});
