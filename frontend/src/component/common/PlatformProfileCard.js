import React from 'react';

const PlatformProfileCard = ({ platform, profileData, isLoading, error }) => {
    const getPlatformColor = (platformName) => {
        const colors = {
            codeforces: 'bg-blue-500',
            atcoder: 'bg-green-500',
            codechef: 'bg-orange-500',
            leetcode: 'bg-yellow-500',
        };
        return colors[platformName.toLowerCase()] || 'bg-gray-500';
    };

    if (isLoading) {
        return (
            <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6 animate-pulse">
                <div className="h-4 bg-neutral-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-neutral-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-neutral-700 rounded w-2/3"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-neutral-800 rounded-lg border border-neutral-700 border-l-4 border-l-red-500 p-6">
                <div className="flex items-center">
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-red-300">{platform} Profile</h3>
                        <p className="text-red-400 text-sm mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return null;
    }

    const renderCodeforcesProfile = (data) => (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-neutral-400 text-sm">Handle:</span>
                    <p className="font-medium text-white">{data.handle}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Rating:</span>
                    <p className="font-medium text-blue-400">{data.rating || 'Unrated'}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Max Rating:</span>
                    <p className="font-medium text-white">{data.maxRating || 'N/A'}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Rank:</span>
                    <p className="font-medium text-white">{data.rank || 'Unranked'}</p>
                </div>
            </div>
            {data.titlePhoto && (
                <img src={data.titlePhoto} alt="Profile" className="w-16 h-16 rounded-full mx-auto" />
            )}
        </div>
    );

    const renderAtcoderProfile = (data) => (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-neutral-400 text-sm">Username:</span>
                    <p className="font-medium text-white">{data.username}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Rating:</span>
                    <p className="font-medium text-green-400">{data.rating || 'Unrated'}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Highest Rating:</span>
                    <p className="font-medium text-white">{data.highestRating || 'N/A'}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Rank:</span>
                    <p className="font-medium text-white">{data.rank || 'Unranked'}</p>
                </div>
            </div>
        </div>
    );

    const renderCodechefProfile = (data) => (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-neutral-400 text-sm">Username:</span>
                    <p className="font-medium text-white">{data.username}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Rating:</span>
                    <p className="font-medium text-orange-400">{data.currentRating || 'Unrated'}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Highest Rating:</span>
                    <p className="font-medium text-white">{data.highestRating || 'N/A'}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Stars:</span>
                    <p className="font-medium text-white">{data.stars || 0} ⭐</p>
                </div>
            </div>
        </div>
    );

    const renderLeetcodeProfile = (data) => (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-neutral-400 text-sm">Username:</span>
                    <p className="font-medium text-white">{data.username}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Ranking:</span>
                    <p className="font-medium text-yellow-400">{data.ranking || 'N/A'}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Problems Solved:</span>
                    <p className="font-medium text-white">{data.totalSolved || 0}</p>
                </div>
                <div>
                    <span className="text-neutral-400 text-sm">Acceptance Rate:</span>
                    <p className="font-medium text-white">{data.acceptanceRate || 'N/A'}%</p>
                </div>
            </div>
        </div>
    );

    const renderProfileContent = () => {
        switch (platform.toLowerCase()) {
            case 'codeforces':
                return renderCodeforcesProfile(profileData);
            case 'atcoder':
                return renderAtcoderProfile(profileData);
            case 'codechef':
                return renderCodechefProfile(profileData);
            case 'leetcode':
                return renderLeetcodeProfile(profileData);
            default:
                return <p>Profile data available</p>;
        }
    };

    return (
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
            <div className="flex items-center mb-4">
                <div className={`w-4 h-4 rounded-full ${getPlatformColor(platform)} mr-3`}></div>
                <h3 className="text-lg font-semibold text-white">{platform} Profile</h3>
            </div>
            {renderProfileContent()}
        </div>
    );
};

export default PlatformProfileCard;
