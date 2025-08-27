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
  const [allPlatformsData, setAllPlatformsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [contestPage, setContestPage] = useState(0);
  const [solutionsPage, setSolutionsPage] = useState(0);

  const CONTESTS_PER_PAGE = 5;
  const SOLUTIONS_PER_PAGE = 9;

  // Get list of connected platforms
  const connectedPlatforms = PLATFORMS.filter((platform) => {
    return Boolean(user?.[platform.usernameField]);
  });

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

  // Recent submissions component for LeetCode and Codeforces
  const renderRecentSubmissions = () => {
    if (!platformData?.recentSubmissions ||
      (selectedPlatform?.id !== 'leetcode' && selectedPlatform?.id !== 'codeforces')) {
      return null;
    }

    if (platformData.recentSubmissions.length === 0) {
      return (
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h4 className="text-lg font-semibold text-white mb-4">Recent Submissions</h4>
          <p className="text-gray-400">No recent submissions available</p>
        </div>
      );
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
                  href={
                    selectedPlatform?.id === 'codeforces'
                      ? `https://codeforces.com/problemset/problem/${submission.id}/${submission.index}`
                      : submission.problemUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {selectedPlatform?.id === 'codeforces' ? submission.name : submission.problemTitle}
                </a>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${(selectedPlatform?.id === 'codeforces' && submission.status === 'OK') ||
                (selectedPlatform?.id === 'leetcode' && submission.status === 'Accepted')
                ? 'bg-green-900 text-green-300'
                : 'bg-red-900 text-red-300'
                }`}>
                {selectedPlatform?.id === 'codeforces'
                  ? (submission.status === 'OK' ? 'Accepted' :
                    submission.status.split('_').map(word =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' '))
                  : submission.status
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
      } else if (platform.id === "codechef") {
        stats = await platformService.getCodechefProfile(user.username);
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

  // Fetch data from all connected platforms
  const fetchAllPlatformsData = async () => {
    if (!user?.username) return;

    setLoading(true);
    setError(null);
    setPlatformData(null);

    try {
      console.log('Fetching stats from all connected platforms...');
      const allData = {};

      // Fetch data from all connected platforms in parallel
      const promises = connectedPlatforms.map(async (platform) => {
        try {
          let stats = null;
          if (platform.id === "codeforces") {
            stats = await platformService.getCodeforcesProfile(user.username);
          } else if (platform.id === "leetcode") {
            stats = await platformService.getLeetcodeProfile(user.username);
          } else if (platform.id === "atcoder") {
            stats = await platformService.getAtcoderProfile(user.username);
          } else if (platform.id === "codechef") {
            stats = await platformService.getCodechefProfile(user.username);
          }

          if (stats?.data) {
            allData[platform.id] = {
              platform,
              data: stats.data
            };
          }
        } catch (err) {
          console.error(`Error fetching ${platform.name} stats:`, err);
        }
      });

      await Promise.all(promises);
      setAllPlatformsData(allData);
      console.log('All platforms data fetched:', allData);
    } catch (err) {
      console.error('Error fetching all platforms stats:', err);
      setError('Failed to fetch statistics from some platforms');
    } finally {
      setLoading(false);
    }
  };

  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    if (platform?.id === 'all') {
      fetchAllPlatformsData();
    } else {
      fetchPlatformData(platform);
    }
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
                    {contest.contestId ? (
                      <a
                        href={(() => {
                          const baseUrls = {
                            codeforces: `https://codeforces.com/contest/${contest.contestId}`,
                            codechef: `https://www.codechef.com/${contest.contestId}`,
                            leetcode: `https://leetcode.com/contest/${contest.contestId}`,
                            atcoder: `https://atcoder.jp/contests/${contest.contestId}`
                          };
                          return baseUrls[selectedPlatform?.id] || '#';
                        })()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                      >
                        {contest.contestName}
                      </a>
                    ) : (
                      contest.contestName
                    )}
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

  // Render superimposed chart for all platforms
  const renderAllPlatformsChart = () => {
    const platformEntries = Object.entries(allPlatformsData);

    if (platformEntries.length === 0) {
      return (
        <p className="text-gray-400">No contest history available from connected platforms</p>
      );
    }

    const platformColors = {
      codeforces: "rgb(59, 130, 246)", // Blue
      leetcode: "rgb(255, 193, 7)", // Yellow
      atcoder: "rgb(34, 197, 94)", // Green
      codechef: "rgb(249, 115, 22)", // Orange
    };

    const datasets = [];

    platformEntries.forEach(([platformId, { platform, data }]) => {
      if (data.contestHistory && data.contestHistory.length > 0) {
        const reversedHistory = [...data.contestHistory].reverse();
        const color = platformColors[platformId] || "rgb(156, 163, 175)";

        // Find the contest where user achieved their max rating (latest occurrence if multiple)
        const maxRating = data.maxRating;
        let highestRatingIndex = -1;
        for (let i = reversedHistory.length - 1; i >= 0; i--) {
          if (reversedHistory[i].newRating === maxRating) {
            highestRatingIndex = i;
            break;
          }
        }

        datasets.push({
          label: platform.name,
          data: reversedHistory.map((contest) => contest.newRating),
          borderColor: color,
          backgroundColor: `${color.replace('rgb', 'rgba').replace(')', ', 0.05)')}`,
          tension: 0.3,
          pointBackgroundColor: reversedHistory.map(
            (_, index) =>
              index === highestRatingIndex
                ? "rgb(255, 215, 0)"
                : "transparent" // Hide normal points, only show golden point
          ),
          pointBorderColor: reversedHistory.map((_, index) =>
            index === highestRatingIndex
              ? "rgba(255, 255, 255, 1)"
              : "transparent" // Hide normal point borders
          ),
          pointBorderWidth: reversedHistory.map((_, index) =>
            index === highestRatingIndex ? 2 : 0
          ),
          pointRadius: reversedHistory.map(
            (_, index) => (index === highestRatingIndex ? 6 : 0) // Hide normal points, show golden point
          ),
          pointHoverRadius: 5, // Show all points on hover
          pointHoverBackgroundColor: reversedHistory.map((_, index) =>
            index === highestRatingIndex
              ? "rgb(255, 215, 0)"
              : color
          ),
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
          borderWidth: 2,
          fill: false,
        });
      }
    });

    if (datasets.length === 0) {
      return (
        <p className="text-gray-400">No contest history available from connected platforms</p>
      );
    }

    // Find the maximum number of contests to create labels
    const maxContests = Math.max(...datasets.map(dataset => dataset.data.length));
    const labels = Array.from({ length: maxContests }, (_, index) => index + 1);

    const chartData = {
      labels,
      datasets,
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: "#ffffff",
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
            generateLabels: function (chart) {
              const datasets = chart.data.datasets;
              return datasets.map((dataset, index) => ({
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                fontColor: "#ffffff",
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(index),
                index: index
              }));
            }
          },
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              return `Contest ${context[0].label}`;
            },
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y}`;
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

  // Render all platforms summary
  const renderAllPlatformsSummary = () => {
    const platformEntries = Object.entries(allPlatformsData);

    if (platformEntries.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">No data available from connected platforms</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Basic Stats Bar - Similar to individual platform design */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            All Platforms Statistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformEntries.map(([platformId, { platform, data }]) => (
              <div key={platformId} className="bg-neutral-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">{platform.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Username:</span>
                    <span className="text-white">{data.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating:</span>
                    <span className="text-blue-400">{data.rating || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Rating:</span>
                    <span className="text-green-400">{data.maxRating || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contests:</span>
                    <span className="text-white">{data.contestParticipations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank:</span>
                    <span className="text-orange-400">{data.rank || "Unranked"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Progression Chart */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          {renderAllPlatformsChart()}
        </div>
      </div>
    );
  };

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

        {/* Profile Update Notice */}
        <div className="mb-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-200">
                Profile Update Information
              </h3>
              <div className="mt-1 text-sm text-blue-300">
                <p>
                  Profile data updates may vary by up to 1 hour from real-time updates on the respective platforms.
                  This ensures optimal performance while maintaining data accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Platform
          </label>
          <select
            value={selectedPlatform?.id || ""}
            onChange={(e) => {
              if (e.target.value === 'all') {
                handlePlatformSelect({ id: 'all', name: 'All Platforms' });
              } else {
                const platform = connectedPlatforms.find(
                  (p) => p.id === e.target.value
                );
                if (platform) handlePlatformSelect(platform);
              }
            }}
            className="w-full max-w-xs px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a platform...</option>
            {connectedPlatforms.length > 1 && (
              <option value="all">All Platforms</option>
            )}
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

        {/* All Platforms Data Display */}
        {selectedPlatform?.id === 'all' && Object.keys(allPlatformsData).length > 0 && !loading && (
          <div className="space-y-8">
            {renderAllPlatformsSummary()}
          </div>
        )}

        {/* Single Platform Data Display */}
        {platformData && selectedPlatform && selectedPlatform?.id !== 'all' && !loading && (
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

                {/* Hide Problems Solved, Total Submissions, and Accepted Submissions for AtCoder and CodeChef */}
                {selectedPlatform?.id !== 'atcoder' && selectedPlatform?.id !== 'codechef' && (
                  <>
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
                  </>
                )}

                {/* CodeChef specific stats in basic stats section */}
                {selectedPlatform?.id === 'codechef' && (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Current Rank</p>
                      <p className="text-lg font-semibold text-orange-400">
                        {platformData.rank || "Unranked"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Max Rank</p>
                      <p className="text-lg font-semibold text-yellow-400">
                        {platformData.maxRank || "Unranked"}
                      </p>
                    </div>
                  </>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-400">Contest Participated</p>
                  <p className="text-lg font-semibold text-orange-400">
                    {platformData.contestParticipations || 0}
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
            ) : selectedPlatform?.id === 'codechef' ? (
              <>
                {/* Rating Progression Chart */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  {renderRatingChart()}
                </div>

                {/* Contest History */}
                <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                  {renderContestHistory()}
                </div>
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

                {/* Recent Submissions */}
                {renderRecentSubmissions()}

                {/* Accepted Solutions - Only show for platforms that provide this data (exclude AtCoder and Codeforces) */}
                {selectedPlatform?.id !== 'atcoder' && selectedPlatform?.id !== 'codeforces' && (
                  <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                    {renderAcceptedSolutions()}
                  </div>
                )}
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