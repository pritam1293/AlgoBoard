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
  const [showPassword, setShowPassword] = useState(false);

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
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10 ${errors.password
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : ""
                      }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>
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
