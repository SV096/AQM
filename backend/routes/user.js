const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const History = require('../models/History');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// Update favorite city
router.put('/favorite-city', authMiddleware, async (req, res) => {
  try {
    const { city } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { favoriteCity: city },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating favorite city' });
  }
});

// Add favorite
router.post('/favorites', authMiddleware, async (req, res) => {
  try {
    const { city, latitude, longitude, country } = req.body;
    
    const favorite = new Favorite({
      userId: req.userId,
      city,
      latitude,
      longitude,
      country
    });
    await favorite.save();
    
    res.status(201).json({ success: true, favorite });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'City already in favorites' 
      });
    }
    res.status(500).json({ success: false, message: 'Error adding favorite' });
  }
});

// Get all favorites
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId });
    res.json({ success: true, favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching favorites' });
  }
});

// Delete favorite
router.delete('/favorites/:id', authMiddleware, async (req, res) => {
  try {
    await Favorite.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Favorite removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing favorite' });
  }
});

// Get history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = await History.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching history' });
  }
});

// Clear history
router.delete('/history', authMiddleware, async (req, res) => {
  try {
    await History.deleteMany({ userId: req.userId });
    res.json({ success: true, message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error clearing history' });
  }
});

module.exports = router;
