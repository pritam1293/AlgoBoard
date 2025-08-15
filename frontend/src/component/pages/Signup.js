import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPasswordStrength } from "../../utils/validation";

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
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Main Container Box - Form */}
        <div className="w-full lg:w-[440px]">
          <div className="bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 p-8">
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
                <div className="bg-green-900/50 border border-green-500 text-green-200 px-3 py-2 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}

              {/* General Error Message */}
              {errors.general && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <div className="space-y-2">
                {/* First Name and Last Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-gray-800 border ${
                        errors.firstName ? "border-red-500" : "border-gray-600"
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                      placeholder="First name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-gray-800 border ${
                        errors.lastName ? "border-red-500" : "border-gray-600"
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                      placeholder="Last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Username Field */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-800 border ${
                      errors.username ? "border-red-500" : "border-gray-600"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                    placeholder="Choose a username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.username}
                    </p>
                  )}
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
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-800 border ${
                      errors.email ? "border-red-500" : "border-gray-600"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Password
                    </label>
                    <div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-gray-800 border ${
                          errors.password ? "border-red-500" : "border-gray-600"
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                        placeholder="Enter password"
                        title="Password must contain: 8-15 characters, one uppercase (A-Z), one lowercase (a-z), one number (0-9), and one special character (!@#$%^&*)"
                      />
                      {formData.password && (
                        <div className="mt-1 flex items-center">
                          <span className="text-sm text-gray-400">
                            Strength:
                          </span>
                          <span
                            className={`ml-1 text-sm font-medium ${
                              passwordStrength.strength === "weak"
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
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-gray-800 border ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-600"
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.confirmPassword}
                      </p>
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
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                    isLoading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  } transition duration-200`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                      className="text-blue-400 hover:text-blue-300 font-medium"
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
