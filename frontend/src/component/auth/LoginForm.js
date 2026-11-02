import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { MESSAGE_CLASSES, BUTTON_CLASSES } from "../../constants/styles";
import FormInput from "../common/FormInput";
import LoadingSpinner from "../common/LoadingSpinner";
import PlatformGrid from "../common/PlatformGrid";

const LoginForm = ({ onSwitchToSignup }) => {
  const { login, validateLoginForm } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const loginPayload = {
      email: formData.email,
      password: formData.password,
    };

    const validationErrors = validateLoginForm(loginPayload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await login(loginPayload);
    } catch (error) {
      setErrors({
        general:
          error?.message || "Login failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md lg:mx-0">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-white">
          Sign in to continue tracking your competitive programming journey.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <div className={MESSAGE_CLASSES.error}>{errors.general}</div>
        )}

        <FormInput
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          label="Email address"
          error={errors.email}
          autoComplete="email"
        />

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-white"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`block w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 pr-11 text-sm text-white placeholder-neutral-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.password
                  ? "border-red-500/50 focus:border-red-400"
                  : "border-white/10 focus:border-blue-400/40"
              }`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white transition hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500/40"
          />
          <label
            htmlFor="remember-me"
            className="block text-sm text-white"
          >
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={
            isLoading ? BUTTON_CLASSES.primaryDisabled : BUTTON_CLASSES.primary
          }
        >
          {isLoading ? (
            <span className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>

        <p className="text-center text-sm text-white">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className={BUTTON_CLASSES.link}
          >
            Create one
          </button>
        </p>
      </form>

      <div className="mt-8 border-t border-white/10 pt-6 lg:hidden">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-white">
          Supported platforms
        </p>
        <PlatformGrid />
      </div>
    </div>
  );
};

export default LoginForm;
