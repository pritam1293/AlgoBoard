import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import contestService from "../../services/contestService";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [runningContests, setRunningContests] = useState([]);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch contests on component mount
  useEffect(() => {
    const fetchContests = async () => {
      try {
        setContestsLoading(true);
        const response = await contestService.getAllContests();

        if (response?.data) {
          const now = new Date();
          const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

          // Filter currently running contests
          const running = response.data.filter(contest => {
            const startTime = new Date(contest.startTime);
            const endTime = new Date(contest.endTime);
            return !isNaN(startTime.getTime()) && !isNaN(endTime.getTime()) &&
              now >= startTime && now <= endTime;
          });

          // Filter upcoming contests (starting within 24 hours)
          const upcoming = response.data.filter(contest => {
            const startTime = new Date(contest.startTime);
            return !isNaN(startTime.getTime()) && startTime >= now && startTime <= next24Hours;
          });

          // Show all running and upcoming contests without any limit
          setRunningContests(running);
          setUpcomingContests(upcoming);
        }
      } catch (error) {
        setUpcomingContests([]);
        setRunningContests([]);
      } finally {
        setContestsLoading(false);
      }
    };

    fetchContests();
  }, []);

  // Update current time every second for countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Helper function to format time until contest starts (with seconds)
  const getTimeUntilContest = (startTime) => {
    const start = new Date(startTime);
    const diffMs = start - currentTime;

    if (diffMs <= 0) return "Starting now";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s`;
    }
    return `${diffSeconds}s`;
  };

  // Helper function to format time remaining for running contests (with seconds)
  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const diffMs = end - currentTime;

    if (diffMs <= 0) return "Contest ended";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s`;
    }
    return `${diffSeconds}s`;
  };

  // Helper function to format duration from minutes to readable format
  const formatDuration = (durationInMinutes) => {
    if (!durationInMinutes || durationInMinutes === 'TBD') return 'TBD';

    const totalMinutes = parseInt(durationInMinutes);
    if (isNaN(totalMinutes)) return 'TBD';

    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(', ') : '0 minutes';
  };

  // Helper function to format date and time
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Helper function to get platform color
  const getPlatformColor = (platform) => {
    const colors = {
      'codeforces': 'bg-blue-600/20 border-blue-500/30 text-blue-400',
      'codechef': 'bg-orange-600/20 border-orange-500/30 text-orange-400',
      'atcoder': 'bg-green-600/20 border-green-500/30 text-green-400',
      'leetcode': 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400'
    };
    return colors[platform?.toLowerCase()] || 'bg-gray-600/20 border-gray-500/30 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar user={user} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username || "User"}! 👋
          </h1>
        </div>

        {/* Features Overview Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 border border-neutral-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="mr-3">🚀</span>
              Welcome to AlgoBoard
            </h2>
            <div className="space-y-4">
              <p className="text-neutral-200 text-lg leading-relaxed">
                Track your complete competitive programming journey at one centralized platform.
                Monitor your progress, analyze your performance, and stay motivated across multiple coding platforms.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <span className="mr-2">📊</span>
                    Comprehensive Analytics
                  </h3>
                  <p className="text-neutral-300 text-sm">
                    Visualize your rating progression, contest history, and problem-solving statistics
                    with interactive charts and detailed insights.
                  </p>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2 flex items-center">
                    <span className="mr-2">🔗</span>
                    Multi-Platform Support
                  </h3>
                  <p className="text-neutral-300 text-sm">
                    Connect accounts from Codeforces, CodeChef, AtCoder, and LeetCode
                    to get a unified view of your competitive programming profile.
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-neutral-800/30 rounded-lg border-l-4 border-blue-500">
                <p className="text-neutral-200 text-sm flex items-center">
                  <span className="mr-2">💬</span>
                  <strong>Need Help?</strong>
                  <span className="ml-2">
                    Encountered any issues or have suggestions? Reach out to our support team at
                    <a href="mailto:support@algoboard.com" className="text-blue-400 hover:text-blue-300 ml-1 underline">
                      support@algoboard.com
                    </a>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📢</span>
            Latest Updates
          </h2>
          <div className="space-y-4">
            {/* New Features Announcement */}
            <div className="bg-neutral-800 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                    <span className="text-white text-lg">✨</span>
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-neutral-200 font-semibold text-lg">
                    Enhanced Profile Tracking Now Live!
                  </h3>
                  <p className="text-neutral-300 mt-2 leading-relaxed">
                    We've significantly improved our profile tracking capabilities. Now enjoy comprehensive
                    statistics and real-time data synchronization for:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div className="bg-blue-600/20 px-3 py-2 rounded-lg border border-blue-500/30">
                      <span className="text-blue-400 font-medium text-sm">Codeforces</span>
                    </div>
                    <div className="bg-orange-600/20 px-3 py-2 rounded-lg border border-orange-500/30">
                      <span className="text-orange-400 font-medium text-sm">CodeChef</span>
                    </div>
                    <div className="bg-green-600/20 px-3 py-2 rounded-lg border border-green-500/30">
                      <span className="text-green-400 font-medium text-sm">AtCoder</span>
                    </div>
                    <div className="bg-yellow-600/20 px-3 py-2 rounded-lg border border-yellow-500/30">
                      <span className="text-yellow-400 font-medium text-sm">LeetCode</span>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-sm mt-3 flex items-center">
                    <span className="mr-2">🗓️</span>
                    Released: September 1, 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Currently Running Contests Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">🔴</span>
            Currently Running Contests
          </h2>
          <div className="space-y-3">
            {contestsLoading ? (
              <div className="bg-neutral-800 rounded-lg p-4 border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mr-3"></div>
                  <span className="text-neutral-300">Loading running contests...</span>
                </div>
              </div>
            ) : runningContests.length > 0 ? (
              runningContests.map((contest, index) => (
                <div key={index} className="bg-neutral-800 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`px-3 py-1 rounded-lg border text-xs font-medium mr-3 ${getPlatformColor(contest.platform)}`}>
                          {contest.platform?.toUpperCase()}
                        </span>
                        <span className="text-green-400 text-sm font-medium bg-green-600/20 px-2 py-1 rounded border border-green-500/30 flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                          LIVE - Ends in {getTimeRemaining(contest.endTime)}
                        </span>
                      </div>
                      <h3 className="text-neutral-200 font-semibold text-lg mb-1">
                        {contest.name}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                        <span className="flex items-center">
                          <span className="mr-1">🏁</span>
                          Ends at: {formatDateTime(contest.endTime)}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">⏱️</span>
                          Duration: {formatDuration(contest.duration)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/contests")}
                      className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Join Contest
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-neutral-800 rounded-lg p-4 border-l-4 border-gray-500">
                <div className="flex items-center">
                  <span className="text-neutral-300">No contests are currently running.</span>
                  <button
                    onClick={() => navigate("/contests")}
                    className="ml-auto px-4 py-2 bg-neutral-700 text-white text-sm rounded-lg hover:bg-neutral-600 transition-colors"
                  >
                    View All Contests
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contest Announcements Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Upcoming Contests (Next 24 Hours)
          </h2>
          <div className="space-y-3">
            {contestsLoading ? (
              <div className="bg-neutral-800 rounded-lg p-4 border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mr-3"></div>
                  <span className="text-neutral-300">Loading upcoming contests...</span>
                </div>
              </div>
            ) : upcomingContests.length > 0 ? (
              upcomingContests.map((contest, index) => (
                <div key={index} className="bg-neutral-800 rounded-lg p-4 border-l-4 border-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`px-3 py-1 rounded-lg border text-xs font-medium mr-3 ${getPlatformColor(contest.platform)}`}>
                          {contest.platform?.toUpperCase()}
                        </span>
                        <span className="text-red-400 text-sm font-medium bg-red-600/20 px-2 py-1 rounded border border-red-500/30">
                          Starts in {getTimeUntilContest(contest.startTime)}
                        </span>
                      </div>
                      <h3 className="text-neutral-200 font-semibold text-lg mb-1">
                        {contest.name}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                        <span className="flex items-center">
                          <span className="mr-1">🚀</span>
                          Starts at: {formatDateTime(contest.startTime)}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">⏱️</span>
                          Duration: {formatDuration(contest.duration)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/contests")}
                      className="ml-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-neutral-800 rounded-lg p-4 border-l-4 border-gray-500">
                <div className="flex items-center">
                  <span className="text-neutral-300">No contests starting in the next 24 hours.</span>
                  <button
                    onClick={() => navigate("/contests")}
                    className="ml-auto px-4 py-2 bg-neutral-700 text-white text-sm rounded-lg hover:bg-neutral-600 transition-colors"
                  >
                    View All Contests
                  </button>
                </div>
              </div>
            )}
            {upcomingContests.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => navigate("/contests")}
                  className="inline-flex items-center px-4 py-2 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors"
                >
                  <span className="mr-2">View All Contests</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Getting Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">
                📊 Connect Your Accounts
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Link your competitive programming platform accounts to track
                your progress automatically.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/profile")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <span className="mr-2">Go to Profile</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">
                📈 Track Your Progress
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Monitor your rating changes, contest participation, and
                problem-solving statistics.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/cp-statistics")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <span className="mr-2">View Statistics</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">
                🔍 Search Users
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Search and explore other users' competitive programming
                statistics and progress across platforms.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/search")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <span className="mr-2">Search Users</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">
                🏆 Live Contests
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Stay updated with upcoming and live contests from all major
                competitive programming platforms.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/contests")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <span className="mr-2">View Contests</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
