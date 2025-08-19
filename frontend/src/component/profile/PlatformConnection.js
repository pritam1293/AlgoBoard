import React from "react";
import { COLOR_CLASSES } from "../../config/platformsConfig";

const PlatformConnection = ({
  platform,
  isConnected,
  platformState = {},
  onConnect,
  onToggleDropdown,
  onUpdateInput,
  onCancel,
}) => {
  const {
    dropdownOpen = false,
    input = "",
    loading = false,
    message = "",
    messageType = "",
  } = platformState;

  const colorClasses = COLOR_CLASSES[platform.color];

  const handleSubmit = () => {
    if (input.trim()) {
      onConnect(platform, input.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel(platform.id);
    }
  };

  const handleConnectClick = () => {
    onToggleDropdown(platform.id, true);
  };

  return (
    <div className="relative">
      {/* Platform Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-neutral-700 rounded-lg w-full gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={platform.logo}
            alt={platform.name}
            className={`w-8 h-8 flex-shrink-0 ${
              platform.id === "codechef" ? "rounded" : ""
            }`}
          />
          <span className="text-white font-medium truncate">
            {platform.name}
          </span>
          {isConnected && (
            <span className="px-2 py-1 bg-green-600 text-green-200 font-semibold text-xs rounded whitespace-nowrap">
              Connected
            </span>
          )}
        </div>

        <button
          onClick={handleConnectClick}
          className={`px-4 py-2 text-white text-sm rounded transition duration-200 whitespace-nowrap flex-shrink-0 ${colorClasses.bg} ${colorClasses.hoverBg}`}
          disabled={loading}
        >
          {isConnected ? "Change Username?" : "Connect"}
        </button>
      </div>

      {/* Dropdown Form */}
      {dropdownOpen && (
        <div className="mt-2 bg-neutral-700 rounded-lg border border-neutral-600 p-4 shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              {platform.name} Username
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => onUpdateInput(platform.id, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Enter your ${platform.name} username`}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Error/Success Message */}
          {message && (
            <div
              className={`mb-2 text-sm ${
                messageType === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <button
              onClick={() => onCancel(platform.id)}
              className="px-4 py-2 text-neutral-400 hover:text-white transition duration-200 rounded border border-neutral-600 hover:border-neutral-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformConnection;
