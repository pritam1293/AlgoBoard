import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api";
import Navbar from "../common/Navbar";
import PasswordInput from "../common/PasswordInput";

const DeleteAccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { email } = useParams();
  const profileEmail = email || user?.email || "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isOwnProfile =
    !email ||
    (user?.email ? email.toLowerCase() === user.email.toLowerCase() : false);

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      setMessage("Email is missing. Please re-login.");
      return;
    }

    if (!password.trim()) {
      setMessage("Please enter your password to confirm account deletion.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await apiService.delete("/users/delete", {
        email: user.email,
        password,
      });

      if (response.status === "success") {
        setMessage(
          "Account deleted successfully. Redirecting to signup page..."
        );
        setTimeout(() => {
          logout();
          navigate("/signup");
        }, 2000);
      } else {
        setMessage(response.message || "Failed to delete account");
      }
    } catch (error) {
      setMessage(
        error.message || "An error occurred while deleting the account."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOwnProfile) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-neutral-950">
        <Navbar user={user} onLogout={logout} />
        <main className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h1 className="text-lg font-semibold text-red-200">
              You cannot delete another user's account
            </h1>
            <button
              onClick={() =>
                navigate(`/profile/${encodeURIComponent(profileEmail)}`)
              }
              className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
            >
              Back to profile
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-red-600/15 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <Navbar user={user} onLogout={logout} />

      <main className="relative mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <button
          onClick={() =>
            navigate(`/profile/${encodeURIComponent(profileEmail)}`)
          }
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-white transition-colors hover:text-white"
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
          Back to profile
        </button>

        <div className="mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-red-400">
            Danger zone
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Delete account
          </h1>
          <p className="mt-2 text-sm text-white">
            This permanently removes your AlgoBoard account and all connected
            platform data. This action cannot be undone.
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 backdrop-blur-sm sm:p-6">
          {message && (
            <div
              className={`mb-5 rounded-xl border p-3 text-sm ${
                message.includes("successfully")
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/20 bg-red-500/10 text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h2 className="text-sm font-semibold text-red-200">
              Are you absolutely sure?
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-red-300/80">
              This will permanently delete{" "}
              <strong className="break-all">{user?.email}</strong> and remove
              all your data from our servers.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-red-300/70">
              <li>
                • All your competitive programming profiles and statistics will
                be lost
              </li>
              <li>• Your account settings and preferences will be deleted</li>
              <li>• You will not be able to recover this data</li>
            </ul>
          </div>

          <form onSubmit={handleDelete} className="mt-5 space-y-4">
            <PasswordInput
              id="deletePassword"
              name="deletePassword"
              label="Confirm your password to delete account"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (message) setMessage("");
              }}
              placeholder="Enter your password"
              visible={showPassword}
              onToggleVisibility={() => setShowPassword(!showPassword)}
              autoComplete="current-password"
            />

            <div className="flex flex-col-reverse gap-2 border-t border-white/5 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(`/profile/${encodeURIComponent(profileEmail)}`)
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Deleting account
                  </>
                ) : (
                  <>
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete my account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default DeleteAccountPage;
