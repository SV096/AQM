import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiTrash2, FiWind, FiEye, FiHeart } from 'react-icons/fi';
import { MdAir, MdThermostat } from 'react-icons/md';
import './live.css';

const AQI_LEVELS = {
  0: { label: 'Good', color: '#22c55e', bg: '#dcfce7' },
  1: { label: 'Moderate', color: '#eab308', bg: '#fef3c7' },
  2: { label: 'Unhealthy for Sensitive Groups', color: '#f97316', bg: '#fed7aa' },
  3: { label: 'Unhealthy', color: '#ef4444', bg: '#fee2e2' },
  4: { label: 'Very Unhealthy', color: '#9333ea', bg: '#f3e8ff' },
  5: { label: 'Hazardous', color: '#7c3aed', bg: '#ede9fe' }
};

const getAQILevel = (aqi) => {
  if (aqi <= 50) return 0;
  if (aqi <= 100) return 1;
  if (aqi <= 150) return 2;
  if (aqi <= 200) return 3;
  if (aqi <= 300) return 4;
  return 5;
};

// Helper function to detect if user is on mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Helper function to convert error codes to user-friendly messages
const getErrorMessage = (error) => {
  if (!error) return { title: '❌ Error', message: 'Something went wrong. Please try again.' };

  const status = error.response?.status;
  const message = error.message?.toLowerCase() || '';
  const errorData = error.response?.data;
  const isMobile = isMobileDevice();

  if (error.code === 'ECONNREFUSED') {
    return {
      title: '🔌 Connection Error',
      message: isMobile
        ? "Can't connect. Check WiFi is turned on and connected. Try turning WiFi off and on again."
        : "Can't connect to the server. Check your internet connection and try again."
    };
  }
  if (error.code === 'ETIMEDOUT') {
    return {
      title: '⏱️ Slow Connection',
      message: isMobile
        ? 'Connection is very slow. Try moving closer to your WiFi router or wait a moment before trying again.'
        : 'The request took too long. Check your internet connection and try again.'
    };
  }
  if (error.code === 'ENOTFOUND' || message.includes('network')) {
    return {
      title: '🌐 Network Error',
      message: isMobile
        ? 'No internet connection found. Check that WiFi or mobile data is turned on and try again.'
        : 'Unable to reach the server. Check your internet connection.'
    };
  }

  if (status === 404) {
    return {
      title: '❌ City Not Found',
      message: 'We could not find that city. Try adding it again from the Live page.'
    };
  }
  if (status === 401 || status === 403) {
    return {
      title: '🔒 Session Expired',
      message: isMobile
        ? 'Your login has expired. Close this app completely and open it again to refresh your session.'
        : 'Your session has expired. Please refresh the page and try again.'
    };
  }
  if (status === 429) {
    return {
      title: '⏸️ Too Many Searches',
      message: 'You searched too quickly. Wait 30 seconds and try again.'
    };
  }
  if (status === 500 || status === 502 || status === 503) {
    return {
      title: '⚙️ Server Maintenance',
      message: 'The server is having issues. Please try again in a few minutes.'
    };
  }
  if (status >= 400) {
    return {
      title: `⚠️ Error (${status})`,
      message: errorData?.message || 'An error occurred. Please try again.'
    };
  }

  return {
    title: '❌ Error',
    message: isMobile
      ? 'Connection problem. Check your internet and try again.'
      : 'Could not load city data. Please check your internet and try again.'
  };
};

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load favorites on mount (don't auto-select)
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
    setFavorites(storedFavorites);
  }, []);

  // Fetch data only when user clicks a city button
  const handleCityClick = async (cityName) => {
    setSelectedCity(cityName);
    setLoading(true);
    setError(null);
    setData(null); // Clear previous data
    try {
      console.log(`Fetching data for ${cityName}...`);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/forecast/city/${cityName}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('Response received:', response.data);

      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        console.error('Invalid data format received', response.data);
        setError({
          title: '⚠️ Invalid Data',
          message: 'Invalid data format received'
        });
      }
    } catch (err) {
      console.error('Error fetching city data:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(getErrorMessage(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (cityName) => {
    const updatedFavorites = favorites.filter(fav => fav.name !== cityName);
    localStorage.setItem('favoriteCities', JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);

    // If removed city was selected, clear selection
    if (selectedCity === cityName) {
      setSelectedCity(null);
      setData(null);
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="live-page">
        <div className="empty-state" style={{ marginTop: '4rem' }}>
          <MdAir className="empty-icon" />
          <h2>No Favorite Cities Yet</h2>
          <p>Go to Live page and click the heart icon to add cities to favorites</p>
        </div>
      </div>
    );
  }

  if (!selectedCity) {
    return (
      <div className="live-page">
        {/* Favorites Buttons */}
        <motion.div
          className="search-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="favorites-buttons">
            {favorites.map((fav, idx) => (
              <motion.button
                key={fav.name}
                className="fav-button"
                onClick={() => handleCityClick(fav.name)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                {fav.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="empty-state" style={{ marginTop: '4rem' }}>
          <MdAir className="empty-icon" />
          <p style={{ fontSize: '1.1rem', color: '#666' }}>Click a city button to view details</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="live-page">
        {/* Favorites Buttons */}
        <motion.div
          className="search-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="favorites-buttons">
            {favorites.map((fav, idx) => (
              <motion.button
                key={fav.name}
                className={`fav-button ${selectedCity === fav.name ? 'active' : ''}`}
                onClick={() => handleCityClick(fav.name)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                {fav.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="empty-state" style={{ marginTop: '4rem' }}>
          <div style={{ color: '#dc2626', fontSize: '1.2rem', padding: '2rem', background: '#fee2e2', borderRadius: '0.5rem' }}>
            <strong style={{ fontSize: '1.5rem' }}>{error.title}</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '1rem' }}>{error.message}</p>
            <button
              onClick={() => {
                setError(null);
                handleCityClick(selectedCity);
              }}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#991b1b'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const levelInfo = data ? AQI_LEVELS[getAQILevel(data.current.aqi)] : AQI_LEVELS[0];

  return (
    <div className="live-page">
      {/* Favorites Buttons */}
      <motion.div
        className="search-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="favorites-buttons">
          {favorites.map((fav, idx) => (
            <motion.button
              key={fav.name}
              className={`fav-button ${selectedCity === fav.name ? 'active' : ''}`}
              onClick={() => handleCityClick(fav.name)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              {fav.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* City Details (Same as Live Page) */}
      {selectedCity && data && (
        <>
          {/* Current AQI Card */}
          <motion.div
            className="current-aqi-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={{ backgroundColor: levelInfo.bg, borderLeftColor: levelInfo.color }}
          >
            <div className="aqi-header">
              <div>
                <h1 className="city-name">{selectedCity}</h1>
                <p className="timestamp">Last updated: {new Date(data.timestamp).toLocaleTimeString()}</p>
              </div>
              <button
                className="favorite-btn"
                onClick={() => removeFavorite(selectedCity)}
                title="Remove from favorites"
              >
                <FiTrash2 />
              </button>
            </div>

            <div className="aqi-main">
              <div className="aqi-value-container">
                <div className="aqi-value" style={{ color: levelInfo.color }}>
                  {Math.round(data.current.aqi)}
                </div>
                <div className="aqi-status" style={{ color: levelInfo.color }}>
                  {levelInfo.label}
                </div>
              </div>

              <div className="aqi-details-grid">
                <div className="detail-item">
                  <MdThermostat className="detail-icon" />
                  <span className="detail-label">Temperature</span>
                  <span className="detail-value">{data.current.weather.temp}°C</span>
                </div>
                <div className="detail-item">
                  <FiHeart className="detail-icon" />
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{data.current.weather.humidity}%</span>
                </div>
                <div className="detail-item">
                  <FiWind className="detail-icon" />
                  <span className="detail-label">Wind</span>
                  <span className="detail-value">{data.current.weather.wind_speed} m/s</span>
                </div>
                <div className="detail-item">
                  <FiEye className="detail-icon" />
                  <span className="detail-label">Weather</span>
                  <span className="detail-value">{data.current.weather.rain > 0 ? 'Rainy' : 'Clear'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pollutants Section */}
          <motion.section
            className="pollutants-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Pollutant Levels</h2>
            <div className="pollutants-grid">
              {Object.entries(data.current.pollutants).map(([name, value]) => {
                const numValue = parseFloat(value);
                const displayValue = !numValue || numValue === 0 || isNaN(numValue) ? 'NA' : numValue.toFixed(2);
                return (
                  <motion.div
                    key={name}
                    className="pollutant-card"
                    whileHover={{ transform: 'translateY(-5px)' }}
                  >
                    <div className="pollutant-icon">
                      <MdAir />
                    </div>
                    <div className="pollutant-name">{name}</div>
                    <div className="pollutant-value">{displayValue} µg/m³</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* 24-Hour Forecast */}
          {data.forecast_24h && (
            <motion.section
              className="forecast-24h"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2>24-Hour Forecast (3-hour intervals)</h2>
              <div className="forecast-grid">
                {data.forecast_24h.predictions?.slice(0, 8).map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="forecast-card-24h"
                    whileHover={{ transform: 'translateY(-8px)' }}
                  >
                    <div className="forecast-time">{item.time}</div>
                    <div className="forecast-aqi" style={{ color: AQI_LEVELS[getAQILevel(item.aqi)].color }}>
                      {item.aqi}
                    </div>
                    <div className="forecast-label">AQI</div>
                    <div className="forecast-condition">{item.condition}</div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* 5-Day Forecast */}
          {data.forecast_5d && (
            <motion.section
              className="forecast-5d"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2>5-Day AQI Forecast</h2>
              <div className="forecast-5d-grid">
                {data.forecast_5d.predictions?.slice(0, 5).map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="forecast-card-5d"
                    whileHover={{ transform: 'translateY(-8px)' }}
                  >
                    <div className="forecast-date">{item.date}</div>
                    <div className="forecast-range">
                      <span className="range-label">AQI:</span>
                      <span className="range-values" style={{ color: AQI_LEVELS[getAQILevel(item.aqi)].color }}>
                        {item.aqi}
                      </span>
                    </div>
                    <div className="forecast-condition">{item.condition}</div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </>
      )}
    </div>
  );
};
