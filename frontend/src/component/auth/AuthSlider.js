import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const FEATURES = [
  "Track progress across all supported platforms",
  "Compare ratings, ranks, and contest history",
  "Get insights and analytics on your coding journey",
  "Never miss an upcoming contest again",
];

const AuthSlider = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignup = location.pathname === "/signup";

  const switchToLogin = () => navigate("/login", { replace: true });
  const switchToSignup = () => navigate("/signup", { replace: true });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 shadow-2xl backdrop-blur-xl">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="relative hidden overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/95 p-1.5">
                  <img
                    src="/images/algoboard_logo.png"
                    alt="AlgoBoard Logo"
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="text-xl font-semibold tracking-tight text-white">
                  AlgoBoard
                </span>
              </div>

              <div className="mt-14 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Your competitive programming HQ
              </div>

              <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-white">
                One board.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  Every contest.
                </span>
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white">
                Track your competitive programming journey across Codeforces,
                AtCoder, CodeChef, and LeetCode in one place.
              </p>

              <ul className="mt-8 space-y-3">
                {FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-white"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-400">
                      <svg
                        className="h-3 w-3"
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
          </aside>

          <section className="relative bg-neutral-900/40 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-center gap-2.5 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/95 p-1.5">
                <img
                  src="/images/algoboard_logo.png"
                  alt="AlgoBoard Logo"
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-lg font-semibold tracking-tight text-white">
                AlgoBoard
              </span>
            </div>

            <div className="mb-8 flex justify-center">
              <div
                className="relative inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1"
                role="tablist"
                aria-label="Authentication mode"
              >
                <span
                  className={`absolute bottom-1 left-1 top-1 w-28 rounded-full bg-blue-600 shadow-lg shadow-blue-600/25 transition-transform duration-300 ease-in-out ${
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
                    !isSignup
                      ? "text-white"
                      : "text-white hover:text-white"
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
                    isSignup
                      ? "text-white"
                      : "text-white hover:text-white"
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
