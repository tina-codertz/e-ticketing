import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="home-container">
      <div className="welcome-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to ARU Event e-Ticketing System</h1>
          <p className="hero-subtitle">Your gateway to seamless event management and ticketing</p>
          <div className="features-grid">
            <div className="feature-card">
              <FaTicketAlt className="feature-icon" />
              <h3>Secure Ticketing</h3>
              <p>Experience safe and efficient ticket management</p>
            </div>
            <div className="feature-card">
              <FaCalendarAlt className="feature-icon" />
              <h3>Real-time Updates</h3>
              <p>Stay informed with instant event updates</p>
            </div>
            <div className="feature-card">
              <FaMoneyBillWave className="feature-icon" />
              <h3>Easy Booking</h3>
              <p>Book tickets with Tanzanian Shillings</p>
            </div>
          </div>
          <div className="auth-buttons">
            <button
              onClick={handleLoginClick}
              className="auth-btn primary-btn"
            >
              <span className="btn-text">Login</span>
              <span className="btn-icon">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;