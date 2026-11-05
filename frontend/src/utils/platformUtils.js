// Platform utility functions shared across components

const EMPTY_LEVEL = Object.freeze({ all: 0, easy: 0, medium: 0, hard: 0 });

// Coerce API values to a finite number so arithmetic/formatting never yields NaN.
export const toSafeNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

// LeetCode exposes solved/submission counts as { all, easy, medium, hard }.
export const normalizeLevel = (level) => {
    if (typeof level === "number") {
        return { ...EMPTY_LEVEL, all: toSafeNumber(level) };
    }
    if (!level || typeof level !== "object") {
        return { ...EMPTY_LEVEL };
    }
    return {
        all: toSafeNumber(level.all),
        easy: toSafeNumber(level.easy),
        medium: toSafeNumber(level.medium),
        hard: toSafeNumber(level.hard),
    };
};

export const normalizeRecentSubmissions = (submissions) => {
    if (!Array.isArray(submissions)) {
        return [];
    }
    return submissions
        .filter((submission) => submission && typeof submission === "object")
        .map((submission) => ({
            ...submission,
            status: submission.status ?? "",
            problemTitle:
                submission.problemTitle ??
                submission.title ??
                submission.name ??
                "",
            problemUrl: submission.problemUrl ?? "",
        }));
};

export const normalizeContestHistory = (history) => {
    if (!Array.isArray(history)) {
        return [];
    }
    return history
        .filter((contest) => contest && typeof contest === "object")
        .map((contest) => ({
            ...contest,
            contestId: contest.contestId ?? "",
            contestName: contest.contestName ?? "Unknown contest",
            standing: toSafeNumber(contest.standing),
            oldRating: toSafeNumber(contest.oldRating),
            newRating: toSafeNumber(contest.newRating),
        }));
};

// Fill missing LeetCode/platform fields with safe defaults before rendering.
export const normalizePlatformData = (platformId, data) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return null;
    }

    const normalized = {
        ...data,
        username: data.username ?? "",
        rank: data.rank ?? "",
        rating: toSafeNumber(data.rating),
        maxRating: toSafeNumber(data.maxRating),
        contestParticipations: toSafeNumber(data.contestParticipations),
        contestHistory: normalizeContestHistory(data.contestHistory),
        recentSubmissions: normalizeRecentSubmissions(data.recentSubmissions),
    };

    const isLevel = (value) => value !== null && typeof value === "object";

    if (platformId === "leetcode" || isLevel(data.problemsSolved)) {
        normalized.problemsSolved = normalizeLevel(data.problemsSolved);
    } else {
        normalized.problemsSolved = toSafeNumber(data.problemsSolved);
    }

    if (platformId === "leetcode" || isLevel(data.totalSubmissions)) {
        normalized.totalSubmissions = normalizeLevel(data.totalSubmissions);
    } else {
        normalized.totalSubmissions = toSafeNumber(data.totalSubmissions);
    }

    if (platformId === "leetcode" || isLevel(data.acceptedSubmissions)) {
        normalized.acceptedSubmissions = normalizeLevel(data.acceptedSubmissions);
    } else {
        normalized.acceptedSubmissions = toSafeNumber(data.acceptedSubmissions);
    }

    return normalized;
};

export const calculateAcceptanceRate = (accepted, total) => {
    const acceptedCount = toSafeNumber(accepted);
    const totalCount = toSafeNumber(total);
    if (totalCount <= 0) {
        return null;
    }
    return (acceptedCount / totalCount) * 100;
};

export const formatPercent = (value, digits = 1) => {
    const number = Number(value);
    if (value === null || value === undefined || !Number.isFinite(number)) {
        return "—";
    }
    return `${number.toFixed(digits)}%`;
};

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
        const rating = toSafeNumber(value);
        if (rating >= 2100) return 'text-red-400';
        if (rating >= 1900) return 'text-purple-400';
        if (rating >= 1600) return 'text-blue-400';
        if (rating >= 1400) return 'text-cyan-400';
        if (rating >= 1200) return 'text-green-400';
        return 'text-white';
    }
    return 'text-blue-400';
};
