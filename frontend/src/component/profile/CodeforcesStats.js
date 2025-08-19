import React from "react";

const CodeforcesStats = ({ codeforcesData }) => {
  if (!codeforcesData) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400">Loading Codeforces statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-400">Current Rating</p>
          <p className="text-xl font-bold text-blue-400">
            {codeforcesData.rating || "Unrated"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Max Rating</p>
          <p className="text-xl font-bold text-green-400">
            {codeforcesData.maxRating || "Unrated"}
          </p>
        </div>
      </div>

      {/* Rank Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-400">Current Rank</p>
          <p className="text-sm font-semibold text-blue-300 capitalize">
            {codeforcesData.rank || "Unranked"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Max Rank</p>
          <p className="text-sm font-semibold text-green-300 capitalize">
            {codeforcesData.maxRank || "Unranked"}
          </p>
        </div>
      </div>

      {/* Problems and Submissions Stats */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-600">
        <div className="text-center">
          <p className="text-sm text-gray-400">Problems Solved</p>
          <p className="text-sm font-medium text-purple-400">
            {codeforcesData.problemsSolved || 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Total Submissions</p>
          <p className="text-sm font-medium text-yellow-400">
            {codeforcesData.totalSubmissions || 0}
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-400">Accepted Submissions</p>
          <p className="text-sm font-medium text-emerald-400">
            {codeforcesData.acceptedSubmissions || 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Contest Participations</p>
          <p className="text-sm font-medium text-orange-400">
            {codeforcesData.contestParticipations || 0}
          </p>
        </div>
      </div>

      {/* Handle */}
      <div className="text-center pt-2 border-t border-neutral-600">
        <p className="text-sm text-gray-400">Codeforces Handle</p>
        <a
          href={`https://codeforces.com/profile/${codeforcesData.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          @{codeforcesData.username}
        </a>
      </div>
    </div>
  );
};

export default CodeforcesStats;
