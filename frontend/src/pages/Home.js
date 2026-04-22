import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdAir, MdTrendingUp, MdFavoriteBorder, MdCheckCircle, MdVerified } from 'react-icons/md';
import { FiArrowRight, FiZap, FiShield, FiActivity, FiUsers, FiBarChart2 } from 'react-icons/fi';
import './home.css';

export const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const features = [
    {
      icon: <MdAir />,
      title: 'Real-time AQI',
      description: 'Get live air quality data for any city worldwide',
      badge: 'Live'
    },
    {
      icon: <MdTrendingUp />,
      title: 'Accurate Forecasts',
      description: '24-hour and 5-day forecasts with 89% accuracy',
      badge: '89%'
    },
    {
      icon: <FiZap />,
      title: 'ML Forecasting',
      description: 'Advanced XGBoost models for precise predictions',
      badge: 'AI'
    },
    {
      icon: <FiActivity />,
      title: 'Health Tracking',
      description: 'Monitor pollutants and track health impact',
      badge: 'Pro'
    },
    {
      icon: <MdFavoriteBorder />,
      title: 'Manage Favorites',
      description: 'Save and quickly access your favorite cities',
      badge: 'Fast'
    },
    {
      icon: <FiShield />,
      title: 'Secure & Responsive',
      description: 'Enterprise security with responsive design',
      badge: 'Secure'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Users', icon: <FiUsers /> },
    { value: '1000+', label: 'Cities Monitored', icon: <FiBarChart2 /> },
    { value: '89%', label: 'Forecast Accuracy', icon: <MdTrendingUp /> },
    { value: '99.9%', label: 'Uptime', icon: <MdCheckCircle /> }
  ];

  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Create your account in seconds'
    },
    {
      number: '2',
      title: 'Search City',
      description: 'Find and select any city worldwide'
    },
    {
      number: '3',
      title: 'View Data',
      description: 'See real-time AQI and pollutant levels'
    },
    {
      number: '4',
      title: 'Check Forecast',
      description: 'View 24-hour and 5-day predictions'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="hero-badge">
            <MdVerified className="badge-icon" /> Trusted by Thousands
          </motion.div>
          <motion.h1 variants={itemVariants} className="hero-title">
            Monitor Air Quality<br /><span className="highlight">in Real-Time</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="hero-subtitle">
            Get accurate AQI forecasts, pollutant levels, and health recommendations
            using advanced machine learning models. Protect your health today.
          </motion.p>
          <motion.div variants={itemVariants} className="hero-buttons">
            <Link to="/signup" className="btn btn-primary">
              Get Started Free <FiArrowRight />
            </Link>
            <Link to="/signin" className="btn btn-secondary">
              Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* Animated Background */}
        <div className="hero-bg">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <motion.div
          className="stats-container"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants} className="stat-item">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          Why Choose AQM?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="section-subtitle"
        >
          Everything you need to monitor and track air quality effectively
        </motion.p>

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} className="feature-card">
              <div className="feature-badge">{feature.badge}</div>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          How It Works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="section-subtitle"
        >
          Get started in 4 simple steps
        </motion.p>

        <motion.div
          className="steps-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < steps.length - 1 && <div className="step-arrow">→</div>}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="cta-content"
        >
          <h2>Start Monitoring Your Air Quality Today</h2>
          <p>Join thousands of users tracking air quality in their cities</p>
          <Link to="/signup" className="btn btn-accent">
            Create Free Account Now
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Air Quality Monitoring. All rights reserved. Protecting your health with real-time data.</p>
      </footer>
    </div>
  );
};
