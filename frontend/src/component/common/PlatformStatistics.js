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
        const isCodeforces = platformId === 'codeforces';

        if (submissions.length === 0) {
            return (
                <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center justify-between gap-2">
                        <h4 className="text-lg font-semibold text-white">Recent Submissions</h4>
                    </div>
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
                        <p className="text-sm text-white/50">No recent submissions available</p>
                    </div>
                </div>
            );
        }

        const formatStatus = (status) => {
            if (!status) return "Unknown";
            if (!isCodeforces) return status;
            const verdicts = {
                OK: "Accepted",
                WRONG_ANSWER: "Wrong Answer",
                TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
                MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
                RUNTIME_ERROR: "Runtime Error",
                COMPILATION_ERROR: "Compilation Error",
                IDLENESS_LIMIT_EXCEEDED: "Idleness Limit Exceeded",
                SECURITY_VIOLATED: "Security Violated",
                CRASHED: "Crashed",
                TESTING: "Testing",
                REJECTED: "Rejected",
                SKIPPED: "Skipped",
                PARTIAL: "Partial"
            };
            return verdicts[status] || status.replace(/_/g, " ").toLowerCase();
        };

        const getSubmissionUrl = (submission) => {
            if (isCodeforces) {
                return submission.id && submission.index
                    ? `https://codeforces.com/problemset/problem/${submission.id}/${submission.index}`
                    : null;
            }
            return submission.problemUrl || null;
        };

        return (
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <h4 className="text-lg font-semibold text-white">Recent Submissions</h4>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/60">
                        Last {submissions.length}
                    </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-white/10">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider text-white/50">
                                    <th className="w-10 px-4 py-3 text-left font-semibold">#</th>
                                    <th className="px-4 py-3 text-left font-semibold">Problem</th>
                                    {isCodeforces && (
                                        <th className="px-4 py-3 text-center font-semibold">Problem ID</th>
                                    )}
                                    <th className="px-4 py-3 text-right font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((submission, index) => {
                                    const accepted = isCodeforces
                                        ? submission.status === 'OK'
                                        : submission.status === 'Accepted';
                                    const unknown = !submission.status;
                                    const problemName = isCodeforces
                                        ? submission.name || submission.problemTitle || "Unknown problem"
                                        : submission.problemTitle || "Unknown problem";
                                    const submissionUrl = getSubmissionUrl(submission);

                                    return (
                                        <tr
                                            key={index}
                                            className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
                                        >
                                            <td className="px-4 py-3.5 text-xs tabular-nums text-white/40">
                                                {index + 1}
                                            </td>
                                            <td className="max-w-[320px] px-4 py-3.5">
                                                {submissionUrl ? (
                                                    <a
                                                        href={submissionUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group inline-flex items-center gap-1.5 font-medium text-white transition-colors hover:text-blue-400"
                                                    >
                                                        <span className="truncate">{problemName}</span>
                                                        <svg
                                                            className="h-3.5 w-3.5 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                            />
                                                        </svg>
                                                    </a>
                                                ) : (
                                                    <span className="font-medium text-white">{problemName}</span>
                                                )}
                                            </td>
                                            {isCodeforces && (
                                                <td className="px-4 py-3.5 text-center text-xs tabular-nums text-white/50">
                                                    {submission.id ? `${submission.id}${submission.index ? submission.index : ''}` : "—"}
                                                </td>
                                            )}
                                            <td className="px-4 py-3.5 text-right">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${accepted
                                                        ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                                                        : unknown
                                                            ? "bg-white/5 text-white/50 ring-white/10"
                                                            : "bg-red-500/10 text-red-400 ring-red-500/20"
                                                        }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${accepted ? "bg-emerald-400" : unknown ? "bg-white/40" : "bg-red-400"}`}
                                                    />
                                                    {formatStatus(submission.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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

        const getContestUrl = (contestId) => {
            if (!contestId) return null;
            const baseUrls = {
                codeforces: `https://codeforces.com/contest/${contestId}`,
                codechef: `https://www.codechef.com/${contestId}`,
                leetcode: `https://leetcode.com/contest/${contestId}`,
                atcoder: `https://atcoder.jp/contests/${contestId}`
            };
            return baseUrls[selectedPlatform?.id] || null;
        };

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-lg font-semibold text-white">Contest History</h4>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/60">
                        {history.length} contests
                    </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider text-white/50">
                                    <th className="px-5 py-3 text-left font-semibold">Contest</th>
                                    <th className="px-4 py-3 text-center font-semibold">Standing</th>
                                    <th className="px-4 py-3 text-right font-semibold">Old Rating</th>
                                    <th className="px-4 py-3 text-right font-semibold">New Rating</th>
                                    <th className="px-5 py-3 text-right font-semibold">Delta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentContests.map((contest, index) => {
                                    const delta = contest.newRating - contest.oldRating;
                                    const isPositive = delta > 0;
                                    const isNegative = delta < 0;
                                    const trendClass = isPositive
                                        ? "text-emerald-400"
                                        : isNegative
                                            ? "text-red-400"
                                            : "text-white/50";
                                    const contestUrl = getContestUrl(contest.contestId);

                                    return (
                                        <tr
                                            key={index}
                                            className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
                                        >
                                            <td className="max-w-[300px] px-5 py-3.5">
                                                {contestUrl ? (
                                                    <a
                                                        href={contestUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group inline-flex items-center gap-1.5 font-medium text-white transition-colors hover:text-blue-400"
                                                    >
                                                        <span className="truncate">{contest.contestName}</span>
                                                        <svg
                                                            className="h-3.5 w-3.5 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                            />
                                                        </svg>
                                                    </a>
                                                ) : (
                                                    <span className="font-medium text-white">{contest.contestName}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-center tabular-nums text-white/70">
                                                {contest.standing.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3.5 text-right tabular-nums text-white/60">
                                                {contest.oldRating.toLocaleString()}
                                            </td>
                                            <td className={`px-4 py-3.5 text-right font-semibold tabular-nums ${trendClass}`}>
                                                {contest.newRating.toLocaleString()}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span
                                                    className={`inline-flex min-w-[72px] items-center justify-end gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums ${isPositive
                                                        ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                                                        : isNegative
                                                            ? "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20"
                                                            : "bg-white/5 text-white/50 ring-1 ring-inset ring-white/10"
                                                        }`}
                                                >
                                                    <span aria-hidden="true">
                                                        {isPositive ? "▲" : isNegative ? "▼" : "▬"}
                                                    </span>
                                                    {Math.abs(delta).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Contest Pagination */}
                {totalPages > 1 && setContestPage && (
                    <div className="flex items-center justify-between gap-4 pt-1">
                        <span className="text-xs font-medium text-white/50">
                            Page {contestPage + 1} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setContestPage(Math.max(0, contestPage - 1))}
                                disabled={contestPage === 0}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-white/5"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                            <button
                                onClick={() =>
                                    setContestPage(Math.min(totalPages - 1, contestPage + 1))
                                }
                                disabled={contestPage === totalPages - 1}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-white/5"
                            >
                                Next
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
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
