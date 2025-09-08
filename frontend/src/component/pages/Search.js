import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import BackButton from '../common/BackButton';
import PlatformStatistics from '../common/PlatformStatistics';
import { PLATFORMS } from '../../config/platformsConfig';
import platformService from '../../services/platformService';

const Search = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchUsername, setSearchUsername] = useState('');
    const [searchedUser, setSearchedUser] = useState(null);
    const [allPlatformsData, setAllPlatformsData] = useState({});
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [platformData, setPlatformData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [contestPage, setContestPage] = useState(0); // Move contestPage state to component level
    const location = useLocation();

    // Get available platforms
    const connectedPlatforms = PLATFORMS;

    // Use the shared PlatformStatistics component
    const platformStats = PlatformStatistics({
        platformData,
        selectedPlatform,
        allPlatformsData,
        contestPage,
        setContestPage,
        solutionsPage: 0, // Search doesn't use solutions pagination
        setSolutionsPage: () => { } // Dummy function for solutions pagination
    });

    // Handle search functionality - moved backend logic to service layer
    const handleSearch = useCallback(async (username = searchUsername) => {
        if (!username.trim()) {
            setError('Please enter a username to search');
            return;
        }

        setLoading(true);
        setError('');
        setAllPlatformsData({});
        setPlatformData(null);
        setSearchedUser(null);
        setSelectedPlatform({ id: 'all', name: 'All Platforms' });

        try {
            const response = await platformService.getAllPlatformsData(username.trim());

            if (response) {
                const allData = {};
                setSearchedUser({ username: username.trim() });

                // Check if response has a data property or if it's direct
                const responseData = response.data || response;

                // Transform the response to match the expected format
                PLATFORMS.forEach(platform => {
                    const platformId = platform.id;
                    if (responseData[platformId] && Object.keys(responseData[platformId]).length > 0) {
                        allData[platformId] = {
                            platform,
                            data: responseData[platformId]
                        };
                    }
                });

                setAllPlatformsData(allData);
            }
        } catch (err) {
            setError(err.message || 'User not found or error occurred');
            setAllPlatformsData({});
            setSearchedUser(null);
        } finally {
            setLoading(false);
        }
    }, [searchUsername]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const usernameParam = params.get('username');
        if (usernameParam) {
            setSearchUsername(usernameParam);
            handleSearch(usernameParam);
        }
    }, [location.search, handleSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    // Handle platform selection
    const handlePlatformSelect = (platform) => {
        setSelectedPlatform(platform);
        if (platform?.id === 'all') {
            setPlatformData(null);
        } else {
            // Set platform data from allPlatformsData
            const data = allPlatformsData[platform.id]?.data;
            setPlatformData(data || null);
        }
    };

    // COPY ALL RENDERING FUNCTIONS FROM CP STATISTICS

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
                        All Platforms Statistics for {searchedUser?.username}
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
                                        <span className="text-blue-400">{data.rating || data.currentRating || 0}</span>
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

                {/* Rating Progression Chart - Superimposed for all platforms */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                    {platformStats.renderAllPlatformsChart()}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-900">
            <Navbar user={user} onLogout={logout} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                <BackButton onBack={() => navigate("/home")} />

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">User Search</h1>
                    <p className="text-neutral-300 text-lg">
                        Search for competitive programming statistics of any user
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-neutral-800 rounded-lg p-6 mb-8 border border-neutral-700">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Enter username to search..."
                                value={searchUsername}
                                onChange={(e) => setSearchUsername(e.target.value)}
                                className="w-full bg-neutral-700 text-white px-4 py-3 rounded-lg border border-neutral-600 focus:outline-none focus:border-blue-500 transition duration-200"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg transition duration-200 flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span>Search</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-lg p-4 mb-8">
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {searchedUser && Object.keys(allPlatformsData).length > 0 && (
                    <>
                        {/* Platform Dropdown */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Select Platform
                            </label>
                            <select
                                value={selectedPlatform?.id || "all"}
                                onChange={(e) => {
                                    if (e.target.value === 'all') {
                                        handlePlatformSelect({ id: 'all', name: 'All Platforms' });
                                    } else {
                                        const platform = connectedPlatforms.find(p => p.id === e.target.value);
                                        if (platform) handlePlatformSelect(platform);
                                    }
                                }}
                                className="w-full max-w-xs px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Platforms</option>
                                {Object.entries(allPlatformsData).map(([platformId, { platform }]) => (
                                    <option key={platformId} value={platformId}>
                                        {platform.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-gray-400 mt-2">Loading statistics...</p>
                            </div>
                        )}

                        {/* Display Results - EXACT COPY from CP Statistics */}
                        {!loading && (
                            <>
                                {/* All Platforms Data Display */}
                                {selectedPlatform?.id === 'all' && Object.keys(allPlatformsData).length > 0 && (
                                    <div className="space-y-8">
                                        {renderAllPlatformsSummary()}
                                    </div>
                                )}

                                {/* No All Platforms Data Yet (but not loading) */}
                                {selectedPlatform?.id === 'all' && Object.keys(allPlatformsData).length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-400 text-lg">
                                            No platform data available for this user.
                                        </p>
                                    </div>
                                )}

                                {/* Single Platform Data Display */}
                                {platformData && selectedPlatform && selectedPlatform?.id !== 'all' && (
                                    <div className="space-y-8">
                                        {/* Basic Stats */}
                                        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                            <h3 className="text-xl font-semibold text-white mb-4">
                                                {selectedPlatform.name} Statistics for {searchedUser?.username}
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
                                                            : (platformData.rating || platformData.currentRating || "Unrated")
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

                                        {/* LeetCode Problem Statistics */}
                                        {selectedPlatform.id === 'leetcode' && (
                                            <div className="mt-8">
                                                {platformStats.renderLeetcodeProblemStats()}
                                            </div>
                                        )}

                                        {/* Rating Chart - Show for all platforms that have contest history */}
                                        {platformData.contestHistory && (
                                            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                                {platformStats.renderRatingChart()}
                                            </div>
                                        )}

                                        {/* Contest History - Show for all platforms that have contest history */}
                                        {platformData.contestHistory && (
                                            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                                {platformStats.renderContestHistory()}
                                            </div>
                                        )}

                                        {/* Recent Submissions - Show for all platforms that have recent submissions */}
                                        {platformData.recentSubmissions && (
                                            <div>
                                                {platformStats.renderRecentSubmissions()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* No Results */}
                {searchedUser && Object.keys(allPlatformsData).length === 0 && !loading && (
                    <div className="bg-neutral-800 rounded-lg p-8 text-center border border-neutral-700">
                        <svg className="w-16 h-16 text-neutral-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0120 12a8 8 0 00-8-8 8 8 0 00-8 8c0 2.485 1.135 4.824 3 6.291z" />
                        </svg>
                        <h3 className="text-xl text-neutral-300 mb-2">No Platform Data Found</h3>
                        <p className="text-neutral-500">
                            This user hasn't connected any competitive programming platforms yet.
                        </p>
                    </div>
                )}

                {/* Initial State */}
                {!searchedUser && !loading && !error && !location.search && (
                    <div className="bg-neutral-800 rounded-lg p-8 text-center border border-neutral-700">
                        <svg className="w-16 h-16 text-neutral-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-xl text-neutral-300 mb-2">Search for Users</h3>
                        <p className="text-neutral-500">
                            Enter a username above to view their competitive programming statistics across all platforms
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom spacing */}
            <div className="h-16"></div>
        </div>
    );
};

export default Search;