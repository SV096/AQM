"""
Data Analysis and Statistical Insights
Performs comprehensive analysis of air quality data
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json

# Paths
PROCESSED_DATA_DIR = Path(__file__).parent.parent / "data" / "processed"

print("=" * 60)
print("🔬 STATISTICAL DATA ANALYSIS")
print("=" * 60)

# ============================================
# STEP 1: Load Processed Data
# ============================================
print("\n📂 Loading Processed Data...")

beijing_path = PROCESSED_DATA_DIR / "beijing_processed.csv"
india_path = PROCESSED_DATA_DIR / "india_processed.csv"

beijing_data = pd.read_csv(beijing_path) if beijing_path.exists() else pd.DataFrame()
india_data = pd.read_csv(india_path) if india_path.exists() else pd.DataFrame()

print(f"  ✅ Beijing data: {len(beijing_data)} records")
print(f"  ✅ India data: {len(india_data)} records")

# ============================================
# STEP 2: Descriptive Statistics
# ============================================
print("\n📊 Descriptive Statistics")

analysis_results = {}

if not beijing_data.empty:
    print("\n🏙️  BEIJING DATA ANALYSIS:")
    beijing_stats = beijing_data.describe()
    print(beijing_stats)
    analysis_results['Beijing'] = {
        'records': len(beijing_data),
        'columns': list(beijing_data.columns),
        'missing_values': beijing_data.isnull().sum().to_dict()
    }

if not india_data.empty:
    print("\n🇮🇳 INDIA DATA ANALYSIS:")
    india_stats = india_data.describe()
    print(india_stats)
    analysis_results['India'] = {
        'records': len(india_data),
        'columns': list(india_data.columns),
        'missing_values': india_data.isnull().sum().to_dict()
    }

# ============================================
# STEP 3: Air Quality Metrics
# ============================================
print("\n🌍 AIR QUALITY METRICS:")

def analyze_aqi(df, name):
    """Analyze AQI-related metrics"""
    print(f"\n{name}:")
    
    if 'PM2.5' in df.columns:
        pm25 = df['PM2.5']
        print(f"  PM2.5:")
        print(f"    - Mean: {pm25.mean():.2f} µg/m³")
        print(f"    - Median: {pm25.median():.2f} µg/m³")
        print(f"    - Std Dev: {pm25.std():.2f}")
        print(f"    - Min: {pm25.min():.2f} µg/m³")
        print(f"    - Max: {pm25.max():.2f} µg/m³")
        
        # AQI Categories
        good = (pm25 <= 50).sum()
        satisfactory = ((pm25 > 50) & (pm25 <= 100)).sum()
        poor = (pm25 > 100).sum()
        
        print(f"    - Good (≤50): {good} ({good/len(pm25)*100:.1f}%)")
        print(f"    - Satisfactory (51-100): {satisfactory} ({satisfactory/len(pm25)*100:.1f}%)")
        print(f"    - Poor (>100): {poor} ({poor/len(pm25)*100:.1f}%)")
    
    if 'PM10' in df.columns:
        pm10 = df['PM10']
        print(f"  PM10:")
        print(f"    - Mean: {pm10.mean():.2f} µg/m³")
        print(f"    - Median: {pm10.median():.2f} µg/m³")
        print(f"    - Min: {pm10.min():.2f} µg/m³")
        print(f"    - Max: {pm10.max():.2f} µg/m³")

if not beijing_data.empty:
    analyze_aqi(beijing_data, "Beijing")

if not india_data.empty:
    analyze_aqi(india_data, "India")

# ============================================
# STEP 4: Correlation Analysis
# ============================================
print("\n🔗 CORRELATION ANALYSIS:")

def find_correlations(df, name):
    """Find strong correlations"""
    print(f"\n{name}:")
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr()
        
        # Find strong correlations (> 0.7)
        strong_corr = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                if abs(corr_matrix.iloc[i, j]) > 0.7:
                    strong_corr.append({
                        'var1': corr_matrix.columns[i],
                        'var2': corr_matrix.columns[j],
                        'correlation': corr_matrix.iloc[i, j]
                    })
        
        if strong_corr:
            for item in strong_corr:
                print(f"  {item['var1']} ↔ {item['var2']}: {item['correlation']:.3f}")
        else:
            print("  No strong correlations found")

if not beijing_data.empty:
    find_correlations(beijing_data, "Beijing")

if not india_data.empty:
    find_correlations(india_data, "India")

# ============================================
# STEP 5: Data Quality Report
# ============================================
print("\n✅ DATA QUALITY REPORT:")

def quality_report(df, name):
    """Generate data quality metrics"""
    print(f"\n{name}:")
    print(f"  - Total Records: {len(df)}")
    print(f"  - Total Columns: {len(df.columns)}")
    print(f"  - Missing Values: {df.isnull().sum().sum()}")
    print(f"  - Duplicates: {df.duplicated().sum()}")
    print(f"  - Data Types: {df.dtypes.value_counts().to_dict()}")

if not beijing_data.empty:
    quality_report(beijing_data, "Beijing")

if not india_data.empty:
    quality_report(india_data, "India")

print("\n" + "=" * 60)
print("✅ ANALYSIS COMPLETE!")
print("=" * 60)
