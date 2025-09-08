import React from "react";
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

const PlatformStatistics = ({
    platformData,
    selectedPlatform,
    allPlatformsData = {},
    contestPage = 0,
    setContestPage,
    solutionsPage = 0,
    setSolutionsPage
}) => {
    const CONTESTS_PER_PAGE = 5;
    const SOLUTIONS_PER_PAGE = 9;

    // LeetCode problem statistics component
    const renderLeetcodeProblemStats = () => {
        if (!platformData?.problemsSolved || selectedPlatform?.id !== 'leetcode') {
            return null;
        }

        const { problemsSolved, totalSubmissions, acceptedSubmissions } = platformData;

        return (
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <h4 className="text-lg font-semibold text-white mb-4">Problem Statistics</h4>

                {/* Problems Solved Breakdown */}
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

                {/* Submission Statistics */}
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

    // Recent submissions component for LeetCode and Codeforces
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

        const submissions = platformData.recentSubmissions.slice(0, 10); // Show latest 10

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
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                                }`}>
                                {submission.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Rating overview stats component
    const renderRatingOverview = () => {
        if (!platformData?.currentRating && !platformData?.maxRating) {
            return null;
        }

        return (
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <h4 className="text-lg font-semibold text-white mb-4">Rating Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {platformData.currentRating !== undefined && (
                        <div className="text-center p-4 bg-neutral-700 rounded-lg">
                            <p className="text-2xl font-bold text-blue-400">{platformData.currentRating}</p>
                            <p className="text-sm text-gray-400">Current Rating</p>
                        </div>
                    )}
                    {platformData.maxRating !== undefined && (
                        <div className="text-center p-4 bg-neutral-700 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-400">{platformData.maxRating}</p>
                            <p className="text-sm text-gray-400">Max Rating</p>
                        </div>
                    )}
                    {platformData.contestsParticipated !== undefined && (
                        <div className="text-center p-4 bg-neutral-700 rounded-lg">
                            <p className="text-2xl font-bold text-green-400">{platformData.contestsParticipated}</p>
                            <p className="text-sm text-gray-400">Contests</p>
                        </div>
                    )}
                    {platformData.problemsSolved !== undefined && (
                        <div className="text-center p-4 bg-neutral-700 rounded-lg">
                            <p className="text-2xl font-bold text-purple-400">
                                {typeof platformData.problemsSolved === 'object'
                                    ? platformData.problemsSolved.all
                                    : platformData.problemsSolved}
                            </p>
                            <p className="text-sm text-gray-400">Problems Solved</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Contest history with pagination
    const renderContestHistory = () => {
        if (
            !platformData?.contestHistory ||
            platformData.contestHistory.length === 0
        ) {
            return <p className="text-gray-400">No contest history available</p>;
        }

        const startIndex = contestPage * CONTESTS_PER_PAGE;
        const endIndex = startIndex + CONTESTS_PER_PAGE;
        const currentContests = platformData.contestHistory.slice(
            startIndex,
            endIndex
        );
        const totalPages = Math.ceil(
            platformData.contestHistory.length / CONTESTS_PER_PAGE
        );

        return (
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Contest History</h4>
                <div className="space-y-2">
                    {currentContests.map((contest, index) => (
                        <div key={index} className="bg-neutral-700 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h5 className="text-white font-medium">
                                        {contest.contestId ? (
                                            <a
                                                href={(() => {
                                                    const baseUrls = {
                                                        codeforces: `https://codeforces.com/contest/${contest.contestId}`,
                                                        codechef: `https://www.codechef.com/${contest.contestId}`,
                                                        leetcode: `https://leetcode.com/contest/${contest.contestId}`,
                                                        atcoder: `https://atcoder.jp/contests/${contest.contestId}`
                                                    };
                                                    return baseUrls[selectedPlatform?.id] || '#';
                                                })()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                            >
                                                {contest.contestName}
                                            </a>
                                        ) : (
                                            contest.contestName
                                        )}
                                    </h5>
                                    <p className="text-gray-400 text-sm">
                                        Standing: {contest.standing}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white">
                                        {contest.oldRating} → {contest.newRating}
                                    </p>
                                    <p
                                        className={`text-sm ${contest.newRating > contest.oldRating
                                            ? "text-green-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {contest.newRating > contest.oldRating ? "+" : ""}
                                        {contest.newRating - contest.oldRating}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contest Pagination */}
                {totalPages > 1 && setContestPage && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button
                            onClick={() => setContestPage(Math.max(0, contestPage - 1))}
                            disabled={contestPage === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-white">
                            {contestPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setContestPage(Math.min(totalPages - 1, contestPage + 1))
                            }
                            disabled={contestPage === totalPages - 1}
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Accepted solutions with pagination
    const renderAcceptedSolutions = () => {
        if (!platformData?.problemSet || platformData.problemSet.length === 0) {
            return <p className="text-gray-400">No accepted solutions available</p>;
        }

        const startIndex = solutionsPage * SOLUTIONS_PER_PAGE;
        const endIndex = startIndex + SOLUTIONS_PER_PAGE;
        const currentSolutions = platformData.problemSet.slice(startIndex, endIndex);
        const totalPages = Math.ceil(platformData.problemSet.length / SOLUTIONS_PER_PAGE);

        return (
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                    Accepted Solutions ({platformData.problemSet.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentSolutions.map((problem, index) => (
                        <div key={index} className="bg-neutral-700 rounded-lg p-4 hover:bg-neutral-600 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="text-white font-medium text-sm">
                                    {problem.contestId ? (
                                        <a
                                            href={(() => {
                                                const baseUrls = {
                                                    codeforces: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
                                                    codechef: `https://www.codechef.com/problems/${problem.contestId}`,
                                                    atcoder: `https://atcoder.jp/contests/${problem.contestId}/tasks/${problem.contestId}_${problem.index?.toLowerCase()}`
                                                };
                                                return baseUrls[selectedPlatform?.id] || '#';
                                            })()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                        >
                                            {problem.name}
                                        </a>
                                    ) : (
                                        problem.name
                                    )}
                                </h5>
                                {problem.rating && (
                                    <span className={`text-xs px-2 py-1 rounded ${problem.rating >= 2400 ? 'bg-red-600 text-white' :
                                        problem.rating >= 1900 ? 'bg-purple-600 text-white' :
                                            problem.rating >= 1600 ? 'bg-blue-600 text-white' :
                                                problem.rating >= 1400 ? 'bg-cyan-600 text-white' :
                                                    problem.rating >= 1200 ? 'bg-green-600 text-white' :
                                                        'bg-gray-600 text-white'
                                        }`}>
                                        {problem.rating}
                                    </span>
                                )}
                            </div>
                            {problem.tags && problem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="text-xs bg-neutral-600 text-gray-300 px-2 py-1 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {problem.tags.length > 3 && (
                                        <span className="text-xs text-gray-400">+{problem.tags.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Solutions Pagination */}
                {totalPages > 1 && setSolutionsPage && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button
                            onClick={() => setSolutionsPage(Math.max(0, solutionsPage - 1))}
                            disabled={solutionsPage === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-white">
                            {solutionsPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setSolutionsPage(Math.min(totalPages - 1, solutionsPage + 1))
                            }
                            disabled={solutionsPage === totalPages - 1}
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Rating progression chart
    const renderRatingChart = () => {
        if (!platformData?.contestHistory || platformData.contestHistory.length === 0) {
            return (
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                    <h4 className="text-lg font-semibold text-white mb-4">Rating Progression</h4>
                    <p className="text-gray-400">No contest history available for chart</p>
                </div>
            );
        }

        const reversedContestHistory = [...platformData.contestHistory].reverse();
        const maxRating = platformData.maxRating;
        let highestRatingIndex = -1;
        for (let i = 0; i < reversedContestHistory.length; i++) {
            if (reversedContestHistory[i].newRating === maxRating) {
                highestRatingIndex = i;
                break;
            }
        }

        const chartData = {
            labels: reversedContestHistory.map((_, index) => index + 1),
            datasets: [
                {
                    label: "Rating",
                    data: reversedContestHistory.map((contest) => contest.newRating),
                    borderColor: "rgb(59, 130, 246)", // Blue
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                    tension: 0.3,
                    pointBackgroundColor: reversedContestHistory.map(
                        (_, index) =>
                            index === highestRatingIndex
                                ? "rgb(255, 215, 0)"
                                : "transparent" // Hide normal points, only show golden point
                    ),
                    pointBorderColor: reversedContestHistory.map((_, index) =>
                        index === highestRatingIndex
                            ? "rgba(255, 255, 255, 1)"
                            : "transparent" // Hide normal point borders
                    ),
                    pointBorderWidth: reversedContestHistory.map((_, index) =>
                        index === highestRatingIndex ? 2 : 0
                    ),
                    pointRadius: reversedContestHistory.map(
                        (_, index) => (index === highestRatingIndex ? 6 : 0) // Hide normal points, show golden point
                    ),
                    pointHoverRadius: 5, // Show all points on hover
                    pointHoverBackgroundColor: reversedContestHistory.map((_, index) =>
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
                            const contestName = reversedContestHistory[index].contestName;
                            return isHighest
                                ? `🏆 ${contestName} (Peak Rating!)`
                                : contestName;
                        },
                        label: function (context) {
                            const index = context.dataIndex;
                            const contest = reversedContestHistory[index];
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
                x: {
                    ticks: {
                        color: "rgba(255, 255, 255, 0.7)",
                        maxTicksLimit: 10,
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
        };

        return (
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <div className="h-80">
                    <Line data={chartData} options={options} />
                </div>
            </div>
        );
    };

    // All platforms superimposed chart
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
                    position: "top",
                    labels: {
                        color: "#ffffff",
                    },
                },
                title: {
                    display: true,
                    text: "All Platforms Rating Progression",
                    color: "#ffffff",
                    font: {
                        size: 16,
                    },
                },
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            const datasetIndex = context[0].datasetIndex;
                            const contestIndex = context[0].dataIndex;
                            const platformId = Object.keys(allPlatformsData)[datasetIndex];
                            const contestHistory = [...allPlatformsData[platformId].data.contestHistory].reverse();

                            if (contestHistory[contestIndex]) {
                                const contest = contestHistory[contestIndex];
                                const maxRating = allPlatformsData[platformId].data.maxRating;
                                const isHighest = contest.newRating === maxRating;
                                return isHighest
                                    ? `🏆 ${contest.contestName} (Peak Rating!)`
                                    : contest.contestName;
                            }
                            return `Contest ${contestIndex + 1}`;
                        },
                        label: function (context) {
                            const datasetIndex = context.datasetIndex;
                            const contestIndex = context.dataIndex;
                            const platformId = Object.keys(allPlatformsData)[datasetIndex];
                            const contestHistory = [...allPlatformsData[platformId].data.contestHistory].reverse();

                            if (contestHistory[contestIndex]) {
                                const contest = contestHistory[contestIndex];
                                const change = contest.newRating - contest.oldRating;
                                const maxRating = allPlatformsData[platformId].data.maxRating;
                                const isHighest = contest.newRating === maxRating;

                                const baseLabels = [
                                    `Platform: ${datasets[datasetIndex].label}`,
                                    `Rating: ${contest.newRating}`,
                                    `Change: ${change > 0 ? "+" : ""}${change}`,
                                    `Standing: ${contest.standing}`,
                                ];

                                if (isHighest) {
                                    baseLabels.push(`⭐ Highest Rating Achieved!`);
                                }

                                return baseLabels;
                            }
                            return `Rating: ${context.parsed.y}`;
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: "rgba(255, 255, 255, 0.7)",
                        maxTicksLimit: 8,
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
                x: {
                    ticks: {
                        color: "rgba(255, 255, 255, 0.7)",
                        maxTicksLimit: 12,
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
        };

        return (
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <div className="h-80">
                    <Line data={chartData} options={options} />
                </div>
            </div>
        );
    };

    return {
        renderLeetcodeProblemStats,
        renderRecentSubmissions,
        renderRatingOverview,
        renderContestHistory,
        renderAcceptedSolutions,
        renderRatingChart,
        renderAllPlatformsChart
    };
};

export default PlatformStatistics;
