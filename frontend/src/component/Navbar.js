import React from 'react';

const Navbar = () => {
const [isOpen, setIsOpen] = React.useState(false);
const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

// Mock user state - you'll replace this with real auth later
const [user, setUser] = React.useState(null);
const isLoggedIn = user !== null;

// Mock login/logout functions
const handleLogin = () => {
    setUser({
        username: "pritam1293",
        codeforcesRating: 1200,
        atcoderRating: 800,
        codechefRating: 1400
    });
};

const handleLogout = () => {
    setUser(null);
    setUserDropdownOpen(false);
};

return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                {/* Logo */}
                <div className="flex items-center">
                    <div className="text-white text-xl font-bold flex items-center">
                        <span className="text-blue-400 mr-2">⚡</span>
                        AlgoBoard
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-6">
                    <a href="#dashboard" className="text-gray-300 hover:text-white px-3 py-2 transition duration-300 flex items-center">
                        <span className="mr-2">📊</span>Dashboard
                    </a>
                    <a href="#profile" className="text-gray-300 hover:text-white px-3 py-2 transition duration-300 flex items-center">
                        <span className="mr-2">👤</span>Profile
                    </a>
                    <a href="#compare" className="text-gray-300 hover:text-white px-3 py-2 transition duration-300 flex items-center">
                        <span className="mr-2">📈</span>Compare
                    </a>
                    <a href="#leaderboard" className="text-gray-300 hover:text-white px-3 py-2 transition duration-300 flex items-center">
                        <span className="mr-2">🏆</span>Leaderboard
                    </a>
                </div>

                {/* Platform Quick Links */}
                <div className="hidden lg:flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-1">
                        <span className="text-gray-400 text-sm">Quick:</span>
                        <a 
                            href="https://codeforces.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm font-bold"
                        >
                            CF
                        </a>
                        <a 
                            href="https://atcoder.jp" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 text-sm font-bold"
                        >
                            AC
                        </a>
                        <a 
                            href="https://codechef.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-yellow-400 hover:text-yellow-300 text-sm font-bold"
                        >
                            CC
                        </a>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="hidden md:flex items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                </div>

                {/* User Section */}
                <div className="hidden md:flex items-center space-x-4">
                    {isLoggedIn ? (
                        <>
                            {/* Platform Ratings */}
                            <div className="flex items-center space-x-3 bg-gray-800 rounded-lg px-3 py-1">
                                <div className="text-center">
                                    <div className="text-xs text-gray-400">CF</div>
                                    <div className="text-sm text-blue-400 font-bold">
                                        {user.codeforcesRating}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-gray-400">AC</div>
                                    <div className="text-sm text-orange-400 font-bold">
                                        {user.atcoderRating}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-gray-400">CC</div>
                                    <div className="text-sm text-yellow-400 font-bold">
                                        {user.codechefRating}
                                    </div>
                                </div>
                            </div>

                            {/* Sync Button */}
                            <button 
                                className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition duration-200"
                                title="Sync platform data"
                            >
                                🔄
                            </button>

                            {/* User Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center space-x-2 text-white hover:text-gray-300 transition duration-200"
                                >
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden lg:block">{user.username}</span>
                                    <span className="text-xs">▼</span>
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                                        <a href="#profile" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200">
                                            👤 My Profile
                                        </a>
                                        <a href="#settings" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200">
                                            ⚙️ Settings
                                        </a>
                                        <a href="#connect" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200">
                                            🔗 Connect Accounts
                                        </a>
                                        <hr className="my-2 border-gray-700" />
                                        <button 
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition duration-200"
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={handleLogin}
                                className="text-gray-300 hover:text-white px-3 py-2 transition duration-200"
                            >
                                Login
                            </button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#dashboard" className="text-gray-300 hover:text-white block px-3 py-2 transition duration-300">
                            📊 Dashboard
                        </a>
                        <a href="#profile" className="text-gray-300 hover:text-white block px-3 py-2 transition duration-300">
                            👤 Profile
                        </a>
                        <a href="#compare" className="text-gray-300 hover:text-white block px-3 py-2 transition duration-300">
                            📈 Compare
                        </a>
                        <a href="#leaderboard" className="text-gray-300 hover:text-white block px-3 py-2 transition duration-300">
                            🏆 Leaderboard
                        </a>
                        
                        {/* Mobile Platform Links */}
                        <div className="border-t border-gray-700 pt-3 mt-3">
                            <div className="text-gray-400 text-sm px-3 mb-2">Quick Links:</div>
                            <div className="flex space-x-4 px-3">
                                <a href="https://codeforces.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                    Codeforces
                                </a>
                                <a href="https://atcoder.jp" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                                    AtCoder
                                </a>
                                <a href="https://codechef.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300">
                                    CodeChef
                                </a>
                            </div>
                        </div>

                        {/* Mobile Auth Section */}
                        <div className="border-t border-gray-700 pt-3 mt-3">
                            {isLoggedIn ? (
                                <div className="px-3">
                                    <div className="text-white font-medium mb-2">Welcome, {user.username}!</div>
                                    <div className="flex justify-between text-sm mb-3">
                                        <span className="text-blue-400">CF: {user.codeforcesRating}</span>
                                        <span className="text-orange-400">AC: {user.atcoderRating}</span>
                                        <span className="text-yellow-400">CC: {user.codechefRating}</span>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="px-3 space-y-2">
                                    <button 
                                        onClick={handleLogin}
                                        className="w-full text-gray-300 hover:text-white border border-gray-600 px-4 py-2 rounded-lg transition duration-200"
                                    >
                                        Login
                                    </button>
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </nav>
);
};

export default Navbar;
