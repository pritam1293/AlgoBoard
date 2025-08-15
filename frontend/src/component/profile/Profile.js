import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/api";

const api = new ApiService();

const Profile = () => {
  const { user, logout, profileMessage, setUser } = useAuth();
  const navigate = useNavigate();
  const [isEditingCF, setIsEditingCF] = useState(false);
  const [cfUsername, setCfUsername] = useState("");
  const [cfError, setCfError] = useState("");

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

        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-neutral-400">
            Manage your account settings and personal information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 mb-8">
          {/* Success/Error Messages */}
          {profileMessage.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                profileMessage.type === "success"
                  ? "bg-green-900/50 border border-green-500 text-green-200"
                  : "bg-red-900/50 border border-red-500 text-red-200"
              }`}
            >
              <div className="flex items-center">
                {profileMessage.type === "success" ? (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {profileMessage.text}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-2xl font-bold">
                  {user?.firstName?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-neutral-400">@{user?.username}</p>
                <p className="text-neutral-500 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                First Name
              </label>
              <p className="text-white py-2">{user?.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Last Name
              </label>
              <p className="text-white py-2">{user?.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Username
              </label>
              <p className="text-white py-2">@{user?.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email
              </label>
              <p className="text-white py-2">{user?.email}</p>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <div
                  className={`mr-2 w-4 h-4 rounded ${
                    user?.student ? "bg-blue-600" : "bg-neutral-600"
                  }`}
                >
                  {user?.student && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-neutral-300">
                  I am a student
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            Account Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">0</p>
              <p className="text-neutral-400 text-sm">Connected Platforms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">0</p>
              <p className="text-neutral-400 text-sm">Contest Participations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    year: "numeric",
                  }
                )}
              </p>
              <p className="text-neutral-400 text-sm">Member Since</p>
            </div>
          </div>
        </div>

        {/* Platform Connections */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            Platform Connections
          </h3>
          <p className="text-neutral-400 mb-4">
            Connect your competitive programming accounts to track your progress
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Codeforces */}
            <div className="p-4 bg-neutral-700 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/platforms/codeforces_logo.png"
                    alt="Codeforces"
                    className="w-8 h-8 mr-3"
                  />
                  <div>
                    <span className="text-white">Codeforces</span>
                    {user?.codeforcesUsername && !isEditingCF && (
                      <p className="text-sm text-gray-400">
                        @{user.codeforcesUsername}
                      </p>
                    )}
                  </div>
                </div>
                {user?.codeforcesUsername && !isEditingCF ? (
                  <div className="flex items-center">
                    <span className="text-sm text-green-400 mr-2">
                      Connected
                    </span>
                    <button
                      onClick={() => {
                        setIsEditingCF(true);
                        setCfUsername(user.codeforcesUsername);
                      }}
                      className="text-xs text-gray-400 hover:text-white transition duration-200"
                    >
                      Change
                    </button>
                  </div>
                ) : !isEditingCF ? (
                  <button
                    onClick={() => setIsEditingCF(true)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200"
                  >
                    Connect
                  </button>
                ) : null}
              </div>

              {/* Connection Form */}
              {isEditingCF && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cfUsername}
                      onChange={(e) => setCfUsername(e.target.value)}
                      placeholder="Enter Codeforces handle"
                      className="flex-1 px-3 py-1 bg-neutral-600 border border-neutral-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={() => {
                        if (cfUsername) {
                          // First validate the Codeforces username
                          api.axiosInstance
                            .get(`/platforms/codeforces?username=${cfUsername}`)
                            .then((cfResponse) => {
                              if (cfResponse.data.success) {
                                // If Codeforces profile is valid, update user profile
                                const profileUpdate = {
                                  username: user.username,
                                  email: user.email,
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                  codeforcesUsername: cfUsername,
                                  atcoderUsername: user.atcoderUsername,
                                  codechefUsername: user.codechefUsername,
                                  leetcodeUsername: user.leetcodeUsername,
                                  student: user.student,
                                };

                                return api.axiosInstance.put(
                                  "/users/profile",
                                  profileUpdate
                                );
                              } else {
                                throw new Error(
                                  cfResponse.data.message ||
                                    "Invalid Codeforces username"
                                );
                              }
                            })
                            .then((response) => {
                              if (response.data.success) {
                                setUser({
                                  ...user,
                                  codeforcesUsername: cfUsername,
                                });
                                setIsEditingCF(false);
                                navigate("/cp-statistics");
                              } else {
                                setCfError(
                                  response.data.message ||
                                    "Failed to update profile"
                                );
                              }
                            })
                            .catch((error) => {
                              setCfError(
                                error.response?.data?.message ||
                                  error.message ||
                                  "Failed to connect account"
                              );
                              console.error(
                                "Error details:",
                                error.response?.data || error.message
                              );
                            });
                        }
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingCF(false);
                        setCfUsername("");
                        setCfError("");
                      }}
                      className="px-3 py-1 bg-neutral-600 text-white text-sm rounded hover:bg-neutral-700 transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                  {cfError && <p className="text-red-400 text-sm">{cfError}</p>}
                </div>
              )}
            </div>

            {/* AtCoder */}
            <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg">
              <div className="flex items-center">
                <img
                  src="/images/platforms/atcoder_logo.png"
                  alt="AtCoder"
                  className="w-8 h-8 mr-3"
                />
                <span className="text-white">AtCoder</span>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200">
                Connect
              </button>
            </div>

            {/* CodeChef */}
            <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg">
              <div className="flex items-center">
                <img
                  src="/images/platforms/codechef_logo.jpg"
                  alt="CodeChef"
                  className="w-8 h-8 mr-3 rounded"
                />
                <span className="text-white">CodeChef</span>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200">
                Connect
              </button>
            </div>

            {/* LeetCode */}
            <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg">
              <div className="flex items-center">
                <img
                  src="/images/platforms/LeetCode_logo.png"
                  alt="LeetCode"
                  className="w-8 h-8 mr-3"
                />
                <span className="text-white">LeetCode</span>
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
