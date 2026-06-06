import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import MoodTracker from './pages/MoodTracker';
import UserProfile from './pages/UserProfile';
import ProfileEdit from './pages/ProfileEdit';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import ResourcesPage from './pages/ResourcesPage';
import CounsellingPage from './pages/CounsellingPage';
import AuthChoice from './pages/AuthChoice';
import AccountChoice from './pages/AccountChoice';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import './App.css';

function AppRoutes() {
  const { accessMode } = useAuth();

  // If user hasn't selected an access mode, show only auth choice
  if (!accessMode) {
    return (
      <Routes>
        <Route path="/auth-choice" element={<AuthChoice />} />
        <Route path="/account-choice" element={<AccountChoice />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/auth-choice" replace />} />
      </Routes>
    );
  }

  // After selecting mode, show all routes
  return (
    <>
      <Header />
      <Routes>
        <Route path="/auth-choice" element={<AuthChoice />} />
        <Route path="/account-choice" element={<AccountChoice />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/mood" element={<MoodTracker />} />
        <Route path="/counselling" element={<CounsellingPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
