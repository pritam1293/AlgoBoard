import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { validateFormData, validationSchemas, sanitizeData, getPasswordStrength } from '../utils/validation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Check if user is already logged in on app start
    const initializeAuth = () => {
      if (authService.isAuthenticated()) {
        const userData = authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // Validate login data
      const sanitizedCredentials = sanitizeData(credentials);
      const validationErrors = validateFormData(sanitizedCredentials, validationSchemas.login);
      
      if (Object.keys(validationErrors).length > 0) {
        // Create a user-friendly error message
        const firstError = Object.values(validationErrors)[0];
        throw new Error(firstError);
      }

      const userData = await authService.login(sanitizedCredentials);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      // Validate signup data
      const sanitizedUserData = sanitizeData(userData);
      const validationErrors = validateFormData(sanitizedUserData, validationSchemas.signup);
      
      if (Object.keys(validationErrors).length > 0) {
        // Create a user-friendly error message
        const firstError = Object.values(validationErrors)[0];
        throw new Error(firstError);
      }

      const response = await authService.signup(sanitizedUserData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    // Also update localStorage to persist the changes
    const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const newUserData = { ...currentUserData, ...updatedUserData };
    localStorage.setItem('userData', JSON.stringify(newUserData));
  };

  const updateProfile = async (formData) => {
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });
    
    try {
      // Validate and sanitize profile data
      const sanitizedData = sanitizeData(formData);
      const validationErrors = validateFormData(sanitizedData, validationSchemas.profile);
      
      if (Object.keys(validationErrors).length > 0) {
        // Show first validation error
        const firstError = Object.values(validationErrors)[0];
        setProfileMessage({ 
          type: 'error', 
          text: firstError 
        });
        return { success: false, validationErrors };
      }
      
      // Prepare complete user data for backend
      const updateData = {
        username: user?.username,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        email: sanitizedData.email,
        student: sanitizedData.student
      };
      
      // Call backend API to update profile
      const response = await userService.updateUserProfile(updateData);
      
      if (response.status === 'success') {
        // Update user in context with new data
        updateUser({
          ...user,
          ...sanitizedData
        });
        
        setProfileMessage({ 
          type: 'success', 
          text: 'Profile updated successfully!' 
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setProfileMessage({ type: '', text: '' });
        }, 3000);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
      return { success: false, error };
    } finally {
      setProfileLoading(false);
    }
  };

  const clearProfileMessage = () => {
    setProfileMessage({ type: '', text: '' });
  };

  // Validation helpers for real-time field validation
  const validateLoginField = (fieldName, value, allData = {}) => {
    const sanitizedData = sanitizeData({ ...allData, [fieldName]: value });
    const errors = validateFormData(sanitizedData, validationSchemas.login);
    return errors[fieldName] || null;
  };

  const validateSignupField = (fieldName, value, allData = {}) => {
    const sanitizedData = sanitizeData({ ...allData, [fieldName]: value });
    const errors = validateFormData(sanitizedData, validationSchemas.signup);
    return errors[fieldName] || null;
  };

  const validateProfileField = (fieldName, value, allData = {}) => {
    const sanitizedData = sanitizeData({ ...allData, [fieldName]: value });
    const errors = validateFormData(sanitizedData, validationSchemas.profile);
    return errors[fieldName] || null;
  };

  // Complete form validation functions
  const validateLoginForm = (data) => {
    const sanitizedData = sanitizeData(data);
    return validateFormData(sanitizedData, validationSchemas.login);
  };

  const validateSignupForm = (data) => {
    const sanitizedData = sanitizeData(data);
    return validateFormData(sanitizedData, validationSchemas.signup);
  };

  const validateProfileForm = (data) => {
    const sanitizedData = sanitizeData(data);
    return validateFormData(sanitizedData, validationSchemas.profile);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    profileLoading,
    profileMessage,
    login,
    signup,
    logout,
    updateUser,
    updateProfile,
    clearProfileMessage,
    // Validation functions
    validateLoginField,
    validateSignupField,
    validateProfileField,
    validateLoginForm,
    validateSignupForm,
    validateProfileForm,
    // Password strength utility
    getPasswordStrength,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
