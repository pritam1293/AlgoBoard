import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";

const UserInfo = ({ user, isOwnProfile = true }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFriends, setShowFriends] = useState(false);
  const [error, setError] = useState(null);
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [localIsFriend, setLocalIsFriend] = useState(false);

  useEffect(() => {
    console.log('Profile data useEffect triggered:', { user: user?.username, isOwnProfile });

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        if (isOwnProfile) {
          // For own profile, use the existing method
          console.log('Fetching own profile data');
          const response = await userService.getUserProfile();
          if (response.status === 'success') {
            setProfileData(response.data);
          } else {
            setError('Failed to load profile data');
          }
        } else {
          // For other users, fetch their profile data by username
          console.log('Fetching profile data for user:', user.username);
          const response = await userService.getUserProfileByUsername(user.username);
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

    if (user?.username) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user?.username, isOwnProfile]);

  // Check friendship status using backend API
  useEffect(() => {
    const checkFriendshipStatus = async () => {
      // Only use profileData if it's loaded, otherwise don't check
      if (!profileData) return;

      const userData = profileData;
      if (currentUser?.username && userData?.username && !isOwnProfile && !loading) {
        try {
          console.log('Checking friendship status for:', userData.username);
          const response = await userService.checkFriendshipStatus(currentUser.username, userData.username);
          if (response.status === 'success') {
            setLocalIsFriend(response.data.isFriend);
            console.log('Friendship status from API:', response.data.isFriend);
          }
        } catch (error) {
          console.error('Error checking friendship status:', error);
          setLocalIsFriend(false);
        }
      }
    };

    // Only check friendship status after profile data is loaded and when viewing other's profile
    if (!loading && !isOwnProfile && profileData) {
      checkFriendshipStatus();
    }
  }, [currentUser?.username, isOwnProfile, loading, profileData]);

  // Check if the viewed user is a friend of the current user
  const isFriend = localIsFriend;

  // Handle Add Friend
  const handleAddFriend = async () => {
    const userData = profileData || user;
    try {
      setFriendActionLoading(true);
      console.log('Adding friend:', userData.username);
      const response = await userService.addFriend(currentUser.username, userData.username);
      console.log('Add friend response:', response);

      if (response.status === 'success') {
        // Verify friendship status with backend API
        try {
          const statusResponse = await userService.checkFriendshipStatus(currentUser.username, userData.username);
          if (statusResponse.status === 'success') {
            setLocalIsFriend(statusResponse.data.isFriend);
            console.log('Friendship status verified:', statusResponse.data.isFriend);
          }
        } catch (statusError) {
          console.error('Error verifying friendship status:', statusError);
          // Fallback to optimistic update
          setLocalIsFriend(true);
        }
      } else {
        console.error('Failed to add friend:', response);
        alert(`Failed to add friend: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Failed to add friend. Please try again.');
    } finally {
      setFriendActionLoading(false);
    }
  };

  // Handle Remove Friend
  const handleRemoveFriend = async () => {
    const userData = profileData || user;
    try {
      setFriendActionLoading(true);
      console.log('Removing friend:', userData.username);
      const response = await userService.removeFriend(currentUser.username, userData.username);
      console.log('Remove friend response:', response);

      if (response.status === 'success') {
        // Verify friendship status with backend API
        try {
          const statusResponse = await userService.checkFriendshipStatus(currentUser.username, userData.username);
          if (statusResponse.status === 'success') {
            setLocalIsFriend(statusResponse.data.isFriend);
            console.log('Friendship status verified:', statusResponse.data.isFriend);
          }
        } catch (statusError) {
          console.error('Error verifying friendship status:', statusError);
          // Fallback to optimistic update
          setLocalIsFriend(false);
        }
      } else {
        console.error('Failed to remove friend:', response);
        alert(`Failed to remove friend: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend. Please try again.');
    } finally {
      setFriendActionLoading(false);
    }
  };

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

  const userData = profileData || user;
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
                <p className="text-neutral-400">{userData?.username}</p>
              </div>
            </div>

            {/* Add/Remove Friend Button - Only show for other users' profiles */}
            {!isOwnProfile && currentUser && userData?.username && (
              <div className="flex-shrink-0">
                {isFriend ? (
                  <button
                    onClick={handleRemoveFriend}
                    disabled={friendActionLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center ${friendActionLoading
                      ? 'bg-red-400 text-white cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                  >
                    {friendActionLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Removing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove Friend
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleAddFriend}
                    disabled={friendActionLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center ${friendActionLoading
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {friendActionLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Friend
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
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
                  <span className="text-neutral-300 font-medium">Username:</span>
                  <span className="text-white font-mono">{userData?.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300 font-medium">Full Name:</span>
                  <span className="text-white">{userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : 'Not provided'}</span>
                </div>
                {/* Only show email for own profile */}
                {isOwnProfile && userData?.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300 font-medium">Email:</span>
                    <span className="text-white break-all">{userData?.email}</span>
                  </div>
                )}
                {/* Show institution if it exists and has content */}
                {userData?.institutionName && userData?.institutionName.trim() && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300 font-medium">Institution:</span>
                    <span className="text-white">{userData?.institutionName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300 font-medium">Student:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${userData?.student
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                    : 'bg-red-600/20 text-red-400 border border-red-500/30'
                    }`}>
                    {userData?.student ? 'Yes' : 'No'}
                  </span>
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

            {/* Friends Section - Only show for own profile */}
            {isOwnProfile && (
              <div className="bg-neutral-700/50 rounded-lg p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowFriends(!showFriends)}
                >
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    <span className="mr-2">👥</span>
                    My Friends
                    {userData?.friends && userData.friends.length > 0 && (
                      <span className="ml-2 bg-blue-600/20 text-blue-400 text-sm px-2 py-1 rounded border border-blue-500/30">
                        {userData.friends.length}
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center">
                    <span className="text-neutral-400 text-sm mr-2">
                      {showFriends ? 'Hide' : 'Show'}
                    </span>
                    <svg
                      className={`w-5 h-5 text-neutral-400 transition-transform ${showFriends ? 'transform rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {showFriends && (
                  <div className="mt-4">
                    {userData?.friends && userData.friends.length > 0 ? (
                      <div className="space-y-2">
                        {userData.friends.map((friend, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-neutral-800/50 rounded-lg p-3 hover:bg-neutral-800/80 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white text-sm font-bold">
                                  {friend[0]?.toUpperCase()}
                                </span>
                              </div>
                              <span className="text-white font-medium">@{friend}</span>
                            </div>
                            <button
                              onClick={() => navigate(`/profile/${friend}`)}
                              className="text-blue-400 hover:text-blue-300 text-sm hover:underline transition-colors"
                            >
                              View Profile
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <span className="text-neutral-400">No friends added yet</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
