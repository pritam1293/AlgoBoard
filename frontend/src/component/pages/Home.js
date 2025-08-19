import React from "react";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { user, logout } = useAuth();

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

        {/* Announcements Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            📢 Announcements
          </h2>
          <div className="space-y-4">
            {/* Important Announcement */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <span className="text-white text-sm font-bold">!</span>
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-neutral-200 font-medium">
                    Welcome to AlgoBoard!
                  </h3>
                  <p className="text-neutral-300 text-sm mt-1">
                    Connect your competitive programming accounts to start
                    tracking your progress across multiple platforms.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Update */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-green-600 rounded-full">
                    <span className="text-white text-sm">✨</span>
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-neutral-200 font-medium">
                    New Feature: Rating Tracking
                  </h3>
                  <p className="text-neutral-300 text-sm mt-1">
                    We've added automatic rating synchronization for Codeforces,
                    AtCoder, Leetcode, and CodeChef platforms.
                  </p>
                  <p className="text-neutral-400 text-xs mt-2">
                    August 12, 2025
                  </p>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-600 rounded-full">
                    <span className="text-white text-sm">🔧</span>
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-neutral-200 font-medium">
                    Scheduled Maintenance
                  </h3>
                  <p className="text-neutral-300 text-sm mt-1">
                    System is under maintenance.
                  </p>
                  <p className="text-neutral-400 text-xs mt-2">
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Contests Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            🏆 Upcoming Contests
          </h2>
          <div className="space-y-4">
            {/* Codeforces Contest */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/platforms/codeforces_logo.png"
                    alt="Codeforces"
                    className="w-8 h-8 mr-3"
                  />
                  <div>
                    <h3 className="text-neutral-200 font-medium">
                      Codeforces Round #912 (Div. 2)
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      August 15, 2025 • 17:35 UTC
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-blue-400 text-sm font-medium">
                    In 3 days
                  </span>
                  <p className="text-neutral-400 text-xs">2h 30m duration</p>
                </div>
              </div>
            </div>

            {/* AtCoder Contest */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/platforms/atcoder_logo.png"
                    alt="AtCoder"
                    className="w-8 h-8 mr-3"
                  />
                  <div>
                    <h3 className="text-neutral-200 font-medium">
                      AtCoder Beginner Contest 364
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      August 17, 2025 • 21:00 JST
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-400 text-sm font-medium">
                    In 5 days
                  </span>
                  <p className="text-neutral-400 text-xs">1h 40m duration</p>
                </div>
              </div>
            </div>

            {/* CodeChef Contest */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/platforms/codechef_logo.jpg"
                    alt="CodeChef"
                    className="w-8 h-8 mr-3 rounded"
                  />
                  <div>
                    <h3 className="text-neutral-200 font-medium">
                      CodeChef Starters 147
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      August 14, 2025 • 20:00 IST
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-yellow-400 text-sm font-medium">
                    In 2 days
                  </span>
                  <p className="text-neutral-400 text-xs">3h duration</p>
                </div>
              </div>
            </div>

            {/* LeetCode Contest */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/platforms/LeetCode_logo.png"
                    alt="LeetCode"
                    className="w-8 h-8 mr-3"
                  />
                  <div>
                    <h3 className="text-neutral-200 font-medium">
                      Weekly Contest 408
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      August 18, 2025 • 10:30 UTC
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-purple-400 text-sm font-medium">
                    In 6 days
                  </span>
                  <p className="text-neutral-400 text-xs">1h 30m duration</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Getting Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">
                📊 Connect Your Accounts
              </h3>
              <p className="text-gray-400 text-sm">
                Link your competitive programming platform accounts to track
                your progress automatically.
              </p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">
                📈 Track Your Progress
              </h3>
              <p className="text-gray-400 text-sm">
                Monitor your rating changes, contest participation, and
                problem-solving statistics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
