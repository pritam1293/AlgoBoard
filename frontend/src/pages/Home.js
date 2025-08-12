import React from 'react';
import Navbar from '../component/common/Navbar';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar user={user} onLogout={logout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'User'}! 👋
          </h1>
          <p className="text-gray-400">
            Here's your competitive programming overview across all platforms.
          </p>
        </div>

        {/* Announcements Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">📢 Announcements</h2>
          <div className="space-y-4">
            {/* Important Announcement */}
            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                    <span className="text-white text-sm font-bold">!</span>
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-blue-200 font-medium">Welcome to AlgoBoard!</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Connect your competitive programming accounts to start tracking your progress across multiple platforms.
                  </p>
                  {/* <p className="text-blue-300 text-xs mt-2">January 15, 2025</p> */}
                </div>
              </div>
            </div>

            {/* Feature Update */}
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                    <span className="text-white text-sm">✨</span>
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-green-200 font-medium">New Feature: Rating Tracking</h3>
                  <p className="text-green-100 text-sm mt-1">
                    We've added automatic rating synchronization for Codeforces, AtCoder, Leetcode, and CodeChef platforms.
                  </p>
                  <p className="text-green-300 text-xs mt-2">August 12, 2025</p>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-full">
                    <span className="text-white text-sm">🔧</span>
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-yellow-200 font-medium">Scheduled Maintenance</h3>
                  <p className="text-yellow-100 text-sm mt-1">
                    System is under maintenance.
                  </p>
                  <p className="text-yellow-300 text-xs mt-2">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">📊 Connect Your Accounts</h3>
              <p className="text-gray-400 text-sm">
                Link your competitive programming platform accounts to track your progress automatically.
              </p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">📈 Track Your Progress</h3>
              <p className="text-gray-400 text-sm">
                Monitor your rating changes, contest participation, and problem-solving statistics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
