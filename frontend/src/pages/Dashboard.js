import React from 'react';
import Navbar from '../component/Navbar';

const Dashboard = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.username}! 👋
          </h1>
          <p className="text-gray-400">
            Here's your competitive programming overview across all platforms.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Codeforces Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Codeforces</h3>
              <span className="text-blue-400 text-2xl font-bold">CF</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Rating:</span>
                <span className="text-blue-400 font-bold">{user.codeforcesRating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Rating:</span>
                <span className="text-blue-300">{user.codeforcesRating + 200}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rank:</span>
                <span className="text-blue-400">Pupil</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Problems Solved:</span>
                <span className="text-white">156</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200">
              View Profile
            </button>
          </div>

          {/* AtCoder Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">AtCoder</h3>
              <span className="text-orange-400 text-2xl font-bold">AC</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Rating:</span>
                <span className="text-orange-400 font-bold">{user.atcoderRating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Rating:</span>
                <span className="text-orange-300">{user.atcoderRating + 150}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rank:</span>
                <span className="text-orange-400">Brown</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Problems Solved:</span>
                <span className="text-white">89</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition duration-200">
              View Profile
            </button>
          </div>

          {/* CodeChef Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">CodeChef</h3>
              <span className="text-yellow-400 text-2xl font-bold">CC</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Rating:</span>
                <span className="text-yellow-400 font-bold">{user.codechefRating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Rating:</span>
                <span className="text-yellow-300">{user.codechefRating + 100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stars:</span>
                <span className="text-yellow-400">⭐⭐</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Problems Solved:</span>
                <span className="text-white">124</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition duration-200">
              View Profile
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Solved Problem A - Watermelon</p>
                  <p className="text-gray-400 text-xs">Codeforces • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Participated in ABC 364</p>
                  <p className="text-gray-400 text-xs">AtCoder • 1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Rating increased to 1400</p>
                  <p className="text-gray-400 text-xs">CodeChef • 3 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Contests */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Contests</h3>
            <div className="space-y-4">
              <div className="border border-gray-600 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white text-sm font-medium">Codeforces Round #912</p>
                    <p className="text-gray-400 text-xs">Aug 12, 2025 • 17:35 UTC</p>
                  </div>
                  <span className="text-blue-400 text-xs">CF</span>
                </div>
              </div>
              <div className="border border-gray-600 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white text-sm font-medium">AtCoder Beginner Contest 365</p>
                    <p className="text-gray-400 text-xs">Aug 13, 2025 • 14:00 UTC</p>
                  </div>
                  <span className="text-orange-400 text-xs">AC</span>
                </div>
              </div>
              <div className="border border-gray-600 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white text-sm font-medium">CodeChef Starters 100</p>
                    <p className="text-gray-400 text-xs">Aug 14, 2025 • 20:00 UTC</p>
                  </div>
                  <span className="text-yellow-400 text-xs">CC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart Placeholder */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Rating Progress</h3>
          <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg">📊</p>
              <p className="text-gray-400 mt-2">Rating chart will be displayed here</p>
              <p className="text-gray-500 text-sm">Integration with charting library coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
