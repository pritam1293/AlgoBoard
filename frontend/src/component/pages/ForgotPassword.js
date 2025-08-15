import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { validationRules } from "../../utils/validation";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle email submission and OTP request
  const handleRequestOtp = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email.trim()) {
      setError("Email address is required");
      setIsLoading(false);
      return;
    }

    const emailError = validationRules.email(email);
    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }

    try {
      await authService.requestPasswordReset(email);
      setSuccess("OTP has been sent to your email");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!otp.trim()) {
      setError("OTP is required");
      setIsLoading(false);
      return;
    }

    try {
      await authService.verifyOtp(email, otp);
      setSuccess("OTP verified successfully");
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Both password fields are required");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const passwordError = validationRules.password(newPassword);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      await authService.resetPassword(email, newPassword, otp);
      setSuccess("Password has been reset successfully");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center mb-4">
              <img
                src="/images/algoboard_logo.png"
                alt="AlgoBoard Logo"
                className="w-12 h-12 mr-3 bg-white rounded-lg p-2"
              />
              <h1 className="text-3xl font-bold text-white">AlgoBoard</h1>
            </div>
            <h2 className="text-xl text-gray-300">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "Reset Password"}
            </h2>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-600 text-white rounded text-sm">
              {success}
            </div>
          )}

          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRequestOtp();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-neutral-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-blue-500 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-400 hover:text-blue-500 text-sm font-medium"
                >
                  Back to Login
                </button>
              </div>
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
              <div>
                <label className="block text-neutral-300 mb-1">Enter OTP</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-blue-500 focus:outline-none"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying OTP...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-400 hover:text-blue-500 text-sm font-medium"
                >
                  Back to Login
                </button>
              </div>
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
              <div>
                <label className="block text-neutral-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-blue-500 focus:outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-blue-500 focus:outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-400 hover:text-blue-500 text-sm font-medium"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
