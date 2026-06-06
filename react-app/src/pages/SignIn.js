import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, setAnonymousMode, setRegisteredMode } = useAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      setRegisteredMode(); // Set access mode to 'registered'
      navigate('/');
    } catch (err) {
      // Provide clearer error messages based on Supabase responses
      let errorMessage = 'Failed to sign in';
      
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before signing in.';
      } else if (err.message?.includes('User already registered')) {
        errorMessage = 'This email is already registered.';
      } else if (err.message?.includes('Provider is not enabled')) {
        errorMessage = 'Authentication provider is not available.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setAnonymousMode();
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🌿</div>
          <h2>Welcome Back</h2>
          <p>Sign in to your Semzung account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSignIn} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button onClick={handleGuestLogin} className="guest-btn">
          Continue as Anonymous Guest
        </button>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
          <p><Link to="/auth-choice">← Back to options</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
