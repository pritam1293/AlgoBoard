import React, { useState } from 'react';
import Navbar from '../common/Navbar';
import PlatformStatistics from '../common/PlatformStatistics';
import { useAuth } from '../../context/AuthContext';
import { PLATFORMS } from '../../config/platformsConfig';
import platformProfileService from '../../services/platformProfileService';
import { getPlatformDisplayName, getPlatformColor, getRankColor } from '../../utils/platformUtils';

const PlatformProfileSearch = () => {
    const { user, logout } = useAuth();
    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [platformData, setPlatformData] = useState(null);
    const [error, setError] = useState('');
    const [contestPage, setContestPage] = useState(0);
    const [solutionsPage, setSolutionsPage] = useState(0);

    // Use the shared PlatformStatistics component when we have data
    const platformStats = platformData ? PlatformStatistics({
        platformData,
        selectedPlatform: { id: selectedPlatform, name: getPlatformDisplayName(selectedPlatform, PLATFORMS) },
        allPlatformsData: { [selectedPlatform]: platformData },
        contestPage,
        setContestPage,
        solutionsPage,
        setSolutionsPage
    }) : null;

    const handleSearch = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        setError('');
        setPlatformData(null);
        setContestPage(0); // Reset pagination on new search
        setSolutionsPage(0); // Reset pagination on new search

        try {
            const response = await platformProfileService.fetchPlatformProfile(selectedPlatform, username);

            if (response.status === 'success' && response.data) {
                setPlatformData(response.data);
            } else {
                setError(response.message || 'Profile not found');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message || 'Failed to fetch profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900">
            <Navbar user={user} onLogout={logout} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white mb-4">
                            Platform Profile Search
                        </h1>
                        <p className="text-neutral-400">
                            Search for competitive programming profiles across different platforms.
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Platform
                                    </label>
                                    <select
                                        value={selectedPlatform}
                                        onChange={(e) => setSelectedPlatform(e.target.value)}
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Platform</option>
                                        {PLATFORMS.map((platform) => (
                                            <option key={platform.id} value={platform.id}>
                                                {platform.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter username"
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedPlatform || !username.trim() || isLoading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Searching...' : 'Search Profile'}
                            </button>
                        </form>
                    </div>

                    {/* Results Section */}
                    {isLoading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="text-white mt-2">Searching...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-red-300">{error}</p>
                        </div>
                    )}

                    {platformData && platformStats && (
                        <div className="space-y-6">
                            {/* Platform Profile Card - using exact same structure as profile page */}
                            <div className="max-w-md mx-auto">
                                <div className="group relative">
                                    {/* Gradient background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${getPlatformColor(selectedPlatform)} opacity-10 rounded-xl transition-opacity group-hover:opacity-20`}></div>

                                    {/* Card content */}
                                    <div className="relative bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 rounded-xl p-6 h-full transition-all duration-300 hover:border-neutral-600 hover:shadow-lg">
                                        {/* Platform header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-white truncate">{getPlatformDisplayName(selectedPlatform, PLATFORMS)}</h3>
                                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPlatformColor(selectedPlatform)}`}></div>
                                        </div>

                                        {/* Stats grid */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between py-1">
                                                <span className="text-sm text-gray-400">Username</span>
                                                <span className="text-sm font-semibold text-white truncate ml-2">{platformData.username}</span>
                                            </div>

                                            <div className="flex items-center justify-between py-1">
                                                <span className="text-sm text-gray-400">Rating</span>
                                                <span className={`text-sm font-bold ${getRankColor(selectedPlatform, platformData.rating)}`}>
                                                    {platformData.rating || 'Unrated'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between py-1">
                                                <span className="text-sm text-gray-400">Max Rating</span>
                                                <span className="text-sm font-bold text-green-400">
                                                    {platformData.maxRating || 'Unrated'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between py-1">
                                                <span className="text-sm text-gray-400">Contests</span>
                                                <span className="text-sm font-semibold text-orange-400">
                                                    {platformData.contestParticipations || 0}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between py-1">
                                                <span className="text-sm text-gray-400">Rank</span>
                                                <span className="text-sm font-semibold text-purple-400 truncate ml-2">
                                                    {platformData.rank || "Unranked"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Platform-specific components */}
                            {selectedPlatform === 'leetcode' ? (
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
                            ) : selectedPlatform === 'codechef' ? (
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

                                    {/* Accepted Solutions - Only show for platforms that provide this data */}
                                    {selectedPlatform !== 'atcoder' && selectedPlatform !== 'codeforces' && (
                                        <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-800/60 backdrop-blur-sm rounded-xl p-6 border border-neutral-700">
                                            {platformStats.renderAcceptedSolutions()}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlatformProfileSearch;
