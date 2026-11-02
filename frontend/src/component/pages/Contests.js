import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";
import contestService from "../../services/contestService";

const PLATFORM_META = {
  codeforces: {
    logo: "/images/platforms/codeforces_logo.png",
    text: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-300 border-blue-400/20",
  },
  codechef: {
    logo: "/images/platforms/codechef_logo.jpg",
    text: "text-orange-400",
    badge: "bg-orange-500/10 text-orange-300 border-orange-400/20",
  },
  atcoder: {
    logo: "/images/platforms/atcoder_logo.png",
    text: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
  },
  leetcode: {
    logo: "/images/platforms/LeetCode_logo.png",
    text: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-300 border-amber-400/20",
  },
};

const DEFAULT_PLATFORM = {
  text: "text-white",
  badge: "bg-neutral-500/10 text-white border-neutral-400/20",
};

const getPlatformMeta = (platform) =>
  PLATFORM_META[platform?.toLowerCase()] || DEFAULT_PLATFORM;

const getPlatformUrl = (platform) => {
  switch (platform?.toLowerCase()) {
    case "codechef":
      return "https://www.codechef.com/contests";
    case "codeforces":
      return "https://codeforces.com/contests";
    case "leetcode":
      return "https://leetcode.com/contest/";
    case "atcoder":
      return "https://atcoder.jp/contests/";
    default:
      return "#";
  }
};

