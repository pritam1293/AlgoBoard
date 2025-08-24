import React from "react";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
