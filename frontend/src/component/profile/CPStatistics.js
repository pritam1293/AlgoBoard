import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../common/Navbar";
import BackButton from "../common/BackButton";
import { useNavigate } from "react-router-dom";
import { PLATFORMS } from "../../config/platformsConfig";
import platformService from "../../services/platformService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CPStatistics = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [contestPage, setContestPage] = useState(0);
  const [solutionsPage, setSolutionsPage] = useState(0);

  const CONTESTS_PER_PAGE = 5;
  const SOLUTIONS_PER_PAGE = 9;





  const renderLeetcodeProblemStats = () => {
    if (!platformData?.problemsSolved || selectedPlatform?.id !== 'leetcode') {
      return null;
    }

    const { problemsSolved, totalSubmissions, acceptedSubmissions } = platformData;

    return (
      <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h4 className="text-lg font-semibold text-white mb-4">Problem Statistics</h4>

        {/* Problems Solved Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-neutral-700 rounded-lg">
            <p className="text-2xl font-bold text-green-400">{problemsSolved.all}</p>
            <p className="text-sm text-gray-400">Total Solved</p>
          </div>
          <div className="text-center p-4 bg-neutral-700 rounded-lg">
            <p className="text-2xl font-bold text-green-500">{problemsSolved.easy}</p>
            <p className="text-sm text-gray-400">Easy</p>
          </div>
          <div className="text-center p-4 bg-neutral-700 rounded-lg">
            <p className="text-2xl font-bold text-yellow-500">{problemsSolved.medium}</p>
            <p className="text-sm text-gray-400">Medium</p>
          </div>
          <div className="text-center p-4 bg-neutral-700 rounded-lg">
            <p className="text-2xl font-bold text-red-500">{problemsSolved.hard}</p>
            <p className="text-sm text-gray-400">Hard</p>
          </div>
        </div>

        {/* Submission Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-700 rounded-lg">
            <h5 className="text-white font-semibold mb-2">Total Submissions</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">All:</span>
                <span className="text-white">{totalSubmissions.all}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Easy:</span>
                <span className="text-white">{totalSubmissions.easy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400">Medium:</span>
                <span className="text-white">{totalSubmissions.medium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">Hard:</span>
                <span className="text-white">{totalSubmissions.hard}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-neutral-700 rounded-lg">
            <h5 className="text-white font-semibold mb-2">Accepted Submissions</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">All:</span>
                <span className="text-white">{acceptedSubmissions.all}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Easy:</span>
                <span className="text-white">{acceptedSubmissions.easy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400">Medium:</span>
                <span className="text-white">{acceptedSubmissions.medium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">Hard:</span>
                <span className="text-white">{acceptedSubmissions.hard}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-neutral-700 rounded-lg">
            <h5 className="text-white font-semibold mb-2">Acceptance Rate</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Overall:</span>
                <span className="text-white">
                  {((acceptedSubmissions.all / totalSubmissions.all) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Easy:</span>
                <span className="text-white">
                  {((acceptedSubmissions.easy / totalSubmissions.easy) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400">Medium:</span>
                <span className="text-white">
                  {((acceptedSubmissions.medium / totalSubmissions.medium) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">Hard:</span>
                <span className="text-white">
                  {((acceptedSubmissions.hard / totalSubmissions.hard) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Recent submissions component for LeetCode
  const renderRecentSubmissions = () => {
    if (!platformData?.recentSubmissions || selectedPlatform?.id !== 'leetcode') {
      return null;
    }

    const submissions = platformData.recentSubmissions.slice(0, 10); // Show latest 10

    return (
      <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h4 className="text-lg font-semibold text-white mb-4">Recent Submissions</h4>
        <div className="space-y-3">
          {submissions.map((submission, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors">
              <div className="flex-1">
                <a
                  href={submission.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {submission.problemTitle}
                </a>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${submission.status === 'Accepted'
                ? 'bg-green-900 text-green-300'
                : 'bg-red-900 text-red-300'
                }`}>
                {submission.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Available platforms (only show connected ones)
  const getConnectedPlatforms = () => {
    return PLATFORMS.filter((platform) => {
      return Boolean(user?.[platform.usernameField]);
    });
  };

  // Fetch platform data when platform is selected
  const fetchPlatformData = async (platform) => {
    if (!platform || !user?.username) return;

    setLoading(true);
    setError(null);
    setPlatformData(null);

    try {
      console.log(`Fetching ${platform.name} stats...`);

      let stats = null;
      if (platform.id === "codeforces") {
        stats = await platformService.getCodeforcesProfile(user.username);
      } else if (platform.id === "leetcode") {
        stats = await platformService.getLeetcodeProfile(user.username);
      } else if (platform.id === "atcoder") {
        stats = await platformService.getAtcoderProfile(user.username);
      }
      // Add other platforms here when needed

      if (stats?.data) {
        console.log(`${platform.name} data received successfully`);
        setPlatformData(stats.data);
        setContestPage(0); // Reset pagination
        setSolutionsPage(0);
      }
    } catch (err) {
      console.error(`Error fetching ${platform.name} stats:`, err);
      setError(`Failed to fetch ${platform.name} statistics`);
    } finally {
      setLoading(false);
    }
  };

  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    fetchPlatformData(platform);
  };

  // Render contest history with pagination
  const renderContestHistory = () => {
    if (
      !platformData?.contestHistory ||
      platformData.contestHistory.length === 0
    ) {
      return <p className="text-gray-400">No contest history available</p>;
    }

    const startIndex = contestPage * CONTESTS_PER_PAGE;
    const endIndex = startIndex + CONTESTS_PER_PAGE;
    const currentContests = platformData.contestHistory.slice(
      startIndex,
      endIndex
    );
    const totalPages = Math.ceil(
      platformData.contestHistory.length / CONTESTS_PER_PAGE
    );

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Contest History</h4>
        <div className="space-y-2">
          {currentContests.map((contest, index) => (
            <div key={index} className="bg-neutral-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-white font-medium">
                    {contest.contestName}
                  </h5>
                  <p className="text-gray-400 text-sm">
                    Standing: {contest.standing}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white">
                    {contest.oldRating} → {contest.newRating}
                  </p>
                  <p
                    className={`text-sm ${contest.newRating > contest.oldRating
                      ? "text-green-400"
                      : "text-red-400"
                      }`}
                  >
                    {contest.newRating > contest.oldRating ? "+" : ""}
                    {contest.newRating - contest.oldRating}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contest Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => setContestPage(Math.max(0, contestPage - 1))}
              disabled={contestPage === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-white">
              {contestPage + 1} of {totalPages}
            </span>
            <button
              onClick={() =>
                setContestPage(Math.min(totalPages - 1, contestPage + 1))
              }
              disabled={contestPage === totalPages - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render accepted solutions with pagination
  const renderAcceptedSolutions = () => {
    if (!platformData?.problemSet || platformData.problemSet.length === 0) {
      return <p className="text-gray-400">No accepted solutions available</p>;
    }

    // Convert problemSet to proper format for display
    const problemsArray = platformData.problemSet.map((problem) => {
      // Each problem is an object like {"2130": "B"}
      const contestId = Object.keys(problem)[0];
      const problemLetter = problem[contestId];
      return {
        contestId,
        problemLetter,
        url: `https://codeforces.com/problemset/problem/${contestId}/${problemLetter}`,
      };
    });

    const startIndex = solutionsPage * SOLUTIONS_PER_PAGE;
    const endIndex = startIndex + SOLUTIONS_PER_PAGE;
    const currentSolutions = problemsArray.slice(startIndex, endIndex);
    const totalPages = Math.ceil(problemsArray.length / SOLUTIONS_PER_PAGE);

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Accepted Solutions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentSolutions.map((problem, index) => (
            <div
              key={index}
              className="bg-neutral-700 rounded-lg p-3 hover:bg-neutral-600 transition-colors"
            >
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm font-mono block"
              >
                Problem {problem.contestId}
                {problem.problemLetter}
              </a>
              <p className="text-gray-400 text-xs mt-1">
                Contest {problem.contestId}
              </p>
            </div>
          ))}
        </div>

        {/* Solutions Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => setSolutionsPage(Math.max(0, solutionsPage - 1))}
              disabled={solutionsPage === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-white">
              {solutionsPage + 1} of {totalPages}
            </span>
            <button
              onClick={() =>
                setSolutionsPage(Math.min(totalPages - 1, solutionsPage + 1))
              }
              disabled={solutionsPage === totalPages - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render rating progression chart
  const renderRatingChart = () => {
    if (
      !platformData?.contestHistory ||
      platformData.contestHistory.length === 0
    ) {
      return (
        <p className="text-gray-400">No contest history available for chart</p>
      );
    }

    // Reverse the contest history to show oldest first (left) to newest last (right)
    const reversedContestHistory = [...platformData.contestHistory].reverse();

    // Find the contest where user achieved their max rating (latest occurrence if multiple)
    const maxRating = platformData.maxRating;
    let highestRatingIndex = -1;
    for (let i = reversedContestHistory.length - 1; i >= 0; i--) {
      if (reversedContestHistory[i].newRating === maxRating) {
        highestRatingIndex = i;
        break;
      }
    }

    const chartData = {
      labels: reversedContestHistory.map((_, index) => index + 1),
      datasets: [
        {
          label: "Rating",
          data: reversedContestHistory.map((contest) => contest.newRating),
          borderColor: "rgb(59, 130, 246)", // Blue
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          tension: 0.3,
          pointBackgroundColor: reversedContestHistory.map(
            (_, index) =>
              index === highestRatingIndex
                ? "rgb(255, 215, 0)"
                : "transparent" // Hide normal points, only show golden point
          ),
          pointBorderColor: reversedContestHistory.map((_, index) =>
            index === highestRatingIndex
              ? "rgba(255, 255, 255, 1)"
              : "transparent" // Hide normal point borders
          ),
          pointBorderWidth: reversedContestHistory.map((_, index) =>
            index === highestRatingIndex ? 2 : 0
          ),
          pointRadius: reversedContestHistory.map(
            (_, index) => (index === highestRatingIndex ? 6 : 0) // Hide normal points, show golden point
          ),
          pointHoverRadius: 5, // Show all points on hover
          pointHoverBackgroundColor: reversedContestHistory.map((_, index) =>
            index === highestRatingIndex
              ? "rgb(255, 215, 0)"
              : "rgb(59, 130, 246)"
          ),
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
          borderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#ffffff",
          },
        },
        title: {
          display: true,
          text: "Rating Progression Over Contests",
          color: "#ffffff",
          font: {
            size: 16,
          },
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              const index = context[0].dataIndex;
              const isHighest = index === highestRatingIndex;
              const contestName = reversedContestHistory[index].contestName;
              return isHighest
                ? `🏆 ${contestName} (Peak Rating!)`
                : contestName;
            },
            label: function (context) {
              const index = context.dataIndex;
              const contest = reversedContestHistory[index];
              const change = contest.newRating - contest.oldRating;
              const isHighest = index === highestRatingIndex;

              const baseLabels = [
                `Rating: ${contest.newRating}`,
                `Change: ${change > 0 ? "+" : ""}${change}`,
                `Standing: ${contest.standing}`,
              ];

              if (isHighest) {
                baseLabels.push(`⭐ Highest Rating Achieved!`);
              }

              return baseLabels;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            maxTicksLimit: 6,
            font: {
              size: 11,
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
            drawBorder: false,
          },
          border: {
            display: false,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    };

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Rating Progression</h4>
        <div className="bg-neutral-700 rounded-lg p-4">
          <div className="relative h-64 sm:h-80 md:h-96">
            <Line data={chartData} options={options} />
          </div>
        </div>
      </div>
    );
  };

  const connectedPlatforms = getConnectedPlatforms();

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar user={user} onLogout={logout} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton onBack={() => navigate("/home")} />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Competitive Programming Statistics
          </h1>
          <p className="text-gray-400">
            View your progress across different platforms
          </p>
        </div>

        {/* Platform Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Platform
          </label>
          <select
            value={selectedPlatform?.id || ""}
            onChange={(e) => {
              const platform = connectedPlatforms.find(
                (p) => p.id === e.target.value
              );
              if (platform) handlePlatformSelect(platform);
            }}
            className="w-full max-w-xs px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a platform...</option>
            {connectedPlatforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading statistics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Platform Data Display */}
        {platformData && selectedPlatform && !loading && (
          <div className="space-y-8">
            {/* Basic Stats */}
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <h3 className="text-xl font-semibold text-white mb-4">
                {selectedPlatform.name} Statistics
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Username</p>
                  <p className="text-lg font-semibold text-white">
                    {platformData.username}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    {selectedPlatform?.id === 'leetcode' ? 'Rank' : 'Rating'}
                  </p>
                  <p className="text-lg font-semibold text-blue-400">
                    {selectedPlatform?.id === 'leetcode'
                      ? (platformData.rank || "Unranked")
                      : (platformData.rating || "Unrated")
                    }
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    {selectedPlatform?.id === 'leetcode' ? 'Rating' : 'Max Rating'}
                  </p>
                  <p className="text-lg font-semibold text-green-400">
                    {selectedPlatform?.id === 'leetcode'
                      ? (platformData.rating || "Unrated")
                      : (platformData.maxRating || "Unrated")
                    }
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Problems Solved</p>
                  <p className="text-lg font-semibold text-purple-400">
                    {selectedPlatform?.id === 'leetcode'
                      ? (platformData.problemsSolved?.all || 0)
                      : (platformData.problemsSolved || 0)
                    }
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Contest Participated</p>
                  <p className="text-lg font-semibold text-orange-400">
                    {platformData.contestParticipations || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Total Submissions</p>
                  <p className="text-lg font-semibold text-yellow-400">
                    {selectedPlatform?.id === 'leetcode'
                      ? (platformData.totalSubmissions?.all || 0)
                      : (platformData.totalSubmissions || 0)
                    }
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Accepted Submissions</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    {selectedPlatform?.id === 'leetcode'
                      ? (platformData.acceptedSubmissions?.all || 0)
                      : (platformData.acceptedSubmissions || 0)
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Platform-specific components */}
            {selectedPlatform?.id === 'leetcode' ? (
              <>
                {/* LeetCode Problem Statistics */}
                {renderLeetcodeProblemStats()}

                {/* Rating Progression Chart */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  {renderRatingChart()}
                </div>

                {/* Contest History */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  {renderContestHistory()}
                </div>

                {/* Recent Submissions */}
                {renderRecentSubmissions()}
              </>
            ) : (
              <>
                {/* Rating Progression Chart */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  {renderRatingChart()}
                </div>

                {/* Contest History */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  {renderContestHistory()}
                </div>

                {/* Accepted Solutions */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  {renderAcceptedSolutions()}
                </div>
              </>
            )}
          </div>
        )}

        {/* No Platform Selected */}
        {!selectedPlatform && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              Select a platform from the dropdown to view your statistics
            </p>
          </div>
        )}

        {/* No Connected Platforms */}
        {connectedPlatforms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              No platforms connected yet
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Platforms
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CPStatistics;