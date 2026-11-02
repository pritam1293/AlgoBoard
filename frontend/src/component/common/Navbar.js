import { useNavigate } from "react-router-dom";

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const isLoggedIn = user !== null;

  return (
    <nav className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 rounded-full bg-neutral-800/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate("/home")}
              className="text-white text-xl font-bold flex items-center hover:text-white transition duration-200"
            >
              <img
                src="/images/algoboard_logo.png"
                alt="AlgoBoard Logo"
                className="w-9 h-9 mr-2.5 bg-white rounded-lg p-1"
              />
              AlgoBoard
            </button>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {isLoggedIn && (
              <>
                <button
                  onClick={() => navigate("/contests")}
                  className="hidden md:block text-white hover:text-white transition duration-200 font-medium"
                >
                  Contests
                </button>
                <button
                  onClick={() => navigate("/platform-search")}
                  className="hidden md:block text-white hover:text-white transition duration-200 font-medium"
                >
                  Platform Search
                </button>
                <button
                  onClick={() =>
                    navigate(`/profile/${encodeURIComponent(user.email)}`)
                  }
                  className="flex items-center text-white hover:text-white transition duration-200 font-medium whitespace-nowrap"
                >
                  Profile
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
                      d="M5 12h14M13 6l6 6-6 6"
                    />
                  </svg>
                </button>
              </>
            )}
            {!isLoggedIn && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="text-white hover:text-white px-3 py-2 transition duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition duration-200"
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
