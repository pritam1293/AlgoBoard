import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../common/Navbar";
import PlatformStatistics from "../common/PlatformStatistics";
import { useAuth } from "../../context/AuthContext";
import { PLATFORMS } from "../../config/platformsConfig";
import platformProfileService from "../../services/platformProfileService";
import {
  getPlatformColor,
  getPlatformDisplayName,
  getRankColor,
} from "../../utils/platformUtils";

const PLATFORM_URLS = {
  codeforces: "https://codeforces.com/",
  atcoder: "https://atcoder.jp/",
  codechef: "https://www.codechef.com/",
  leetcode: "https://leetcode.com/",
};

const PlatformProfileSearch = () => {
  const { user, logout } = useAuth();
  const { platform: urlPlatform, username: urlUsername } = useParams();
  const navigate = useNavigate();

  const [selectedPlatform, setSelectedPlatform] = useState(urlPlatform || "");
  const [username, setUsername] = useState(urlUsername || "");
  const [isLoading, setIsLoading] = useState(false);
  const [platformData, setPlatformData] = useState(null);
  const [error, setError] = useState("");
  const [contestPage, setContestPage] = useState(0);
  const [solutionsPage, setSolutionsPage] = useState(0);

  const performSearch = useCallback(
    async (platform, handle) => {
      setIsLoading(true);
      setError("");
      setPlatformData(null);
      setContestPage(0);
      setSolutionsPage(0);

      try {
        const response = await platformProfileService.fetchPlatformProfile(
          platform,
          handle
        );

        if (response.status === "success" && response.data) {
          setPlatformData(response.data);
          navigate(`/platform-search/${platform}/${handle}?status=true`, {
            replace: true,
          });
        } else {
          setError(response.message || "Profile not found");
          navigate(`/platform-search/${platform}/${handle}?status=false`, {
            replace: true,
          });
        }
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message || "Failed to fetch profile");
        navigate(`/platform-search/${platform}/${handle}?status=false`, {
          replace: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (urlPlatform && urlUsername) {
      performSearch(urlPlatform, urlUsername);
    }
  }, [urlPlatform, urlUsername, performSearch]);

  const platformStats = platformData
    ? PlatformStatistics({
        platformData,
        selectedPlatform: {
          id: selectedPlatform,
          name: getPlatformDisplayName(selectedPlatform, PLATFORMS),
        },
        allPlatformsData: { [selectedPlatform]: platformData },
        contestPage,
        setContestPage,
        solutionsPage,
        setSolutionsPage,
      })
    : null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedPlatform || !username.trim()) return;
    await performSearch(selectedPlatform, username.trim());
  };

  const renderStatTile = (label, value, accent = "text-white") => (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-wide text-white">
        {label}
      </p>
      <p className={`mt-1 truncate text-sm font-semibold ${accent}`}>{value}</p>
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
        <div className="mb-8">
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Platform profile search
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white">
                Look up any competitive programmer across Codeforces, AtCoder,
                CodeChef, and LeetCode without leaving AlgoBoard.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <a
                  key={platform.id}
                  href={PLATFORM_URLS[platform.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10"
                  title={platform.name}
                >
                  <img
                    src={platform.logo}
                    alt={`${platform.name} logo`}
                    className="h-5 w-5 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <section className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-white">
                  Search a profile
                </h2>
                <p className="mt-1 text-xs text-white">
                  Pick a platform and enter the exact username.
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Platform
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((platform) => {
                      const isSelected = selectedPlatform === platform.id;
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => setSelectedPlatform(platform.id)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                            isSelected
                              ? "border-blue-400/30 bg-blue-500/15 text-blue-200"
                              : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <img
                            src={platform.logo}
                            alt=""
                            className="h-4 w-4 object-contain"
                          />
                          <span className="truncate">{platform.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="platform-username"
                    className="mb-2 block text-xs font-medium text-white"
                  >
                    Username
                  </label>
                  <input
                    id="platform-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter username"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-neutral-300 focus:border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedPlatform || !username.trim() || isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Searching
                    </>
                  ) : (
                    <>
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Search profile
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-white">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <h3 className="text-sm font-semibold text-white">
                  Search tips
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-white">
                {[
                  "Usernames are case-sensitive on some platforms.",
                  "No login or account connection is required to search.",
                  "Results include ratings, contest history, and submissions where available.",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="min-w-0 space-y-5">
            {!platformData && !isLoading && !error && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 p-8 text-center sm:p-12">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Find a competitor
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white">
                  Search by platform and username to see a complete performance
                  snapshot, contest history, and recent submissions.
                </p>
                <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-2 sm:grid-cols-4">
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
              </div>
            )}

            {isLoading && (
              <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Searching profile
                    </p>
                    <p className="text-xs text-white">
                      Fetching the latest data from{" "}
                      {getPlatformDisplayName(selectedPlatform, PLATFORMS)}...
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
                    Profile not found
                  </h3>
                  <p className="mt-0.5 text-xs text-red-300/80">{error}</p>
                  <p className="mt-1 text-xs text-red-300/60">
                    Check the username spelling and make sure the profile is
                    public on the selected platform.
                  </p>
                </div>
              </div>
            )}

            {platformData && platformStats && (
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
                  <div
                    className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${getPlatformColor(
                      selectedPlatform
                    )} opacity-10 blur-3xl`}
                  />
                  <div className="relative">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                          <img
                            src={
                              PLATFORMS.find(
                                (item) => item.id === selectedPlatform
                              )?.logo
                            }
                            alt=""
                            className="h-6 w-6 object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-white">
                            {getPlatformDisplayName(selectedPlatform, PLATFORMS)}
                          </p>
                          <h2 className="mt-0.5 text-xl font-semibold text-white">
                            @{platformData.username}
                          </h2>
                          <p className="mt-1 text-xs text-white">
                            {platformData.rank || "Unranked"}
                          </p>
                        </div>
                      </div>
                      <a
                        href={PLATFORM_URLS[selectedPlatform]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
                      >
                        Open on platform
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

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                      {renderStatTile(
                        "Rating",
                        platformData.rating || "Unrated",
                        getRankColor(selectedPlatform, platformData.rating)
                      )}
                      {renderStatTile(
                        "Max rating",
                        platformData.maxRating || "Unrated",
                        "text-emerald-400"
                      )}
                      {renderStatTile(
                        "Contests",
                        platformData.contestParticipations || 0,
                        "text-orange-300"
                      )}
                      {renderStatTile(
                        "Rank",
                        platformData.rank || "Unranked",
                        "text-violet-300"
                      )}
                      {selectedPlatform === "leetcode" &&
                        renderStatTile(
                          "Problems solved",
                          platformData.problemsSolved?.all || 0,
                          "text-blue-300"
                        )}
                      {selectedPlatform === "leetcode" &&
                        renderStatTile(
                          "Acceptance",
                          platformData.totalSubmissions?.all
                            ? `${(
                                (platformData.acceptedSubmissions.all /
                                  platformData.totalSubmissions.all) *
                                100
                              ).toFixed(1)}%`
                            : "—",
                          "text-emerald-400"
                        )}
                    </div>
                  </div>
                </div>

                {selectedPlatform === "leetcode" ? (
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
                ) : selectedPlatform === "codechef" ? (
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
                    {selectedPlatform !== "atcoder" &&
                      selectedPlatform !== "codeforces" && (
                        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
                          {platformStats.renderAcceptedSolutions()}
                        </div>
                      )}
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default PlatformProfileSearch;
