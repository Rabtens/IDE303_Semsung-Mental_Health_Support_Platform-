import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#resources">Resources</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Us</a>
        </div>
        <div className="footer-bottom">
          <p>
            <strong>Disclaimer:</strong> Semzung provides emotional support and general wellness guidance. 
            It is NOT a substitute for professional mental health care. If you're in crisis, please contact a 
            licensed professional or call <strong>112</strong> (Bhutan Hospital Emergency).
            {' '}<a href="tel:+67317263" style={{ display: 'inline-block', marginLeft: '8px', padding: '6px 12px', backgroundColor: '#00d4aa', color: '#1a2f3f', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>📞 Dial Hospital</a>
          </p>
          <p style={{ marginTop: '20px' }}>© 2026 Semzung. Made with 💚 for mental health.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