const formatDuration = (durationMinutes) => {
  if (!durationMinutes || durationMinutes === "TBD") return "TBD";
  const minutes = Number(durationMinutes);
  if (Number.isNaN(minutes)) return "TBD";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatShortDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const Contests = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchContests();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await contestService.getAllContests();

      if (response && response.data) {
        setContests(Array.isArray(response.data) ? response.data : []);
      } else {
        setContests([]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching contests:", err);
    } finally {
      setLoading(false);
    }
  };

  const getContestStatus = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = currentTime;

    if (now > end) {
      return {
        label: "Ended",
        pill: "border-neutral-500/20 bg-neutral-500/10 text-white",
        isLive: false,
      };
    }

    if (now >= start && now <= end) {
      const diff = end - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const countdown = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      return {
        label: "LIVE",
        pill: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
        isLive: true,
        countdown,
      };
    }

    const diff = start - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 1) {
      return {
        label: `Starts in ${days}d`,
        pill: "border-blue-400/20 bg-blue-500/10 text-blue-300",
        isLive: false,
      };
    }

    if (days === 1) {
      return {
        label: `Starts in 1d ${hours}h`,
        pill: "border-blue-400/20 bg-blue-500/10 text-blue-300",
        isLive: false,
      };
    }

    const countdown = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return {
      label: "Starting soon",
      pill: "border-amber-400/20 bg-amber-500/10 text-amber-300",
      isLive: false,
      countdown,
    };
  };

  const filteredContests = contests.filter((contest) => {
    if (filter === "all") return true;
    if (filter === "live") {
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);
      const now = currentTime;
      return now >= start && now <= end;
    }
    if (filter === "upcoming") {
      const start = new Date(contest.startTime);
      const now = currentTime;
      return start > now;
    }
    if (filter === "ended") {
      const end = new Date(contest.endTime);
      const now = currentTime;
      return now > end;
    }
    return contest.platform?.toLowerCase() === filter;
  });

  const platformFilters = [
    { id: "all", label: "All" },
    { id: "live", label: "Live" },
    { id: "upcoming", label: "Upcoming" },
    { id: "ended", label: "Ended" },
    { id: "codeforces", label: "Codeforces" },
    { id: "codechef", label: "CodeChef" },
    { id: "atcoder", label: "AtCoder" },
    { id: "leetcode", label: "LeetCode" },
  ];

  const liveCount = contests.filter((contest) => {
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const now = currentTime;
    return now >= start && now <= end;
  }).length;

  const upcomingCount = contests.filter((contest) => {
    const start = new Date(contest.startTime);
    const now = currentTime;
    return start > now;
  }).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <Navbar user={user} onLogout={logout} />

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
              Contest calendar
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white">
              Track live, upcoming, and past contests across Codeforces, CodeChef,
              AtCoder, and LeetCode in one unified view.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {liveCount} live
            </span>
            <span className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium text-blue-300">
              {upcomingCount} upcoming
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white">
              {contests.length} total
            </span>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {platformFilters.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                filter === item.id
                  ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
                  : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900/60 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">Stay on time</p>
            <p className="text-xs text-white">
              Contest times are displayed in your local timezone. Official links
              open on each platform.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchContests}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <svg
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? "Refreshing" : "Refresh"}
            </button>
            <a
              href="https://codeforces.com/contests"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
            >
              Official calendar
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <div>
                <p className="text-sm font-medium text-white">
                  Loading contests
                </p>
                <p className="text-xs text-white">
                  Fetching the latest events from all platforms...
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl border border-white/5 bg-white/[0.03]"
                />
              ))}
            </div>
          </div>
        ) : error ? (
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
                Failed to load contests
              </h3>
              <p className="mt-0.5 text-xs text-red-300/80">{error}</p>
              <button
                onClick={fetchContests}
                className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
              >
                Try again
              </button>
            </div>
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 p-10 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">
              No contests match this filter
            </h3>
            <p className="mt-1 max-w-sm text-xs text-white">
              Try switching to a different filter or refresh to see the latest
              schedule.
            </p>
            <button
              onClick={() => setFilter("all")}
              className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
            >
              View all contests
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white">
                        Contest
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white">
                        Start
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white">
                        End
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-white">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-right text-[10px] font-medium uppercase tracking-wider text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredContests.map((contest, index) => {
                      const status = getContestStatus(
                        contest.startTime,
                        contest.endTime
                      );
                      const meta = getPlatformMeta(contest.platform);

                      return (
                        <tr
                          key={`${contest.platform}-${contest.contestId}-${index}`}
                          className="transition-colors hover:bg-white/[0.02]"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                <img
                                  src={
                                    meta.logo ||
                                    `/images/platforms/${contest.platform}_logo.png`
                                  }
                                  alt={contest.platform}
                                  className="h-5 w-5 object-contain"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                  {contest.contestName}
                                </p>
                                <span
                                  className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${meta.badge}`}
                                >
                                  {contest.platform}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-white">
                            {formatDateTime(contest.startTime)}
                          </td>
                          <td className="px-6 py-4 text-sm text-white">
                            {formatDateTime(contest.endTime)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-start gap-1">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${status.pill}`}
                              >
                                {status.isLive && (
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                                )}
                                {status.label}
                              </span>
                              {(status.isLive || status.countdown) && (
                                <span className="font-mono text-[10px] text-white">
                                  {status.isLive
                                    ? `Ends in ${status.countdown}`
                                    : `Starts in ${status.countdown}`}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-white">
                            {formatDuration(contest.duration)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a
                              href={contest.contestUrl || getPlatformUrl(contest.platform)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
                            >
                              View contest
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
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:hidden">
              {filteredContests.map((contest, index) => {
                const status = getContestStatus(contest.startTime, contest.endTime);
                const meta = getPlatformMeta(contest.platform);

                return (
                  <div
                    key={`${contest.platform}-${contest.contestId}-${index}`}
                    className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                          <img
                            src={
                              meta.logo ||
                              `/images/platforms/${contest.platform}_logo.png`
                            }
                            alt={contest.platform}
                            className="h-5 w-5 object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {contest.contestName}
                          </p>
                          <span
                            className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${meta.badge}`}
                          >
                            {contest.platform}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${status.pill}`}
                      >
                        {status.isLive && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        )}
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-white">
                          Starts
                        </p>
                        <p className="mt-1 text-white">
                          {formatShortDateTime(contest.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-white">
                          Ends
                        </p>
                        <p className="mt-1 text-white">
                          {formatShortDateTime(contest.endTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-white">
                          Duration
                        </p>
                        <p className="mt-1 text-white">
                          {formatDuration(contest.duration)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-white">
                          Countdown
                        </p>
                        <p className="mt-1 font-mono text-white">
                          {status.isLive
                            ? status.countdown
                            : status.countdown || "—"}
                        </p>
                      </div>
                    </div>

                    <a
                      href={contest.contestUrl || getPlatformUrl(contest.platform)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
                    >
                      Open contest
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Contests;
