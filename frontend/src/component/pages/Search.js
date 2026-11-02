import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../common/Navbar";
import userService from "../../services/userService";

const Search = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchEmailRef = useRef(searchEmail);
  searchEmailRef.current = searchEmail;

  const handleSearch = useCallback(
    async (email) => {
      const emailToSearch = email || searchEmailRef.current;

      if (!emailToSearch.trim()) {
        setError("Please enter an email to search");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await userService.getUserProfileByEmail(
          emailToSearch.trim()
        );

        if (response && response.status === "success") {
          navigate(`/profile/${encodeURIComponent(emailToSearch.trim())}`);
        } else {
          setError("Profile not found. Please enter a correct email.");
        }
      } catch (err) {
        console.error("User search error:", err);
        setError("Profile not found. Please enter a correct email.");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    const errorParam = params.get("error");

    if (emailParam) {
      setSearchEmail(emailParam);

      if (errorParam === "not_found") {
        setError("Profile not found. Please enter a correct email.");
      } else {
        const searchUser = async () => {
          setLoading(true);
          setError("");

          try {
            const response = await userService.getUserProfileByEmail(
              emailParam.trim()
            );

            if (response && response.status === "success") {
              navigate(`/profile/${encodeURIComponent(emailParam.trim())}`);
            } else {
              setError("Profile not found. Please enter a correct email.");
            }
          } catch (err) {
            console.error("User search error:", err);
            setError("Profile not found. Please enter a correct email.");
          } finally {
            setLoading(false);
          }
        };
        searchUser();
      }
    }
  }, [location.search, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <Navbar user={user} onLogout={logout} />

      <main className="relative mx-auto max-w-3xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <button
            onClick={() => navigate("/home")}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-white transition-colors hover:text-white"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to dashboard
          </button>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            User search
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white">
            Look up any AlgoBoard member by email to view their profile and
            competitive programming statistics.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white">
                <svg
                  className="h-4 w-4"
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
              </span>
              <input
                type="text"
                placeholder="Enter email to search"
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value);
                  if (error) setError("");
                }}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-neutral-300 transition focus:border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Searching
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
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
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <svg
                className="mt-0.5 h-5 w-5 flex-none text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.348 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-200">{error}</p>
                <p className="mt-1 text-xs text-red-300/70">
                  Make sure the email is spelled correctly and the user has an
                  AlgoBoard account.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-white">
            Search the community
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-white">
            Enter an email above to explore a member's rating progression,
            contest history, and platform coverage.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Search;
