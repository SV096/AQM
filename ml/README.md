# ML

This folder contains the machine learning part of the Air Quality Monitoring project.

It includes:

- trained XGBoost models used by the backend
- Python inference code
- preprocessing, analysis, and training scripts

## Tech Stack

- Python
- NumPy
- pandas
- scikit-learn
- XGBoost
- matplotlib
- seaborn

## Project Structure

```text
ml/
|- data/
|  |- raw/
|  |  |- beijing/
|  |  `- india/
|  `- processed/
|- models/
|  |- xgb_1d_forecast.json
|  `- xgb_5d_forecast.json
|- results/
|  |- predictions/
|  `- visualizations/
|- src/
|  |- 01_preprocessing.py
|  |- 02_eda.py
|  |- 03_data_analysis.py
|  `- 04_model_training.py
|- .gitignore
|- inference.py
`- README.md
```

## What Each File Does

- `inference.py` - loads trained models and returns predictions
- `01_preprocessing.py` - prepares raw data for training
- `02_eda.py` - creates exploratory analysis outputs
- `03_data_analysis.py` - runs statistical analysis
- `04_model_training.py` - trains and evaluates forecast models

## Datasets

The training pipeline uses two public air quality datasets:

- `Beijing Multi-Site Air-Quality Data Set`
- `Air Quality Data in India (2015 - 2020)`

You can download these from Kaggle and place them in the raw data folders below.

### Where To Put The Raw Data

Place the downloaded files inside:

```text
ml/
`- data/
   `- raw/
      |- beijing/
      `- india/
```

Use this layout:

- Beijing dataset files -> `ml/data/raw/beijing/`
- India dataset files -> `ml/data/raw/india/`

### Datasets Used For Training

The model training pipeline uses:

- Beijing raw CSV files from `ml/data/raw/beijing/`
- India raw CSV files from `ml/data/raw/india/`

These files are first processed by:

- `src/01_preprocessing.py`

After preprocessing, the generated processed datasets are used by:

- `src/02_eda.py`
- `src/03_data_analysis.py`
- `src/04_model_training.py`

In short:

- raw Beijing and India datasets are the source data
- processed datasets are the direct inputs for analysis and model training

## Run Locally

```bash
cd ml
python src/01_preprocessing.py
python src/02_eda.py
python src/03_data_analysis.py
python src/04_model_training.py
```

## Deployment

The backend uses the model files in `ml/models/` directly for forecasting, so these files should be available in deployment.
