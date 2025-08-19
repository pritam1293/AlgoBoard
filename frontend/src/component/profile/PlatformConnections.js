import React from "react";
import PlatformConnection from "./PlatformConnection";
import { PLATFORMS } from "../../config/platformsConfig";

const PlatformConnections = ({
  user,
  platformStates,
  globalMessages,
  onConnect,
  onToggleDropdown,
  onUpdateInput,
  onCancel,
  isPlatformConnected,
}) => {
  return (
    <div className="w-full">
      <div className="bg-neutral-800 rounded-lg p-4 sm:p-6 border border-neutral-700">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
          Platform Connections
        </h3>

        {/* Global Success Messages */}
        {Object.entries(globalMessages).map(
          ([platformId, message]) =>
            message && (
              <div
                key={platformId}
                className="mb-4 text-green-400 text-sm font-semibold bg-green-900/20 border border-green-800 rounded p-3"
              >
                {message}
              </div>
            )
        )}

        <p className="text-neutral-400 mb-6 text-sm">
          Connect your competitive programming accounts to track your progress
        </p>

        <div className="space-y-4">
          {PLATFORMS.map((platform) => (
            <PlatformConnection
              key={platform.id}
              platform={platform}
              isConnected={isPlatformConnected(platform)}
              platformState={platformStates[platform.id]}
              onConnect={onConnect}
              onToggleDropdown={onToggleDropdown}
              onUpdateInput={onUpdateInput}
              onCancel={onCancel}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformConnections;
