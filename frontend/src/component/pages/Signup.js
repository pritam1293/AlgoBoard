import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPasswordStrength } from "../../utils/validation";
import {
  CONTAINER_CLASSES,
  BUTTON_CLASSES,
  MESSAGE_CLASSES,
} from "../../constants/styles";
import FormInput from "../common/FormInput";
import LoadingSpinner from "../common/LoadingSpinner";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, validateSignupForm } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    student: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(
    getPasswordStrength("")
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value,
    });

    // Update password strength when password changes
    if (e.target.name === "password") {
      setPasswordStrength(getPasswordStrength(value));
    }

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

    // Use AuthContext validation
    const validationErrors = validateSignupForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        student: formData.student,
      });
      // Show success message and redirect to login after delay
      setErrors({});
      setSuccessMessage(
        "Account created successfully! Please log in with your credentials."
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrors({
        general: error.message || "Signup failed. Please try again.",
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
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Main Container Box - Form */}
        <div className="w-full lg:w-[440px]">
          <div className={CONTAINER_CLASSES.card}>
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center items-center">
                <img
                  src="/images/algoboard_logo.png"
                  alt="AlgoBoard Logo"
                  className="w-10 h-10 mr-2 bg-white rounded-lg p-1.5"
                />
                <h1 className="text-2xl font-bold text-white">AlgoBoard</h1>
              </div>
              <h2 className="text-lg text-gray-300 mt-1">
                Create your account
              </h2>
            </div>

            {/* Signup Form */}
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              {/* Success Message */}
              {successMessage && (
                <div className={MESSAGE_CLASSES.success}>{successMessage}</div>
              )}

              {/* General Error Message */}
              {errors.general && (
                <div className={MESSAGE_CLASSES.error}>{errors.general}</div>
              )}

              <div className="space-y-2">
                {/* First Name and Last Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    id="firstName"
                    name="firstName"
                    type="text"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    error={errors.firstName}
                  />
                  <FormInput
                    id="lastName"
                    name="lastName"
                    type="text"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    error={errors.lastName}
                  />
                </div>

                {/* Username Field */}
                <div>
                  <FormInput
                    id="username"
                    name="username"
                    type="text"
                    label="Username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    error={errors.username}
                  />
                  {/* Username Warning Message */}
                  <div className="mt-2 flex items-start">
                    <svg
                      className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-yellow-400">
                      <strong>Choose carefully:</strong> Your username cannot be
                      changed after account creation and will be publicly
                      visible on leaderboards.
                    </p>
                  </div>
                </div>

                {/* Email Field */}
                <FormInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  error={errors.email}
                />

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        placeholder="Enter password"
                        title="Password must contain: 8-15 characters, one uppercase (A-Z), one lowercase (a-z), one number (0-9), and one special character (!@#$%^&*)"
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
                    {formData.password && (
                      <div className="mt-1 flex items-center">
                        <span className="text-sm text-gray-400">Strength:</span>
                        <span
                          className={`ml-1 text-sm font-medium ${passwordStrength.strength === "weak"
                            ? "text-red-400"
                            : passwordStrength.strength === "medium"
                              ? "text-yellow-400"
                              : passwordStrength.strength === "good"
                                ? "text-blue-400"
                                : "text-green-400"
                            }`}
                        >
                          {passwordStrength.strength}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-neutral-300 mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className={`block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10 ${errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : ""
                          }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
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
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2 mt-1">
                  {/* Student Checkbox */}
                  <div className="flex items-center">
                    <input
                      id="student"
                      name="student"
                      type="checkbox"
                      checked={formData.student}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-800 rounded"
                    />
                    <label
                      htmlFor="student"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      I am a student
                    </label>
                  </div>
                  {/* Terms and Privacy */}
                  <div className="flex items-start">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-800 rounded mt-0.5"
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      I agree to the{" "}
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-300 underline"
                        onClick={() => navigate("/terms")}
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-300 underline"
                        onClick={() => navigate("/privacy")}
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit and Login Link */}
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2 ${isLoading
                    ? BUTTON_CLASSES.primaryDisabled
                    : BUTTON_CLASSES.primary
                    }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-3">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className={
                        BUTTON_CLASSES.secondary + " text-sm font-medium"
                      }
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </div>
              {/* End of form content */}
            </form>
          </div>
        </div>

        {/* Features Preview */}
        <div className="w-full lg:w-[360px]">
          <div className="bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 p-8 sticky top-8">
            <h3 className="text-xl font-medium text-gray-300 mb-6">
              What you'll get:
            </h3>
            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <span>
                  Track progress across Codeforces, AtCoder, CodeChef & LeetCode
                </span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <span>Compare your performance with friends</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <span>Get insights and analytics on your coding journey</span>
              </div>
              <div className="flex items-center text-gray-300">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <span>Never miss a contest with our notification system</span>
              </div>

              {/* Supported Platforms */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <p className="text-center text-sm text-gray-400 mb-4">
                  Supported Platforms
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://codeforces.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200">
                      <img
                        src="/images/platforms/codeforces_logo.png"
                        alt="Codeforces"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </a>
                  <a
                    href="https://atcoder.jp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200">
                      <img
                        src="/images/platforms/atcoder_logo.png"
                        alt="AtCoder"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </a>
                  <a
                    href="https://www.codechef.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200">
                      <img
                        src="/images/platforms/codechef_logo.jpg"
                        alt="CodeChef"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </a>
                  <a
                    href="https://leetcode.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200">
                      <img
                        src="/images/platforms/LeetCode_logo.png"
                        alt="LeetCode"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
