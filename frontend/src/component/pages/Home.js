import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import contestService from "../../services/contestService";
import platformService from "../../services/platformService";
import { PLATFORMS } from "../../config/platformsConfig";

const PLATFORM_THEMES = {
  codeforces: {
    text: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-300 border-blue-400/20",
    icon: "bg-blue-500/10 border-blue-400/20",
    glow: "from-blue-500/20",
  },
  atcoder: {
    text: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
    icon: "bg-emerald-500/10 border-emerald-400/20",
    glow: "from-emerald-500/20",
  },
  codechef: {
    text: "text-orange-400",
    badge: "bg-orange-500/10 text-orange-300 border-orange-400/20",
    icon: "bg-orange-500/10 border-orange-400/20",
    glow: "from-orange-500/20",
  },
  leetcode: {
    text: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-300 border-amber-400/20",
    icon: "bg-amber-500/10 border-amber-400/20",
    glow: "from-amber-500/20",
  },
};

const DEFAULT_THEME = {
  text: "text-white",
  badge: "bg-neutral-500/10 text-white border-neutral-400/20",
  icon: "bg-neutral-500/10 border-neutral-400/20",
  glow: "from-neutral-500/20",
};

const getTheme = (platform) =>
  PLATFORM_THEMES[platform?.toLowerCase()] || DEFAULT_THEME;

