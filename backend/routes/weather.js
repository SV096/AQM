const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get weather for coordinates
router.get('/current/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    res.json({
      success: true,
      weather: response.data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weather'
    });
  }
});

// Get forecast for coordinates
router.get('/forecast/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    res.json({
      success: true,
      forecast: response.data.list
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching forecast'
    });
  }
});

module.exports = router;
