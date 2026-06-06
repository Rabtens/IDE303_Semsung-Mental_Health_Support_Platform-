import React from 'react';
import { FaLeaf } from 'react-icons/fa6';
import './About.css';

function About() {
  return (
    <section id="about" className="about">
      <div className="section-container">
        <div className="about-content">
          <div className="about-text">
            <h2>About Semzung</h2>
            <p>Mental health matters. Too many people struggle in silence, lacking access to affordable support or a safe space to express their feelings.</p>
            <p>Semzung was created to bridge that gap. Powered by cutting-edge AI (Groq's llama model) and designed with compassion, we provide warm, judgment-free emotional support to anyone who needs it.</p>
            <p>This isn't a replacement for professional therapy, but it's a thoughtful companion for the journey. Whether you're managing anxiety, stress, insomnia, or just need someone to talk to — we're here.</p>
            <p style={{ marginTop: '30px', color: 'var(--sage-dark)', fontWeight: 600 }}>
              Remember: If you're in crisis, always reach out to a professional or call <strong>112</strong> (Bhutan Hospital Emergency).
            </p>
          </div>
          <div className="about-image"><FaLeaf /></div>
        </div>
      </div>
    </section>
  );
}

export default About;
