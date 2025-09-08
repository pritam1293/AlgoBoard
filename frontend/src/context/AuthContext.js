import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";
import userService from "../services/userService";
import {
  validateFormData,
  validationSchemas,
  sanitizeData,
  getPasswordStrength,
} from "../utils/validation";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

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
      // Accepts credentials with either username or email
      const sanitizedCredentials = sanitizeData(credentials);
      let identifier =
        sanitizedCredentials.username || sanitizedCredentials.email;
      let errors = {};
      if (
        !identifier ||
        (typeof identifier === "string" && !identifier.trim())
      ) {
        errors.identifier = "Username or Email is required";
      }
      if (
        !sanitizedCredentials.password ||
        (typeof sanitizedCredentials.password === "string" &&
          !sanitizedCredentials.password.trim())
      ) {
        errors.password = "Password is required";
      }
      if (Object.keys(errors).length > 0) {
        throw new Error(Object.values(errors)[0]);
      }
      const response = await authService.login(sanitizedCredentials);
      // response is AuthenticationResponse: { token, username, ...profile fields, expiresIn }
      setUser(response); // Store the whole profile/response object
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      if (typeof error === "object" && error.message) {
        throw new Error(String(error.message));
      } else if (typeof error === "string") {
        throw new Error(error);
      } else {
        throw new Error("Login failed. Please check your credentials.");
      }
    }
  };

  const signup = async (userData) => {
    try {
      const sanitizedUserData = sanitizeData(userData);

      // Remove confirmPassword from data sent to backend as it's not needed
      const { confirmPassword, ...dataForBackend } = sanitizedUserData;

      const response = await authService.signup(dataForBackend);
      // response is the profile object
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

  const updateUser = (updatedProfile) => {
    setUser(updatedProfile);
    localStorage.setItem("userData", JSON.stringify(updatedProfile));
  };

  const updateProfile = async (formData) => {
    setProfileLoading(true);
    setProfileMessage({ type: "", text: "" });
    try {
      const sanitizedData = sanitizeData(formData);
      const validationErrors = validateFormData(
        sanitizedData,
        validationSchemas.profile
      );
      if (Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0];
        setProfileMessage({ type: "error", text: firstError });
        return { success: false, validationErrors };
      }
      const response = await userService.updateUserProfile(sanitizedData);
      if (response.status === "success") {
        updateUser(response.data); // response.data is the updated profile
        setProfileMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setTimeout(() => {
          setProfileMessage({ type: "", text: "" });
        }, 3000);
        return { success: true };
      }
    } catch (error) {
      setProfileMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to update profile. Please try again.",
      });
      return { success: false, error };
    } finally {
      setProfileLoading(false);
    }
  };

  const clearProfileMessage = () => {
    setProfileMessage({ type: "", text: "" });
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
    const result = validateFormData(sanitizedData, validationSchemas.signup);
    return result;
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
