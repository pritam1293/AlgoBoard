import React, { useState, useEffect } from "react";
import userService from "../../services/userService";

const UserInfo = ({ user, isOwnProfile = true }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        if (isOwnProfile) {
          // For own profile, use the existing method
          const response = await userService.getUserProfile();
          if (response.status === 'success') {
            setProfileData(response.data);
          } else {
            setError('Failed to load profile data');
          }
        } else {
          // For other users, fetch their profile data by email
          const response = await userService.getUserProfileByEmail(user.email);
          if (response.status === 'success') {
            setProfileData(response.data);
          } else {
            setError('Failed to load user profile');
          }
        }
      } catch (err) {
        setError('Error fetching profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user?.email, isOwnProfile]);

  if (loading) {
    return (
      <div className="w-full mb-6">
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-neutral-300">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mb-6">
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div className="text-center text-red-400 py-4">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const userData = isOwnProfile
    ? { ...(profileData || {}), ...(user || {}) }
    : profileData || user;
  const allPlatforms = [
    { name: 'Codeforces', username: userData?.codeforcesUsername, color: 'text-blue-400' },
    { name: 'AtCoder', username: userData?.atcoderUsername, color: 'text-green-400' },
    { name: 'CodeChef', username: userData?.codechefUsername, color: 'text-orange-400' },
    { name: 'LeetCode', username: userData?.leetcodeUsername, color: 'text-yellow-400' }
  ];

  return (
    <div className="w-full mb-6">
      <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-neutral-600 pb-3">
          Profile Information
        </h2>

        <div className="space-y-6">
          {/* Profile Header with Avatar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white text-2xl font-bold">
                  {userData?.firstName?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {userData?.firstName} {userData?.lastName}
                </h3>
                <p className="text-neutral-400 break-all">{userData?.email}</p>
              </div>
            </div>

          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="bg-neutral-700/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <span className="mr-2">👤</span>
                Basic Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300 font-medium">Email:</span>
                  <span className="text-white break-all">{userData?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300 font-medium">Full Name:</span>
                  <span className="text-white">{userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Competitive Programming Platforms */}
            <div className="bg-neutral-700/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <span className="mr-2">🔗</span>
                Competitive Programming Platforms
              </h4>
              <div className="space-y-3">
                {allPlatforms.map((platform, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-neutral-300 font-medium">{platform.name}:</span>
                    {platform.username && platform.username.trim() ? (
                      <span className={`font-mono ${platform.color} font-medium`}>
                        {platform.username}
                      </span>
                    ) : (
                      <span className="text-neutral-500 font-medium">
                        Not connected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
