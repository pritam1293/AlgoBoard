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
    <div className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${className}`}>
      {PLATFORMS.map((platform) => (
        <a
          key={platform.id}
          href={platformUrls[platform.id]}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-white/20 hover:bg-white/[0.06]"
        >
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/95 p-1.5">
            <img
              src={platform.logo}
              alt={platform.name}
              className={`h-full w-full object-contain ${
                platform.id === "codechef" ? "rounded" : ""
              }`}
            />
          </span>
          {showLabels && (
            <span className="truncate text-xs font-medium text-white transition group-hover:text-white">
              {platform.name}
            </span>
          )}
        </a>
      ))}
    </div>
  );
};

export default PlatformGrid;
