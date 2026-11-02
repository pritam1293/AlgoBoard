import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePlatformConnection } from "../../hooks/usePlatformConnection";
import { PLATFORMS } from "../../config/platformsConfig";
import Navbar from "../common/Navbar";
import PlatformConnections from "./PlatformConnections";

const PlatformConnectionsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { email, platform: platformId } = useParams();
  const profileEmail = email || user?.email || "";

  const {
    platformStates,
    globalMessages,
    connectPlatform,
    isPlatformConnected,
    toggleDropdown,
    updateInput,
    cancelConnection,
  } = usePlatformConnection();

  const isOwnProfile =
    !email ||
    (user?.email ? email.toLowerCase() === user.email.toLowerCase() : false);

  const selectedPlatform = platformId
    ? PLATFORMS.find((platform) => platform.id === platformId)
    : null;

  const profilePath = `/profile/${encodeURIComponent(profileEmail)}`;
  const connectionsPath = `${profilePath}/platforms`;

  if (!isOwnProfile) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-neutral-950">
        <Navbar user={user} onLogout={logout} />
        <main className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h1 className="text-lg font-semibold text-red-200">
              You cannot manage another user's platforms
            </h1>
            <button
              onClick={() => navigate(profilePath)}
              className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
            >
              Back to profile
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (platformId && !selectedPlatform) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-neutral-950">
        <Navbar user={user} onLogout={logout} />
        <main className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
            <h1 className="text-lg font-semibold text-white">
              Platform not found
            </h1>
            <p className="mt-1 text-sm text-white">
              Choose one of the supported platforms to manage its connection.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() =>
                    navigate(`${connectionsPath}/${platform.id}`)
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
                >
                  <img
                    src={platform.logo}
                    alt=""
                    className="h-4 w-4 object-contain"
                  />
                  {platform.name}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <Navbar user={user} onLogout={logout} />

      <main className="relative mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(profilePath)}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-white transition-colors hover:text-white"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to profile
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {selectedPlatform
              ? `${selectedPlatform.name} connection`
              : "Platform connections"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white">
            {selectedPlatform
              ? `Connect or update the ${selectedPlatform.name} handle linked to your AlgoBoard account.`
              : "Link your competitive programming handles so your profile and analytics stay in sync."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-3 backdrop-blur-sm">
              <p className="px-3 pb-2 pt-1 text-[10px] font-medium uppercase tracking-widest text-white">
                Platforms
              </p>
              {PLATFORMS.map((platform) => {
                const isSelected = selectedPlatform?.id === platform.id;
                const connected = isPlatformConnected(platform);

                return (
                  <button
                    key={platform.id}
                    onClick={() =>
                      navigate(`${connectionsPath}/${platform.id}`)
                    }
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      isSelected
                        ? "bg-blue-500/10 text-white"
                        : "text-white hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-white/5 bg-white/5">
                      <img
                        src={platform.logo}
                        alt=""
                        className="h-4 w-4 object-contain"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">
                        {platform.name}
                      </span>
                      <span
                        className={`block truncate text-[10px] ${
                          connected ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {connected ? "Connected" : "Not connected"}
                      </span>
                    </span>
                    <svg
                      className={`h-3.5 w-3.5 flex-none ${
                        isSelected ? "text-blue-300" : "text-white"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                );
              })}

              <div className="my-2 h-px bg-white/5" />

              <button
                onClick={() => navigate(connectionsPath)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${
                  !selectedPlatform
                    ? "bg-blue-500/10 text-white"
                    : "text-white hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-white/5 bg-white/5 text-white">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </span>
                All platforms
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold text-white">Good to know</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white">
                We only retrieve public profile data. We never ask for or store
                passwords from competitive programming platforms.
              </p>
            </div>
          </aside>

          <div className="min-w-0">
            <PlatformConnections
              user={user}
              platforms={selectedPlatform ? [selectedPlatform] : PLATFORMS}
              platformStates={platformStates}
              globalMessages={globalMessages}
              onConnect={connectPlatform}
              onToggleDropdown={toggleDropdown}
              onUpdateInput={updateInput}
              onCancel={cancelConnection}
              isPlatformConnected={isPlatformConnected}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlatformConnectionsPage;
