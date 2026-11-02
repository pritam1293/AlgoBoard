import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import { PLATFORMS } from "../../config/platformsConfig";

const PLATFORM_TEXT_COLORS = {
  blue: "text-blue-400",
  green: "text-emerald-400",
  orange: "text-orange-400",
  yellow: "text-amber-400",
};

const UserInfo = ({ user, isOwnProfile = true }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        if (isOwnProfile) {
          const response = await userService.getUserProfile();
          if (response.status === "success") {
            setProfileData(response.data);
          } else {
            setError("Failed to load profile data");
          }
        } else {
          const response = await userService.getUserProfileByEmail(user.email);
          if (response.status === "success") {
            setProfileData(response.data);
          } else {
            setError("Failed to load user profile");
          }
        }
      } catch (err) {
        setError("Error fetching profile data");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user?.email, isOwnProfile]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <div>
            <p className="text-sm font-medium text-white">Loading profile</p>
            <p className="text-xs text-white">
              Fetching your account details...
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl border border-white/5 bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
        <p className="text-sm font-medium text-red-200">{error}</p>
        <p className="mt-1 text-xs text-red-300/80">
          Please refresh the page or try again later.
        </p>
      </div>
    );
  }

  const userData = isOwnProfile
    ? { ...(profileData || {}), ...(user || {}) }
    : profileData || user;

  const fullName =
    [userData?.firstName, userData?.lastName].filter(Boolean).join(" ") ||
    "Not provided";

  const connectedPlatforms = PLATFORMS.filter((platform) =>
    Boolean(userData?.[platform.usernameField])
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-sm">
      <div className="relative h-28 bg-gradient-to-r from-blue-600/25 via-sky-500/10 to-violet-600/25">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      </div>

      <div className="px-5 pb-6 sm:px-6">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl font-semibold text-white shadow-xl shadow-blue-950/40 ring-4 ring-neutral-950/80">
              {userData?.firstName?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {fullName}
              </h2>
              <p className="break-all text-sm text-white">
                {userData?.email || "No email available"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {connectedPlatforms.length} platforms linked
            </span>
            {isOwnProfile && (
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white">
                Account active
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-white">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <p className="text-xs font-semibold text-white">
                Account details
              </p>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-white">Full name</p>
                <p className="mt-0.5 break-words font-medium text-white">
                  {fullName}
                </p>
              </div>
              <div>
                <p className="text-white">Email address</p>
                <p className="mt-0.5 break-all font-medium text-white">
                  {userData?.email || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-white">
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
                      d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m6.5-3.5l1.5-1.5a4 4 0 015.656 5.656l-3 3a4 4 0 01-5.656 0"
                    />
                  </svg>
                </span>
                <p className="text-xs font-semibold text-white">
                  Linked platforms
                </p>
              </div>
              <span className="text-[10px] text-white">
                {connectedPlatforms.length} of {PLATFORMS.length} connected
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PLATFORMS.map((platform) => {
                const username = userData?.[platform.usernameField];
                const isConnected = Boolean(username);
                const canOpen = isOwnProfile || isConnected;

                const handleClick = () => {
                  if (isOwnProfile) {
                    const targetEmail = userData?.email || user?.email;
                    if (targetEmail) {
                      navigate(
                        `/profile/${encodeURIComponent(
                          targetEmail
                        )}/platforms/${platform.id}`
                      );
                    }
                    return;
                  }

                  if (isConnected) {
                    navigate(
                      `/platform-search/${platform.id}/${encodeURIComponent(
                        username
                      )}`
                    );
                  }
                };

                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={handleClick}
                    disabled={!canOpen}
                    className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                      isConnected
                        ? "border-white/5 bg-white/[0.03]"
                        : "border-white/5 bg-white/[0.01]"
                    } ${
                      canOpen
                        ? "hover:border-white/10 hover:bg-white/[0.06]"
                        : "cursor-default opacity-60"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5">
                      <img
                        src={platform.logo}
                        alt={`${platform.name} logo`}
                        className="h-4 w-4 object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">
                        {platform.name}
                      </p>
                      <p
                        className={`truncate text-[10px] ${
                          isConnected
                            ? PLATFORM_TEXT_COLORS[platform.color] ||
                              "text-blue-400"
                            : "text-white"
                        }`}
                      >
                        {isConnected ? `@${username}` : "Not connected"}
                      </p>
                    </div>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        isConnected ? "bg-emerald-400" : "bg-neutral-700"
                      }`}
                    />
                    {canOpen && (
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-white transition group-hover:text-white"
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
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
