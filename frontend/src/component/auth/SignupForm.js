import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPasswordStrength } from "../../utils/validation";
import {
  BUTTON_CLASSES,
  MESSAGE_CLASSES,
} from "../../constants/styles";
import FormInput from "../common/FormInput";
import LoadingSpinner from "../common/LoadingSpinner";

const SignupForm = ({ onSwitchToLogin }) => {
  const { signup, validateSignupForm } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(
    getPasswordStrength("")
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    const updatedFormData = {
      ...formData,
      [e.target.name]: value,
    };

    setFormData(updatedFormData);

    if (e.target.name === "password") {
      setPasswordStrength(getPasswordStrength(value));
    }

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

    const validationErrors = validateSignupForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      setErrors({});
      navigate(
        `/verify-email-sent?email=${encodeURIComponent(formData.email.trim())}`,
        { replace: true }
      );
    } catch (error) {
      setErrors({
        general: error.message || "Signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrengthClass =
    passwordStrength.strength === "weak"
      ? "text-red-400"
      : passwordStrength.strength === "medium"
        ? "text-yellow-400"
        : passwordStrength.strength === "good"
          ? "text-blue-400"
          : "text-green-400";

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Create your account</h2>
        <p className="mt-2 text-sm text-white">
          Join AlgoBoard and bring all your coding profiles together.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {errors.general && (
          <div className={MESSAGE_CLASSES.error}>{errors.general}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            id="firstName"
            name="firstName"
            type="text"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name"
            error={errors.firstName}
            autoComplete="given-name"
          />
          <FormInput
            id="lastName"
            name="lastName"
            type="text"
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last name"
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          error={errors.email}
          autoComplete="email"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white mb-2"
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
                placeholder="Enter password"
                title="Password must contain: 8-15 characters, one uppercase (A-Z), one lowercase (a-z), one number (0-9), and one special character (!@#$%^&*)"
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
            {formData.password && (
              <div className="mt-2 flex items-center gap-1">
                <span className="text-xs text-white">Strength:</span>
                <span
                  className={`text-xs font-medium ${passwordStrengthClass}`}
                >
                  {passwordStrength.strength}
                </span>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-white mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className={`block w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 pr-11 text-sm text-white placeholder-neutral-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.confirmPassword
                    ? "border-red-500/50 focus:border-red-400"
                    : "border-white/10 focus:border-blue-400/40"
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white transition hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500/40"
            required
          />
          <label
            htmlFor="terms"
            className="ml-2 block text-sm text-white"
          >
            I agree to the{" "}
            <button
              type="button"
              className="font-medium text-blue-400 underline underline-offset-2 transition hover:text-blue-300"
              onClick={() => window.open("/terms", "_blank")}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="font-medium text-blue-400 underline underline-offset-2 transition hover:text-blue-300"
              onClick={() => window.open("/privacy", "_blank")}
            >
              Privacy Policy
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 ${
            isLoading
              ? BUTTON_CLASSES.primaryDisabled
              : BUTTON_CLASSES.primary
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" className="mr-2" />
              Creating account...
            </div>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-center text-sm text-white">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={BUTTON_CLASSES.link}
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
