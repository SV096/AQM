/**
 * Python XGBoost Model Inference Wrapper
 * 
 * Calls Python inference.py to get real ML predictions
 * from pre-trained XGBoost models
 */

const { spawn } = require('child_process');
const path = require('path');

let modelStats = {
  successfulPredictions: 0,
  failedPredictions: 0,
  averageResponseTime: 0
};

/**
 * Make AQI predictions using Python XGBoost inference
 * 
 * @param {Array} features - 42-element feature array
 * @returns {Promise<Object>} Contains aqi_1d and aqi_5d predictions
 */
async function predictWithML(features) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    try {
      // Validate input
      if (!Array.isArray(features) || features.length !== 42) {
        throw new Error(`Expected 42 features, got ${features.length}`);
      }

      // Path to Python inference script - support both local dev and Docker deployment
      const pythonScriptPath = path.join(__dirname, '../../ml/inference.py');

      // Determine Python executable - try python3 first, then python
      const pythonCmd = process.env.PYTHON_CMD || 'python3';

      console.log(`🐍 Using Python command: ${pythonCmd}`);
      console.log(`📍 Inference script path: ${pythonScriptPath}`);

      // Spawn Python process with increased timeout for model loading
      const python = spawn(pythonCmd, [pythonScriptPath, JSON.stringify(features)], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000 // 60 second timeout for model loading + inference
      });

      let stdout = '';
      let stderr = '';

      // Capture stdout
      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      // Capture stderr (for debugging)
      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle process completion
      python.on('close', (code) => {
        const responseTime = Date.now() - startTime;

        if (code === 0) {
          try {
            const result = JSON.parse(stdout);

            if (result.success) {
              modelStats.successfulPredictions++;
              modelStats.averageResponseTime =
                (modelStats.averageResponseTime + responseTime) / 2;

              console.log(`✅ ML Inference successful (${responseTime}ms)`);
              console.log(`   - 1-day AQI: ${result.aqi_1d}`);
              console.log(`   - 5-day AQI: ${result.aqi_5d}`);

              resolve(result);
            } else {
              throw new Error(result.error || 'Unknown inference error');
            }
          } catch (parseErr) {
            reject(new Error(`Failed to parse Python output: ${parseErr.message}`));
          }
        } else {
          modelStats.failedPredictions++;
          console.error(`❌ Python process failed with code ${code}`);
          if (stderr) console.error(`   stderr: ${stderr}`);
          reject(new Error(`Python inference failed with code ${code}`));
        }
      });

      // Handle process errors
      python.on('error', (err) => {
        modelStats.failedPredictions++;
        console.error(`❌ Failed to spawn Python process: ${err.message}`);

        // Check if it's a "command not found" error
        if (err.code === 'ENOENT') {
          console.error(`⚠️ Python executable not found at: ${pythonCmd}`);
          console.error('💡 Try setting PYTHON_CMD environment variable to path of python/python3');
          reject(new Error(`Python not found. Install Python or set PYTHON_CMD env var. Details: ${err.message}`));
        } else {
          reject(err);
        }
      });

    } catch (err) {
      modelStats.failedPredictions++;
      console.error(`❌ Prediction error: ${err.message}`);
      reject(err);
    }
  });
}

/**
 * Get prediction statistics
 */
function getPredictionStats() {
  return {
    ...modelStats,
    successRate: modelStats.successfulPredictions + modelStats.failedPredictions > 0
      ? ((modelStats.successfulPredictions / (modelStats.successfulPredictions + modelStats.failedPredictions)) * 100).toFixed(1) + '%'
      : 'N/A'
  };
}

module.exports = {
  predictWithML,
  getPredictionStats
};
