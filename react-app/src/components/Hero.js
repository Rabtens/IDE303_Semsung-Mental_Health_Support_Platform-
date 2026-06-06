import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="dzongkha-header">ཀུ་ཟུ་བཟང་པོ་ལགས།</div>
            <h1>Your Compassionate<br /><span className="accent-text">Mental Health</span> Companion</h1>
            <p>Semzung is here to listen, support, and guide you through life's challenges. Available 24/7, judgment-free, and designed with care for your wellbeing.</p>
            <div className="hero-buttons">
              <button onClick={() => navigate('/chat')} className="btn-primary">
                Start Chatting Now
              </button>
              <a href="#features" className="btn-secondary">Learn More</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-element">
              <div className="visual-circle"></div>
              <div className="visual-card">
                <img src="/brain-wellness.svg" alt="Mental wellness and meditation" className="visual-card-image" />
              </div>
              <div className="visual-dots"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
