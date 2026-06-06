import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountChoice.css';

function AccountChoice() {
  const navigate = useNavigate();

  return (
    <div className="account-choice-container">
      <div className="account-choice-card">
        <div className="account-choice-header">
          <div className="account-choice-icon">🌿</div>
          <h2>Create or Sign In</h2>
          <p>Choose what works best for you</p>
        </div>

        <div className="account-choice-options">
          {/* Sign Up Option */}
          <div className="account-option" onClick={() => navigate('/signup')}>
            <div className="option-icon">✨</div>
            <h3>Create Account</h3>
            <p>New to Semzung? Create a free account to save your conversations permanently.</p>
            <button className="option-btn">Sign Up</button>
          </div>

          {/* Sign In Option */}
          <div className="account-option" onClick={() => navigate('/signin')}>
            <div className="option-icon">🔓</div>
            <h3>Sign In</h3>
            <p>Already have an account? Log in to access your saved conversations.</p>
            <button className="option-btn">Sign In</button>
          </div>
        </div>

        <div className="account-choice-footer">
          <button onClick={() => navigate('/auth-choice')} className="back-link">
            ← Back to access options
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountChoice;
