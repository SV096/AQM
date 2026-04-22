/**
 * Weather-Based Feature Engineering for AQI Forecasting
 * 
 * Converts live AQI data + 5-day weather forecast into 40-feature vector
 * for ML model inference. No historical data storage required!
 * 
 * Features (40 total):
 * - Current pollutants (6): PM2.5, PM10, NO2, SO2, CO, O3
 * - Current weather (6): temp, wind, humidity, pressure, rain, clouds
 * - Weather forecast patterns (12): avg temp, wind trend, rain total, etc.
 * - Temporal (4): hour, day_of_week, month, season
 * - Padding/additional weather analysis (12)
 */

/**
 * Engineer 40-feature vector from live data + weather forecast
 * 
 * @param {Object} currentAQI - Current AQI from WAQI { PM25, PM10, NO2, SO2, CO, O3, AQI }
 * @param {Object} currentWeather - Current weather from OpenWeather
 * @param {Array} weatherForecast - 5-day weather forecast (array of daily forecasts)
 * @returns {Array} 40-element feature array ready for ML model
 */
function engineerWeatherFeatures(currentAQI, currentWeather, weatherForecast) {
  const features = [];

  // ============================================
  // GROUP A: CURRENT POLLUTANTS (6 features)
  // ============================================
  features.push(
    currentAQI.PM25 || 0,  // PM2.5 (µg/m³)
    currentAQI.PM10 || 0,  // PM10 (µg/m³)
    currentAQI.NO2 || 0,   // NO2 (ppb)
    currentAQI.SO2 || 0,   // SO2 (ppb)
    currentAQI.CO || 0,    // CO (ppm)
    currentAQI.O3 || 0     // O3 (ppb)
  );

  // ============================================
  // GROUP B: CURRENT WEATHER (6 features)
  // ============================================
  const temp = currentWeather.temp || 20;
  const windSpeed = currentWeather.wind_speed || 0;
  const humidity = currentWeather.humidity || 50;
  const pressure = currentWeather.pressure || 1013;
  const rain = currentWeather.rain || 0;
  const clouds = currentWeather.clouds || 0;

  features.push(
    temp,           // Temperature (°C)
    windSpeed,      // Wind speed (m/s)
    humidity,       // Humidity (%)
    pressure,       // Pressure (mb)
    rain,           // Rain (mm)
    clouds          // Cloud cover (%)
  );

  // ============================================
  // GROUP C: 5-DAY WEATHER FORECAST PATTERNS (12 features)
  // ============================================

  if (!weatherForecast || weatherForecast.length === 0) {
    // Fallback: if no forecast, use current values repeated
    console.warn('⚠️ No weather forecast available, using current values');
    features.push(
      temp, 0, windSpeed, 0, 0, windSpeed, 0, 5,
      pressure, humidity, clouds, temp
    );
  } else {
    // Calculate forecast-based features
    const forecastTemps = weatherForecast.map(d => d.temp || temp);
    const forecastWinds = weatherForecast.map(d => d.wind_speed || windSpeed);
    const forecastRains = weatherForecast.map(d => d.rain || 0);
    const forecastPressures = weatherForecast.map(d => d.pressure || pressure);
    const forecastHumidities = weatherForecast.map(d => d.humidity || humidity);

    // 1. Average temperature over 5 days
    const avgTemp = average(forecastTemps);
    features.push(avgTemp);

    // 2. Temperature trend: last day - first day
    // Negative = cooling (bad for AQI), positive = warming (good)
    const tempTrend = (forecastTemps[forecastTemps.length - 1] || temp) - (forecastTemps[0] || temp);
    features.push(tempTrend);

    // 3. Average wind speed over 5 days
    const avgWind = average(forecastWinds);
    features.push(avgWind);

    // 4. Wind speed trend: last day - first day
    // Positive = wind increasing (good), negative = wind decreasing (bad)
    const windTrend = (forecastWinds[forecastWinds.length - 1] || windSpeed) - (forecastWinds[0] || windSpeed);
    features.push(windTrend);

    // 5. Total rain expected in 5 days (mm)
    // More rain = lower AQI (particles settle, get washed)
    const totalRain = sum(forecastRains);
    features.push(totalRain);

    // 6. Maximum wind speed in 5-day forecast
    // Higher max wind = better dispersion
    const maxWind = Math.max(...forecastWinds, windSpeed);
    features.push(maxWind);

    // 7. Days with rain expected
    // More rainy days = lower AQI
    const rainyDays = forecastRains.filter(r => r > 0.5).length;
    features.push(rainyDays);

    // 8. Temperature volatility (range)
    // High volatility = weather system moving = good
    const minTemp = Math.min(...forecastTemps, temp);
    const maxTemp = Math.max(...forecastTemps, temp);
    const tempVolatility = maxTemp - minTemp;
    features.push(tempVolatility);

    // 9. Average pressure over 5 days
    const avgPressure = average(forecastPressures);
    features.push(avgPressure);

    // 10. Average humidity over 5 days
    const avgHumidity = average(forecastHumidities);
    features.push(avgHumidity);

    // 11. Average cloud cover over 5 days
    const forecastClouds = weatherForecast.map(d => d.clouds || clouds);
    const avgClouds = average(forecastClouds);
    features.push(avgClouds);

    // 12. Maximum temperature in forecast
    features.push(maxTemp);
  }

  // ============================================
  // GROUP D: TEMPORAL FEATURES (4 features)
  // ============================================
  const now = new Date();
  const hour = now.getHours();        // 0-23
  const dayOfWeek = now.getDay();     // 0-6 (0=Sunday)
  const month = now.getMonth() + 1;   // 1-12
  const season = getSeason(month);    // 1-4

  features.push(
    hour,
    dayOfWeek,
    month,
    season
  );

  // ============================================
  // TOTAL: 6 + 6 + 12 + 4 = 28 features
  // Need 14 more for compatibility with trained model
  // ============================================

  // Add additional weather analysis features to reach 42
  const additionalFeatures = getAdditionalWeatherFeatures(
    currentWeather,
    weatherForecast,
    currentAQI
  );
  features.push(...additionalFeatures);

  // Ensure we have exactly 42 features
  while (features.length < 42) {
    features.push(0); // Pad with zeros if needed
  }

  // Truncate if somehow over 42
  return features.slice(0, 42);
}

