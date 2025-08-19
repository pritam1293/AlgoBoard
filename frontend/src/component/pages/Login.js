import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  CONTAINER_CLASSES,
  MESSAGE_CLASSES,
  BUTTON_CLASSES,
} from "../../constants/styles";
import FormInput from "../common/FormInput";
import LoadingSpinner from "../common/LoadingSpinner";
import PlatformGrid from "../common/PlatformGrid";

const Login = () => {
  const navigate = useNavigate();
  const { login, validateLoginForm } = useAuth();
  const [formData, setFormData] = useState({
    identifier: "", // can be username or email
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Determine if identifier is email or username
    const isEmail = /\S+@\S+\.\S+/.test(formData.identifier);
    const loginPayload = {
      username: isEmail ? null : formData.identifier,
      email: isEmail ? formData.identifier : null,
      password: formData.password,
    };

    // Use AuthContext validation
    const validationErrors = validateLoginForm(loginPayload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await login(loginPayload);
      // Navigation will be handled by ProtectedRoute/PublicRoute
    } catch (error) {
      setErrors({
        general:
          error?.message || "Login failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={
        CONTAINER_CLASSES.page +
        " flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      }
    >
      <div className="max-w-md w-full space-y-8">
        <div className={CONTAINER_CLASSES.card}>
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <img
                src="/images/algoboard_logo.png"
                alt="AlgoBoard Logo"
                className="w-12 h-12 mr-3 bg-white rounded-lg p-2"
              />
              <h1 className="text-3xl font-bold text-white">AlgoBoard</h1>
            </div>
            <h2 className="text-xl text-gray-300">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-400">
              Track your competitive programming journey across multiple
              platforms
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* General Error Message */}
            {errors.general && (
              <div className={MESSAGE_CLASSES.error}>{errors.general}</div>
            )}

            <div className="space-y-4">
              {/* Username or Email Field */}
              <FormInput
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter your username or email"
                label="Username or Email"
                error={errors.identifier}
              />

              {/* Password Field */}
              <FormInput
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                label="Password"
                error={errors.password}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-800 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300 transition duration-200 bg-transparent border-none cursor-pointer"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={
                isLoading
                  ? BUTTON_CLASSES.primaryDisabled
                  : BUTTON_CLASSES.primary
              }
            >
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className={BUTTON_CLASSES.link}
                >
                  Sign up here
                </button>
              </p>
            </div>
          </form>

          {/* Platform Features */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400 mb-4">
              Supported Platforms
            </p>
            <PlatformGrid />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
