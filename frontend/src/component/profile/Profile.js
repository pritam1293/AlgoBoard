import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";
import UserInfo from "./UserInfo";
import PlatformStatistics from "../common/PlatformStatistics";
import { PLATFORMS } from "../../config/platformsConfig";
import platformService from "../../services/platformService";
import userService from "../../services/userService";
import {
  getPlatformColor,
  getRankColor,
  normalizePlatformData,
} from "../../utils/platformUtils";

const Profile = () => {
  const {
    user,
    logout,
    updateProfile,
    validateProfileForm,
    profileLoading: profileUpdateLoading,
    profileMessage,
    clearProfileMessage,
  } = useAuth();
  const navigate = useNavigate();
  const { email } = useParams();

  const isOwnProfile =
    !email ||
    (user?.email ? email.toLowerCase() === user.email.toLowerCase() : false);
  const profileEmail = isOwnProfile ? user?.email : email;

  const [selectedPlatform, setSelectedPlatform] = useState({
    id: "all",
    name: "All Platforms",
  });
  const [platformData, setPlatformData] = useState(null);
  const [allPlatformsData, setAllPlatformsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contestPage, setContestPage] = useState(0);
  const [solutionsPage, setSolutionsPage] = useState(0);
  const [profileUserData, setProfileUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [editErrors, setEditErrors] = useState({});

  const profileRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const fetchProfileUserData = async () => {
      try {
        setProfileLoading(true);
        if (isOwnProfile) {
          setProfileUserData(user);
        } else {
          const response = await userService.getUserProfileByEmail(profileEmail);
          if (response.status === "success") {
            setProfileUserData(response.data);
          }
        }
      } catch (err) {
        console.error("Error fetching profile user data:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (profileEmail) {
      fetchProfileUserData();
    }
  }, [profileEmail, isOwnProfile, user]);

  const connectedPlatforms = PLATFORMS.filter((platform) => {
    return Boolean(profileUserData?.[platform.usernameField]);
  });

  const platformStats = PlatformStatistics({
    platformData,
    selectedPlatform,
    allPlatformsData,
    contestPage,
    setContestPage,
    solutionsPage,
    setSolutionsPage,
  });

  const loadPlatformData = async (platform) => {
    if (!platform || !profileEmail) return;

    setLoading(true);
    setError(null);
    setPlatformData(null);

    try {
      const stats = await platformService.getProfileByPlatform(
        platform.id,
        profileEmail
      );

      if (stats?.data) {
        const normalized = normalizePlatformData(platform.id, stats.data);
        if (normalized) {
          setPlatformData(normalized);
          setContestPage(0);
          setSolutionsPage(0);
        }
      }
    } catch (err) {
      setError(`Failed to fetch ${platform.name} statistics`);
    } finally {
      setLoading(false);
    }
  };

  const loadAllPlatformsData = async () => {
    if (!profileEmail) return;

    setLoading(true);
    setError(null);
    setPlatformData(null);

    try {
      const response = await platformService.getAllPlatformsData(profileEmail);

      if (response?.data) {
        const allData = {};
        const platformsData = response.data;

        connectedPlatforms.forEach((platform) => {
          const platformId = platform.id;
          const platformResult = platformsData[platformId];
          const normalized = normalizePlatformData(
            platformId,
            platformResult?.data || platformResult
          );
          if (normalized) {
            allData[platformId] = {
              platform,
              data: normalized,
            };
          }
        });

        setAllPlatformsData(allData);
      }
    } catch (err) {
      setError("Failed to fetch statistics from platforms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileEmail && connectedPlatforms.length > 0 && !profileLoading) {
      if (selectedPlatform?.id === "all") {
        loadAllPlatformsData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileEmail, connectedPlatforms.length, profileLoading, selectedPlatform?.id]);

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    if (platform?.id === "all") {
      loadAllPlatformsData();
    } else {
      loadPlatformData(platform);
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    const target =
      section === "profile" ? profileRef.current : statsRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const profilePath = (suffix = "") =>
    `/profile/${encodeURIComponent(profileEmail || "")}${suffix}`;

  const openEditProfile = () => {
    setEditFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setEditErrors({});
    clearProfileMessage();
    setShowEditProfile(true);
  };

  const closeEditProfile = () => {
    setShowEditProfile(false);
    setEditErrors({});
    clearProfileMessage();
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSaveProfile = async () => {
    const errors = validateProfileForm(editFormData);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    const result = await updateProfile({
      ...editFormData,
      email: user?.email,
    });

    if (result.success) {
      setShowEditProfile(false);
    }
  };

  const displayName =
    profileUserData?.firstName || user?.firstName || profileEmail || "Player";

  const sidebarItems = [
    {
      id: "profile",
      label: "Profile",
      hint: "Personal information",
      onClick: () => scrollToSection("profile"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      ),
    },
    {
      id: "statistics",
      label: "Statistics",
      hint: "Ratings and contest history",
      onClick: () => scrollToSection("statistics"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      ),
    },
    {
      id: "contests",
      label: "Contests",
      hint: "Live and upcoming events",
      onClick: () => navigate("/contests"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M8 21h8m-4-4v4m-5-9V5a2 2 0 012-2h6a2 2 0 012 2v7a5 5 0 01-5 5h0a5 5 0 01-5-5z"
        />
      ),
    },
    {
      id: "search",
      label: "Platform Search",
      hint: "Find any competitor",
      onClick: () => navigate("/platform-search"),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
        />
      ),
    },
    {
      id: "change-password",
      label: "Change Password",
      hint: "Update your credentials",
      onClick: () => navigate(profilePath("/change-password")),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      ),
    },
    {
      id: "delete-account",
      label: "Delete Account",
      hint: "Permanently remove account",
      onClick: () => navigate(profilePath("/delete-account")),
      danger: true,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      ),
    },
  ];

  const renderAllPlatformsSummary = () => {
    const platformEntries = Object.entries(allPlatformsData);

    if (platformEntries.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-white">
            No platform data available
          </p>
          <p className="mt-1 text-xs text-white">
            Statistics will appear once your connected platforms respond.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {platformEntries.map(([platformId, { platform, data }]) => (
            <div
              key={platformId}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/20"
            >
              <div
                className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${getPlatformColor(
                  platformId
                )} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}
              />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <img
                        src={platform.logo}
                        alt={`${platform.name} logo`}
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {platform.name}
                      </p>
                      <p className="truncate text-xs text-white">
                        @{data.username}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r ${getPlatformColor(
                      platformId
                    )}`}
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white">
                      Rating
                    </p>
                    <p
                      className={`mt-0.5 text-base font-semibold ${getRankColor(
                        platformId,
                        data.rating
                      )}`}
                    >
                      {data.rating || "Unrated"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white">
                      Max rating
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-emerald-400">
                      {data.maxRating || "Unrated"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white">
                      Contests
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-orange-400">
                      {data.contestParticipations || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white">
                      Rank
                    </p>
                    <p className="mt-0.5 truncate text-base font-semibold text-violet-300">
                      {data.rank || "Unranked"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <svg
                className="h-5 w-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Rating progression
            </h3>
            <p className="mt-1 text-xs text-white">
              Compare your rating journey across every connected platform
            </p>
          </div>
          {platformStats.renderAllPlatformsChart()}
        </div>
      </div>
    );
  };

  const renderStatTile = (label, value, accent = "text-white") => (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <p className="text-[10px] uppercase tracking-wide text-white">
        {label}
      </p>
      <p className={`mt-1 truncate text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <Navbar user={user} onLogout={logout} />

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/home")}
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
              Back to dashboard
            </button>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {isOwnProfile ? "Your profile" : `${displayName}'s profile`}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white">
              Manage your identity, connected platforms, and competitive
              programming performance in one place.
            </p>
          </div>
          {isOwnProfile && (
            <button
              onClick={openEditProfile}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white sm:self-auto"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="self-start space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-xl font-semibold text-white shadow-lg shadow-blue-900/30">
                  {displayName?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-white">
                    {profileEmail}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-white">
                    Platform coverage
                  </span>
                  <span className="text-white">
                    {connectedPlatforms.length}/4
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {PLATFORMS.map((platform) => {
                    const connected = connectedPlatforms.some(
                      (item) => item.id === platform.id
                    );
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        disabled={!isOwnProfile}
                        onClick={() =>
                          navigate(profilePath(`/platforms/${platform.id}`))
                        }
                        className={`flex h-8 items-center justify-center rounded-lg border transition ${
                          connected
                            ? "border-white/10 bg-white/5"
                            : "border-white/5 bg-white/[0.02] opacity-35"
                        } ${
                          isOwnProfile
                            ? "hover:border-white/20 hover:bg-white/10"
                            : "cursor-default"
                        }`}
                        title={`${platform.name}: ${
                          connected ? "Connected" : "Not connected"
                        }`}
                      >
                        <img
                          src={platform.logo}
                          alt={`${platform.name} logo`}
                          className="h-4 w-4 object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => navigate(profilePath("/platforms"))}
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  Manage accounts
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
                      d="M5 12h14M13 6l6 6-6 6"
                    />
                  </svg>
                </button>
              )}
            </div>

            <nav className="rounded-2xl border border-white/10 bg-neutral-900/60 p-2 backdrop-blur-sm">
              {(isOwnProfile
                ? sidebarItems
                : sidebarItems.filter(
                    (item) =>
                      item.id !== "change-password" &&
                      item.id !== "delete-account"
                  )
              ).map((item) => {
                const isActive =
                  item.id === activeSection &&
                  (item.id === "profile" || item.id === "statistics");

                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-blue-500/10 text-white"
                        : item.danger
                          ? "text-white hover:bg-red-500/10 hover:text-red-300"
                          : "text-white hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        isActive
                          ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                          : item.danger
                            ? "border-white/5 bg-white/[0.03] text-white group-hover:border-red-400/10 group-hover:text-red-300"
                            : "border-white/5 bg-white/[0.03] text-white group-hover:text-white"
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {item.icon}
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">
                        {item.label}
                      </span>
                      <span className="block truncate text-[10px] text-white">
                        {item.hint}
                      </span>
                    </span>
                    <svg
                      className={`h-3.5 w-3.5 shrink-0 transition ${
                        isActive
                          ? "text-blue-300"
                          : "text-white group-hover:text-white"
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
                onClick={() => navigate("/home")}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-white transition-colors hover:bg-white/5 hover:text-white"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-white group-hover:text-white">
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
                      d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
                    />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 text-xs font-medium">
                  Back to Home
                </span>
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-white group-hover:text-white"
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

              <button
                onClick={logout}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-white transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-white group-hover:border-red-400/10 group-hover:text-red-300">
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 text-xs font-medium">
                  Log out
                </span>
              </button>
            </nav>
          </aside>

          <section className="min-w-0 space-y-6">
            <div ref={profileRef} className="scroll-mt-24">
              <UserInfo
                user={isOwnProfile ? user : { email: profileEmail }}
                isOwnProfile={isOwnProfile}
              />
            </div>

            <div ref={statsRef} className="scroll-mt-24 space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Competitive statistics
                  </h2>
                  <p className="mt-1 text-xs text-white">
                    Ratings, contest history, and problem-solving data across
                    your platforms
                  </p>
                </div>
                <span className="self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white sm:self-auto">
                  {connectedPlatforms.length} of 4 platforms connected
                </span>
              </div>

              {profileLoading ? (
                <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        Loading profile data
                      </p>
                      <p className="text-xs text-white">
                        Preparing your platform connections...
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[0, 1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-24 animate-pulse rounded-xl border border-white/5 bg-white/[0.03]"
                      />
                    ))}
                  </div>
                </div>
              ) : connectedPlatforms.length > 0 ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 backdrop-blur-sm sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-white">
                          Viewing platform
                        </p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {selectedPlatform?.name || "All Platforms"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handlePlatformSelect({
                              id: "all",
                              name: "All Platforms",
                            })
                          }
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                            selectedPlatform?.id === "all"
                              ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
                              : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          All platforms
                        </button>
                        {connectedPlatforms.map((platform) => (
                          <button
                            key={platform.id}
                            onClick={() => handlePlatformSelect(platform)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                              selectedPlatform?.id === platform.id
                                ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
                                : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:text-white"
                            }`}
                          >
                            <img
                              src={platform.logo}
                              alt=""
                              className="h-3.5 w-3.5 object-contain"
                            />
                            {platform.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {loading && (
                    <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            Loading statistics
                          </p>
                          <p className="text-xs text-white">
                            Pulling the latest data from your platforms...
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[0, 1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="h-24 animate-pulse rounded-xl border border-white/5 bg-white/[0.03]"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-red-200">
                          Error loading data
                        </h3>
                        <p className="mt-0.5 text-xs text-red-300/80">{error}</p>
                      </div>
                    </div>
                  )}

                  {selectedPlatform?.id === "all" &&
                    Object.keys(allPlatformsData).length > 0 &&
                    !loading && <div>{renderAllPlatformsSummary()}</div>}

                  {selectedPlatform?.id === "all" &&
                    Object.keys(allPlatformsData).length === 0 &&
                    !loading &&
                    !error && (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 px-6 py-14 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-white">
                          No platform data available
                        </p>
                        <p className="mx-auto mt-1 max-w-md text-xs text-white">
                          Make sure your competitive programming accounts are
                          connected in settings, then refresh this page.
                        </p>
                        {isOwnProfile && (
                          <button
                            onClick={() => navigate(profilePath("/platforms"))}
                            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500"
                          >
                            Connect platforms
                          </button>
                        )}
                      </div>
                    )}

                  {platformData &&
                    selectedPlatform &&
                    selectedPlatform?.id !== "all" &&
                    !loading && (
                      <div className="space-y-5">
                        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5`}
                              >
                                <img
                                  src={
                                    PLATFORMS.find(
                                      (item) =>
                                        item.id === selectedPlatform.id
                                    )?.logo
                                  }
                                  alt=""
                                  className="h-6 w-6 object-contain"
                                />
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-white">
                                  {selectedPlatform.name} statistics
                                </h3>
                                <p className="text-xs text-white">
                                  @{platformData.username}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium ${getRankColor(
                                selectedPlatform.id,
                                platformData.rating
                              )}`}
                            >
                              {selectedPlatform?.id === "leetcode"
                                ? platformData.rank || "Unranked"
                                : platformData.rank || "Competitor"}
                            </span>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                            {renderStatTile(
                              "Username",
                              platformData.username || "—"
                            )}
                            {renderStatTile(
                              selectedPlatform?.id === "leetcode"
                                ? "Rank"
                                : "Rating",
                              selectedPlatform?.id === "leetcode"
                                ? platformData.rank || "Unranked"
                                : platformData.rating || "Unrated",
                              getRankColor(
                                selectedPlatform.id,
                                platformData.rating
                              )
                            )}
                            {renderStatTile(
                              selectedPlatform?.id === "leetcode"
                                ? "Rating"
                                : "Max rating",
                              selectedPlatform?.id === "leetcode"
                                ? platformData.rating || "Unrated"
                                : platformData.maxRating || "Unrated",
                              "text-emerald-400"
                            )}

                            {selectedPlatform?.id !== "atcoder" &&
                              selectedPlatform?.id !== "codechef" && (
                                <>
                                  {renderStatTile(
                                    "Problems solved",
                                    selectedPlatform?.id === "leetcode"
                                      ? platformData.problemsSolved?.all || 0
                                      : platformData.problemsSolved || 0,
                                    "text-violet-300"
                                  )}
                                  {renderStatTile(
                                    "Total submissions",
                                    selectedPlatform?.id === "leetcode"
                                      ? platformData.totalSubmissions?.all || 0
                                      : platformData.totalSubmissions || 0,
                                    "text-amber-300"
                                  )}
                                  {renderStatTile(
                                    "Accepted",
                                    selectedPlatform?.id === "leetcode"
                                      ? platformData.acceptedSubmissions?.all ||
                                          0
                                      : platformData.acceptedSubmissions || 0,
                                    "text-emerald-400"
                                  )}
                                </>
                              )}

                            {selectedPlatform?.id === "codechef" && (
                              <>
                                {renderStatTile(
                                  "Current rank",
                                  platformData.rank || "Unranked",
                                  "text-orange-300"
                                )}
                                {renderStatTile(
                                  "Max rank",
                                  platformData.maxRank || "Unranked",
                                  "text-amber-300"
                                )}
                              </>
                            )}

                            {renderStatTile(
                              "Contests",
                              platformData.contestParticipations || 0,
                              "text-orange-300"
                            )}
                          </div>
                        </div>

                        {selectedPlatform?.id === "leetcode" ? (
                          <>
                            {platformStats.renderLeetcodeProblemStats()}
                            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
                              {platformStats.renderRatingChart()}
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
                              {platformStats.renderContestHistory()}
                            </div>
                            {platformStats.renderRecentSubmissions()}
                          </>
                        ) : selectedPlatform?.id === "codechef" ? (
                          <>
                            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
                              {platformStats.renderRatingChart()}
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
                              {platformStats.renderContestHistory()}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
                              {platformStats.renderRatingChart()}
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
                              {platformStats.renderContestHistory()}
                            </div>
                            {platformStats.renderRecentSubmissions()}
                            {selectedPlatform?.id !== "atcoder" &&
                              selectedPlatform?.id !== "codeforces" && (
                                <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
                                  {platformStats.renderAcceptedSolutions()}
                                </div>
                              )}
                          </>
                        )}
                      </div>
                    )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 p-6 text-center sm:p-10">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-white">
                    <svg
                      className="h-7 w-7"
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
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {isOwnProfile
                      ? "No platforms connected"
                      : "No platform data available"}
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white">
                    {isOwnProfile
                      ? "Connect your competitive programming accounts to unlock ratings, contest history, problem statistics, and multi-platform comparisons."
                      : `${profileEmail} has not connected any competitive programming platforms yet.`}
                  </p>

                  {isOwnProfile && (
                    <>
                      <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-2 text-left sm:grid-cols-4">
                        {PLATFORMS.map((platform) => (
                          <div
                            key={platform.id}
                            className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
                          >
                            <img
                              src={platform.logo}
                              alt=""
                              className="h-4 w-4 object-contain"
                            />
                            <span className="truncate text-xs text-white">
                              {platform.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mx-auto mt-5 max-w-lg rounded-xl border border-white/5 bg-white/[0.03] p-4 text-left">
                        <p className="mb-3 text-xs font-semibold text-white">
                          What you unlock
                        </p>
                        <div className="grid grid-cols-1 gap-2 text-xs text-white sm:grid-cols-2">
                          {[
                            "Rating progression tracking",
                            "Contest participation history",
                            "Problem solving statistics",
                            "Multi-platform comparison",
                          ].map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center gap-2"
                            >
                              <svg
                                className="h-3.5 w-3.5 shrink-0 text-emerald-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(profilePath("/platforms"))}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                      >
                        Connect platforms
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h14M13 6l6 6-6 6"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeEditProfile}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close edit profile"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="edit-profile-title"
                  className="text-lg font-semibold text-white"
                >
                  Edit profile
                </h2>
                <p className="mt-1 text-xs text-white">
                  Update how your name appears on AlgoBoard.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditProfile}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {profileMessage.text && (
              <div
                className={`mb-4 rounded-xl border p-3 text-xs ${
                  profileMessage.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                {profileMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditInputChange}
                    className={`w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-sm text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      editErrors.firstName
                        ? "border-red-500/50 focus:border-red-400"
                        : "border-white/10 focus:border-blue-400/40"
                    }`}
                  />
                  {editErrors.firstName && (
                    <p className="mt-1 text-xs text-red-400">
                      {editErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditInputChange}
                    className={`w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-sm text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      editErrors.lastName
                        ? "border-red-500/50 focus:border-red-400"
                        : "border-white/10 focus:border-blue-400/40"
                    }`}
                  />
                  {editErrors.lastName && (
                    <p className="mt-1 text-xs text-red-400">
                      {editErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-sm text-white"
                />
                <p className="mt-1 text-[11px] text-white">
                  Your email is your account identifier and cannot be changed.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-white/5 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditProfile}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={profileUpdateLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {profileUpdateLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
