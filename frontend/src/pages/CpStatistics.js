import React from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../component/common/Navbar";
import { useNavigate } from "react-router-dom";

const CpStatistics = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar user={user} onLogout={logout} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center text-neutral-400 hover:text-white transition duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        </div>
        <div className="max-w-2xl mx-auto bg-neutral-800 rounded-lg p-6 border border-neutral-700 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">CP Statistics</h2>
          <div className="space-y-6">
            <div className="bg-neutral-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                Codeforces
              </h3>
              <p className="text-white">
                Username: {user?.codeforcesUsername || "Not linked"}
              </p>
              {/* Add more Codeforces stats here */}
            </div>
            <div className="bg-neutral-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                AtCoder
              </h3>
              <p className="text-white">
                Username: {user?.atcoderUsername || "Not linked"}
              </p>
              {/* Add more AtCoder stats here */}
            </div>
            <div className="bg-neutral-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-400 mb-2">
                CodeChef
              </h3>
              <p className="text-white">
                Username: {user?.codechefUsername || "Not linked"}
              </p>
              {/* Add more CodeChef stats here */}
            </div>
            <div className="bg-neutral-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                LeetCode
              </h3>
              <p className="text-white">
                Username: {user?.leetcodeUsername || "Not linked"}
              </p>
              {/* Add more LeetCode stats here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CpStatistics;
