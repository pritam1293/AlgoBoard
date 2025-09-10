// Platform utility functions shared across components

// Get platform display name from platform ID
export const getPlatformDisplayName = (platformId, platforms) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.name : platformId;
};

// Get platform colors for better visual distinction
export const getPlatformColor = (platformId) => {
    const colors = {
        codeforces: 'from-red-500 to-red-600',
        atcoder: 'from-green-500 to-green-600',
        codechef: 'from-yellow-500 to-yellow-600',
        leetcode: 'from-blue-500 to-blue-600'
    };
    return colors[platformId] || 'from-gray-500 to-gray-600';
};

// Get rank/rating color based on platform
export const getRankColor = (platform, value) => {
    if (platform === 'codeforces') {
        if (value >= 2100) return 'text-red-400';
        if (value >= 1900) return 'text-purple-400';
        if (value >= 1600) return 'text-blue-400';
        if (value >= 1400) return 'text-cyan-400';
        if (value >= 1200) return 'text-green-400';
        return 'text-gray-400';
    }
    return 'text-blue-400';
};
