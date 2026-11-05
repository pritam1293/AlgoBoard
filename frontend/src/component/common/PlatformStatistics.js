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
import {
    calculateAcceptanceRate,
    formatPercent,
    normalizeContestHistory,
    normalizeLevel,
    normalizeRecentSubmissions,
    toSafeNumber,
} from "../../utils/platformUtils";

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

        const problemsSolved = normalizeLevel(platformData.problemsSolved);
        const totalSubmissions = normalizeLevel(platformData.totalSubmissions);
        const acceptedSubmissions = normalizeLevel(platformData.acceptedSubmissions);

        return (
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-4">Problem Statistics</h4>

                {/* Problems Solved Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">{problemsSolved.all}</p>
                        <p className="text-sm text-white">Total Solved</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                        <p className="text-2xl font-bold text-green-500">{problemsSolved.easy}</p>
                        <p className="text-sm text-white">Easy</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-500">{problemsSolved.medium}</p>
                        <p className="text-sm text-white">Medium</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                        <p className="text-2xl font-bold text-red-500">{problemsSolved.hard}</p>
                        <p className="text-sm text-white">Hard</p>
                    </div>
                </div>

                {/* Submission Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                        <h5 className="text-white font-semibold mb-2">Total Submissions</h5>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white">All:</span>
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

                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                        <h5 className="text-white font-semibold mb-2">Accepted Submissions</h5>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white">All:</span>
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

                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                        <h5 className="text-white font-semibold mb-2">Acceptance Rate</h5>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white">Overall:</span>
                                <span className="text-white">
                                    {formatPercent(calculateAcceptanceRate(acceptedSubmissions.all, totalSubmissions.all))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-green-400">Easy:</span>
                                <span className="text-white">
                                    {formatPercent(calculateAcceptanceRate(acceptedSubmissions.easy, totalSubmissions.easy))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-yellow-400">Medium:</span>
                                <span className="text-white">
                                    {formatPercent(calculateAcceptanceRate(acceptedSubmissions.medium, totalSubmissions.medium))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-red-400">Hard:</span>
                                <span className="text-white">
                                    {formatPercent(calculateAcceptanceRate(acceptedSubmissions.hard, totalSubmissions.hard))}
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
        const platformId = selectedPlatform?.id;
        if (platformId !== 'leetcode' && platformId !== 'codeforces') {
            return null;
        }

        // Missing data means the platform did not send this section at all.
        if (!Array.isArray(platformData?.recentSubmissions)) {
            return null;
        }

        const submissions = normalizeRecentSubmissions(platformData.recentSubmissions).slice(0, 10);

        if (submissions.length === 0) {
            return (
                <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
                    <h4 className="text-lg font-semibold text-white mb-4">Recent Submissions</h4>
                    <p className="text-white">No recent submissions available</p>
                </div>
            );
        }

        return (
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-4">Recent Submissions</h4>
                <div className="space-y-3">
                    {submissions.map((submission, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] transition-colors hover:bg-white/[0.06]">
                            <div className="flex-1">
                                <a
                                    href={
                                        platformId === 'codeforces'
                                            ? (submission.id && submission.index
                                                ? `https://codeforces.com/problemset/problem/${submission.id}/${submission.index}`
                                                : "#")
                                            : submission.problemUrl || "#"
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    {platformId === 'codeforces'
                                        ? submission.name || submission.problemTitle || "Unknown problem"
                                        : submission.problemTitle || "Unknown problem"}
                                </a>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${(platformId === 'codeforces' && submission.status === 'OK') ||
                                (platformId === 'leetcode' && submission.status === 'Accepted')
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                                }`}>
                                {platformId === 'codeforces' && submission.status === 'OK'
                                    ? 'Accepted'
                                    : submission.status || 'Unknown'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Rating overview stats component
    const renderRatingOverview = () => {
        const data = platformData && typeof platformData === "object" ? platformData : {};
        if (!data.currentRating && !data.maxRating) {
            return null;
        }

        const hasCurrentRating = data.currentRating !== undefined && data.currentRating !== null;
        const hasMaxRating = data.maxRating !== undefined && data.maxRating !== null;
        const hasContests = data.contestsParticipated !== undefined && data.contestsParticipated !== null;
        const hasSolved = data.problemsSolved !== undefined && data.problemsSolved !== null;
        const solved = data.problemsSolved && typeof data.problemsSolved === "object"
            ? normalizeLevel(data.problemsSolved).all
            : toSafeNumber(data.problemsSolved);

        return (
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-4">Rating Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {hasCurrentRating && (
                        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                            <p className="text-2xl font-bold text-blue-400">{toSafeNumber(data.currentRating)}</p>
                            <p className="text-sm text-white">Current Rating</p>
                        </div>
                    )}
                    {hasMaxRating && (
                        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                            <p className="text-2xl font-bold text-yellow-400">{toSafeNumber(data.maxRating)}</p>
                            <p className="text-sm text-white">Max Rating</p>
                        </div>
                    )}
                    {hasContests && (
                        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                            <p className="text-2xl font-bold text-green-400">{toSafeNumber(data.contestsParticipated)}</p>
                            <p className="text-sm text-white">Contests</p>
                        </div>
                    )}
                    {hasSolved && (
                        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                            <p className="text-2xl font-bold text-purple-400">{solved}</p>
                            <p className="text-sm text-white">Problems Solved</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Contest history with pagination
    const renderContestHistory = () => {
        const history = normalizeContestHistory(platformData?.contestHistory);
        if (history.length === 0) {
            return <p className="text-white">No contest history available</p>;
        }

        const startIndex = contestPage * CONTESTS_PER_PAGE;
        const endIndex = startIndex + CONTESTS_PER_PAGE;
        const currentContests = history.slice(startIndex, endIndex);
        const totalPages = Math.ceil(history.length / CONTESTS_PER_PAGE);

        return (
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Contest History</h4>
                <div className="space-y-2">
                    {currentContests.map((contest, index) => (
                        <div key={index} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
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
                                    <p className="text-white text-sm">
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
                            className="rounded-xl border border-blue-400/20 bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white"
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
                            className="rounded-xl border border-blue-400/20 bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white"
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
        const problemSet = Array.isArray(platformData?.problemSet)
            ? platformData.problemSet.filter((problem) => problem && typeof problem === "object")
            : [];

        if (problemSet.length === 0) {
            return <p className="text-white">No accepted solutions available</p>;
        }

        const startIndex = solutionsPage * SOLUTIONS_PER_PAGE;
        const endIndex = startIndex + SOLUTIONS_PER_PAGE;
        const currentSolutions = problemSet.slice(startIndex, endIndex);
        const totalPages = Math.ceil(problemSet.length / SOLUTIONS_PER_PAGE);

        return (
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                    Accepted Solutions ({problemSet.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentSolutions.map((problem, index) => (
                        <div key={index} className="rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]">
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
                                                        'bg-neutral-600 text-white'
                                        }`}>
                                        {problem.rating}
                                    </span>
                                )}
                            </div>
                            {Array.isArray(problem.tags) && problem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="rounded-md border border-white/5 bg-white/5 px-2 py-1 text-xs text-white"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {problem.tags.length > 3 && (
                                        <span className="text-xs text-white">+{problem.tags.length - 3}</span>
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
                            className="rounded-xl border border-blue-400/20 bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white"
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
                            className="rounded-xl border border-blue-400/20 bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white"
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
        const history = normalizeContestHistory(platformData?.contestHistory);
        if (history.length === 0) {
            return (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Rating Progression</h4>
                    <p className="text-white">No contest history available for chart</p>
                </div>
            );
        }

        const reversedContestHistory = [...history].reverse();
        const maxRating = toSafeNumber(platformData?.maxRating);
        let highestRatingIndex = -1;
        for (let i = 0; i < reversedContestHistory.length; i++) {
            if (reversedContestHistory[i].newRating === maxRating) {
                highestRatingIndex = i;
                break;
            }
        }

        // Get platform colors for consistency
        const platformColors = {
            codeforces: "rgb(239, 68, 68)", // Red
            leetcode: "rgb(59, 130, 246)", // Blue
            atcoder: "rgb(34, 197, 94)", // Green
            codechef: "rgb(234, 179, 8)", // Yellow
        };

        const platformColor = platformColors[selectedPlatform?.id] || "rgb(59, 130, 246)";

        const chartData = {
            labels: reversedContestHistory.map((_, index) => index + 1),
            datasets: [
                {
                    label: "Rating",
                    data: reversedContestHistory.map((contest) => contest.newRating),
                    borderColor: platformColor,
                    backgroundColor: `${platformColor.replace('rgb', 'rgba').replace(')', ', 0.05)')}`,
                    tension: 0.3,
                    pointBackgroundColor: reversedContestHistory.map(
                        (_, index) =>
                            index === highestRatingIndex
                                ? "rgb(255, 215, 0)" // Golden for highest rating
                                : platformColor // Platform color for all other contests
                    ),
                    pointBorderColor: reversedContestHistory.map((_, index) =>
                        index === highestRatingIndex
                            ? "rgba(255, 255, 255, 1)" // White border for highest
                            : "rgba(255, 255, 255, 0.8)" // Semi-transparent white for others
                    ),
                    pointBorderWidth: reversedContestHistory.map((_, index) =>
                        index === highestRatingIndex ? 1 : 0.5 // Slightly thicker border for highest
                    ),
                    pointRadius: reversedContestHistory.map(
                        (_, index) => (index === highestRatingIndex ? 3 : 2.5) // Much smaller dots
                    ),
                    pointHoverRadius: 4, // Small hover radius
                    pointHoverBackgroundColor: reversedContestHistory.map((_, index) =>
                        index === highestRatingIndex
                            ? "rgb(255, 215, 0)"
                            : platformColor
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
            <div className="h-80">
                <Line data={chartData} options={options} />
            </div>
        );
    };

    // All platforms superimposed chart
    const renderAllPlatformsChart = () => {
        const platformEntries =
            allPlatformsData && typeof allPlatformsData === "object" && !Array.isArray(allPlatformsData)
                ? Object.entries(allPlatformsData)
                : [];

        if (platformEntries.length === 0) {
            return (
                <p className="text-white">No contest history available from connected platforms</p>
            );
        }

        const platformColors = {
            codeforces: "rgb(239, 68, 68)", // Red (matches from-red-500)
            leetcode: "rgb(59, 130, 246)", // Blue (matches from-blue-500)
            atcoder: "rgb(34, 197, 94)", // Green (matches from-green-500)
            codechef: "rgb(234, 179, 8)", // Yellow (matches from-yellow-500)
        };

        const datasets = [];

        platformEntries.forEach(([platformId, entry]) => {
            const data = entry?.data;
            if (!data || typeof data !== "object") {
                return;
            }

            const reversedHistory = [...normalizeContestHistory(data.contestHistory)].reverse();
            if (reversedHistory.length === 0) {
                return;
            }

            const color = platformColors[platformId] || "rgb(156, 163, 175)";

            // Find the contest where user achieved their max rating (latest occurrence if multiple)
            const maxRating = toSafeNumber(data.maxRating);
            let highestRatingIndex = -1;
            for (let i = reversedHistory.length - 1; i >= 0; i--) {
                if (reversedHistory[i].newRating === maxRating) {
                    highestRatingIndex = i;
                    break;
                }
            }

            datasets.push({
                platformId,
                label: entry?.platform?.name || platformId,
                data: reversedHistory.map((contest) => contest.newRating),
                borderColor: color,
                backgroundColor: `${color.replace('rgb', 'rgba').replace(')', ', 0.05)')}`,
                tension: 0.3,
                pointBackgroundColor: reversedHistory.map(
                    (_, index) =>
                        index === highestRatingIndex
                            ? "rgb(255, 215, 0)" // Golden for highest rating
                            : color // Platform color for all other contests
                ),
                pointBorderColor: reversedHistory.map((_, index) =>
                    index === highestRatingIndex
                        ? "rgba(255, 255, 255, 1)" // White border for highest
                        : "rgba(255, 255, 255, 0.8)" // Semi-transparent white for others
                ),
                pointBorderWidth: reversedHistory.map((_, index) =>
                    index === highestRatingIndex ? 1 : 0.5 // Slightly thicker border for highest
                ),
                pointRadius: reversedHistory.map(
                    (_, index) => (index === highestRatingIndex ? 3 : 2.5) // Much smaller dots
                ),
                pointHoverRadius: 4, // Small hover radius
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
        });

        if (datasets.length === 0) {
            return (
                <p className="text-white">No contest history available from connected platforms</p>
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
                            const platformId = datasets[datasetIndex]?.platformId;
                            const contestHistory = normalizeContestHistory(
                                allPlatformsData?.[platformId]?.data?.contestHistory
                            ).reverse();

                            if (contestHistory[contestIndex]) {
                                const contest = contestHistory[contestIndex];
                                const maxRating = toSafeNumber(
                                    allPlatformsData?.[platformId]?.data?.maxRating
                                );
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
                            const dataset = datasets[datasetIndex];
                            const platformId = dataset?.platformId;
                            const contestHistory = normalizeContestHistory(
                                allPlatformsData?.[platformId]?.data?.contestHistory
                            ).reverse();

                            if (contestHistory[contestIndex]) {
                                const contest = contestHistory[contestIndex];
                                const change = contest.newRating - contest.oldRating;
                                const maxRating = toSafeNumber(
                                    allPlatformsData?.[platformId]?.data?.maxRating
                                );
                                const isHighest = contest.newRating === maxRating;

                                const baseLabels = [
                                    `Platform: ${dataset?.label || platformId || "Unknown"}`,
                                    `Rating: ${contest.newRating}`,
                                    `Change: ${change > 0 ? "+" : ""}${change}`,
                                    `Standing: ${contest.standing}`,
                                ];

                                if (isHighest) {
                                    baseLabels.push(`⭐ Highest Rating Achieved!`);
                                }

                                return baseLabels;
                            }
                            return `Rating: ${context.parsed?.y ?? 0}`;
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
            <div className="h-80">
                <Line data={chartData} options={options} />
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
