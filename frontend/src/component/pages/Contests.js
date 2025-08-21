import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";
import contestService from "../../services/contestService";

const Contests = () => {
    const { user, logout } = useAuth();
    const [contests, setContests] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
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
                setContests(response.data || {});
            } else {
                console.warn("No contest data in response");
                setContests({});
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
    const getCountdownOrStatus = (dateString, phase) => {
        const contestDate = new Date(dateString);
        const now = currentTime;
        const diff = contestDate - now;

        if (phase === "FINISHED" || phase === "past") {
            return { text: "Ended", color: "text-gray-400", isCountdown: false };
        } else if (phase === "CODING" || phase === "present") {
            return { text: "LIVE", color: "text-red-500 font-bold animate-pulse", isCountdown: false };
        } else if (diff > 0) {
            // Contest hasn't started yet
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 1) {
                return { text: `${days} days`, color: "text-green-400", isCountdown: false };
            } else if (days === 1) {
                return { text: `${days} day ${hours}h`, color: "text-green-400", isCountdown: false };
            } else {
                // Less than 24 hours - show countdown
                const countdownText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                return { text: countdownText, color: "text-yellow-400 font-mono", isCountdown: true };
            }
        }
        return { text: "Started", color: "text-blue-400", isCountdown: false };
    };

    // Helper function to get contest link
    const getContestLink = (platform, contestId) => {
        switch (platform.toLowerCase()) {
            case "codeforces":
                return `https://codeforces.com/contests/${contestId}`;
            case "codechef":
                return `https://www.codechef.com/${contestId}`;
            case "atcoder":
                // You'll provide this URL pattern
                return `https://atcoder.jp/contests/${contestId}`;
            case "leetcode":
                // You'll provide this URL pattern
                return `https://leetcode.com/contest/${contestId}`;
            default:
                return "#";
        }
    };    // Platform logos mapping
    const platformLogos = {
        codeforces: "/images/platforms/codeforces_logo.png",
        codechef: "/images/platforms/codechef_logo.jpg",
        atcoder: "/images/platforms/atcoder_logo.png",
        leetcode: "/images/platforms/LeetCode_logo.png",
    };

    // Sort contests by start date
    const sortContestsByDate = (contestList) => {
        return contestList.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    };

    // Filter contests based on active tab
    const getFilteredContests = () => {
        const allContests = [];

        Object.entries(contests).forEach(([platform, contestList]) => {
            if (contestList && Array.isArray(contestList)) {
                contestList.forEach(contest => {
                    allContests.push({ ...contest, platform });
                });
            }
        });

        const sortedContests = sortContestsByDate(allContests);

        if (activeTab === "all") return sortedContests;

        const now = new Date();
        return sortedContests.filter(contest => {
            const contestDate = new Date(contest.startTime);

            switch (activeTab) {
                case "upcoming":
                    return contestDate > now && (contest.phase === "BEFORE" || contest.phase === "future" || !contest.phase);
                case "live":
                    return contest.phase === "CODING" || contest.phase === "present";
                case "past":
                    return contestDate < now || contest.phase === "FINISHED" || contest.phase === "past";
                default:
                    return true;
            }
        });
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

    const filteredContests = getFilteredContests();

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

                {/* Filter Tabs */}
                <div className="mb-6">
                    <div className="flex space-x-1 bg-neutral-800 p-1 rounded-lg w-fit">
                        {[
                            { key: "all", label: "All" },
                            { key: "upcoming", label: "Upcoming" },
                            { key: "live", label: "Live" },
                            { key: "past", label: "Past" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key
                                    ? "bg-blue-600 text-white"
                                    : "text-neutral-400 hover:text-white"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contests Display */}
                {filteredContests.length === 0 ? (
                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-8 text-center">
                        <h3 className="text-neutral-300 text-lg font-medium mb-2">
                            No Contests Found
                        </h3>
                        <p className="text-neutral-400">
                            {activeTab === "all"
                                ? "No contests available at the moment."
                                : `No ${activeTab} contests found.`}
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
                                                Starts In
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
                                        {filteredContests.map((contest, index) => {
                                            const countdown = getCountdownOrStatus(contest.startTime, contest.phase);
                                            const contestLink = getContestLink(contest.platform, contest.contestId);

                                            return (
                                                <tr
                                                    key={`${contest.platform}-${contest.contestId}-${index}`}
                                                    className="hover:bg-neutral-750 transition-colors"
                                                >
                                                    {/* Contest Name & Platform */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={platformLogos[contest.platform]}
                                                                alt={contest.platform}
                                                                className="w-6 h-6 mr-3 rounded"
                                                                onError={(e) => {
                                                                    e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23374151"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10">${contest.platform[0].toUpperCase()}</text></svg>`;
                                                                }}
                                                            />
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

                                                    {/* Starts In / Countdown */}
                                                    <td className="px-6 py-4">
                                                        <span className={`text-sm font-medium ${countdown.color}`}>
                                                            {countdown.text}
                                                        </span>
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
                                                            href={contestLink}
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
                            {filteredContests.map((contest, index) => {
                                const countdown = getCountdownOrStatus(contest.startTime, contest.phase);
                                const contestLink = getContestLink(contest.platform, contest.contestId);

                                return (
                                    <div
                                        key={`${contest.platform}-${contest.contestId}-${index}`}
                                        className="bg-neutral-800 border border-neutral-700 rounded-lg p-4"
                                    >
                                        {/* Mobile Format: 22.08 Fri 15:30 */}
                                        <div className="text-neutral-300 text-lg font-semibold mb-1">
                                            {formatMobileDateTime(contest.startTime)}
                                        </div>

                                        {/* Duration */}
                                        <div className="text-neutral-400 text-sm mb-2">
                                            {formatDuration(contest.duration)}
                                        </div>

                                        {/* Countdown */}
                                        <div className={`text-sm font-medium mb-3 ${countdown.color}`}>
                                            {countdown.text}
                                        </div>

                                        {/* Contest Name with Platform Logo */}
                                        <div className="flex items-center mb-3">
                                            <img
                                                src={platformLogos[contest.platform]}
                                                alt={contest.platform}
                                                className="w-5 h-5 mr-2 rounded"
                                                onError={(e) => {
                                                    e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" fill="%23374151"/><text x="10" y="14" text-anchor="middle" fill="white" font-size="8">${contest.platform[0].toUpperCase()}</text></svg>`;
                                                }}
                                            />
                                            <div className="text-neutral-200 font-medium text-sm">
                                                {contest.contestName}
                                            </div>
                                        </div>

                                        {/* Contest Link */}
                                        <a
                                            href={contestLink}
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
