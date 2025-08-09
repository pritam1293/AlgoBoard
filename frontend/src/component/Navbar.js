import React from 'react';

const Navbar = () => {
const [isOpen, setIsOpen] = React.useState(false);

return (
    <nav className="bg-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                {/* Logo */}
                <div className="flex items-center">
                    <h1 className="text-white text-xl font-bold">AlgoBoard</h1>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#home" className="text-gray-300 hover:text-white px-3 py-2 transition duration-300">
                        Home
                    </a>
                    <a href="#about" className="text-gray-300 hover:text-white px-3 py-2 transition duration-300">
                        About
                    </a>
                    <a href="#contact" className="text-gray-300 hover:text-white px-3 py-2 transition duration-300">
                        Contact
                    </a>
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
                        <a href="#home" className="text-gray-300 hover:text-white block px-3 py-2 transition duration-300">
                            Home
                        </a>
                        <a href="#about" className="text-gray-300 hover:text-white block px-3 py-2 transition duration-300">
                            About
                        </a>
                        <a href="#contact" className="text-gray-300 hover:text-white block px-3 py-2 transition duration-300">
                            Contact
                        </a>
                    </div>
                </div>
            )}
        </div>
    </nav>
);
};

export default Navbar;
