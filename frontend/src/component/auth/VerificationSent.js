import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BUTTON_CLASSES, MESSAGE_CLASSES } from "../../constants/styles";
import FormInput from "../common/FormInput";
import LoadingSpinner from "../common/LoadingSpinner";

const RESEND_COOLDOWN_SECONDS = 60;

const formatCountdown = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const VerificationSent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resendVerification } = useAuth();

  const initialEmail = (searchParams.get("email") || "").trim();
  const [email, setEmail] = useState(initialEmail);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [countdown, setCountdown] = useState(
    initialEmail ? RESEND_COOLDOWN_SECONDS : 0
  );
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [inputError, setInputError] = useState("");

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const target = (email || emailInput).trim();

    if (!target) {
      setInputError("Enter the email address you signed up with.");
      return;
    }

    setInputError("");
    setFeedback({ type: "", text: "" });
    setIsSending(true);

    try {
      const response = await resendVerification(target);
      setEmail(target);
      setEmailInput(target);
      setCountdown(RESEND_COOLDOWN_SECONDS);
      navigate(
        `/verify-email-sent?email=${encodeURIComponent(target)}`,
        { replace: true }
      );
      setFeedback({
        type: "success",
        text:
          response?.message ||
          `A new verification link has been sent to ${target}.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error?.message || "Could not send the verification email.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const resendDisabled = isSending || countdown > 0;
  const resendLabel = isSending
    ? "Sending..."
    : countdown > 0
      ? `Resend email in ${formatCountdown(countdown)}`
      : email
        ? "Resend verification email"
        : "Send verification email";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/95 p-1.5">
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

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-blue-300">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          {email ? "Check your email" : "Request a verification link"}
        </h1>

        {email ? (
          <p className="mt-3 text-sm text-white">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-blue-300">{email}</span>. Click
            the link in the email to verify your account.
          </p>
        ) : (
          <p className="mt-3 text-sm text-white">
            Enter the email address you signed up with and we&apos;ll send you a
            new verification link.
          </p>
        )}

        {feedback.text && (
          <div className={`mt-4 text-left ${feedback.type === "success" ? MESSAGE_CLASSES.success : MESSAGE_CLASSES.error}`}>
            {feedback.text}
          </div>
        )}

        <form className="mt-6 space-y-4 text-left" onSubmit={handleSubmit} noValidate>
          {!email && (
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={emailInput}
              onChange={(event) => {
                setEmailInput(event.target.value);
                if (inputError) {
                  setInputError("");
                }
              }}
              placeholder="Enter your email"
              error={inputError}
              autoComplete="email"
            />
          )}

          <div>
            <p className="text-sm text-white">
              {email
                ? "Didn't get the email? Check your spam or junk folder, then request another one."
                : "Didn't receive the email? You can request a new link below."}
            </p>
            <button
              type="submit"
              disabled={resendDisabled}
              className={`mt-3 ${resendDisabled ? BUTTON_CLASSES.primaryDisabled : BUTTON_CLASSES.primary}`}
            >
              {isSending ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </span>
              ) : (
                resendLabel
              )}
            </button>
            {email && (
              <button
                type="button"
                onClick={() => {
                  setEmail("");
                  setCountdown(0);
                  setFeedback({ type: "", text: "" });
                  navigate("/verify-email-sent", { replace: true });
                }}
                className={`mt-3 ${BUTTON_CLASSES.link}`}
              >
                Use a different email address
              </button>
            )}
          </div>
        </form>

        <p className="mt-6 text-sm text-white">
          Already verified?{" "}
          <Link to="/login" className={BUTTON_CLASSES.link}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerificationSent;
