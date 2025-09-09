import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../common/Navbar";
import BackButton from "../common/BackButton";
import PlatformStatistics from "../common/PlatformStatistics";
import { useNavigate } from "react-router-dom";
import { PLATFORMS } from "../../config/platformsConfig";
import platformService from "../../services/platformService";

const CPStatistics = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedPlatform, setSelectedPlatform] = useState({ id: 'all', name: 'All Platforms' }); // Default to "All Platforms"
    const [platformData, setPlatformData] = useState(null);
    const [allPlatformsData, setAllPlatformsData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination states
    const [contestPage, setContestPage] = useState(0);
    const [solutionsPage, setSolutionsPage] = useState(0);

    // Get list of connected platforms
    const connectedPlatforms = PLATFORMS.filter((platform) => {
        return Boolean(user?.[platform.usernameField]);
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

    // Handle platform data loading - moved backend calls to service layer
    const loadPlatformData = async (platform) => {
        if (!platform || !user?.username) return;

        setLoading(true);
        setError(null);
        setPlatformData(null);

        try {
            const stats = await platformService.getProfileByPlatform(platform.id, user.username);

            if (stats?.data) {
                setPlatformData(stats.data);
                setContestPage(0); // Reset pagination
                setSolutionsPage(0);
            }
        } catch (err) {
            setError(`Failed to fetch ${platform.name} statistics`);
        } finally {
            setLoading(false);
        }
    };

    // Handle all platforms data loading - uses service layer
    const loadAllPlatformsData = async () => {
        if (!user?.username) return;

        setLoading(true);
        setError(null);
        setPlatformData(null);

        try {
            const response = await platformService.getAllPlatformsData(user.username);

            if (response?.data) {
                const allData = {};
                const platformsData = response.data;

                // Transform the response to match the expected format
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

    // Auto-load all platforms data when component mounts (only once)
    useEffect(() => {
        if (user?.username && connectedPlatforms.length > 0) {
            loadAllPlatformsData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.username, connectedPlatforms.length]); // Only re-run when username or connected platforms change

    // Handle platform selection
    const handlePlatformSelect = (platform) => {
        setSelectedPlatform(platform);
        if (platform?.id === 'all') {
            loadAllPlatformsData();
        } else {
            loadPlatformData(platform);
        }
    };

    // Render all platforms summary
    const renderAllPlatformsSummary = () => {
        const platformEntries = Object.entries(allPlatformsData);

        if (platformEntries.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-400">No data available from connected platforms</p>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {/* Basic Stats Bar - Similar to individual platform design */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                    <h3 className="text-xl font-semibold text-white mb-4">
                        All Platforms Statistics
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {platformEntries.map(([platformId, { platform, data }]) => (
                            <div key={platformId} className="bg-neutral-700 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-white mb-2">{platform.name}</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Username:</span>
                                        <span className="text-white">{data.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Rating:</span>
                                        <span className="text-blue-400">{data.rating || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Max Rating:</span>
                                        <span className="text-green-400">{data.maxRating || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Contests:</span>
                                        <span className="text-white">{data.contestParticipations || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Rank:</span>
                                        <span className="text-orange-400">{data.rank || "Unranked"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rating Progression Chart */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                    {platformStats.renderAllPlatformsChart()}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-900">
            <Navbar user={user} onLogout={logout} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BackButton onBack={() => navigate("/home")} />

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Competitive Programming Statistics
                    </h1>
                    <p className="text-gray-400">
                        View your progress across different platforms
                    </p>
                </div>

                {/* Profile Update Notice */}
                <div className="mb-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-200">
                                Profile Update Information
                            </h3>
                            <div className="mt-1 text-sm text-blue-300">
                                <p>
                                    Profile data updates may vary by up to 1 hour from real-time updates on the respective platforms.
                                    This ensures optimal performance while maintaining data accuracy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platform Dropdown */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Platform
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
                            className="w-full max-w-xs px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                        >
                            <option value="">Choose a platform...</option>
                            {connectedPlatforms.length > 1 && (
                                <option value="all">All Platforms</option>
                            )}
                            {connectedPlatforms.map((platform) => (
                                <option key={platform.id} value={platform.id}>
                                    {platform.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-400 mt-2">Loading statistics...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* All Platforms Data Display */}
                {selectedPlatform?.id === 'all' && Object.keys(allPlatformsData).length > 0 && !loading && (
                    <div className="space-y-8">
                        {renderAllPlatformsSummary()}
                    </div>
                )}

                {/* No All Platforms Data Yet (but not loading) */}
                {selectedPlatform?.id === 'all' && Object.keys(allPlatformsData).length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">
                            No platform data available. Make sure you have connected platforms in your profile.
                        </p>
                    </div>
                )}

                {/* Single Platform Data Display */}
                {platformData && selectedPlatform && selectedPlatform?.id !== 'all' && !loading && (
                    <div className="space-y-8">
                        {/* Basic Stats */}
                        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                            <h3 className="text-xl font-semibold text-white mb-4">
                                {selectedPlatform.name} Statistics
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-400">Username</p>
                                    <p className="text-lg font-semibold text-white">
                                        {platformData.username}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-400">
                                        {selectedPlatform?.id === 'leetcode' ? 'Rank' : 'Rating'}
                                    </p>
                                    <p className="text-lg font-semibold text-blue-400">
                                        {selectedPlatform?.id === 'leetcode'
                                            ? (platformData.rank || "Unranked")
                                            : (platformData.rating || "Unrated")
                                        }
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-400">
                                        {selectedPlatform?.id === 'leetcode' ? 'Rating' : 'Max Rating'}
                                    </p>
                                    <p className="text-lg font-semibold text-green-400">
                                        {selectedPlatform?.id === 'leetcode'
                                            ? (platformData.rating || "Unrated")
                                            : (platformData.maxRating || "Unrated")
                                        }
                                    </p>
                                </div>

                                {/* Hide Problems Solved, Total Submissions, and Accepted Submissions for AtCoder and CodeChef */}
                                {selectedPlatform?.id !== 'atcoder' && selectedPlatform?.id !== 'codechef' && (
                                    <>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-400">Problems Solved</p>
                                            <p className="text-lg font-semibold text-purple-400">
                                                {selectedPlatform?.id === 'leetcode'
                                                    ? (platformData.problemsSolved?.all || 0)
                                                    : (platformData.problemsSolved || 0)
                                                }
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-400">Total Submissions</p>
                                            <p className="text-lg font-semibold text-yellow-400">
                                                {selectedPlatform?.id === 'leetcode'
                                                    ? (platformData.totalSubmissions?.all || 0)
                                                    : (platformData.totalSubmissions || 0)
                                                }
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-400">Accepted Submissions</p>
                                            <p className="text-lg font-semibold text-emerald-400">
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
                                        <div className="text-center">
                                            <p className="text-sm text-gray-400">Current Rank</p>
                                            <p className="text-lg font-semibold text-orange-400">
                                                {platformData.rank || "Unranked"}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-400">Max Rank</p>
                                            <p className="text-lg font-semibold text-yellow-400">
                                                {platformData.maxRank || "Unranked"}
                                            </p>
                                        </div>
                                    </>
                                )}

                                <div className="text-center">
                                    <p className="text-sm text-gray-400">Contest Participated</p>
                                    <p className="text-lg font-semibold text-orange-400">
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
                                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                    {platformStats.renderRatingChart()}
                                </div>

                                {/* Contest History */}
                                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                    {platformStats.renderContestHistory()}
                                </div>

                                {/* Recent Submissions */}
                                {platformStats.renderRecentSubmissions()}
                            </>
                        ) : selectedPlatform?.id === 'codechef' ? (
                            <>
                                {/* Rating Progression Chart */}
                                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                    {platformStats.renderRatingChart()}
                                </div>

                                {/* Contest History */}
                                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                    {platformStats.renderContestHistory()}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Rating Progression Chart */}
                                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                    {platformStats.renderRatingChart()}
                                </div>

                                {/* Contest History */}
                                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                    {platformStats.renderContestHistory()}
                                </div>

                                {/* Recent Submissions */}
                                {platformStats.renderRecentSubmissions()}

                                {/* Accepted Solutions - Only show for platforms that provide this data (exclude AtCoder and Codeforces) */}
                                {selectedPlatform?.id !== 'atcoder' && selectedPlatform?.id !== 'codeforces' && (
                                    <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                        {platformStats.renderAcceptedSolutions()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* No Connected Platforms */}
                {connectedPlatforms.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg mb-4">
                            No platforms connected yet
                        </p>
                        <button
                            onClick={() => navigate("/profile")}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Connect Platforms
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CPStatistics;