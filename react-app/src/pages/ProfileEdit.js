import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfileEdit.css';

function ProfileEdit() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth-choice');
      return;
    }

    fetchProfile();
    // Fetch again only when the active user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${user.id}`);
      const data = await res.json();
      
      if (data.profile) {
        setDisplayName(data.profile.display_name || '');
        setBio(data.profile.bio || '');
        setLocation(data.profile.location || '');
        setWebsite(data.profile.website || '');
        setAvatarUrl(data.profile.avatar_url || '');
        setAvatarPreview(data.profile.avatar_url || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      let finalAvatarUrl = avatarUrl;

      // Upload avatar if changed
      if (avatarFile) {
        const base64 = await convertToBase64(avatarFile);
        finalAvatarUrl = base64;
      }

      const profileData = {
        user_id: user.id,
        display_name: displayName,
        bio: bio,
        location: location,
        website: website,
        avatar_url: finalAvatarUrl
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (res.ok) {
        const data = await res.json();
        setMessage('✅ Profile updated successfully!');
        
        // Update context
        if (updateUserProfile) {
          updateUserProfile(data.profile);
        }

        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        setMessage('❌ Failed to update profile. Try again.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('❌ Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-edit-container"><p>Loading...</p></div>;
  }

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-card">
        <h2>Edit Your Profile</h2>

        {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="profile-edit-form">
          {/* Avatar Upload */}
          <div className="form-section">
            <h3>Profile Picture</h3>
            <div className="avatar-upload">
              <img 
                src={avatarPreview || 'https://via.placeholder.com/150?text=No+Avatar'} 
                alt="Avatar Preview" 
                className="avatar-preview"
                onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Avatar'}
              />
              <div className="upload-controls">
                <label htmlFor="avatar-input" className="upload-btn">
                  📷 Choose Image
                </label>
                <input
                  type="file"
                  id="avatar-input"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <p className="upload-hint">JPG, PNG, or GIF (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                maxLength="50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email (Read-only)</label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
              />
            </div>
          </div>

          {/* About Section */}
          <div className="form-section">
            <h3>About You</h3>
            
            <div className="form-group">
              <label htmlFor="bio">Bio / About</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself... (max 200 characters)"
                maxLength="200"
                rows="4"
              />
              <p className="char-count">{bio.length}/200</p>
            </div>

            <div className="form-group">
              <label htmlFor="location">📍 Location</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                maxLength="50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">🔗 Website / Portfolio</label>
              <input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                maxLength="100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={saving}
            >
              {saving ? 'Saving...' : '✅ Save Profile'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/profile')} 
              className="cancel-btn"
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileEdit;
