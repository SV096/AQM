const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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
  country: String,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique user-city combination
favoriteSchema.index({ userId: 1, city: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
