import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaGlobe, FaLock, FaChartLine, FaHandshake } from 'react-icons/fa6';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, accessMode, signOut, resetAccessMode, userProfile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth-choice');
  };

  const handleChangeMode = () => {
    resetAccessMode();
    navigate('/auth-choice');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="nav-container">
        <Link to="/" className="logo">
          <div className="logo-icon" style={{backgroundImage: 'url(/semzung-logo.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}}></div>
        </Link>
        <button 
          className="hamburger-menu" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`nav ${menuOpen ? 'active' : ''}`}>
          <button onClick={() => handleNavClick('/features')} className="nav-link">Features</button>
          <button onClick={() => handleNavClick('/about')} className="nav-link">About</button>
          <button onClick={() => handleNavClick('/resources')} className="nav-link">Resources</button>
          <button onClick={() => handleNavClick('/counselling')} className="nav-link" title="Find a counsellor">
            <FaHandshake /> Counselling
          </button>
          <button onClick={() => handleNavClick('/mood')} className="nav-mood-btn" title="Mood Tracker">
            <FaChartLine /> Mood
          </button>
          
          <div className="header-user-section">
            {user ? (
              <>
                <div className="header-user-info">
                  {userProfile?.avatar_url && (
                    <img 
                      src={userProfile.avatar_url} 
                      alt="Profile" 
                      className="header-avatar"
                      onClick={() => handleNavClick('/profile')}
                      title="View profile"
                    />
                  )}
                  <span className="user-email" onClick={() => handleNavClick('/profile')}>
                    <FaUser /> {userProfile?.display_name || user.email.split('@')[0]}
                  </span>
                </div>
                <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="signout-btn">Sign Out</button>
                <button onClick={() => { handleChangeMode(); setMenuOpen(false); }} className="back-btn" title="Switch access mode">
                  ← Change Mode
                </button>
              </>
            ) : accessMode ? (
              <>
                <span className="access-mode">
                  {accessMode === 'public' ? <><FaGlobe /> Public</> : <><FaLock /> Anonymous</>}
                </span>
                <button onClick={handleChangeMode} className="back-btn" title="Go back to access mode selection">
                  ← Back
                </button>
              </>
            ) : null}
            
            <button onClick={() => handleNavClick('/chat')} className="cta-btn">
              Start Chatting
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
