import React from "react";

const BackButton = ({ onBack, label = "Back to Home" }) => {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center text-neutral-400 hover:text-white transition duration-200"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {label}
      </button>
    </div>
  );
};

export default BackButton;
