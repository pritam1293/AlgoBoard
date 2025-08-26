import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";
import contestService from "../../services/contestService";

const Contests = () => {
    const { user, logout } = useAuth();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchContests();

        // Update current time every second for countdown
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchContests = async () => {
        try {
            setLoading(true);
            console.log("Fetching contest list...");

            const response = await contestService.getAllContests();

            if (response && response.data) {
                console.log("Contest data received successfully");
                // Backend now returns array directly, not grouped by platform
                setContests(Array.isArray(response.data) ? response.data : []);
            } else {
                console.warn("No contest data in response");
                setContests([]);
            }
        } catch (err) {
            setError(err.message);
            console.error("Error fetching contests:", err);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format duration (convert minutes to hours and minutes)
    const formatDuration = (durationMinutes) => {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    // Helper function to format date and time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    // Helper function to format date for mobile (Jul 16, 2025, 8:00 PM)
    const formatMobileDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    // Helper function to get countdown or status
    const getContestStatus = (startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = currentTime;

        if (now > end) {
            return { text: "Ended", color: "text-gray-400", isCountdown: false, isLive: false };
        } else if (now >= start && now <= end) {
            // Contest is live - show countdown to end
            const diff = end - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const endCountdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            return {
                text: "LIVE",
                countdown: endCountdown,
                color: "text-red-500 font-bold animate-pulse",
                isCountdown: false,
                isLive: true
            };
        } else {
            // Contest hasn't started yet
            const diff = start - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 1) {
                return { text: `${days} days`, color: "text-green-400", isCountdown: false, isLive: false };
            } else if (days === 1) {
                return { text: `${days} day ${hours}h`, color: "text-green-400", isCountdown: false, isLive: false };
            } else {
                // Less than 24 hours - show countdown
                const countdownText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                return { text: countdownText, color: "text-yellow-400 font-mono", isCountdown: true, isLive: false };
            }
        }
    };

    // Helper function to get platform URLs
    const getPlatformUrl = (platform) => {
        switch (platform.toLowerCase()) {
            case "codechef":
                return "https://www.codechef.com/dashboard";
            case "codeforces":
                return "https://codeforces.com/";
            case "leetcode":
                return "https://leetcode.com/";
            case "atcoder":
                return "https://atcoder.jp/";
            default:
                return "#";
        }
    };

    // Platform logos mapping
    const platformLogos = {
        codeforces: "/images/platforms/codeforces_logo.png",
        codechef: "/images/platforms/codechef_logo.jpg",
        atcoder: "/images/platforms/atcoder_logo.png",
        leetcode: "/images/platforms/LeetCode_logo.png",
    }; if (loading) {
        return (
            <div className="min-h-screen bg-neutral-900">
                <Navbar user={user} onLogout={logout} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-neutral-900">
                <Navbar user={user} onLogout={logout} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                        <h3 className="text-red-200 font-medium">Error Loading Contests</h3>
                        <p className="text-red-300 text-sm mt-1">{error}</p>
                        <button
                            onClick={fetchContests}
                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900">
            <Navbar user={user} onLogout={logout} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        🏆 Programming Contests
                    </h1>
                    <p className="text-neutral-400 mb-2">
                        Stay updated with contests from Codeforces, CodeChef, AtCoder, and LeetCode
                    </p>
                    <p className="text-neutral-500 text-sm">
                        ⏰ All times are in IST (GMT+5:30)
                    </p>
                </div>

                {/* Contest Update Delay Notice */}
                <div className="mb-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-200">
                                Contest Update Information
                            </h3>
                            <div className="mt-1 text-sm text-blue-300">
                                <p>
                                    Contest updates may be delayed by 20-30 minutes when newly announced or recently updated.
                                    For immediate and real-time updates, please visit the respective official contest pages directly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="mb-6 bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-200">
                                Notice about Codeforces Contest Links
                            </h3>
                            <div className="mt-1 text-m text-amber-300">
                                <p>
                                    Please note that Codeforces contest links may not redirect you to the exact contest if it hasn't started yet.
                                    Instead, you may be redirected to the most recently concluded contest. For upcoming contests,
                                    we recommend visiting the{' '}
                                    <a
                                        href="https://codeforces.com/contests"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-amber-200 transition-colors"
                                    >
                                        Codeforces contest page
                                    </a>
                                    {' '}directly to view the upcoming contests details.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contests Display */}
                {contests.length === 0 ? (
                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-8 text-center">
                        <h3 className="text-neutral-300 text-lg font-medium mb-2">
                            No Contests Found
                        </h3>
                        <p className="text-neutral-400">
                            No contests available at the moment.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                                Contest
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                                Start Date & Time
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                                End Date & Time
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                                Link
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-700">
                                        {contests.map((contest, index) => {
                                            const status = getContestStatus(contest.startTime, contest.endTime);

                                            return (
                                                <tr
                                                    key={`${contest.platform}-${contest.contestId}-${index}`}
                                                    className="hover:bg-neutral-750 transition-colors"
                                                >
                                                    {/* Contest Name & Platform */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <a
                                                                href={getPlatformUrl(contest.platform)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mr-3 hover:opacity-80 transition-opacity"
                                                            >
                                                                <img
                                                                    src={platformLogos[contest.platform]}
                                                                    alt={contest.platform}
                                                                    className="w-6 h-6 rounded cursor-pointer"
                                                                    onError={(e) => {
                                                                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23374151"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10">${contest.platform[0].toUpperCase()}</text></svg>`;
                                                                    }}
                                                                />
                                                            </a>
                                                            <div>
                                                                <div className="text-neutral-200 font-medium">
                                                                    {contest.contestName}
                                                                </div>
                                                                <div className="text-neutral-400 text-sm capitalize">
                                                                    {contest.platform}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Start Date & Time */}
                                                    <td className="px-6 py-4">
                                                        <div className="text-neutral-200 text-sm">
                                                            {formatDateTime(contest.startTime)}
                                                        </div>
                                                    </td>

                                                    {/* End Date & Time */}
                                                    <td className="px-6 py-4">
                                                        <div className="text-neutral-200 text-sm">
                                                            {formatDateTime(contest.endTime)}
                                                        </div>
                                                    </td>

                                                    {/* Status / Countdown */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-medium ${status.color}`}>
                                                                {status.text}
                                                            </span>
                                                            {status.isLive && status.countdown && (
                                                                <span className="text-xs text-neutral-400 mt-1 font-mono">
                                                                    Ends in: {status.countdown}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Duration */}
                                                    <td className="px-6 py-4">
                                                        <span className="text-neutral-200 text-sm">
                                                            {formatDuration(contest.duration)}
                                                        </span>
                                                    </td>

                                                    {/* Contest Link */}
                                                    <td className="px-6 py-4">
                                                        <a
                                                            href={contest.contestUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                                        >
                                                            Link to Contest
                                                            <svg
                                                                className="w-3 h-3 ml-1"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                                />
                                                            </svg>
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {contests.map((contest, index) => {
                                const status = getContestStatus(contest.startTime, contest.endTime);

                                return (
                                    <div
                                        key={`${contest.platform}-${contest.contestId}-${index}`}
                                        className="bg-neutral-800 border border-neutral-700 rounded-lg p-4"
                                    >
                                        {/* Start Time */}
                                        <div className="text-neutral-300 text-lg font-semibold mb-1">
                                            Start: {formatMobileDateTime(contest.startTime)}
                                        </div>

                                        {/* End Time */}
                                        <div className="text-neutral-300 text-sm mb-2">
                                            End: {formatMobileDateTime(contest.endTime)}
                                        </div>

                                        {/* Duration */}
                                        <div className="text-neutral-400 text-sm mb-2">
                                            Duration: {formatDuration(contest.duration)}
                                        </div>

                                        {/* Status */}
                                        <div className={`text-sm font-medium mb-3 ${status.color}`}>
                                            {status.text}
                                            {status.isLive && status.countdown && (
                                                <div className="text-xs text-neutral-400 mt-1 font-mono">
                                                    Ends in: {status.countdown}
                                                </div>
                                            )}
                                        </div>

                                        {/* Contest Name with Platform Logo */}
                                        <div className="flex items-center mb-3">
                                            <a
                                                href={getPlatformUrl(contest.platform)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mr-2 hover:opacity-80 transition-opacity"
                                            >
                                                <img
                                                    src={platformLogos[contest.platform]}
                                                    alt={contest.platform}
                                                    className="w-5 h-5 rounded cursor-pointer"
                                                    onError={(e) => {
                                                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" fill="%23374151"/><text x="10" y="14" text-anchor="middle" fill="white" font-size="8">${contest.platform[0].toUpperCase()}</text></svg>`;
                                                    }}
                                                />
                                            </a>
                                            <div className="text-neutral-200 font-medium text-sm">
                                                {contest.contestName}
                                            </div>
                                        </div>

                                        {/* Contest Link */}
                                        <a
                                            href={contest.contestUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors w-full justify-center"
                                        >
                                            Link to Contest
                                            <svg
                                                className="w-3 h-3 ml-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}                {/* Refresh Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={fetchContests}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Refreshing..." : "Refresh Contests"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Contests;
