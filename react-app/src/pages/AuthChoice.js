import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLeaf, FaGlobe, FaLock, FaUser } from 'react-icons/fa6';
import './AuthChoice.css';

function AuthChoice() {
  const navigate = useNavigate();
  const { setPublicMode, setAnonymousMode } = useAuth();

  const handlePublic = () => {
    setPublicMode();
    navigate('/');
  };

  const handleAnonymous = () => {
    setAnonymousMode();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/account-choice');
  };

  return (
    <div className="auth-choice-container">
      <div className="auth-choice-card">
        <div className="auth-choice-header">
          <div className="auth-choice-icon"><FaLeaf /></div>
          <h1>Welcome to Semzung</h1>
          <p>How would you like to access our platform?</p>
        </div>

        <div className="auth-choice-options">
          {/* Public Option */}
          <div className="auth-choice-option" onClick={handlePublic}>
            <div className="option-icon"><FaGlobe /></div>
            <h3>Browse Publicly</h3>
            <p>Explore our resources and information without any account or tracking.</p>
            <button className="option-btn">Continue as Public</button>
          </div>

          {/* Anonymous Option */}
          <div className="auth-choice-option" onClick={handleAnonymous}>
            <div className="option-icon"><FaLock /></div>
            <h3>Chat Anonymously</h3>
            <p>Use the chatbot with a temporary ID. Your chat history is saved for this session only.</p>
            <button className="option-btn">Chat Anonymously</button>
          </div>

          {/* Registered Option */}
          <div className="auth-choice-option">
            <div className="option-icon"><FaUser /></div>
            <h3>Create Account</h3>
            <p>Sign up to save your conversations permanently and access personalized features.</p>
            <button className="option-btn" onClick={handleLogin}>Sign Up / Sign In</button>
          </div>
        </div>

        <div className="auth-choice-disclaimer">
          <strong><FaLock /> Privacy:</strong> Whether you choose public, anonymous, or registered access, your mental health and privacy are our top priority. All conversations are encrypted and confidential.
        </div>
      </div>
    </div>
  );
}

export default AuthChoice;
