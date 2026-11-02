import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api";
import Navbar from "../common/Navbar";
import PasswordInput from "../common/PasswordInput";

const ChangePasswordPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { email } = useParams();
  const profileEmail = email || user?.email || "";

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const isOwnProfile =
    !email ||
    (user?.email ? email.toLowerCase() === user.email.toLowerCase() : false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: "" });
    }
    if (message) setMessage("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validate = (data) => {
    const errors = {};

    if (!data.oldPassword) {
      errors.oldPassword = "Current password is required";
    }

    if (!data.newPassword) {
      errors.newPassword = "New password is required";
    } else if (data.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(passwordData);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setLoading(true);
    setPasswordErrors({});
    setMessage("");

    try {
      const response = await apiService.put("/auth/change-password", {
        email: user?.email,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.status === "success") {
        setMessage("Password changed successfully! Please log in again.");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      } else {
        setMessage(response.message || "Failed to change password");
      }
    } catch (error) {
      setMessage(error.message || "An error occurred. Please try again.");
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
              You cannot change another user's password
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
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
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
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Change password
          </h1>
          <p className="mt-2 text-sm text-white">
            Choose a strong password you don't use anywhere else. You will be
            signed out after changing it.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-sm sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div
                className={`rounded-xl border p-3 text-sm ${
                  message.includes("successfully")
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                {message}
              </div>
            )}

            <PasswordInput
              id="oldPassword"
              name="oldPassword"
              label="Current password"
              value={passwordData.oldPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              error={passwordErrors.oldPassword}
              visible={showPasswords.oldPassword}
              onToggleVisibility={() =>
                togglePasswordVisibility("oldPassword")
              }
              autoComplete="current-password"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PasswordInput
                id="newPassword"
                name="newPassword"
                label="New password"
                value={passwordData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                error={passwordErrors.newPassword}
                visible={showPasswords.newPassword}
                onToggleVisibility={() =>
                  togglePasswordVisibility("newPassword")
                }
                autoComplete="new-password"
              />
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                error={passwordErrors.confirmPassword}
                visible={showPasswords.confirmPassword}
                onToggleVisibility={() =>
                  togglePasswordVisibility("confirmPassword")
                }
                autoComplete="new-password"
              />
            </div>

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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Changing password
                  </>
                ) : (
                  "Change password"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChangePasswordPage;
