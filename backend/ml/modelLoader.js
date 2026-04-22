/**
 * ML Model Loader
 * Loads pre-trained XGBoost models from disk
 * Models location: e:\AQM\ml\models\
 */

const fs = require('fs');
const path = require('path');

let modelsLoaded = false;
let models = {
  aqi24hModel: null,
  aqi5dModel: null
};

/**
 * Load ML models from disk
 * Loads pre-trained XGBoost models for 1-day and 5-day forecasting
 */
async function loadAQIModels() {
  try {
    console.log('📦 Attempting to load pre-trained AQI models...');

    // Paths to models relative to backend folder
    const model1DayPath = path.join(__dirname, '../../ml/models/xgb_1d_forecast.json');
    const model5DayPath = path.join(__dirname, '../../ml/models/xgb_5d_forecast.json');

    console.log(`📍 Looking for 1-day model at: ${model1DayPath}`);
    console.log(`📍 Looking for 5-day model at: ${model5DayPath}`);

    // Load 1-day model
    if (fs.existsSync(model1DayPath)) {
      models.aqi24hModel = JSON.parse(fs.readFileSync(model1DayPath, 'utf8'));
      console.log('✅ Loaded 1-day AQI forecast model');
    } else {
      console.warn('⚠️ 1-day model not found at', model1DayPath);
    }

    // Load 5-day model
    if (fs.existsSync(model5DayPath)) {
      models.aqi5dModel = JSON.parse(fs.readFileSync(model5DayPath, 'utf8'));
      console.log('✅ Loaded 5-day AQI forecast model');
    } else {
      console.warn('⚠️ 5-day model not found at', model5DayPath);
    }

    // Check if both models loaded
    if (models.aqi24hModel && models.aqi5dModel) {
      modelsLoaded = true;
      console.log('🎯 Both models loaded successfully!');
      return true;
    } else {
      modelsLoaded = false;
      console.log('⚠️ One or more models missing. Using fallback predictions.');
      return false;
    }
  } catch (err) {
    console.error('❌ Model loading failed:', err.message);
    modelsLoaded = false;
    return false;
  }
}

/**
 * Check if models are loaded and ready
 */
function isModelsLoaded() {
  return modelsLoaded && models.aqi24hModel && models.aqi5dModel;
}

/**
 * Get loaded models
 */
function getModels() {
  return models;
}

module.exports = {
  loadAQIModels,
  isModelsLoaded,
  getModels
};
