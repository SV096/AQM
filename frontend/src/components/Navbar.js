import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiHome, FiMapPin, FiHeart, FiClock } from 'react-icons/fi';
import { MdAir } from 'react-icons/md';
import './navbar.css';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <MdAir className="logo-icon" />
          <span>AQM</span>
        </Link>

        {/* Menu Toggle */}
        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/live" className="nav-link">
                <FiMapPin /> Live
              </Link>
              <Link to="/favorites" className="nav-link">
                <FiHeart /> Favorites
              </Link>
              <Link to="/history" className="nav-link">
                <FiClock /> History
              </Link>
              <div className="user-section">
                <span className="user-name">{user?.name}</span>
                <button onClick={handleLogout} className="logout-btn">
                  <FiLogOut /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">
                <FiHome /> Home
              </Link>
              <Link to="/signin" className="nav-link signin-link">
                Sign In
              </Link>
              <Link to="/signup" className="nav-link signup-link">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
