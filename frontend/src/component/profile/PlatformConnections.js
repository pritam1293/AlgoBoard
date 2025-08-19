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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          Platform Connections
        </h3>

        {/* Global Success Messages */}
        {Object.entries(globalMessages).map(
          ([platformId, message]) =>
            message && (
              <div
                key={platformId}
                className="mb-4 text-green-400 text-sm font-semibold"
              >
                {message}
              </div>
            )
        )}

        <p className="text-neutral-400 mb-4">
          Connect your competitive programming accounts to track your progress
        </p>

        <div className="flex flex-col gap-4 w-full">
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
