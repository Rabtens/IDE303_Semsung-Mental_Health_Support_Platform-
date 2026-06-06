import React, { createContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth Context
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Initialize accessMode from localStorage to persist across page reloads
  const [accessMode, setAccessMode] = useState(() => {
    const stored = localStorage.getItem('semzung_access_mode');
    return stored || null;
  });
  // Initialize sessionId from localStorage to persist across page reloads
  const [sessionId, setSessionId] = useState(() => {
    const stored = localStorage.getItem('semzung_session_id');
    return stored || null;
  });
  const [userProfile, setUserProfile] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get stored access mode (already initialized from localStorage above)
        const storedMode = localStorage.getItem('semzung_access_mode');
        const storedSessionId = localStorage.getItem('semzung_session_id');
        
        // Update state if not already set
        if (storedSessionId && !sessionId) setSessionId(storedSessionId);
        if (storedMode && !accessMode) setAccessMode(storedMode);

        // Check if user is logged in
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        
        // If user is logged in but access mode isn't set, set it to registered
        if (currentUser && !storedMode) {
          setAccessMode('registered');
          localStorage.setItem('semzung_access_mode', 'registered');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      // If user just logged in, set registered mode and fetch profile
      if (session?.user && !localStorage.getItem('semzung_access_mode')) {
        setAccessMode('registered');
        localStorage.setItem('semzung_access_mode', 'registered');
        
        // Fetch profile for this user
        fetchUserProfile(session.user.id);
      } else if (session?.user) {
        // User is already logged in from storage, fetch their profile
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription?.unsubscribe();
    // This initialization effect intentionally runs once; auth changes are handled by the subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    localStorage.removeItem('semzung_access_mode');
    localStorage.removeItem('semzung_session_id');
    setAccessMode(null);
  };

  const setPublicMode = () => {
    const id = 'public_' + Date.now();
    setAccessMode('public');
    setSessionId(id);
    localStorage.setItem('semzung_access_mode', 'public');
    localStorage.setItem('semzung_session_id', id);
  };

  const setAnonymousMode = () => {
    const id = 'anon_' + Date.now() + Math.random().toString(36).slice(2, 8);
    setAccessMode('anonymous');
    setSessionId(id);
    localStorage.setItem('semzung_access_mode', 'anonymous');
    localStorage.setItem('semzung_session_id', id);
  };

  const resetAccessMode = () => {
    localStorage.removeItem('semzung_access_mode');
    localStorage.removeItem('semzung_session_id');
    setAccessMode(null);
    setSessionId(null);
  };

  const fetchUserProfile = async (userId) => {
    try {
      const res = await fetch(`/api/profile/${userId}`);
      const data = await res.json();
      if (data.profile) {
        setUserProfile(data.profile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const setRegisteredMode = () => {
    setAccessMode('registered');
    localStorage.setItem('semzung_access_mode', 'registered');
  };

  const updateUserProfile = (profile) => {
    setUserProfile(profile);
  };

  const value = {
    user,
    loading,
    accessMode,
    sessionId,
    userProfile,
    signUp,
    signIn,
    signOut,
    setPublicMode,
    setAnonymousMode,
    setRegisteredMode,
    resetAccessMode,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
