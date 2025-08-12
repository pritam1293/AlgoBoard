import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    student: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        student: formData.student
      });
      
      // Show success message and redirect to login after delay
      setErrors({}); // Clear any existing errors
      setSuccessMessage('Account created successfully! Please log in with your credentials.');
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      setErrors({
        general: error.message || 'Signup failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Main Container Box */}
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <span className="text-blue-400 text-4xl mr-3">⚡</span>
              <h1 className="text-3xl font-bold text-white">AlgoBoard</h1>
            </div>
            <h2 className="text-xl text-gray-300">Create your account</h2>
            <p className="mt-2 text-sm text-gray-400">
              Join the community and start tracking your competitive programming progress
            </p>
          </div>

          {/* Signup Form */}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}
            
            <div className="space-y-3">
            {/* First Name and Last Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-800 border ${
                    errors.firstName ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-800 border ${
                    errors.lastName ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-800 border ${
                  errors.username ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-800 border ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-800 border ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-800 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

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
              <label htmlFor="student" className="ml-2 block text-sm text-gray-300">
                I am a student
              </label>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-800 rounded mt-1"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
              I agree to the{' '}
              <button 
                type="button"
                className="text-blue-400 hover:text-blue-300 bg-transparent border-none cursor-pointer underline"
                onClick={() => navigate('/terms')}
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button 
                type="button"
                className="text-blue-400 hover:text-blue-300 bg-transparent border-none cursor-pointer underline"
                onClick={() => navigate('/privacy')}
              >
                Privacy Policy
              </button>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              isLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            } transition duration-200`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium transition duration-200"
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>

        {/* Features Preview */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-center text-sm font-medium text-gray-300 mb-3">What you'll get:</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-400">
              <span className="text-green-400 mr-3">✓</span>
              Track progress across Codeforces, AtCoder, CodeChef & LeetCode
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <span className="text-green-400 mr-3">✓</span>
              Compare your performance with friends
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <span className="text-green-400 mr-3">✓</span>
              Get insights and analytics on your coding journey
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <span className="text-green-400 mr-3">✓</span>
              Never miss a contest with our notification system
            </div>
          </div>

          {/* Platform Logos */}
          <div className="mt-4">
            <p className="text-center text-xs text-gray-500 mb-2">Supported Platforms</p>
            <div className="flex justify-center space-x-4">
              <a 
                href="https://codeforces.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200 cursor-pointer">
                  <img 
                    src="/images/platforms/codeforces_logo.png" 
                    alt="Codeforces" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </a>
              <a 
                href="https://atcoder.jp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200 cursor-pointer">
                  <img 
                    src="/images/platforms/atcoder_logo.png" 
                    alt="AtCoder" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </a>
              <a 
                href="https://www.codechef.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200 cursor-pointer">
                  <img 
                    src="/images/platforms/codechef_logo.jpg" 
                    alt="CodeChef" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </a>
              <a 
                href="https://leetcode.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200 cursor-pointer">
                  <img 
                    src="/images/platforms/LeetCode_logo.png" 
                    alt="LeetCode" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
        
        </div> {/* End of Main Container Box */}
      </div>
    </div>
  );
};

export default Signup;
