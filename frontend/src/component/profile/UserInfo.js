import React from "react";

const UserInfo = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-2xl font-bold">
                {user?.firstName?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              First Name
            </label>
            <p className="text-white py-2">{user?.firstName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Last Name
            </label>
            <p className="text-white py-2">{user?.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Username
            </label>
            <p className="text-white py-2">@{user?.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email
            </label>
            <p className="text-white py-2">{user?.email}</p>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center">
              <div
                className={`mr-2 w-4 h-4 rounded ${
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
