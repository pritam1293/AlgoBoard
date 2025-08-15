import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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

    // Custom validation for identifier (username or email)
    let validationErrors = {};
    if (
      !formData.identifier ||
      (typeof formData.identifier === "string" && !formData.identifier.trim())
    ) {
      validationErrors.identifier = "Username or Email is required";
    }
    if (
      !formData.password ||
      (typeof formData.password === "string" && !formData.password.trim())
    ) {
      validationErrors.password = "Password is required";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    // Determine if identifier is email or username
    const isEmail = /\S+@\S+\.\S+/.test(formData.identifier);
    const loginPayload = {
      username: isEmail ? null : formData.identifier,
      email: isEmail ? formData.identifier : null,
      password: formData.password,
    };

    try {
      await login(loginPayload);
      // Navigation will be handled by ProtectedRoute/PublicRoute
    } catch (error) {
      setErrors({
        general:
          error && error.message && typeof error.message === "string"
            ? error.message
            : "Login failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Main Container Box */}
        <div className="bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 p-8">
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
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              {/* Username or Email Field */}
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Username or Email
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  value={formData.identifier}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 bg-gray-800 border ${
                    errors.identifier ? "border-red-500" : "border-gray-600"
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                  placeholder="Enter your username or email"
                />
                {errors.identifier && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.identifier}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 bg-gray-800 border ${
                    errors.password ? "border-red-500" : "border-gray-600"
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                  placeholder="Enter your password"
                />
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
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              } transition duration-200`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                  className="text-blue-400 hover:text-blue-300 font-medium transition duration-200"
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
            <div className="flex justify-center space-x-8">
              <div className="text-center group">
                <a
                  href="https://codeforces.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200 cursor-pointer">
                    <img
                      src="/images/platforms/codeforces_logo.png"
                      alt="Codeforces"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-white transition duration-200">
                    Codeforces
                  </div>
                </a>
              </div>
              <div className="text-center group">
                <a
                  href="https://atcoder.jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200 cursor-pointer">
                    <img
                      src="/images/platforms/atcoder_logo.png"
                      alt="AtCoder"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-white transition duration-200">
                    AtCoder
                  </div>
                </a>
              </div>
              <div className="text-center group">
                <a
                  href="https://www.codechef.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200 cursor-pointer">
                    <img
                      src="/images/platforms/codechef_logo.jpg"
                      alt="CodeChef"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-white transition duration-200">
                    CodeChef
                  </div>
                </a>
              </div>
              <div className="text-center group">
                <a
                  href="https://leetcode.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200 cursor-pointer">
                    <img
                      src="/images/platforms/LeetCode_logo.png"
                      alt="LeetCode"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-white transition duration-200">
                    LeetCode
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* End of Main Container Box */}
      </div>
    </div>
  );
};

export default Login;
