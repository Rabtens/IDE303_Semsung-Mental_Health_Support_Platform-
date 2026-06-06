import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaPencil, FaBars, FaComments } from 'react-icons/fa6';
import './UserProfile.css';

function UserProfile() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(userProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth-choice');
      return;
    }
    
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${user.id}`);
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-container"><p>Loading profile...</p></div>;
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p>No profile found. <button onClick={() => navigate('/profile/edit')}>Create one now</button></p>
        </div>
      </div>
    );
  }

  const dateJoined = profile.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <img 
              src={profile.avatar_url || 'https://via.placeholder.com/150?text=No+Avatar'} 
              alt="Profile" 
              className="profile-avatar-large"
              onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Avatar'}
            />
            <button onClick={() => navigate('/profile/edit')} className="edit-profile-btn">
              Edit Profile
            </button>
          </div>

          {/* Profile Info */}
          <div className="profile-info">
            <h1 className="profile-name">{profile.display_name || user.email.split('@')[0]}</h1>
            <p className="profile-email">📧 {user.email}</p>
            
            {profile.bio && (
              <p className="profile-bio">
                <span className="bio-label">About:</span> {profile.bio}
              </p>
            )}

            {profile.location && (
              <p className="profile-detail">
                📍 <strong>Location:</strong> {profile.location}
              </p>
            )}

            {profile.website && (
              <p className="profile-detail">
                🔗 <strong>Website:</strong> <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a>
              </p>
            )}

            <p className="profile-joined">
              ✨ <strong>Joined:</strong> {dateJoined}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="profile-stats">
          <div className="stat">
            <h3>Profile Complete</h3>
            <p className="stat-value">{calculateProfileCompletion(profile)}%</p>
          </div>
          <div className="stat">
            <h3>Account Type</h3>
            <p className="stat-value"><FaUser /> Registered</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="profile-actions">
          <button onClick={() => navigate('/profile/edit')} className="action-btn primary">
            <FaPencil /> Edit Profile
          </button>
          <button onClick={() => navigate('/mood')} className="action-btn">
            <FaBars /> View Mood History
          </button>
          <button onClick={() => navigate('/chat')} className="action-btn">
            <FaComments /> Start Chatting
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate profile completion
function calculateProfileCompletion(profile) {
  let completed = 0;
  const fields = ['display_name', 'bio', 'location', 'website', 'avatar_url'];
  
  fields.forEach(field => {
    if (profile[field]) completed++;
  });
  
  return Math.round((completed / fields.length) * 100);
}

export default UserProfile;
