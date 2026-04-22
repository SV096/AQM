const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB connection error:', err));

// ============================================
// ML Model Initialization
// ============================================
const { loadAQIModels, isModelsLoaded } = require('./ml/modelLoader');

// Initialize ML models on startup
async function initializeML() {
  try {
    console.log('🤖 Initializing ML models...');
    await loadAQIModels();
    if (isModelsLoaded()) {
      console.log('✅ ML models initialized successfully');
    } else {
      console.log('⚠️ Models not fully loaded, using fallback predictions');
    }
  } catch (err) {
    console.error('❌ ML initialization error:', err);
    console.log('⚠️ Continuing without ML models, will use fallback predictions');
  }
}

initializeML();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/forecast', require('./routes/forecast'));
app.use('/api/user', require('./routes/user'));
app.use('/api/weather', require('./routes/weather'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'AQM Backend is running',
    mlModelsLoaded: isModelsLoaded()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`═════════════════════════════════════════`);
  console.log(`🚀 AQM Backend Server Running`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`═════════════════════════════════════════`);
});
