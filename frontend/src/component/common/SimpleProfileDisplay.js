import React from 'react';

const SimpleProfileDisplay = ({ platform, profileData }) => {
    const getPlatformColor = (platformName) => {
        const colors = {
            codeforces: 'text-blue-400',
            atcoder: 'text-green-400',
            codechef: 'text-orange-400',
            leetcode: 'text-yellow-400',
        };
        return colors[platformName.toLowerCase()] || 'text-white';
    };

    const renderCodeforcesProfile = (data) => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Basic Information</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-white">Handle:</span>
                            <span className="text-white font-medium">{data.handle}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white">Rank:</span>
                            <span className="text-white font-medium">{data.rank || 'Unranked'}</span>
                        </div>
                        {data.firstName && (
                            <div className="flex justify-between">
                                <span className="text-white">Name:</span>
                                <span className="text-white font-medium">{`${data.firstName} ${data.lastName || ''}`.trim()}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-neutral-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Rating Information</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-white">Current Rating:</span>
                            <span className="text-blue-400 font-medium">{data.rating || 'Unrated'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white">Max Rating:</span>
                            <span className="text-blue-400 font-medium">{data.maxRating || 'N/A'}</span>
                        </div>
                        {data.contribution !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-white">Contribution:</span>
                                <span className="text-white font-medium">{data.contribution}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {data.titlePhoto && (
                <div className="text-center">
                    <img src={data.titlePhoto} alt="Profile" className="w-20 h-20 rounded-full mx-auto border-2 border-neutral-600" />
                </div>
            )}
        </div>
    );

    const renderAtcoderProfile = (data) => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Basic Information</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-white">Username:</span>
                            <span className="text-white font-medium">{data.username}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white">Rank:</span>
                            <span className="text-white font-medium">{data.rank || 'Unranked'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Rating Information</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-white">Current Rating:</span>
                            <span className="text-green-400 font-medium">{data.rating || 'Unrated'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white">Highest Rating:</span>
                            <span className="text-green-400 font-medium">{data.highestRating || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCodechefProfile = (data) => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Basic Information</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-white">Username:</span>
                            <span className="text-white font-medium">{data.username}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white">Stars:</span>
                            <span className="text-white font-medium">{data.stars || 0} ⭐</span>
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Rating Information</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-white">Current Rating:</span>
                            <span className="text-orange-400 font-medium">{data.currentRating || 'Unrated'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white">Highest Rating:</span>
                            <span className="text-orange-400 font-medium">{data.highestRating || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLeetcodeProfile = (data) => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Basic Information</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-white">Username:</span>
                            <span className="text-white font-medium">{data.username}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white">Ranking:</span>
                            <span className="text-yellow-400 font-medium">{data.ranking || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Problem Statistics</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-white">Problems Solved:</span>
                            <span className="text-white font-medium">{data.totalSolved || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white">Acceptance Rate:</span>
                            <span className="text-white font-medium">{data.acceptanceRate || 'N/A'}%</span>
                        </div>
                    </div>
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
                return (
                    <div className="bg-neutral-700 rounded-lg p-4">
                        <p className="text-white">Profile data available for {platform}</p>
                        <pre className="text-white text-sm mt-2 overflow-auto">
                            {JSON.stringify(profileData, null, 2)}
                        </pre>
                    </div>
                );
        }
    };

    return (
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
            <div className="flex items-center mb-6">
                <div className={`w-4 h-4 rounded-full ${getPlatformColor(platform)} mr-3`}>
                    <div className="w-full h-full rounded-full bg-current"></div>
                </div>
                <h3 className={`text-xl font-semibold ${getPlatformColor(platform)}`}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)} Profile
                </h3>
            </div>
            {renderProfileContent()}
        </div>
    );
};

export default SimpleProfileDisplay;
