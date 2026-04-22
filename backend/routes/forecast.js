const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const Forecast = require('../models/Forecast');
const History = require('../models/History');
const Favorite = require('../models/Favorite');

// ML Integration Modules
const { engineerWeatherFeatures } = require('../ml/weatherFeatureEngineering');
const { predictWithML } = require('../ml/pythonInference');
const { generateForecastResponse } = require('../ml/forecastFormatter');

// Get forecast for a city (ML + Weather-Based)
router.get('/city/:city', authMiddleware, async (req, res) => {
  try {
    const { city } = req.params;

    // ============================================
    // STEP 1: Get city coordinates from OpenWeather Geo API
    // ============================================
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    if (!weatherResponse.data.length) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    const { lat, lon, name, country } = weatherResponse.data[0];

    // ============================================
    // STEP 2: Get current weather from OpenWeather
    // ============================================
    const currentWeatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    // ============================================
    // STEP 3: Get 5-day weather forecast from OpenWeather
    // ============================================
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    // ============================================
    // STEP 4: Get current AQI + pollutants from WAQI
    // ============================================
    const waqiResponse = await axios.get(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${process.env.WAQI_API_KEY}`
    );

    const currentWeather = currentWeatherResponse.data;
    const aqiData = waqiResponse.data.data;
    const forecastData = forecastResponse.data;

    // Extract current pollutants from WAQI
    const currentAQI = {
      AQI: aqiData.aqi,
      PM25: aqiData.iaqi.pm25?.v || 0,
      PM10: aqiData.iaqi.pm10?.v || 0,
      NO2: aqiData.iaqi.no2?.v || 0,
      SO2: aqiData.iaqi.so2?.v || 0,
      CO: aqiData.iaqi.co?.v || 0,
      O3: aqiData.iaqi.o3?.v || 0
    };

    // Extract current weather
    const currentWeatherData = {
      temp: currentWeather.main.temp,
      wind_speed: currentWeather.wind.speed,
      humidity: currentWeather.main.humidity,
      pressure: currentWeather.main.pressure,
      rain: currentWeather.rain?.['1h'] || 0,
      clouds: currentWeather.clouds.all,
      description: currentWeather.weather[0].description,
      icon: currentWeather.weather[0].icon
    };

    // ============================================
    // STEP 5: Process weather forecast into daily/hourly arrays
    // ============================================
    const dailyWeather = processDailyForecast(forecastData);
    const hourlyWeather = forecastData.list.slice(0, 8); // Next 24-40 hours

    // ============================================
    // STEP 6: Engineer features from live data + weather forecast
    // ============================================
    const features = engineerWeatherFeatures(
      currentAQI,
      currentWeatherData,
      dailyWeather
    );

    console.log(`✅ Engineered ${features.length} features for ${name}`);
    console.log(`📊 Current AQI from WAQI: ${currentAQI.AQI}`);
    console.log(`📊 Current Pollutants: PM2.5=${currentAQI.PM25}, PM10=${currentAQI.PM10}`);
    console.log(`🌤️ Current Weather: Temp=${currentWeatherData.temp}°C, Wind=${currentWeatherData.wind_speed}m/s, Humidity=${currentWeatherData.humidity}%`);
    console.log(`📋 Feature Sample (first 12): ${features.slice(0, 12).map(f => f.toFixed(2)).join(', ')}`);

    // ============================================
    // STEP 7: Make ML predictions using XGBoost models
    // ============================================
    let aqi24hPrediction, aqi5dPrediction;
    
    try {
      const mlPredictions = await predictWithML(features);
      aqi24hPrediction = mlPredictions.aqi_1d;
      aqi5dPrediction = mlPredictions.aqi_5d;
      console.log(`🤖 ML Predictions - 24h: ${aqi24hPrediction}, 5d: ${aqi5dPrediction}`);
      console.log(`📈 AQI Change: Current=${currentAQI.AQI} → 24h=${aqi24hPrediction} (Δ${(aqi24hPrediction - currentAQI.AQI).toFixed(0)})`);
      console.log(`📈 AQI Change: Current=${currentAQI.AQI} → 5d=${aqi5dPrediction} (Δ${(aqi5dPrediction - currentAQI.AQI).toFixed(0)})`);
    } catch (mlError) {
      console.error(`⚠️ ML prediction failed: ${mlError.message}`);
      console.error('❌ Cannot proceed without ML predictions');
      return res.status(500).json({
        success: false,
        message: 'ML model prediction failed',
        error: mlError.message
      });
    }

    // ============================================
    // STEP 8: Format response with 24h + 5d breakdowns
    // ============================================
    const completeResponse = generateForecastResponse(
      name,
      { lat, lon, country },
      currentAQI,
      currentWeatherData,
      aqi24hPrediction,
      aqi5dPrediction,
      hourlyWeather,
      dailyWeather
    );

    // ============================================
    // STEP 9: Save to database
    // ============================================
    const forecast = new Forecast({
      userId: req.userId,
      city: name,
      latitude: lat,
      longitude: lon,
      forecast24h: completeResponse.forecast_24h.predictions,
      forecast5d: completeResponse.forecast_5d.predictions,
      currentAQI: currentAQI.AQI,
      pollutants: {
        PM25: currentAQI.PM25,
        PM10: currentAQI.PM10,
        NO2: currentAQI.NO2,
        SO2: currentAQI.SO2,
        CO: currentAQI.CO,
        O3: currentAQI.O3
      },
      weather: {
        temperature: currentWeatherData.temp,
        humidity: currentWeatherData.humidity,
        windSpeed: currentWeatherData.wind_speed,
        description: currentWeatherData.description,
        icon: currentWeatherData.icon
      }
    });

    await forecast.save();

    // Save to history
    const history = new History({
      userId: req.userId,
      city: name,
      aqi: currentAQI.AQI,
      pollutants: {
        PM25: currentAQI.PM25,
        PM10: currentAQI.PM10,
        NO2: currentAQI.NO2,
        SO2: currentAQI.SO2,
        CO: currentAQI.CO,
        O3: currentAQI.O3
      },
      weather: {
        temperature: currentWeatherData.temp,
        humidity: currentWeatherData.humidity,
        windSpeed: currentWeatherData.wind_speed,
        description: currentWeatherData.description,
        icon: currentWeatherData.icon
      },
      action: 'search'
    });
    await history.save();

    // ============================================
    // STEP 10: Return complete response
    // ============================================
    res.json({
      success: true,
      data: completeResponse
    });
  } catch (err) {
    console.error('❌ Forecast error:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching forecast',
      error: err.message
    });
  }
});

// Helper function to process daily forecast from OpenWeather data
function processDailyForecast(forecastData) {
  const dailyMap = {};

  // Group forecast by day
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyMap[date]) {
      dailyMap[date] = [];
    }
    dailyMap[date].push(item);
  });

  // Calculate daily aggregates
  const dailyForecasts = Object.values(dailyMap).slice(0, 5).map(dayItems => {
    const temps = dayItems.map(item => item.main.temp);
    const winds = dayItems.map(item => item.wind.speed);
    const rains = dayItems.map(item => item.rain?.['3h'] || 0);
    const humidities = dayItems.map(item => item.main.humidity);
    const pressures = dayItems.map(item => item.main.pressure);

    return {
      temp: average(temps),
      temp_low: Math.min(...temps),
      temp_high: Math.max(...temps),
      wind_speed: average(winds),
      rain: sum(rains),
      humidity: average(humidities),
      pressure: average(pressures),
      clouds: average(dayItems.map(item => item.clouds.all)),
      condition: dayItems[0].weather[0].main,
      icon: dayItems[0].weather[0].icon
    };
  });

  return dailyForecasts;
}

/**
 * Calculate average of array
 */
function average(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Calculate sum of array
 */
function sum(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0);
}

module.exports = router;
