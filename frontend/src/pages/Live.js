import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiSearch, FiHeart, FiWind, FiDroplet, FiEye } from 'react-icons/fi';
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

const POPULAR_CITIES = [
  // Europe
  'London', 'Paris', 'Berlin', 'Amsterdam', 'Madrid', 'Rome', 'Vienna',
  'Barcelona', 'Prague', 'Warsaw', 'Athens', 'Lisbon', 'Dublin',
  'Copenhagen', 'Stockholm', 'Zurich', 'Geneva', 'Brussels', 'Budapest',
  'Istanbul', 'Moscow', 'St. Petersburg', 'Krakow', 'Hamburg', 'Munich',
  'Milan', 'Venice', 'Florence', 'Naples', 'Palermo', 'Cardiff',
  'Edinburgh', 'Manchester', 'Liverpool', 'Malmo', 'Gothenburg',
  
  // Asia
  'Tokyo', 'Beijing', 'Shanghai', 'Delhi', 'Mumbai', 'Bangkok',
  'Singapore', 'Hong Kong', 'Seoul', 'Jakarta', 'Manila', 'Ho Chi Minh City',
  'Hanoi', 'Kuala Lumpur', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad',
  'Pune', 'Lahore', 'Karachi', 'Islamabad', 'Dhaka', 'Bangkok',
  'Chiang Mai', 'Phuket', 'Bali', 'Penang', 'Cebu', 'Davao',
  'Pattaya', 'Macau', 'Shenzhen', 'Guangzhou', 'Chongqing', 'Wuhan',
  'Chengdu', 'Xian', 'Nanjing', 'Hangzhou', 'Suzhou', 'Shenyang',
  'Harbin', 'Jinan', 'Qingdao', 'Taiyuan', 'Zhengzhou', 'Changsha',
  'Nanchang', 'Hefei', 'Fuzhou', 'Xiamen', 'Guangzhou', 'Taichung',
  'Taipei', 'Yokohama', 'Osaka', 'Kyoto', 'Yokohama', 'Kobe',
  'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Bangkok', 'Yangon',
  'Naypyidaw', 'Phnom Penh', 'Vientiane', 'Kathmandu', 'Thimphu',
  
  // Middle East & North Africa
  'Dubai', 'Abu Dhabi', 'Doha', 'Riyadh', 'Jeddah', 'Mecca',
  'Medina', 'Kuwait City', 'Manama', 'Muscat', 'Amman', 'Jerusalem',
  'Tel Aviv', 'Baghdad', 'Damascus', 'Beirut', 'Cairo', 'Alexandria',
  'Giza', 'Casablanca', 'Fez', 'Marrakech', 'Tunis', 'Algiers',
  'Rabat', 'Tangier', 'Tripoli', 'Benghazi', 'Sanaa', 'Aden',
  
  // Africa
  'Lagos', 'Cairo', 'Kinshasa', 'Nairobi', 'Johannesburg', 'Dar es Salaam',
  'Accra', 'Addis Ababa', 'Khartoum', 'Kampala', 'Abuja', 'Ibadan',
  'Cape Town', 'Durban', 'Pretoria', 'Port Louis', 'Casablanca',
  'Dakar', 'Ouagadougou', 'Niamey', 'Bamako', 'Freetown', 'Monrovia',
  'Luanda', 'Maputo', 'Harare', 'Lusaka', 'Botswana', 'Windhoek',
  'Gaborone', 'Lilongwe', 'Blantyre', 'Kigali', 'Bujumbura', 'Djibouti',
  
  // North America
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Indianapolis', 'Charlotte', 'San Francisco',
  'Seattle', 'Denver', 'Boston', 'Miami', 'Portland', 'Las Vegas',
  'Atlanta', 'Nashville', 'Memphis', 'Detroit', 'Minneapolis', 'New Orleans',
  'Cleveland', 'Long Beach', 'Albuquerque', 'Tucson', 'Fresno', 'Mesa',
  'Sacramento', 'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa',
  'Edmonton', 'Winnipeg', 'Quebec City', 'Mexico City', 'Guadalajara',
  'Monterry', 'Cancun', 'Acapulco', 'Puerto Vallarta', 'Cabo San Lucas',
  'Havana', 'Nassau', 'Santo Domingo', 'San Juan', 'Kingston', 'Port-au-Prince',
  
  // South America
  'Sao Paulo', 'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Bogota',
  'Salvador', 'Brasilia', 'Belo Horizonte', 'Manaus', 'Recife',
  'Porto Alegre', 'Fortaleza', 'Curitiba', 'Medellin', 'Cali',
  'Cartagena', 'Quito', 'Guayaquil', 'Caracas', 'Maracaibo',
  'Santiago', 'Valparaiso', 'Asuncion', 'Montevideo', 'La Paz',
  'Cochabamba', 'Sucre', 'Paramaribo', 'Georgetown', 'Cayenne',
  
  // Oceania & Pacific
  'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Hobart',
  'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga',
  'Fiji', 'Samoa', 'Tonga', 'Palau', 'Guam', 'Honolulu'
];

