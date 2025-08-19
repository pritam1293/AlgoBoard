import React from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../common/Navbar";
import BackButton from "../common/BackButton";
import { useNavigate } from "react-router-dom";
import { PLATFORMS, COLOR_CLASSES } from "../../config/platformsConfig";

const CpStatistics = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Platform Statistics Component
  const PlatformStatCard = ({ platform }) => {
    const isConnected = Boolean(user?.[platform.usernameField]);
    const colorClasses = COLOR_CLASSES[platform.color];

    return (
      <div className="bg-neutral-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src={platform.logo}
              alt={platform.name}
              className={`w-8 h-8 mr-3 ${
                platform.id === "codechef" ? "rounded" : ""
              }`}
            />
            <div>
              <h3 className={`text-lg font-semibold ${colorClasses.text}`}>
                {platform.name}
              </h3>
              <p className="text-sm text-gray-400">
                {isConnected
                  ? `@${user[platform.usernameField]}`
                  : "Not linked"}
              </p>
            </div>
          </div>
          {isConnected && (
            <button
              onClick={() => navigate("/profile")}
              className={`text-sm ${colorClasses.text} ${colorClasses.hoverText}`}
            >
              Change
            </button>
          )}
        </div>
        {isConnected ? (
          <div className="text-center py-4">
            <p className="text-gray-400 mb-2">
              {platform.name} statistics will be displayed here
            </p>
            {/* Platform stats component can be added here when available */}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 mb-2">
              Connect your {platform.name} account to see your statistics
            </p>
            <button
              onClick={() => navigate("/profile")}
              className={`text-sm ${colorClasses.text} ${colorClasses.hoverText}`}
            >
              Connect Now
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar user={user} onLogout={logout} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton onBack={() => navigate("/home")} />
        <div className="max-w-2xl mx-auto bg-neutral-800 rounded-lg p-6 border border-neutral-700 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">CP Statistics</h2>
          <div className="space-y-6">
            {PLATFORMS.map((platform) => (
              <PlatformStatCard key={platform.id} platform={platform} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CpStatistics;