const getGreeting = (date) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [runningContests, setRunningContests] = useState([]);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [platformStats, setPlatformStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);

  const userEmail = user?.email;
  const profileBasePath = userEmail
    ? `/profile/${encodeURIComponent(userEmail)}`
    : "/profile";

  const connectedPlatforms = useMemo(
    () => PLATFORMS.filter((platform) => Boolean(user?.[platform.usernameField])),
    [user]
  );

  // Fetch contests on component mount
  useEffect(() => {
    const fetchContests = async () => {
      try {
        setContestsLoading(true);
        const response = await contestService.getAllContests();

        if (response?.data) {
          const now = new Date();

          const running = response.data
            .filter((contest) => {
              const startTime = new Date(contest.startTime);
              const endTime = new Date(contest.endTime);
              return (
                !isNaN(startTime.getTime()) &&
                !isNaN(endTime.getTime()) &&
                now >= startTime &&
                now <= endTime
              );
            })
            .sort((a, b) => new Date(a.endTime) - new Date(b.endTime));

          // Every future contest is eligible, no matter how far away it is.
          const upcoming = response.data
            .filter((contest) => {
              const startTime = new Date(contest.startTime);
              return !isNaN(startTime.getTime()) && startTime >= now;
            })
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

          setRunningContests(running);
          setUpcomingContests(upcoming);
        }
      } catch (error) {
        setUpcomingContests([]);
        setRunningContests([]);
      } finally {
        setContestsLoading(false);
      }
    };

    fetchContests();
  }, []);

  // Fetch connected platform statistics
  useEffect(() => {
    let cancelled = false;

    const fetchPlatformStats = async () => {
      if (!userEmail || connectedPlatforms.length === 0) {
        setPlatformStats({});
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);

      const results = await Promise.allSettled(
        connectedPlatforms.map(async (platform) => {
          const response = await platformService.getProfileByPlatform(
            platform.id,
            userEmail
          );
          return { id: platform.id, data: response?.data ?? null };
        })
      );

      if (cancelled) return;

      const nextStats = {};
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.data) {
          nextStats[result.value.id] = result.value.data;
        }
      });

      setPlatformStats(nextStats);
      setStatsLoading(false);
    };

    fetchPlatformStats();

    return () => {
      cancelled = true;
    };
  }, [userEmail, connectedPlatforms]);

  // Update current time every second for countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeUntilContest = (startTime) => {
    const start = new Date(startTime);
    const diffMs = start - currentTime;

    if (diffMs <= 0) return "Starting now";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s`;
    }
    return `${diffSeconds}s`;
  };

  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const diffMs = end - currentTime;

    if (diffMs <= 0) return "Contest ended";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s`;
    }
    return `${diffSeconds}s`;
  };

  const formatDuration = (durationInMinutes) => {
    if (!durationInMinutes || durationInMinutes === "TBD") return "TBD";

    const totalMinutes = parseInt(durationInMinutes);
    if (isNaN(totalMinutes)) return "TBD";

    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(", ") : "0 minutes";
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Contest radar shows 4 contests total: live contests first (ending soonest),
  // then upcoming contests (starting soonest) regardless of how far away they are.
  const radarContests = useMemo(() => {
    const live = runningContests.map((contest) => ({
      contest,
      isLive: true,
    }));
    const upcoming = upcomingContests.map((contest) => ({
      contest,
      isLive: false,
    }));

    return [...live, ...upcoming].slice(0, 4);
  }, [runningContests, upcomingContests]);

  const platformEntries = Object.entries(platformStats);
  const hasPlatformStats = platformEntries.length > 0;

  const peakRating = hasPlatformStats
    ? Math.max(
        ...platformEntries.map(([, stat]) => Number(stat?.maxRating) || 0)
      )
    : 0;

  const totalContests = platformEntries.reduce(
    (sum, [, stat]) => sum + (Number(stat?.contestParticipations) || 0),
    0
  );

  const totalSolved = connectedPlatforms.reduce((sum, platform) => {
    const solved = platformStats[platform.id]?.problemsSolved;
    if (typeof solved === "number") return sum + solved;
    if (solved && typeof solved === "object") {
      return sum + (Number(solved.all) || 0);
    }
    return sum;
  }, 0);

  const statCards = [
    {
      label: "Connected platforms",
      value: `${connectedPlatforms.length}/4`,
      hint:
        connectedPlatforms.length === 4
          ? "Full platform coverage"
          : `${4 - connectedPlatforms.length} available to link`,
      accent: "text-blue-400",
      glow: "bg-blue-500/10",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      label: "Peak rating",
      value: statsLoading ? "..." : peakRating > 0 ? peakRating.toLocaleString() : "—",
      hint: "Best rating across platforms",
      accent: "text-violet-400",
      glow: "bg-violet-500/10",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      label: "Contests played",
      value: statsLoading
        ? "..."
        : hasPlatformStats
        ? totalContests.toLocaleString()
        : "—",
      hint: "Across connected platforms",
      accent: "text-emerald-400",
      glow: "bg-emerald-500/10",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 21h8m-4-4v4m-5-9V5a2 2 0 012-2h6a2 2 0 012 2v7a5 5 0 01-5 5h0a5 5 0 01-5-5z"
          />
        </svg>
      ),
    },
    {
      label: "Problems solved",
      value: statsLoading
        ? "..."
        : totalSolved > 0
        ? totalSolved.toLocaleString()
        : "—",
      hint: "Tracked from your profiles",
      accent: "text-amber-400",
      glow: "bg-amber-500/10",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const renderContestItem = (contest, isLive) => {
    const theme = getTheme(contest.platform);

    return (
      <div
        key={`${isLive ? "live" : "upcoming"}-${contest.name}-${contest.startTime}`}
        className="flex flex-1 flex-col justify-center rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${theme.badge}`}
              >
                {contest.platform}
              </span>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  LIVE · {getTimeRemaining(contest.endTime)}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                  in {getTimeUntilContest(contest.startTime)}
                </span>
              )}
            </div>
            <p className="truncate text-sm font-medium text-white">
              {contest.name}
            </p>
            <p className="mt-1 text-xs text-white">
              {formatDateTime(isLive ? contest.endTime : contest.startTime)} ·{" "}
              {formatDuration(contest.duration)}
            </p>
          </div>
          <button
            onClick={() => navigate("/contests")}
            className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-white/10 hover:text-white"
          >
            Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <Navbar user={user} onLogout={logout} />

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Dashboard
              <span className="text-white">/</span>
              <span className="text-white">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {getGreeting(currentTime)},{" "}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                {user?.firstName || "Coder"}
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white sm:text-base">
              Your competitive programming command center. Track ratings, review
              contest activity, and keep every platform in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                navigate(`/profile/${encodeURIComponent(user?.email || "")}`)
              }
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-900/30 transition duration-200 hover:bg-blue-500"
            >
              View profile
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
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
            <button
              onClick={() => navigate("/contests")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Explore contests
            </button>
          </div>
        </section>

        {/* Overview stats */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/20"
            >
              <div
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${card.glow}`}
              />
              <div className="relative">
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${card.accent}`}
                >
                  {card.icon}
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-white">
                  {card.label}
                </p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-white">{card.hint}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Platform performance */}
          <section className="flex flex-col lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Platform performance
                </h2>
                <p className="text-xs text-white">
                  Live snapshot of your competitive programming accounts
                </p>
              </div>
              <button
                onClick={() => navigate(`${profileBasePath}/platforms`)}
                className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
              >
                Manage accounts
              </button>
            </div>

            <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2">
              {PLATFORMS.map((platform) => {
                const theme = getTheme(platform.id);
                const isConnected = Boolean(
                  user?.[platform.usernameField]
                );
                const stat = isConnected ? platformStats[platform.id] : null;
                const username =
                  stat?.username || user?.[platform.usernameField];

                return (
                  <div
                    key={platform.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/20"
                  >
                    <div
                      className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${theme.glow} to-transparent opacity-70 blur-2xl`}
                    />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${theme.icon}`}
                          >
                            <img
                              src={platform.logo}
                              alt={`${platform.name} logo`}
                              className="h-6 w-6 object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {platform.name}
                            </p>
                            <p className="truncate text-xs text-white">
                              {isConnected
                                ? `@${username || "linked"}`
                                : "Click to connect your account"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                            isConnected
                              ? theme.badge
                              : "border-white/10 bg-white/5 text-white"
                          }`}
                        >
                          {isConnected ? stat?.rank || "Unranked" : "Not connected"}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-white">
                            Rating
                          </p>
                          <p className={`mt-0.5 text-base font-semibold ${theme.text}`}>
                            {stat ? stat.rating || 0 : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-white">
                            Peak
                          </p>
                          <p className="mt-0.5 text-base font-semibold text-white">
                            {stat ? stat.maxRating || 0 : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-white">
                            Contests
                          </p>
                          <p className="mt-0.5 text-base font-semibold text-white">
                            {stat ? stat.contestParticipations || 0 : "—"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            isConnected
                              ? `/profile/${encodeURIComponent(
                                  user?.email || ""
                                )}`
                              : `${profileBasePath}/platforms`
                          )
                        }
                        className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        {isConnected ? "View statistics" : "Connect account"}
                        <svg
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
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
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Contest radar */}
          <section className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Contest radar
                </h2>
                <p className="text-xs text-white">
                  Live now, then the next scheduled contests
                </p>
              </div>
              <button
                onClick={() => navigate("/contests")}
                className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
              >
                View all
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-neutral-900/60 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {runningContests.length} live
                </span>
                <span className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-300">
                  {upcomingContests.length} upcoming
                </span>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
                {contestsLoading ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] px-4 py-10">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="ml-3 text-xs text-white">
                      Loading contests...
                    </span>
                  </div>
                ) : radarContests.length > 0 ? (
                  radarContests.map(({ contest, isLive }) =>
                    renderContestItem(contest, isLive)
                  )
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-white">
                      No contests on the radar
                    </p>
                    <p className="mt-1 text-[11px] text-white">
                      Check the full contest calendar for upcoming events.
                    </p>
                    <button
                      onClick={() => navigate("/contests")}
                      className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-white/10 hover:text-white"
                    >
                      Browse contests
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Quick actions */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Quick actions</h2>
            <p className="text-xs text-white">
              Jump straight into the tools you use most
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                title: "Connect accounts",
                description:
                  "Link or update your competitive programming profiles.",
                action: () => navigate(`${profileBasePath}/platforms`),
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m6.5-3.5l1.5-1.5a4 4 0 015.656 5.656l-3 3a4 4 0 01-5.656 0"
                  />
                ),
              },
              {
                title: "Update profile",
                description:
                  "Keep your personal details and preferences up to date.",
                action: () => navigate(profileBasePath),
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
                title: "Browse contests",
                description:
                  "Discover upcoming contests across every major platform.",
                action: () => navigate("/contests"),
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M8 21h8m-4-4v4m-5-9V5a2 2 0 012-2h6a2 2 0 012 2v7a5 5 0 01-5 5h0a5 5 0 01-5-5z"
                  />
                ),
              },
            ].map((item) => (
              <button
                key={item.title}
                onClick={item.action}
                className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-neutral-900/60 p-5 text-left backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-blue-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {item.icon}
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white">
                    {item.description}
                  </p>
                </div>
                <svg
                  className="ml-auto h-4 w-4 shrink-0 text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white"
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
            ))}
          </div>
        </section>

        {/* Support */}
        <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-900/20 via-neutral-900/40 to-violet-900/20 px-5 py-4 backdrop-blur-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-white">Need a hand?</p>
            <p className="text-xs text-white">
              Found an issue or have a suggestion? We would love to hear from
              you.
            </p>
          </div>
          <a
            href="mailto:support@algoboard.com"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
          >
            Contact support
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
          </a>
        </div>
      </main>
    </div>
  );
};

export default Home;