// Helper function to detect if user is on mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Helper function to convert error codes to user-friendly messages
const getErrorMessage = (error) => {
  if (!error) return { 
    title: '❌ Error', 
    message: 'Something went wrong. Please try again.' 
  };
  
  const status = error.response?.status;
  const message = error.message?.toLowerCase() || '';
  const errorData = error.response?.data;
  const isMobile = isMobileDevice();
  
  // Network/Connection errors
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
  
  // HTTP Status errors
  if (status === 404) {
    return {
      title: '❌ City Not Found',
      message: 'We could not find that city. Please check the spelling and try searching again.'
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
  
  // Generic fallback
  return {
    title: '❌ Error',
    message: isMobile 
      ? 'Connection problem. Check your internet and try again.'
      : 'Could not load city data. Please check your internet and try again.'
  };
};

export const Live = () => {
  const [searchInput, setSearchInput] = useState('');
  const [currentCity, setCurrentCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load favorite status from localStorage when data is loaded
  useEffect(() => {
    if (currentCity && data) {
      const favorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
      const isFav = favorites.some(city => city.name === currentCity);
      setIsFavorite(isFav);
    }
  }, [currentCity, data]);

  const fetchCityData = async (cityName) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/forecast/city/${cityName}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setData(response.data.data);
      setCurrentCity(cityName);
      setIsFavorite(false);
    } catch (err) {
      console.error('Error fetching city data:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchCityData(searchInput.trim());
      setHasSearched(true);
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (value.trim().length > 0) {
      const filtered = POPULAR_CITIES.filter(c => 
        c.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    fetchCityData(city);
    setHasSearched(true);
    setSearchInput('');
    setShowSuggestions(false);
  };

  const toggleFavorite = () => {
    if (!currentCity || !data) return;
    
    let favorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
    const newIsFavorite = !isFavorite;
    
    if (newIsFavorite) {
      // Add to favorites
      const newFav = {
        name: currentCity,
        timestamp: new Date().toISOString()
      };
      favorites.push(newFav);
    } else {
      // Remove from favorites
      favorites = favorites.filter(city => city.name !== currentCity);
    }
    
    localStorage.setItem('favoriteCities', JSON.stringify(favorites));
    setIsFavorite(newIsFavorite);
  };

  if (loading && !data) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="live-page">
        {/* Search Bar */}
        <motion.div
          className="search-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                onFocus={() => searchInput && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                placeholder="Search city..."
                className="search-input"
              />
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  className="suggestions-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {suggestions.slice(0, 8).map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(suggestion);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <FiSearch className="suggestion-icon" />
                      {suggestion}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
            <button type="submit" className="search-btn">Search</button>
          </form>
        </motion.div>

        {/* Error Message */}
        <motion.div
          className="error-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #dc2626',
            borderRadius: '0.75rem',
            padding: '2rem',
            margin: '2rem 0',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '1.5rem', color: '#dc2626', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {error.title}
          </div>
          <div style={{ fontSize: '1rem', color: '#7f1d1d', marginBottom: '1rem' }}>
            {error.message}
          </div>
          <button
            onClick={() => setError(null)}
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
        </motion.div>

        <div className="empty-state">
          <MdAir className="empty-icon" />
          <p>Try searching again or choose from popular cities: London, New York, Tokyo, Delhi</p>
          <p className="empty-state-hint">💡 Try searching for: London, Tokyo, New York, Delhi, Mumbai, or Beijing</p>
        </div>
      </div>
    );
  }

  if (!hasSearched || !data) {
    return (
      <div className="live-page">
        {/* Search Bar */}
        <motion.div
          className="search-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                onFocus={() => searchInput && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                placeholder="Search city..."
                className="search-input"
                autoFocus
              />
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  className="suggestions-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {suggestions.slice(0, 8).map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(suggestion);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <FiSearch className="suggestion-icon" />
                      {suggestion}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
            <button type="submit" className="search-button">Search</button>
          </form>
        </motion.div>

        {/* Empty State Message */}
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MdAir className="empty-state-icon" />
          <h2>Search for a City</h2>
          <p>Enter a city name above to view real-time air quality data, forecasts, and health information.</p>
          <p className="empty-state-hint">💡 Try searching for: London, Tokyo, New York, Delhi, Mumbai, or Beijing</p>
        </motion.div>
      </div>
    );
  }

  const aqiLevel = getAQILevel(data.current.aqi);
  const levelInfo = AQI_LEVELS[aqiLevel];

  return (
    <div className="live-page">
      {/* Search Bar */}
      <motion.div
        className="search-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              onFocus={() => searchInput && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
              placeholder="Search city..."
              className="search-input"
            />
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                className="suggestions-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {suggestions.slice(0, 8).map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(suggestion);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <FiSearch className="suggestion-icon" />
                    {suggestion}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
          <button type="submit" className="search-btn">Search</button>
        </form>
      </motion.div>

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
            <h1 className="city-name">{data.city}</h1>
            <p className="timestamp">Last updated: {new Date(data.timestamp).toLocaleTimeString()}</p>
          </div>
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
          >
            <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
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
              <FiDroplet className="detail-icon" />
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

      {/* 5-Day Forecast */}
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

    </div>
  );
};

