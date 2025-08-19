import React from "react";

const UserInfo = ({ user }) => {
  return (
    <div className="w-full mb-6">
      <div className="bg-neutral-800 rounded-lg p-4 sm:p-6 border border-neutral-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-white text-lg sm:text-2xl font-bold">
                {user?.firstName?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              First Name
            </label>
            <p className="text-white py-2 break-words">{user?.firstName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Last Name
            </label>
            <p className="text-white py-2 break-words">{user?.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Username
            </label>
            <p className="text-white py-2 break-all">@{user?.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email
            </label>
            <p className="text-white py-2 break-all">{user?.email}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center">
              <div
                className={`mr-2 w-4 h-4 rounded flex-shrink-0 ${
                  user?.student ? "bg-blue-600" : "bg-neutral-600"
                }`}
              >
                {user?.student && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-neutral-300">
                STUDENT
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
