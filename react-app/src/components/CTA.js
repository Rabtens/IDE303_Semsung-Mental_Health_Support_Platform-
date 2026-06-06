import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTA.css';

function CTA() {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="section-container">
        <h2>Ready to Start Your Journey?</h2>
        <p>Take the first step toward better mental health. Semzung is free and waiting for you.</p>
        <button onClick={() => navigate('/chat')} className="cta-btn-large">
          Open Semzung Now
        </button>
      </div>
    </section>
  );
}

export default CTA;
