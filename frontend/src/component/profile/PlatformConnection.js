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
    <div className="relative rounded-xl border border-white/5 bg-white/[0.02]">
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-white/10 bg-white/95 p-1.5">
            <img
              src={platform.logo}
              alt={platform.name}
              className={`h-full w-full object-contain ${
                platform.id === "codechef" ? "rounded" : ""
              }`}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {platform.name}
            </p>
            <div className="mt-0.5 text-[11px] text-white">
              {isConnected ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Connected
                </span>
              ) : (
                "Not connected"
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleConnectClick}
          disabled={loading}
          className={`inline-flex flex-none items-center justify-center rounded-xl border px-4 py-2 text-xs font-medium transition disabled:opacity-50 ${
            isConnected
              ? "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              : `${colorClasses.bg} ${colorClasses.hoverBg} border-transparent text-white`
          }`}
        >
          {isConnected ? "Change username" : "Connect"}
        </button>
      </div>

      {dropdownOpen && (
        <div className="border-t border-white/5 p-3 sm:p-4">
          <label className="mb-2 block text-xs font-medium text-white">
            {platform.name} username
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => onUpdateInput(platform.id, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Enter your ${platform.name} username`}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-neutral-300 transition focus:border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            autoFocus
            disabled={loading}
          />

          {message && (
            <p
              className={`mt-2 text-xs ${
                messageType === "success" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => onCancel(platform.id)}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving
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
