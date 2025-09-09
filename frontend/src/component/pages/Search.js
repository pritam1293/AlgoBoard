import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import userService from '../../services/userService';

const Search = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchUsername, setSearchUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Use ref to avoid dependency issues in useCallback
    const searchUsernameRef = useRef(searchUsername);
    searchUsernameRef.current = searchUsername;

    // Handle search functionality - validate user exists before redirecting
    const handleSearch = useCallback(async (username) => {
        // If no username provided, use current searchUsername from ref
        const usernameToSearch = username || searchUsernameRef.current;

        if (!usernameToSearch.trim()) {
            setError('Please enter a username to search');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Check if user exists in our database
            const response = await userService.getUserProfileByUsername(usernameToSearch.trim());

            if (response && response.status === 'success') {
                // User exists, redirect to their profile
                navigate(`/profile/${usernameToSearch.trim()}`);
            } else {
                // This shouldn't happen if API is working correctly, but handle it
                setError('Profile not found. Please enter a correct username.');
            }
        } catch (err) {
            // User doesn't exist or other error occurred
            console.error('User search error:', err);
            setError('Profile not found. Please enter a correct username.');
        } finally {
            setLoading(false);
        }
    }, [navigate]); // No searchUsername dependency needed due to ref

    // Handle URL parameters (when navigated from other parts of the app)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const usernameParam = params.get('username');
        const errorParam = params.get('error');

        if (usernameParam) {
            setSearchUsername(usernameParam);

            // If there's an error parameter (from navbar search), show the error directly
            if (errorParam === 'not_found') {
                setError('Profile not found. Please enter a correct username.');
            } else {
                // Otherwise, perform the search normally - pass username directly
                const searchUser = async () => {
                    setLoading(true);
                    setError('');

                    try {
                        const response = await userService.getUserProfileByUsername(usernameParam.trim());

                        if (response && response.status === 'success') {
                            navigate(`/profile/${usernameParam.trim()}`);
                        } else {
                            setError('Profile not found. Please enter a correct username.');
                        }
                    } catch (err) {
                        console.error('User search error:', err);
                        setError('Profile not found. Please enter a correct username.');
                    } finally {
                        setLoading(false);
                    }
                };
                searchUser();
            }
        }
    }, [location.search, navigate]); // Only depends on location.search and navigate

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <div className="min-h-screen bg-neutral-900">
            <Navbar user={user} onLogout={logout} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">User Search</h1>
                    <p className="text-neutral-300 text-lg">
                        Search for any user to view their profile and competitive programming statistics
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-neutral-800 rounded-lg p-6 mb-8 border border-neutral-700 max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Enter username to search..."
                                value={searchUsername}
                                onChange={(e) => {
                                    setSearchUsername(e.target.value);
                                    if (error) setError(''); // Clear error when user types
                                }}
                                className="w-full bg-neutral-700 text-white px-4 py-3 rounded-lg border border-neutral-600 focus:outline-none focus:border-blue-500 transition duration-200"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition duration-200 flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span>Search</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg p-4 flex items-start space-x-3">
                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div>
                                <p className="font-medium">{error}</p>
                                <p className="text-sm text-red-300 mt-1">
                                    Make sure the username is spelled correctly and the user has an account on AlgoBoard.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-neutral-800 rounded-lg p-6 text-center border border-neutral-700 max-w-2xl mx-auto">
                    <svg className="w-16 h-16 text-neutral-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-xl text-neutral-300 mb-2">Search for Users</h3>
                    <p className="text-neutral-500">
                        Enter a username above to view their profile and competitive programming statistics across all platforms.
                    </p>
                </div>
            </div>

            {/* Bottom spacing */}
            <div className="h-16"></div>
        </div>
    );
};

export default Search;