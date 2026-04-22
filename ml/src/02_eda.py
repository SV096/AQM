"""
Exploratory Data Analysis (EDA)
Generates visualizations and statistical analysis of air quality data
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings

warnings.filterwarnings('ignore')

# Paths
PROCESSED_DATA_DIR = Path(__file__).parent.parent / "data" / "processed"
VIZ_DIR = Path(__file__).parent.parent / "results" / "visualizations"

VIZ_DIR.mkdir(parents=True, exist_ok=True)

print("=" * 60)
print("📊 EXPLORATORY DATA ANALYSIS")
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
# STEP 2: Correlation Heatmap
# ============================================
print("\n📈 Generating Correlation Heatmap...")

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

if not beijing_data.empty:
    # Select numerical columns
    numeric_cols = beijing_data.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 1:
        corr_beijing = beijing_data[numeric_cols].corr()
        sns.heatmap(corr_beijing, annot=False, cmap='coolwarm', ax=axes[0], cbar_kws={'label': 'Correlation'})
        axes[0].set_title('Beijing - Correlation Matrix', fontsize=12, fontweight='bold')

if not india_data.empty:
    numeric_cols = india_data.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 1:
        corr_india = india_data[numeric_cols].corr()
        sns.heatmap(corr_india, annot=False, cmap='coolwarm', ax=axes[1], cbar_kws={'label': 'Correlation'})
        axes[1].set_title('India - Correlation Matrix', fontsize=12, fontweight='bold')

plt.tight_layout()
heatmap_path = VIZ_DIR / "01_correlation_heatmap.png"
plt.savefig(heatmap_path, dpi=300, bbox_inches='tight')
print(f"  ✅ Saved: {heatmap_path}")
plt.close()

# ============================================
# STEP 3: Time Series Analysis
# ============================================
print("\n📉 Generating Time Series Plots...")

fig, axes = plt.subplots(2, 1, figsize=(14, 8))

# Beijing time series
if not beijing_data.empty and 'PM2.5' in beijing_data.columns:
    pm25_vals = beijing_data['PM2.5'].values[:500]  # First 500 points
    axes[0].plot(pm25_vals, linewidth=1, color='#E74C3C', alpha=0.7)
    axes[0].fill_between(range(len(pm25_vals)), pm25_vals, alpha=0.3, color='#E74C3C')
    axes[0].set_title('Beijing - PM2.5 Time Series', fontsize=12, fontweight='bold')
    axes[0].set_ylabel('PM2.5 (µg/m³)')
    axes[0].grid(True, alpha=0.3)

# India time series
if not india_data.empty and 'PM2.5' in india_data.columns:
    pm25_vals = india_data['PM2.5'].values[:500]
    axes[1].plot(pm25_vals, linewidth=1, color='#3498DB', alpha=0.7)
    axes[1].fill_between(range(len(pm25_vals)), pm25_vals, alpha=0.3, color='#3498DB')
    axes[1].set_title('India - PM2.5 Time Series', fontsize=12, fontweight='bold')
    axes[1].set_ylabel('PM2.5 (µg/m³)')
    axes[1].set_xlabel('Time Period')
    axes[1].grid(True, alpha=0.3)

plt.tight_layout()
timeseries_path = VIZ_DIR / "02_beijing_india_timeseries.png"
plt.savefig(timeseries_path, dpi=300, bbox_inches='tight')
print(f"  ✅ Saved: {timeseries_path}")
plt.close()

# ============================================
# STEP 4: Seasonality Analysis
# ============================================
print("\n🔄 Generating Seasonality Analysis...")

fig, ax = plt.subplots(figsize=(12, 6))

# Combine data for seasonal analysis
combined = pd.concat([
    beijing_data[['PM2.5']].assign(Source='Beijing'),
    india_data[['PM2.5']].assign(Source='India')
], ignore_index=True)

if not combined.empty:
    # Monthly averages
    beijing_monthly = beijing_data.groupby(beijing_data.index % 12)['PM2.5'].mean() if 'PM2.5' in beijing_data.columns else pd.Series()
    india_monthly = india_data.groupby(india_data.index % 12)['PM2.5'].mean() if 'PM2.5' in india_data.columns else pd.Series()
    
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    if not beijing_monthly.empty:
        ax.plot(months[:len(beijing_monthly)], beijing_monthly.values, marker='o', label='Beijing', linewidth=2)
    if not india_monthly.empty:
        ax.plot(months[:len(india_monthly)], india_monthly.values, marker='s', label='India', linewidth=2)
    
    ax.set_title('Seasonal PM2.5 Patterns', fontsize=12, fontweight='bold')
    ax.set_ylabel('Average PM2.5 (µg/m³)')
    ax.set_xlabel('Month')
    ax.legend()
    ax.grid(True, alpha=0.3)

plt.tight_layout()
seasonality_path = VIZ_DIR / "03_seasonality_analysis.png"
plt.savefig(seasonality_path, dpi=300, bbox_inches='tight')
print(f"  ✅ Saved: {seasonality_path}")
plt.close()

# ============================================
# STEP 5: Distribution Analysis
# ============================================
print("\n📊 Generating Distribution Plots...")

fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Beijing PM2.5 distribution
if not beijing_data.empty and 'PM2.5' in beijing_data.columns:
    axes[0, 0].hist(beijing_data['PM2.5'], bins=50, color='#E74C3C', alpha=0.7, edgecolor='black')
    axes[0, 0].set_title('Beijing PM2.5 Distribution', fontsize=11, fontweight='bold')
    axes[0, 0].set_xlabel('PM2.5 (µg/m³)')
    axes[0, 0].set_ylabel('Frequency')

# Beijing PM10 distribution
if not beijing_data.empty and 'PM10' in beijing_data.columns:
    axes[0, 1].hist(beijing_data['PM10'], bins=50, color='#E67E22', alpha=0.7, edgecolor='black')
    axes[0, 1].set_title('Beijing PM10 Distribution', fontsize=11, fontweight='bold')
    axes[0, 1].set_xlabel('PM10 (µg/m³)')
    axes[0, 1].set_ylabel('Frequency')

# India PM2.5 distribution
if not india_data.empty and 'PM2.5' in india_data.columns:
    axes[1, 0].hist(india_data['PM2.5'], bins=50, color='#3498DB', alpha=0.7, edgecolor='black')
    axes[1, 0].set_title('India PM2.5 Distribution', fontsize=11, fontweight='bold')
    axes[1, 0].set_xlabel('PM2.5 (µg/m³)')
    axes[1, 0].set_ylabel('Frequency')

# India PM10 distribution
if not india_data.empty and 'PM10' in india_data.columns:
    axes[1, 1].hist(india_data['PM10'], bins=50, color='#27AE60', alpha=0.7, edgecolor='black')
    axes[1, 1].set_title('India PM10 Distribution', fontsize=11, fontweight='bold')
    axes[1, 1].set_xlabel('PM10 (µg/m³)')
    axes[1, 1].set_ylabel('Frequency')

plt.tight_layout()
distribution_path = VIZ_DIR / "04_distributions.png"
plt.savefig(distribution_path, dpi=300, bbox_inches='tight')
print(f"  ✅ Saved: {distribution_path}")
plt.close()

print("\n" + "=" * 60)
print("✅ EDA COMPLETE!")
print("=" * 60)
