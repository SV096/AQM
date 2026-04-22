import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiTrash2, FiSearch, FiClock } from 'react-icons/fi';
import './history.css';

export const History = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const filtered = history.filter(item =>
      item.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHistory(filtered);
  }, [searchTerm, history]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/history?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setHistory(response.data.history);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (window.confirm('Are you sure? This cannot be undone.')) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/user/history`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setHistory([]);
      } catch (err) {
        console.error('Error clearing history:', err);
      }
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'search':
        return <FiSearch />;
      case 'favorite':
        return '❤️';
      case 'view':
        return <FiClock />;
      default:
        return '📍';
    }
  };

  if (loading) {
    return <div className="history-page"><div className="loading">Loading...</div></div>;
  }

  if (history.length === 0) {
    return (
      <div className="history-page">
        <div className="empty-state">
          <FiClock className="empty-icon" />
          <h2>No History Yet</h2>
          <p>Your search activity will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <motion.div
        className="history-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Search History</h1>
        <button onClick={clearHistory} className="clear-btn">
          <FiTrash2 /> Clear All
        </button>
      </motion.div>

      <motion.div
        className="search-filter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <input
          type="text"
          placeholder="Filter by city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
      </motion.div>

      <motion.div
        className="history-list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredHistory.map((item, idx) => (
          <motion.div
            key={item._id}
            className="history-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="item-action-icon">{getActionIcon(item.action)}</div>
            
            <div className="item-content">
              <div className="item-city">{item.city}</div>
              <div className="item-details">
                <span className="item-action">Action: {item.action}</span>
                <span className="item-aqi">AQI: {item.aqi}</span>
              </div>
              {item.weather && (
                <div className="item-weather">
                  {item.weather.description && (
                    <span>🌡️ {item.weather.temperature}°C - {item.weather.description}</span>
                  )}
                </div>
              )}
            </div>

            <div className="item-time">
              {new Date(item.timestamp).toLocaleDateString()}<br />
              {new Date(item.timestamp).toLocaleTimeString()}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
