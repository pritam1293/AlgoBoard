import React, { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'signup', 'dashboard', 'terms', 'privacy'
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleSignup = (userData) => {
    // In a real app, you'd create the account first
    // For now, we'll just log them in with mock data
    setUser({
      ...userData,
      codeforcesRating: 0,
      atcoderRating: 0,
      codechefRating: 0
    });
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const switchToLogin = () => {
    setCurrentPage('login');
  };

  const switchToSignup = () => {
    setCurrentPage('signup');
  };

  const switchToTerms = () => {
    setCurrentPage('terms');
  };

  const switchToPrivacy = () => {
    setCurrentPage('privacy');
  };

  if (currentPage === 'login') {
    return (
      <Login 
        onLogin={handleLogin}
        switchToSignup={switchToSignup}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <Signup 
        onSignup={handleSignup}
        switchToLogin={switchToLogin}
        switchToTerms={switchToTerms}
        switchToPrivacy={switchToPrivacy}
      />
    );
  }

  if (currentPage === 'terms') {
    return (
      <TermsOfService 
        switchToSignup={switchToSignup}
      />
    );
  }

  if (currentPage === 'privacy') {
    return (
      <PrivacyPolicy 
        switchToSignup={switchToSignup}
      />
    );
  }

  if (currentPage === 'dashboard') {
    return (
      <Dashboard 
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}

export default App;
