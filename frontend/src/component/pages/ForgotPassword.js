import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { validationRules } from "../../utils/validation";
import {
  CONTAINER_CLASSES,
  MESSAGE_CLASSES,
  BUTTON_CLASSES,
} from "../../constants/styles";
import FormInput from "../common/FormInput";
import LoadingSpinner from "../common/LoadingSpinner";

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

  const LoadingButton = ({ onClick, children, loadingText }) => (
    <button
      type="submit"
      className={`w-full py-2 ${
        isLoading ? BUTTON_CLASSES.primaryDisabled : BUTTON_CLASSES.primary
      }`}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <span className="inline-flex items-center">
          <LoadingSpinner size="sm" className="mr-3" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );

  return (
    <div
      className={
        CONTAINER_CLASSES.page +
        " flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      }
    >
      <div className="max-w-md w-full space-y-8">
        <div className={CONTAINER_CLASSES.card}>
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
            <div className={MESSAGE_CLASSES.success + " mb-4"}>{success}</div>
          )}

          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRequestOtp();
              }}
              className="space-y-4"
            >
              <FormInput
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
              {error && (
                <div className={MESSAGE_CLASSES.errorSmall}>{error}</div>
              )}
              <LoadingButton loadingText="Sending OTP...">
                Send OTP
              </LoadingButton>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className={BUTTON_CLASSES.secondary + " text-sm font-medium"}
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
              <FormInput
                type="text"
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
              />
              {error && (
                <div className={MESSAGE_CLASSES.errorSmall}>{error}</div>
              )}
              <LoadingButton loadingText="Verifying OTP...">
                Verify OTP
              </LoadingButton>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className={BUTTON_CLASSES.secondary + " text-sm font-medium"}
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
              <FormInput
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <FormInput
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              {error && (
                <div className={MESSAGE_CLASSES.errorSmall}>{error}</div>
              )}
              <LoadingButton loadingText="Resetting Password...">
                Reset Password
              </LoadingButton>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className={BUTTON_CLASSES.secondary + " text-sm font-medium"}
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