/**
 * Generate additional weather analysis features
 * @returns {Array} 14 additional features
 */
function getAdditionalWeatherFeatures(currentWeather, weatherForecast, currentAQI) {
  const features = [];

  // Weather stability index (0-1: how much is weather changing)
  const windStability = currentWeather.wind_speed > 0
    ? 1 / (1 + Math.abs(currentWeather.wind_speed - (weatherForecast[0]?.wind_speed || 0)))
    : 0.5;
  features.push(windStability);

  // Inversion risk score (high pressure + low wind + cooling)
  const inversionRisk = (currentWeather.pressure > 1015 ? 0.5 : 0) +
                        (currentWeather.wind_speed < 2 ? 0.3 : 0) +
                        ((weatherForecast[0]?.temp || 20) < currentWeather.temp ? 0.2 : 0);
  features.push(Math.min(inversionRisk, 1));

  // Clearing potential (wind + rain + warming)
  const clearingPotential = (currentWeather.wind_speed > 3 ? 0.4 : 0) +
                           (sum((weatherForecast || []).map(d => d.rain || 0)) > 2 ? 0.3 : 0) +
                           (((weatherForecast[0]?.temp || 20) > currentWeather.temp) ? 0.3 : 0);
  features.push(Math.min(clearingPotential, 1));

  // AQI baseline (normalized current AQI)
  const normalizedAQI = Math.min(currentAQI.AQI / 500, 1); // 0-1 scale
  features.push(normalizedAQI);

  // Wind direction effect (0-1, simplified - we don't have direction data)
  features.push(0.5); // Default to neutral

  // Humidity-temperature interaction
  const humTempInteraction = (currentWeather.humidity / 100) * (currentWeather.temp / 40);
  features.push(humTempInteraction);

  // Pressure trend approximation
  const avgForecastPressure = average((weatherForecast || []).map(d => d.pressure || 1013));
  const pressureTrend = avgForecastPressure - (currentWeather.pressure || 1013);
  features.push(pressureTrend / 50); // Normalize to -1 to 1

  // Convection potential (high temp + low humidity = good mixing)
  const convectionPotential = (currentWeather.temp > 25 ? 0.5 : 0) +
                             (currentWeather.humidity < 60 ? 0.5 : 0);
  features.push(Math.min(convectionPotential, 1));

  // Seasonal pollution modifier
  const seasonalModifier = (month) => {
    // Winter peaks
    if ([12, 1, 2].includes(month)) return 1.3; // Winter = more pollution
    // Monsoon/rainy season helps
    if ([6, 7, 8].includes(month)) return 0.8; // Summer/monsoon = less
    return 1.0; // Spring/Fall neutral
  };
  features.push(seasonalModifier(new Date().getMonth() + 1));

  // Weather system movement indicator
  // If max wind is in forecast days 3-5, a weather system is coming
  const forecastWinds = (weatherForecast || []).map(d => d.wind_speed || 0);
  const maxWindIndex = forecastWinds.length > 0 ? forecastWinds.indexOf(Math.max(...forecastWinds)) : 2;
  features.push(maxWindIndex / 5); // 0-1: when in forecast does wind peak

  // Pollution accumulation risk (inverse of clearing potential)
  features.push(1 - (sum((weatherForecast || []).map(d => d.rain || 0)) / 10));

  // Feature 13: AQI change rate (how much AQI might improve/worsen)
  // Based on average wind speed trend
  const avgForecastWind = average((weatherForecast || []).map(d => d.wind_speed || 0));
  const windChangeRate = (avgForecastWind - currentWeather.wind_speed) / Math.max(currentWeather.wind_speed, 0.5);
  features.push(Math.max(-1, Math.min(1, windChangeRate)));

  // Feature 14: Combined meteorological favorability score (0-1)
  // How favorable are the weather conditions for good AQI
  const favorability = 
    (currentWeather.wind_speed > 2 ? 0.25 : 0) +
    (currentWeather.humidity > 40 && currentWeather.humidity < 80 ? 0.25 : 0) +
    (currentWeather.temp > 5 && currentWeather.temp < 35 ? 0.25 : 0) +
    (currentWeather.clouds > 30 ? 0.25 : 0);
  features.push(favorability);

  return features.slice(0, 14);
}

/**
 * Get season from month (1-12)
 * 1=Winter, 2=Spring, 3=Summer, 4=Fall
 */
function getSeason(month) {
  if ([12, 1, 2].includes(month)) return 1;
  if ([3, 4, 5].includes(month)) return 2;
  if ([6, 7, 8].includes(month)) return 3;
  if ([9, 10, 11].includes(month)) return 4;
  return 2;
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

module.exports = {
  engineerWeatherFeatures,
  getSeason
};
