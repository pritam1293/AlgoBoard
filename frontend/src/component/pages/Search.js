import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import BackButton from '../common/BackButton';
import { PLATFORMS } from '../../config/platformsConfig';
import platformService from '../../services/platformService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

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

    // Get username from URL params if coming from navbar search
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
            // Use the /api/users/search endpoint to fetch all platforms data
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
            console.error('Search error details:', err);
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

    // LeetCode problem statistics
    const renderLeetcodeProblemStats = () => {
        if (!platformData?.problemsSolved || !platformData?.totalSubmissions || !platformData?.acceptedSubmissions) {
            return (
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                    <h4 className="text-lg font-semibold text-white mb-4">Problem Statistics</h4>
                    <p className="text-gray-400">No problem statistics available</p>
                </div>
            );
        }

        const problemsSolved = platformData.problemsSolved;
        const totalSubmissions = platformData.totalSubmissions;
        const acceptedSubmissions = platformData.acceptedSubmissions;

        return (
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <h4 className="text-lg font-semibold text-white mb-4">Problem Statistics</h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-neutral-700 rounded-lg">
                        <p className="text-2xl font-bold text-green-400">{problemsSolved.all}</p>
                        <p className="text-sm text-gray-400">Total Solved</p>
                    </div>
                    <div className="text-center p-4 bg-neutral-700 rounded-lg">
                        <p className="text-2xl font-bold text-green-500">{problemsSolved.easy}</p>
                        <p className="text-sm text-gray-400">Easy</p>
                    </div>
                    <div className="text-center p-4 bg-neutral-700 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-500">{problemsSolved.medium}</p>
                        <p className="text-sm text-gray-400">Medium</p>
                    </div>
                    <div className="text-center p-4 bg-neutral-700 rounded-lg">
                        <p className="text-2xl font-bold text-red-500">{problemsSolved.hard}</p>
                        <p className="text-sm text-gray-400">Hard</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-neutral-700 rounded-lg">
                        <h5 className="text-white font-semibold mb-2">Total Submissions</h5>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">All:</span>
                                <span className="text-white">{totalSubmissions.all}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-400">Easy:</span>
                                <span className="text-white">{totalSubmissions.easy}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-yellow-400">Medium:</span>
                                <span className="text-white">{totalSubmissions.medium}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-red-400">Hard:</span>
                                <span className="text-white">{totalSubmissions.hard}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-neutral-700 rounded-lg">
                        <h5 className="text-white font-semibold mb-2">Accepted Submissions</h5>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">All:</span>
                                <span className="text-white">{acceptedSubmissions.all}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-400">Easy:</span>
                                <span className="text-white">{acceptedSubmissions.easy}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-yellow-400">Medium:</span>
                                <span className="text-white">{acceptedSubmissions.medium}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-red-400">Hard:</span>
                                <span className="text-white">{acceptedSubmissions.hard}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-neutral-700 rounded-lg">
                        <h5 className="text-white font-semibold mb-2">Acceptance Rate</h5>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Overall:</span>
                                <span className="text-white">
                                    {((acceptedSubmissions.all / totalSubmissions.all) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-400">Easy:</span>
                                <span className="text-white">
                                    {((acceptedSubmissions.easy / totalSubmissions.easy) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-yellow-400">Medium:</span>
                                <span className="text-white">
                                    {((acceptedSubmissions.medium / totalSubmissions.medium) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-red-400">Hard:</span>
                                <span className="text-white">
                                    {((acceptedSubmissions.hard / totalSubmissions.hard) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Recent submissions component
    const renderRecentSubmissions = () => {
        if (!platformData?.recentSubmissions ||
            (selectedPlatform?.id !== 'leetcode' && selectedPlatform?.id !== 'codeforces')) {
            return null;
        }

        if (platformData.recentSubmissions.length === 0) {
            return (
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                    <h4 className="text-lg font-semibold text-white mb-4">Recent Submissions</h4>
                    <p className="text-gray-400">No recent submissions available</p>
                </div>
            );
        }

        const submissions = platformData.recentSubmissions.slice(0, 10);

        return (
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <h4 className="text-lg font-semibold text-white mb-4">Recent Submissions</h4>
                <div className="space-y-3">
                    {submissions.map((submission, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors">
                            <div className="flex-1">
                                <a
                                    href={
                                        selectedPlatform?.id === 'codeforces'
                                            ? `https://codeforces.com/problemset/problem/${submission.id}/${submission.index}`
                                            : submission.problemUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    {selectedPlatform?.id === 'codeforces' ? submission.name : submission.problemTitle}
                                </a>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${(selectedPlatform?.id === 'codeforces' && submission.status === 'OK') ||
                                (selectedPlatform?.id === 'leetcode' && submission.status === 'Accepted')
                                ? 'bg-green-900 text-green-300'
                                : 'bg-red-900 text-red-300'
                                }`}>
                                {selectedPlatform?.id === 'codeforces'
                                    ? (submission.status === 'OK' ? 'Accepted' :
                                        submission.status.split('_').map(word =>
                                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                        ).join(' '))
                                    : submission.status
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Rating chart component
    const renderRatingChart = () => {
        if (!platformData?.contestHistory || platformData.contestHistory.length === 0) {
            return (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Rating Progression</h4>
                    <p className="text-gray-400">No contest history available for chart</p>
                </div>
            );
        }

        const chartContestHistory = [...platformData.contestHistory].reverse(); // Reverse for chart progression
        const maxRating = platformData.maxRating;
        let highestRatingIndex = -1;
        for (let i = 0; i < chartContestHistory.length; i++) {
            if (chartContestHistory[i].newRating === maxRating) {
                highestRatingIndex = i;
                break;
            }
        }

        const chartData = {
            labels: chartContestHistory.map((_, index) => index + 1),
            datasets: [
                {
                    label: "Rating",
                    data: chartContestHistory.map((contest) => contest.newRating),
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                    tension: 0.3,
                    pointBackgroundColor: chartContestHistory.map(
                        (_, index) =>
                            index === highestRatingIndex
                                ? "rgb(255, 215, 0)"
                                : "transparent"
                    ),
                    pointBorderColor: chartContestHistory.map((_, index) =>
                        index === highestRatingIndex
                            ? "rgba(255, 255, 255, 1)"
                            : "transparent"
                    ),
                    pointBorderWidth: chartContestHistory.map((_, index) =>
                        index === highestRatingIndex ? 2 : 0
                    ),
                    pointRadius: chartContestHistory.map(
                        (_, index) => (index === highestRatingIndex ? 6 : 0)
                    ),
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: chartContestHistory.map((_, index) =>
                        index === highestRatingIndex
                            ? "rgb(255, 215, 0)"
                            : "rgb(59, 130, 246)"
                    ),
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 2,
                    borderWidth: 2,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        color: "#ffffff",
                    },
                },
                title: {
                    display: true,
                    text: "Rating Progression Over Contests",
                    color: "#ffffff",
                    font: {
                        size: 16,
                    },
                },
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            const index = context[0].dataIndex;
                            const isHighest = index === highestRatingIndex;
                            const contestName = chartContestHistory[index].contestName;
                            return isHighest
                                ? `🏆 ${contestName} (Peak Rating!)`
                                : contestName;
                        },
                        label: function (context) {
                            const index = context.dataIndex;
                            const contest = chartContestHistory[index];
                            const change = contest.newRating - contest.oldRating;
                            const isHighest = index === highestRatingIndex;

                            const baseLabels = [
                                `Rating: ${contest.newRating}`,
                                `Change: ${change > 0 ? "+" : ""}${change}`,
                                `Standing: ${contest.standing}`,
                            ];

                            if (isHighest) {
                                baseLabels.push(`⭐ Highest Rating Achieved!`);
                            }

                            return baseLabels;
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                        color: "#ffffff",
                    },
                },
                x: {
                    grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                        color: "#ffffff",
                    },
                },
            },
        };

        return (
            <div>
                <h4 className="text-lg font-semibold text-white mb-4">Rating Progression</h4>
                <div className="h-80">
                    <Line data={chartData} options={options} />
                </div>
            </div>
        );
    };

    // Contest history component
    const renderContestHistory = () => {
        if (!platformData?.contestHistory) {
            return (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Contest History</h4>
                    <p className="text-gray-400">No contest history available</p>
                </div>
            );
        }

        const contestsPerPage = 10;
        const contests = [...platformData.contestHistory];
        const totalPages = Math.ceil(contests.length / contestsPerPage);
        const currentContests = contests.slice(
            contestPage * contestsPerPage,
            (contestPage + 1) * contestsPerPage
        );

        return (
            <div>
                <h4 className="text-lg font-semibold text-white mb-4">Contest History</h4>
                <div className="space-y-2 mb-4">
                    {currentContests.map((contest, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg"
                        >
                            <div className="flex-1">
                                <h5 className="text-white font-medium">{contest.contestName}</h5>
                                <p className="text-sm text-gray-400">Standing: {contest.standing}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-semibold">{contest.newRating}</p>
                                <p
                                    className={`text-sm ${contest.newRating - contest.oldRating >= 0
                                        ? "text-green-400"
                                        : "text-red-400"
                                        }`}
                                >
                                    {contest.newRating - contest.oldRating >= 0 ? "+" : ""}
                                    {contest.newRating - contest.oldRating}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                        <button
                            onClick={() => setContestPage(Math.max(0, contestPage - 1))}
                            disabled={contestPage === 0}
                            className="px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-white">
                            Page {contestPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setContestPage(Math.min(totalPages - 1, contestPage + 1))
                            }
                            disabled={contestPage === totalPages - 1}
                            className="px-3 py-1 bg-neutral-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Render superimposed chart for all platforms - EXACT COPY from CP Statistics
    const renderAllPlatformsChart = () => {
        const platformEntries = Object.entries(allPlatformsData);

        if (platformEntries.length === 0) {
            return (
                <p className="text-gray-400">No contest history available from connected platforms</p>
            );
        }

        const platformColors = {
            codeforces: "rgb(59, 130, 246)", // Blue
            leetcode: "rgb(255, 193, 7)", // Yellow
            atcoder: "rgb(34, 197, 94)", // Green
            codechef: "rgb(249, 115, 22)", // Orange
        };

        const datasets = [];

        platformEntries.forEach(([platformId, { platform, data }]) => {
            if (data.contestHistory && data.contestHistory.length > 0) {
                const reversedHistory = [...data.contestHistory].reverse();
                const color = platformColors[platformId] || "rgb(156, 163, 175)";

                // Find the contest where user achieved their max rating (latest occurrence if multiple)
                const maxRating = data.maxRating;
                let highestRatingIndex = -1;
                for (let i = reversedHistory.length - 1; i >= 0; i--) {
                    if (reversedHistory[i].newRating === maxRating) {
                        highestRatingIndex = i;
                        break;
                    }
                }

                datasets.push({
                    label: platform.name,
                    data: reversedHistory.map((contest) => contest.newRating),
                    borderColor: color,
                    backgroundColor: `${color.replace('rgb', 'rgba').replace(')', ', 0.05)')}`,
                    tension: 0.3,
                    pointBackgroundColor: reversedHistory.map(
                        (_, index) =>
                            index === highestRatingIndex
                                ? "rgb(255, 215, 0)"
                                : "transparent" // Hide normal points, only show golden point
                    ),
                    pointBorderColor: reversedHistory.map((_, index) =>
                        index === highestRatingIndex
                            ? "rgba(255, 255, 255, 1)"
                            : "transparent" // Hide normal point borders
                    ),
                    pointBorderWidth: reversedHistory.map((_, index) =>
                        index === highestRatingIndex ? 2 : 0
                    ),
                    pointRadius: reversedHistory.map(
                        (_, index) => (index === highestRatingIndex ? 6 : 0) // Hide normal points, show golden point
                    ),
                    pointHoverRadius: 5, // Show all points on hover
                    pointHoverBackgroundColor: reversedHistory.map((_, index) =>
                        index === highestRatingIndex
                            ? "rgb(255, 215, 0)"
                            : color
                    ),
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 2,
                    borderWidth: 2,
                    fill: false,
                });
            }
        });

        if (datasets.length === 0) {
            return (
                <p className="text-gray-400">No contest history available from connected platforms</p>
            );
        }

        // Find the maximum number of contests to create labels
        const maxContests = Math.max(...datasets.map(dataset => dataset.data.length));
        const labels = Array.from({ length: maxContests }, (_, index) => index + 1);

        const chartData = {
            labels,
            datasets,
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        color: "#ffffff",
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        generateLabels: function (chart) {
                            const datasets = chart.data.datasets;
                            return datasets.map((dataset, index) => ({
                                text: dataset.label,
                                fillStyle: dataset.borderColor,
                                strokeStyle: dataset.borderColor,
                                fontColor: "#ffffff",
                                lineWidth: 2,
                                hidden: !chart.isDatasetVisible(index),
                                index: index
                            }));
                        }
                    },
                },
                title: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            return `Contest ${context[0].label}`;
                        },
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: "rgba(255, 255, 255, 0.7)",
                        maxTicksLimit: 6,
                        font: {
                            size: 11,
                        },
                    },
                    grid: {
                        color: "rgba(255, 255, 255, 0.05)",
                        drawBorder: false,
                    },
                    border: {
                        display: false,
                    },
                },
            },
            interaction: {
                intersect: false,
                mode: "index",
            },
        };

        return (
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Rating Progression</h4>

                <div className="bg-neutral-700 rounded-lg p-4">
                    <div className="relative h-64 sm:h-80 md:h-96">
                        <Line data={chartData} options={options} />
                    </div>
                </div>
            </div>
        );
    };

    // Render all platforms summary - EXACT COPY from CP Statistics
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
                    {renderAllPlatformsChart()}
                </div>
            </div>
        );
    }; return (
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
                                                {renderLeetcodeProblemStats()}
                                            </div>
                                        )}

                                        {/* Rating Chart - Show for all platforms that have contest history */}
                                        {platformData.contestHistory && (
                                            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                                {renderRatingChart()}
                                            </div>
                                        )}

                                        {/* Contest History - Show for all platforms that have contest history */}
                                        {platformData.contestHistory && (
                                            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                                                {renderContestHistory()}
                                            </div>
                                        )}

                                        {/* Recent Submissions - Show for all platforms that have recent submissions */}
                                        {platformData.recentSubmissions && (
                                            <div>
                                                {renderRecentSubmissions()}
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
