import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BUTTON_CLASSES, MESSAGE_CLASSES } from "../../constants/styles";
import LoadingSpinner from "../common/LoadingSpinner";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    // Verification tokens are single-use, so make sure this only runs once.
    if (started.current) {
      return;
    }
    started.current = true;

    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    const run = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus("success");
        setMessage(
          response?.message ||
            "Email verified successfully. You can now sign in."
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error?.message ||
            "We could not verify your email. The link may be invalid or expired."
        );
      }
    };

    run();
  }, [token, verifyEmail]);

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

        {status === "verifying" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-blue-300">
              <LoadingSpinner size="lg" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
              Verifying your email
            </h1>
            <p className="mt-2 text-sm text-white">
              Just a moment while we confirm your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-400">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
              Email verified
            </h1>
            <div className={`mt-4 text-left ${MESSAGE_CLASSES.success}`}>
              {message}
            </div>
            <Link to="/login" className={`mt-6 inline-block ${BUTTON_CLASSES.primary}`}>
              Continue to sign in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-red-400">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
              Verification failed
            </h1>
            <div className={`mt-4 text-left ${MESSAGE_CLASSES.error}`}>
              {message}
            </div>
            <p className="mt-4 text-sm text-white">
              Verification links expire and can only be used once. You can
              request a new link below.
            </p>
            <Link
              to="/verify-email-sent"
              className={`mt-6 inline-block ${BUTTON_CLASSES.primary}`}
            >
              Request a new verification link
            </Link>
            <p className="mt-4 text-sm text-white">
              Already verified?{" "}
              <Link to="/login" className={BUTTON_CLASSES.link}>
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
