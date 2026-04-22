const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  city: {
    type: String,
    required: true
  },
  aqi: Number,
  pollutants: Object,
  weather: Object,
  action: {
    type: String,
    enum: ['search', 'view', 'favorite'],
    default: 'search'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
historySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('History', historySchema);
