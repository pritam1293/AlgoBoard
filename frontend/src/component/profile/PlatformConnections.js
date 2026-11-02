import React from "react";
import PlatformConnection from "./PlatformConnection";
import { PLATFORMS } from "../../config/platformsConfig";

const PlatformConnections = ({
  user,
  platforms,
  platformStates,
  globalMessages,
  onConnect,
  onToggleDropdown,
  onUpdateInput,
  onCancel,
  isPlatformConnected,
}) => {
  const platformList = platforms || PLATFORMS;
  const connectedCount = PLATFORMS.filter((platform) =>
    isPlatformConnected(platform)
  ).length;

  return (
    <section
      id="connections"
      className="scroll-mt-24 rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Platform connections
          </h2>
          <p className="mt-1 text-xs text-white">
            Link your competitive programming handles to keep your dashboard up
            to date.
          </p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
          {connectedCount}/{PLATFORMS.length} connected
        </span>
      </div>

      {Object.entries(globalMessages).map(
        ([platformId, message]) =>
          message && (
            <div
              key={platformId}
              className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-300"
            >
              {message}
            </div>
          )
      )}

      <div className="space-y-3">
        {platformList.map((platform) => (
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
    </section>
  );
};

export default PlatformConnections;
