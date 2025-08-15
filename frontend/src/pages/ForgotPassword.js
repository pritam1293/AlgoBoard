import React, { useState } from "react";

const ForgotPassword = () => {
  const [step] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success] = useState("");
  const [isLoading] = useState(false);

  // Real API calls
  // TODO: Move forgot password logic to an existing service (e.g., authService) and update these handlers.
  // Placeholder handlers to prevent runtime errors until integration is complete.
  const handleRequestOtp = async () => {
    setError("Forgot password service not implemented.");
  };
  const handleVerifyOtp = async () => {
    setError("Forgot password service not implemented.");
  };
  const handleResetPassword = async () => {
    setError("Forgot password service not implemented.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="bg-neutral-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Forgot Password
        </h2>
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRequestOtp();
            }}
            className="space-y-4"
          >
            <label className="block text-neutral-300">Email Address</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded bg-neutral-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOtp();
            }}
            className="space-y-4"
          >
            <label className="block text-neutral-300">
              Enter OTP sent to your email
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded bg-neutral-700 text-white"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
        {step === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleResetPassword();
            }}
            className="space-y-4"
          >
            <label className="block text-neutral-300">Email Address</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded bg-neutral-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
            />
            <label className="block text-neutral-300">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-neutral-700 text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label className="block text-neutral-300">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-neutral-700 text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
