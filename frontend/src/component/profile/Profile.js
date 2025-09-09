import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../common/Navbar";
import BackButton from "../common/BackButton";
import { useAuth } from "../../context/AuthContext";
import UserInfo from "./UserInfo";
import PlatformStatistics from "../common/PlatformStatistics";
import { PLATFORMS } from "../../config/platformsConfig";
import platformService from "../../services/platformService";
import userService from "../../services/userService";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams();

  // Check if this is the current user's profile or someone else's
  const isOwnProfile = !username || username === user?.username;
  const profileUsername = isOwnProfile ? user?.username : username;

  // CP Statistics State
  const [selectedPlatform, setSelectedPlatform] = useState({ id: 'all', name: 'All Platforms' });
  const [platformData, setPlatformData] = useState(null);
  const [allPlatformsData, setAllPlatformsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contestPage, setContestPage] = useState(0);
  const [solutionsPage, setSolutionsPage] = useState(0);

  // Profile user data state
  const [profileUserData, setProfileUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch profile user data
  useEffect(() => {
    const fetchProfileUserData = async () => {
      try {
        setProfileLoading(true);
        if (isOwnProfile) {
          setProfileUserData(user);
        } else {
          const response = await userService.getUserProfileByUsername(profileUsername);
          if (response.status === 'success') {
            setProfileUserData(response.data);
          }
        }
      } catch (err) {
        console.error('Error fetching profile user data:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (profileUsername) {
      fetchProfileUserData();
    }
  }, [profileUsername, isOwnProfile, user]);

  // Get list of connected platforms based on profile user data
  const connectedPlatforms = PLATFORMS.filter((platform) => {
    return Boolean(profileUserData?.[platform.usernameField]);
  });

  // Use the shared PlatformStatistics component
  const platformStats = PlatformStatistics({
    platformData,
    selectedPlatform,
    allPlatformsData,
    contestPage,
    setContestPage,
    solutionsPage,
    setSolutionsPage
  });

  // Handle platform data loading
  const loadPlatformData = async (platform) => {
    if (!platform || !profileUsername) return;

    setLoading(true);
    setError(null);
    setPlatformData(null);

    try {
      const stats = await platformService.getProfileByPlatform(platform.id, profileUsername);

      if (stats?.data) {
        setPlatformData(stats.data);
        setContestPage(0);
        setSolutionsPage(0);
      }
    } catch (err) {
      setError(`Failed to fetch ${platform.name} statistics`);
    } finally {
      setLoading(false);
    }
  };

  // Handle all platforms data loading
  const loadAllPlatformsData = async () => {
    if (!profileUsername) return;

    setLoading(true);
    setError(null);
    setPlatformData(null);

    try {
      const response = await platformService.getAllPlatformsData(profileUsername);

      if (response?.data) {
        const allData = {};
        const platformsData = response.data;

        connectedPlatforms.forEach(platform => {
          const platformId = platform.id;
          if (platformsData[platformId]) {
            allData[platformId] = {
              platform,
              data: platformsData[platformId]
            };
          }
        });

        setAllPlatformsData(allData);
      }
    } catch (err) {
      setError('Failed to fetch statistics from platforms');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load all platforms data when component mounts
  useEffect(() => {
    if (profileUsername && connectedPlatforms.length > 0 && !profileLoading) {
      // If we have connected platforms and selected platform is 'all', load the data
      if (selectedPlatform?.id === 'all') {
        loadAllPlatformsData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUsername, connectedPlatforms.length, profileLoading, selectedPlatform?.id]);

  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    if (platform?.id === 'all') {
      loadAllPlatformsData();
    } else {
      loadPlatformData(platform);
    }
  };

  // Get platform colors for better visual distinction
  const getPlatformColor = (platformId) => {
    const colors = {
      codeforces: 'from-red-500 to-red-600',
      atcoder: 'from-green-500 to-green-600',
      codechef: 'from-yellow-500 to-yellow-600',
      leetcode: 'from-blue-500 to-blue-600'
    };
    return colors[platformId] || 'from-gray-500 to-gray-600';
  };

  // Get rank/rating color based on platform
  const getRankColor = (platform, value) => {
    if (platform === 'codeforces') {
      if (value >= 2100) return 'text-red-400';
      if (value >= 1900) return 'text-purple-400';
      if (value >= 1600) return 'text-blue-400';
      if (value >= 1400) return 'text-cyan-400';
      if (value >= 1200) return 'text-green-400';
      return 'text-gray-400';
    }
    return 'text-blue-400';
  };

  // Render all platforms summary with improved design
  const renderAllPlatformsSummary = () => {
    const platformEntries = Object.entries(allPlatformsData);

    if (platformEntries.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">No data available from connected platforms</p>
          <p className="text-gray-500 text-sm mt-2">Statistics will appear here once data is loaded</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Enhanced Platform Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {platformEntries.map(([platformId, { platform, data }]) => (
            <div key={platformId} className="group relative">
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getPlatformColor(platformId)} opacity-10 rounded-xl transition-opacity group-hover:opacity-20`}></div>

              {/* Card content */}
              <div className="relative bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 rounded-xl p-6 h-full transition-all duration-300 hover:border-neutral-600 hover:shadow-lg">
                {/* Platform header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white truncate">{platform.name}</h3>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPlatformColor(platformId)}`}></div>
                </div>

                {/* Stats grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-400">Username</span>
                    <span className="text-sm font-semibold text-white truncate ml-2">{data.username}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-400">Rating</span>
                    <span className={`text-sm font-bold ${getRankColor(platformId, data.rating)}`}>
                      {data.rating || 'Unrated'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-400">Max Rating</span>
                    <span className="text-sm font-bold text-green-400">
                      {data.maxRating || 'Unrated'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-400">Contests</span>
                    <span className="text-sm font-semibold text-orange-400">
                      {data.contestParticipations || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-400">Rank</span>
                    <span className="text-sm font-semibold text-purple-400 truncate ml-2">
                      {data.rank || "Unranked"}
                    </span>
                  </div>
                </div>


              </div>
            </div>
          ))}
        </div>


        {/* Rating Progression Chart */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Rating Progression
          </h3>
          {platformStats.renderAllPlatformsChart()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar user={user} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton onBack={() => navigate("/home")} />

        {/* Main Content Layout */}
        <div className="space-y-8 mt-6">

          {/* Profile Information - Full Width */}
          <div>
            <UserInfo user={isOwnProfile ? user : { username: profileUsername }} isOwnProfile={isOwnProfile} />
          </div>

          {/* CP Statistics Section - Full Width */}
          <div>
            {profileLoading ? (
              /* Loading Profile Data */
              <div className="text-center py-16 bg-neutral-800/30 rounded-xl border border-neutral-700">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                </div>
                <p className="text-gray-300 mt-4 text-lg">Loading profile data...</p>
                <p className="text-gray-500 text-sm mt-1">This may take a few moments</p>
              </div>
            ) : connectedPlatforms.length > 0 ? (
              <div>
                {/* Header Section */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-3 flex items-center">
                    <svg className="w-8 h-8 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {isOwnProfile ? 'Your' : `${profileUsername}'s`} Competitive Programming Statistics
                  </h2>
                  <p className="text-gray-400 text-lg">
                    Track {isOwnProfile ? 'your' : 'their'} progress and performance across multiple platforms
                  </p>
                </div>

                {/* Profile Update Notice - Enhanced - Only show for own profile */}
                {isOwnProfile && (
                  <div className="mb-8 bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700/50 rounded-xl p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-blue-200 mb-2">
                          Data Update Information
                        </h3>
                        <p className="text-blue-300 leading-relaxed">
                          Profile statistics are automatically updated and may vary by up to 1 hour from real-time platform data.
                          This ensures optimal performance while maintaining accuracy across all connected platforms.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Platform Selection */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold text-gray-200 mb-3">
                    Select Platform to View
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPlatform?.id || ""}
                      onChange={(e) => {
                        if (e.target.value === 'all') {
                          handlePlatformSelect({ id: 'all', name: 'All Platforms' });
                        } else {
                          const platform = connectedPlatforms.find(
                            (p) => p.id === e.target.value
                          );
                          if (platform) handlePlatformSelect(platform);
                        }
                      }}
                      className="w-full max-w-md px-4 py-3 bg-neutral-800 border-2 border-neutral-600 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer hover:border-neutral-500"
                    >
                      <option value="">Choose a platform...</option>
                      {connectedPlatforms.length > 0 && (
                        <option value="all">📊 All Platforms Overview</option>
                      )}
                      {connectedPlatforms.map((platform) => (
                        <option key={platform.id} value={platform.id}>
                          🏆 {platform.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Enhanced Loading State */}
                {loading && (
                  <div className="text-center py-16 bg-neutral-800/30 rounded-xl border border-neutral-700">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                    </div>
                    <p className="text-gray-300 mt-4 text-lg">Loading statistics...</p>
                    <p className="text-gray-500 text-sm mt-1">This may take a few moments</p>
                  </div>
                )}

                {/* Enhanced Error State */}
                {error && (
                  <div className="bg-red-900/30 border-2 border-red-800/50 text-red-300 rounded-xl p-6 mb-6">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-red-200 mb-1">Error Loading Data</h4>
                        <p className="text-red-300">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Platforms Data Display */}
                {selectedPlatform?.id === 'all' && Object.keys(allPlatformsData).length > 0 && !loading && (
                  <div className="space-y-8">
                    {renderAllPlatformsSummary()}
                  </div>
                )}

                {/* No All Platforms Data Yet */}
                {selectedPlatform?.id === 'all' && Object.keys(allPlatformsData).length === 0 && !loading && (
                  <div className="text-center py-16 bg-neutral-800/30 rounded-xl border border-neutral-700">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-700 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Platform Data Available</h3>
                    <p className="text-gray-400 text-lg max-w-md mx-auto">
                      Make sure you have connected and configured your competitive programming platforms in your profile settings.
                    </p>
                  </div>
                )}

                {/* Single Platform Data Display */}
                {platformData && selectedPlatform && selectedPlatform?.id !== 'all' && !loading && (
                  <div className="space-y-8">
                    {/* Enhanced Basic Stats */}
                    <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-800/60 backdrop-blur-sm rounded-xl p-8 border border-neutral-700">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getPlatformColor(selectedPlatform.id)} mr-3`}></div>
                        {selectedPlatform.name} Statistics
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                          <p className="text-sm text-gray-400 mb-1">Username</p>
                          <p className="text-lg font-semibold text-white truncate">
                            {platformData.username}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                          <p className="text-sm text-gray-400 mb-1">
                            {selectedPlatform?.id === 'leetcode' ? 'Rank' : 'Rating'}
                          </p>
                          <p className={`text-lg font-bold ${getRankColor(selectedPlatform.id, platformData.rating)}`}>
                            {selectedPlatform?.id === 'leetcode'
                              ? (platformData.rank || "Unranked")
                              : (platformData.rating || "Unrated")
                            }
                          </p>
                        </div>
                        <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                          <p className="text-sm text-gray-400 mb-1">
                            {selectedPlatform?.id === 'leetcode' ? 'Rating' : 'Max Rating'}
                          </p>
                          <p className="text-lg font-bold text-green-400">
                            {selectedPlatform?.id === 'leetcode'
                              ? (platformData.rating || "Unrated")
                              : (platformData.maxRating || "Unrated")
                            }
                          </p>
                        </div>

                        {/* Hide Problems Solved, Total Submissions, and Accepted Submissions for AtCoder and CodeChef */}
                        {selectedPlatform?.id !== 'atcoder' && selectedPlatform?.id !== 'codechef' && (
                          <>
                            <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">Problems Solved</p>
                              <p className="text-lg font-bold text-purple-400">
                                {selectedPlatform?.id === 'leetcode'
                                  ? (platformData.problemsSolved?.all || 0)
                                  : (platformData.problemsSolved || 0)
                                }
                              </p>
                            </div>
                            <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">Total Submissions</p>
                              <p className="text-lg font-bold text-yellow-400">
                                {selectedPlatform?.id === 'leetcode'
                                  ? (platformData.totalSubmissions?.all || 0)
                                  : (platformData.totalSubmissions || 0)
                                }
                              </p>
                            </div>
                            <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">Accepted Submissions</p>
                              <p className="text-lg font-bold text-emerald-400">
                                {selectedPlatform?.id === 'leetcode'
                                  ? (platformData.acceptedSubmissions?.all || 0)
                                  : (platformData.acceptedSubmissions || 0)
                                }
                              </p>
                            </div>
                          </>
                        )}

                        {/* CodeChef specific stats in basic stats section */}
                        {selectedPlatform?.id === 'codechef' && (
                          <>
                            <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">Current Rank</p>
                              <p className="text-lg font-bold text-orange-400">
                                {platformData.rank || "Unranked"}
                              </p>
                            </div>
                            <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">Max Rank</p>
                              <p className="text-lg font-bold text-yellow-400">
                                {platformData.maxRank || "Unranked"}
                              </p>
                            </div>
                          </>
                        )}

                        <div className="text-center p-4 bg-neutral-700/50 rounded-lg">
                          <p className="text-sm text-gray-400 mb-1">Contest Participated</p>
                          <p className="text-lg font-bold text-orange-400">
                            {platformData.contestParticipations || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Platform-specific components */}
                    {selectedPlatform?.id === 'leetcode' ? (
                      <>
                        {/* LeetCode Problem Statistics */}
                        {platformStats.renderLeetcodeProblemStats()}

                        {/* Rating Progression Chart */}
                        <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-800/60 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
                          {platformStats.renderRatingChart()}
                        </div>

                        {/* Contest History */}
                        <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-800/60 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
                          {platformStats.renderContestHistory()}
                        </div>

                        {/* Recent Submissions */}
                        {platformStats.renderRecentSubmissions()}
                      </>
                    ) : selectedPlatform?.id === 'codechef' ? (
                      <>
                        {/* Rating Progression Chart */}
                        <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-800/60 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
                          {platformStats.renderRatingChart()}
                        </div>

                        {/* Contest History */}
                        <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-800/60 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
                          {platformStats.renderContestHistory()}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Rating Progression Chart */}
                        <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-800/60 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
                          {platformStats.renderRatingChart()}
                        </div>

                        {/* Contest History */}
                        <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-800/60 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
                          {platformStats.renderContestHistory()}
                        </div>

                        {/* Recent Submissions */}
                        {platformStats.renderRecentSubmissions()}

                        {/* Accepted Solutions - Only show for platforms that provide this data (exclude AtCoder and Codeforces) */}
                        {selectedPlatform?.id !== 'atcoder' && selectedPlatform?.id !== 'codeforces' && (
                          <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-800/60 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
                            {platformStats.renderAcceptedSolutions()}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Enhanced No Connected Platforms Message */
              <div className="text-center py-20 bg-gradient-to-br from-neutral-800/50 to-neutral-800/30 rounded-xl border-2 border-dashed border-neutral-600">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-4">
                    {isOwnProfile ? "No Platforms Connected" : "No Platform Data Available"}
                  </h2>

                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    {isOwnProfile
                      ? "Connect your competitive programming platforms to unlock detailed statistics, track your progress, and analyze your performance across contests."
                      : `${profileUsername} hasn't connected any competitive programming platforms yet.`
                    }
                  </p>

                  {/* Only show platform setup info for own profile */}
                  {isOwnProfile && (
                    <>
                      {/* Supported Platforms */}
                      <div className="bg-neutral-700/30 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Supported Platforms</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-300">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            Codeforces
                          </div>
                          <div className="flex items-center text-gray-300">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            AtCoder
                          </div>
                          <div className="flex items-center text-gray-300">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                            CodeChef
                          </div>
                          <div className="flex items-center text-gray-300">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            LeetCode
                          </div>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="text-left bg-neutral-700/20 rounded-lg p-6 mb-6">
                        <h4 className="text-md font-semibold text-white mb-3">What you'll get:</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li className="flex items-center">
                            <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Rating progression tracking
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Contest participation history
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Problem solving statistics
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Multi-platform comparison
                          </li>
                        </ul>
                      </div>

                      {/* Connect Platforms Button */}
                      <button
                        onClick={() => navigate("/account-settings")}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center mx-auto"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Connect Platforms
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;