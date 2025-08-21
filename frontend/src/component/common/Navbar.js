import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isLoggedIn = user !== null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleLogout = () => {
    onLogout();
    setUserDropdownOpen(false);
  };

  return (
    <nav className="bg-neutral-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate("/home")}
              className="text-white text-xl font-bold flex items-center hover:text-gray-300 transition duration-200"
            >
              <img
                src="/images/algoboard_logo.png"
                alt="AlgoBoard Logo"
                className="w-10 h-10 mr-3 bg-white rounded-lg p-1"
              />
              AlgoBoard
            </button>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <>
                <button
                  onClick={() => navigate("/cp-statistics")}
                  className="hidden md:block text-neutral-300 hover:text-white transition duration-200 font-medium"
                >
                  CP Statistics
                </button>
                <button
                  onClick={() => navigate("/contests")}
                  className="hidden md:block text-neutral-300 hover:text-white transition duration-200 font-medium"
                >
                  Contests
                </button>
              </>
            )}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center text-white hover:text-gray-300 transition duration-200"
                >
                  <span className="mr-2">👤</span>
                  {user.username}
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-neutral-300 border-b border-neutral-700">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-neutral-400">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-700 transition duration-200 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate("/cp-statistics");
                          setUserDropdownOpen(false);
                        }}
                        className="md:hidden w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-700 transition duration-200 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        CP Statistics
                      </button>
                      <button
                        onClick={() => {
                          navigate("/contests");
                          setUserDropdownOpen(false);
                        }}
                        className="md:hidden w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-700 transition duration-200 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Contests
                      </button>
                      <button
                        onClick={() => {
                          navigate("/account-settings");
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-700 transition duration-200 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Account Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-neutral-300 hover:bg-neutral-700 transition duration-200 flex items-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-300 hover:text-white px-3 py-2 transition duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
