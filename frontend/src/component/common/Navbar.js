import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/userService";

const Navbar = ({ user, onLogout }) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchUsername, setSearchUsername] = React.useState("");
  const [searchLoading, setSearchLoading] = React.useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const isLoggedIn = user !== null;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    if (userDropdownOpen || searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen, searchOpen]);

  const handleLogout = () => {
    onLogout();
    setUserDropdownOpen(false);
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    setSearchUsername("");
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) {
      // For empty search, just redirect to search page
      navigate('/search');
      setSearchOpen(false);
      return;
    }

    setSearchLoading(true);

    try {
      // Check if user exists in our database
      const response = await userService.getUserProfileByUsername(searchUsername.trim());

      if (response && response.status === 'success') {
        // User exists, redirect to their profile
        navigate(`/profile/${encodeURIComponent(searchUsername.trim())}`);
        setSearchOpen(false);
        setSearchUsername("");
      } else {
        // User doesn't exist, redirect to search page with error
        navigate(`/search?username=${encodeURIComponent(searchUsername.trim())}&error=not_found`);
        setSearchOpen(false);
        setSearchUsername("");
      }
    } catch (err) {
      // User doesn't exist or other error occurred
      console.error('User search error:', err);
      navigate(`/search?username=${encodeURIComponent(searchUsername.trim())}&error=not_found`);
      setSearchOpen(false);
      setSearchUsername("");
    } finally {
      setSearchLoading(false);
    }
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
                <div className="relative hidden md:block" ref={searchRef}>
                  <button
                    onClick={handleSearchToggle}
                    className="text-neutral-300 hover:text-white transition duration-200 font-medium flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Search
                  </button>

                  {searchOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 z-50">
                      <form onSubmit={handleSearchSubmit} className="p-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Enter username to search..."
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            className="flex-1 bg-neutral-700 text-white px-3 py-2 rounded-lg border border-neutral-600 focus:outline-none focus:border-blue-500 transition duration-200"
                            autoFocus
                            disabled={searchLoading}
                          />
                          <button
                            type="submit"
                            disabled={searchLoading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
                          >
                            {searchLoading ? (
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate("/contests")}
                  className="hidden md:block text-neutral-300 hover:text-white transition duration-200 font-medium"
                >
                  Contests
                </button>
                <button
                  onClick={() => navigate("/platform-search")}
                  className="hidden md:block text-neutral-300 hover:text-white transition duration-200 font-medium"
                >
                  Platform Search
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
                          navigate(`/profile/${user.username}`);
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
                          navigate("/search");
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        Search
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
                          navigate("/platform-search");
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Platform Search
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
