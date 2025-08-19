import React from "react";
import { PLATFORMS } from "../../config/platformsConfig";

const PlatformGrid = ({ showLabels = true, className = "" }) => {
  const platformUrls = {
    codeforces: "https://codeforces.com",
    atcoder: "https://atcoder.jp",
    codechef: "https://www.codechef.com",
    leetcode: "https://leetcode.com",
  };

  return (
    <div className={`flex justify-center space-x-4 ${className}`}>
      {PLATFORMS.map((platform) => (
        <div key={platform.id} className="text-center group">
          <a
            href={platformUrls[platform.id]}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-200 cursor-pointer">
              <img
                src={platform.logo}
                alt={platform.name}
                className={`w-8 h-8 object-contain ${
                  platform.id === "codechef" ? "rounded" : ""
                }`}
              />
            </div>
            {showLabels && (
              <div className="text-xs text-neutral-400 group-hover:text-white transition duration-200">
                {platform.name}
              </div>
            )}
          </a>
        </div>
      ))}
    </div>
  );
};

export default PlatformGrid;
