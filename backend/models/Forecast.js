const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  city: {
    type: String,
    required: true
  },
  latitude: Number,
  longitude: Number,
  forecast24h: {
    type: Array,
    default: []
  },
  forecast5d: {
    type: Array,
    default: []
  },
  currentAQI: Number,
  pollutants: {
    PM25: Number,
    PM10: Number,
    NO2: Number,
    SO2: Number,
    CO: Number,
    O3: Number
  },
  weather: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    description: String,
    icon: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Auto delete after 24 hours
  }
});

module.exports = mongoose.model('Forecast', forecastSchema);
