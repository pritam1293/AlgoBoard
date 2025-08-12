import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/common/Navbar';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { 
    user, 
    logout, 
    updateProfile, 
    profileLoading, 
    profileMessage, 
    clearProfileMessage,
    validateProfileForm 
  } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    student: user?.student || false
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleSaveProfile = async () => {
    // Validate before saving
    const errors = validateProfileForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({}); // Clear any existing validation errors
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      student: user?.student || false
    });
    setValidationErrors({}); // Clear validation errors
    setIsEditing(false);
    clearProfileMessage(); // Clear any messages
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar user={user} onLogout={logout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center text-neutral-400 hover:text-white transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-neutral-400">
            Manage your account settings and personal information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 mb-8">
          {/* Success/Error Messages */}
          {profileMessage.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              profileMessage.type === 'success' 
                ? 'bg-green-900/50 border border-green-500 text-green-200' 
                : 'bg-red-900/50 border border-red-500 text-red-200'
            }`}>
              <div className="flex items-center">
                {profileMessage.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {profileMessage.text}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-2xl font-bold">
                  {user?.firstName?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-neutral-400">@{user?.username}</p>
                <p className="text-neutral-500 text-sm">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                First Name
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      validationErrors.firstName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-neutral-600 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.firstName && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.firstName}</p>
                  )}
                </div>
              ) : (
                <p className="text-white py-2">{user?.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      validationErrors.lastName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-neutral-600 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.lastName && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.lastName}</p>
                  )}
                </div>
              ) : (
                <p className="text-white py-2">{user?.lastName}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Username
              </label>
              <div className="flex items-center justify-between">
                <p className="text-white py-2">@{user?.username}</p>
                <div className="flex items-center text-neutral-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Cannot be changed</span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      validationErrors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-neutral-600 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-white py-2">{user?.email}</p>
              )}
            </div>

            {/* Student Status */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                {isEditing ? (
                  <input
                    type="checkbox"
                    name="student"
                    checked={formData.student}
                    onChange={handleInputChange}
                    className="mr-2 w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500"
                  />
                ) : (
                  <div className={`mr-2 w-4 h-4 rounded ${user?.student ? 'bg-blue-600' : 'bg-neutral-600'}`}>
                    {user?.student && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
                <span className="text-sm font-medium text-neutral-300">
                  I am a student
                </span>
              </label>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className={`px-4 py-2 rounded-lg transition duration-200 flex items-center ${
                  profileLoading 
                    ? 'bg-blue-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {profileLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Account Stats */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Account Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">0</p>
              <p className="text-neutral-400 text-sm">Connected Platforms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">0</p>
              <p className="text-neutral-400 text-sm">Contest Participations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
              <p className="text-neutral-400 text-sm">Member Since</p>
            </div>
          </div>
        </div>

        {/* Platform Connections */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 className="text-xl font-semibold text-white mb-4">Platform Connections</h3>
          <p className="text-neutral-400 mb-4">
            Connect your competitive programming accounts to track your progress
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Codeforces */}
            <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg">
              <div className="flex items-center">
                <img 
                  src="/images/platforms/codeforces_logo.png" 
                  alt="Codeforces" 
                  className="w-8 h-8 mr-3"
                />
                <span className="text-white">Codeforces</span>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200">
                Connect
              </button>
            </div>

            {/* AtCoder */}
            <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg">
              <div className="flex items-center">
                <img 
                  src="/images/platforms/atcoder_logo.png" 
                  alt="AtCoder" 
                  className="w-8 h-8 mr-3"
                />
                <span className="text-white">AtCoder</span>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200">
                Connect
              </button>
            </div>

            {/* CodeChef */}
            <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg">
              <div className="flex items-center">
                <img 
                  src="/images/platforms/codechef_logo.jpg" 
                  alt="CodeChef" 
                  className="w-8 h-8 mr-3 rounded"
                />
                <span className="text-white">CodeChef</span>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200">
                Connect
              </button>
            </div>

            {/* LeetCode */}
            <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg">
              <div className="flex items-center">
                <img 
                  src="/images/platforms/LeetCode_logo.png" 
                  alt="LeetCode" 
                  className="w-8 h-8 mr-3"
                />
                <span className="text-white">LeetCode</span>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
