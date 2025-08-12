import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [userDropdownOpen]);

const handleLogout = () => {
    onLogout();
    setUserDropdownOpen(false);
};

return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                {/* Logo */}
                <div className="flex items-center">
                    <div className="text-white text-xl font-bold flex items-center">
                        <img 
                            src="/images/algoboard_logo.png" 
                            alt="AlgoBoard Logo" 
                            className="w-8 h-8 mr-2"
                        />
                        AlgoBoard
                    </div>
                </div>

                {/* User Section */}
                <div className="flex items-center">
                    {isLoggedIn ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center text-white hover:text-gray-300 transition duration-200"
                            >
                                <span className="mr-2">👤</span>
                                {user.username}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-gray-300 border-b border-gray-700">
                                            <p className="text-sm font-medium">{user.username}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition duration-200"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => navigate('/login')}
                                className="text-gray-300 hover:text-white px-3 py-2 transition duration-200"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => navigate('/signup')}
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
