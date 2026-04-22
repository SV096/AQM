#!/usr/bin/env python3
"""
XGBoost Model Inference for AQI Forecasting
Loads pre-trained models and makes real ML predictions
"""

import json
import sys
import os
import numpy as np
from pathlib import Path

try:
    import xgboost as xgb
except ImportError:
    print(json.dumps({"error": "xgboost not installed. Run: pip install xgboost"}))
    sys.exit(1)


class AQIPredictor:
    """Load and use pre-trained XGBoost models for AQI forecasting"""
    
    def __init__(self):
        """Initialize model paths"""
        self.ml_dir = Path(__file__).parent
        self.model_1d_path = self.ml_dir / 'models' / 'xgb_1d_forecast.json'
        self.model_5d_path = self.ml_dir / 'models' / 'xgb_5d_forecast.json'
        
        self.model_1d = None
        self.model_5d = None
        self.loaded = False
    
    def load_models(self):
        """Load pre-trained XGBoost models from JSON files"""
        try:
            # Load 1-day model
            if not self.model_1d_path.exists():
                raise FileNotFoundError(f"1-day model not found: {self.model_1d_path}")
            
            self.model_1d = xgb.XGBRegressor()
            self.model_1d.load_model(str(self.model_1d_path))
            print(f"✅ Loaded 1-day model from {self.model_1d_path}", file=sys.stderr)
            
            # Load 5-day model
            if not self.model_5d_path.exists():
                raise FileNotFoundError(f"5-day model not found: {self.model_5d_path}")
            
            self.model_5d = xgb.XGBRegressor()
            self.model_5d.load_model(str(self.model_5d_path))
            print(f"✅ Loaded 5-day model from {self.model_5d_path}", file=sys.stderr)
            
            self.loaded = True
            return True
        
        except Exception as e:
            print(f"❌ Model loading failed: {str(e)}", file=sys.stderr)
            return False
    
    def predict(self, features):
        """
        Make AQI predictions using loaded models
        
        Args:
            features (list): 42-element feature array
        
        Returns:
            dict: Contains aqi_1d, aqi_5d predictions
        """
        if not self.loaded:
            raise RuntimeError("Models not loaded. Call load_models() first.")
        
        try:
            # Convert to numpy array
            X = np.array([features], dtype=np.float32)
            
            # Make predictions
            aqi_1d = float(self.model_1d.predict(X)[0])
            aqi_5d = float(self.model_5d.predict(X)[0])
            
            # Clamp to valid AQI range (0-500)
            aqi_1d = max(0, min(aqi_1d, 500))
            aqi_5d = max(0, min(aqi_5d, 500))
            
            return {
                'success': True,
                'aqi_1d': round(aqi_1d, 2),
                'aqi_5d': round(aqi_5d, 2),
                'model_1d_features': 42,
                'model_5d_features': 42,
                'models_used': ['xgb_1d_forecast.json', 'xgb_5d_forecast.json']
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': f"Prediction failed: {str(e)}"
            }


def main():
    """Main entry point - reads features from stdin and outputs predictions"""
    
    if len(sys.argv) < 2:
        print(json.dumps({
            'error': 'No features provided',
            'usage': 'python inference.py \'[feature1, feature2, ...]\''
        }))
        sys.exit(1)
    
    try:
        # Parse input features
        features = json.loads(sys.argv[1])
        
        if not isinstance(features, list) or len(features) != 42:
            raise ValueError(f"Expected 42 features, got {len(features)}")
        
        # Initialize predictor
        predictor = AQIPredictor()
        
        # Load models
        if not predictor.load_models():
            print(json.dumps({
                'error': 'Failed to load models',
                'aqi_1d': 0,
                'aqi_5d': 0,
                'fallback': True
            }))
            sys.exit(1)
        
        # Make predictions
        result = predictor.predict(features)
        
        # Output JSON result
        print(json.dumps(result))
        
        if result.get('success'):
            sys.exit(0)
        else:
            sys.exit(1)
    
    except json.JSONDecodeError as e:
        print(json.dumps({
            'error': f'Invalid JSON input: {str(e)}'
        }))
        sys.exit(1)
    
    except Exception as e:
        print(json.dumps({
            'error': f'Unexpected error: {str(e)}'
        }))
        sys.exit(1)


if __name__ == '__main__':
    main()
