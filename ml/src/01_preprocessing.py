"""
Data Preprocessing Script
Cleans and combines raw Beijing and India air quality data
Generates processed CSVs for model training
"""

import pandas as pd
import numpy as np
import os
from pathlib import Path

# Paths
RAW_DATA_DIR = Path(__file__).parent.parent / "data" / "raw"
PROCESSED_DATA_DIR = Path(__file__).parent.parent / "data" / "processed"

print("=" * 60)
print("🔄 DATA PREPROCESSING PIPELINE")
print("=" * 60)

# ============================================
# STEP 1: Load Beijing Data
# ============================================
print("\n📍 Loading Beijing Data...")
beijing_files = list((RAW_DATA_DIR / "beijing").glob("*.csv"))
beijing_dfs = []

for file in beijing_files:
    try:
        df = pd.read_csv(file)
        beijing_dfs.append(df)
        print(f"  ✅ Loaded {file.name} ({len(df)} rows)")
    except Exception as e:
        print(f"  ❌ Error loading {file.name}: {e}")

if beijing_dfs:
    beijing_data = pd.concat(beijing_dfs, ignore_index=True)
    print(f"📊 Total Beijing records: {len(beijing_data)}")
else:
    beijing_data = pd.DataFrame()

# ============================================
# STEP 2: Load India Data
# ============================================
print("\n📍 Loading India Data...")
india_files = list((RAW_DATA_DIR / "india").glob("*.csv"))
india_dfs = []

for file in india_files:
    try:
        df = pd.read_csv(file)
        india_dfs.append(df)
        print(f"  ✅ Loaded {file.name} ({len(df)} rows)")
    except Exception as e:
        print(f"  ❌ Error loading {file.name}: {e}")

if india_dfs:
    india_data = pd.concat(india_dfs, ignore_index=True)
    print(f"📊 Total India records: {len(india_data)}")
else:
    india_data = pd.DataFrame()

# ============================================
# STEP 3: Data Cleaning
# ============================================
print("\n🧹 Cleaning Data...")

def clean_dataset(df, source):
    """Clean and standardize dataset"""
    print(f"\n  Cleaning {source} data:")
    
    # Handle missing values
    initial_rows = len(df)
    df = df.dropna(subset=['PM2.5', 'PM10'] if 'PM2.5' in df.columns else [])
    print(f"    - Removed rows with missing PM values: {initial_rows - len(df)}")
    
    # Remove duplicates
    initial_rows = len(df)
    df = df.drop_duplicates()
    print(f"    - Removed duplicates: {initial_rows - len(df)}")
    
    # Remove outliers (PM2.5 > 1000)
    if 'PM2.5' in df.columns:
        initial_rows = len(df)
        df = df[df['PM2.5'] <= 1000]
        print(f"    - Removed extreme outliers: {initial_rows - len(df)}")
    
    print(f"    ✅ Final records: {len(df)}")
    return df

if not beijing_data.empty:
    beijing_data = clean_dataset(beijing_data, "Beijing")

if not india_data.empty:
    india_data = clean_dataset(india_data, "India")

# ============================================
# STEP 4: Save Processed Data
# ============================================
print("\n💾 Saving Processed Data...")

PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

if not beijing_data.empty:
    beijing_path = PROCESSED_DATA_DIR / "beijing_processed.csv"
    beijing_data.to_csv(beijing_path, index=False)
    print(f"  ✅ Saved: {beijing_path} ({len(beijing_data)} rows)")

if not india_data.empty:
    india_path = PROCESSED_DATA_DIR / "india_processed.csv"
    india_data.to_csv(india_path, index=False)
    print(f"  ✅ Saved: {india_path} ({len(india_data)} rows)")

# ============================================
# STEP 5: Dataset Info
# ============================================
print("\n📋 Dataset Information:")

dataset_info = {
    "Source": ["Beijing", "India"],
    "Records": [len(beijing_data), len(india_data)],
    "Date Range": ["2013-03-01 to 2017-02-28", "2015-03-01 onwards"],
    "Stations": [12, "Multiple"]
}

info_df = pd.DataFrame(dataset_info)
info_path = PROCESSED_DATA_DIR / "dataset_info.csv"
info_df.to_csv(info_path, index=False)
print(f"\n{info_df.to_string()}")
print(f"\n  ✅ Saved: {info_path}")

print("\n" + "=" * 60)
print("✅ PREPROCESSING COMPLETE!")
print("=" * 60)
