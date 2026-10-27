import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import PlatformGrid from "../common/PlatformGrid";

const AuthSlider = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignup = location.pathname === "/signup";

  const switchToLogin = () => navigate("/login", { replace: true });
  const switchToSignup = () => navigate("/signup", { replace: true });

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-800 shadow-2xl">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-neutral-900 to-neutral-900 p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/images/algoboard_logo.png"
                  alt="AlgoBoard Logo"
                  className="h-12 w-12 rounded-lg bg-white p-2"
                />
                <span className="text-2xl font-bold text-white">AlgoBoard</span>
              </div>

              <h1 className="mt-12 text-3xl font-bold leading-tight text-white">
                One board.
                <br />
                Every contest.
              </h1>
              <p className="mt-4 text-sm leading-6 text-neutral-300">
                Track your competitive programming journey across Codeforces,
                AtCoder, CodeChef and LeetCode in one place.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  "Track progress across all supported platforms",
                  "Compare your performance with friends",
                  "Get insights and analytics on your coding journey",
                  "Never miss a contest with notifications",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-neutral-200"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-green-500/15 text-green-400">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 border-t border-white/10 pt-6">
              <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-neutral-400">
                Supported Platforms
              </p>
              <PlatformGrid />
            </div>
          </aside>

          <section className="relative bg-neutral-800 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
              <img
                src="/images/algoboard_logo.png"
                alt="AlgoBoard Logo"
                className="h-9 w-9 rounded-lg bg-white p-1.5"
              />
              <span className="text-xl font-bold text-white">AlgoBoard</span>
            </div>

            <div className="mb-8 flex justify-center">
              <div
                className="relative inline-flex rounded-full border border-neutral-700 bg-neutral-900 p-1"
                role="tablist"
                aria-label="Authentication mode"
              >
                <span
                  className={`absolute bottom-1 left-1 top-1 w-28 rounded-full bg-blue-600 transition-transform duration-300 ease-in-out ${
                    isSignup ? "translate-x-28" : "translate-x-0"
                  }`}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isSignup}
                  onClick={switchToLogin}
                  className={`relative z-10 w-28 rounded-full py-2 text-sm font-medium transition-colors duration-200 ${
                    !isSignup ? "text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSignup}
                  onClick={switchToSignup}
                  className={`relative z-10 w-28 rounded-full py-2 text-sm font-medium transition-colors duration-200 ${
                    isSignup ? "text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className={`flex w-[200%] transition-transform duration-500 ease-in-out ${
                  isSignup ? "-translate-x-1/2" : "translate-x-0"
                }`}
              >
                <div
                  className="flex w-1/2 flex-none items-center px-1 pr-4 sm:pr-6"
                  inert={isSignup ? true : undefined}
                  aria-hidden={isSignup}
                >
                  <LoginForm onSwitchToSignup={switchToSignup} />
                </div>
                <div
                  className="w-1/2 flex-none px-1 pl-4 sm:pl-6"
                  inert={!isSignup ? true : undefined}
                  aria-hidden={!isSignup}
                >
                  <SignupForm onSwitchToLogin={switchToLogin} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthSlider;
