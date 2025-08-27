import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api";
import Navbar from "../common/Navbar";

const AccountSettings = () => {
  const {
    user,
    logout,
    updateProfile,
    validateProfileForm,
    profileLoading,
    profileMessage,
    clearProfileMessage,
  } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    student: user?.student || false,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Delete user state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const handleInputChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: "" });
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.username) {
      setValidationErrors({
        username: "Username is missing. Please re-login.",
      });
      return;
    }
    const errors = validateProfileForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    const result = await updateProfile({
      ...formData,
      username: user.username,
    });
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      student: user?.student || false,
    });
    setValidationErrors({});
    setIsEditing(false);
    clearProfileMessage();
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: "" });
    }
  };

  const validatePasswordForm = (data) => {
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

  const handleChangePassword = async () => {
    const errors = validatePasswordForm(passwordData);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);
    setPasswordErrors({});
    setPasswordMessage("");

    try {
      const response = await apiService.put("/auth/change-password", {
        username: user?.username,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.status === "success") {
        setPasswordMessage("Password changed successfully!");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Hide form after successful change
        setTimeout(() => {
          setShowPasswordForm(false);
          setPasswordMessage("");
        }, 2000);
      } else {
        setPasswordMessage(response.message || "Failed to change password");
      }
    } catch (error) {
      setPasswordMessage(error.message || "An error occurred. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  }; const handleCancelPasswordChange = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
    setPasswordMessage("");
    setShowPasswordForm(false);
    setShowPasswords({
      oldPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Delete user handlers
  const handleDeleteUser = async () => {
    if (!user?.username) {
      setDeleteMessage("Username is missing. Please re-login.");
      return;
    }

    if (!deletePassword.trim()) {
      setDeleteMessage("Please enter your password to confirm account deletion.");
      return;
    }

    setDeleteLoading(true);
    setDeleteMessage("");

    try {
      const response = await apiService.delete("/users/delete", {
        username: user.username,
        password: deletePassword
      });

      if (response.status === "success") {
        setDeleteMessage("Account deleted successfully. Redirecting to signup page...");
        // Logout and redirect after a short delay
        setTimeout(() => {
          logout();
          navigate("/signup");
        }, 2000);
      } else {
        setDeleteMessage(response.message || "Failed to delete account");
      }
    } catch (error) {
      setDeleteMessage(error.message || "An error occurred while deleting the account.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteMessage("");
    setDeletePassword("");
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar user={user} onLogout={logout} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center text-neutral-400 hover:text-white transition duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Profile Settings Section */}
        <div className="max-w-2xl mx-auto bg-neutral-800 rounded-lg p-6 border border-neutral-700 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Account Settings
          </h2>
          {profileMessage.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${profileMessage.type === "success"
                ? "bg-green-900/50 border border-green-500 text-green-200"
                : "bg-red-900/50 border border-red-500 text-red-200"
                }`}
            >
              <div className="flex items-center">
                {profileMessage.type === "success" ? (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {profileMessage.text}
              </div>
            </div>
          )}
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${validationErrors.firstName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-neutral-600 focus:ring-blue-500"
                      }`}
                  />
                  {validationErrors.firstName && (
                    <p className="mt-1 text-sm text-red-400">
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${validationErrors.lastName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-neutral-600 focus:ring-blue-500"
                      }`}
                  />
                  {validationErrors.lastName && (
                    <p className="mt-1 text-sm text-red-400">
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Username
                  </label>
                  <div className="flex items-center justify-between">
                    <p className="text-white py-2">@{user?.username}</p>
                    <div className="flex items-center text-neutral-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs">Cannot be changed</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${validationErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-neutral-600 focus:ring-blue-500"
                      }`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-400">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="student"
                      checked={formData.student}
                      onChange={handleInputChange}
                      className="mr-2 w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-neutral-300">
                      I am a student
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className={`px-4 py-2 rounded-lg transition duration-200 flex items-center ${profileLoading
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {profileLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="max-w-2xl mx-auto bg-neutral-800 rounded-lg p-6 border border-neutral-700 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Security</h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <div className="max-w-md mx-auto">
              {passwordMessage && (
                <div
                  className={`p-3 rounded-lg text-sm mb-6 ${passwordMessage.includes("successfully")
                    ? "bg-green-800 text-green-200"
                    : "bg-red-800 text-red-200"
                    }`}
                >
                  {passwordMessage}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2 ml-[10%]">
                    Current Password
                  </label>
                  <div className="relative w-4/5 mx-auto">
                    <input
                      type={showPasswords.oldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${passwordErrors.oldPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-neutral-600 focus:ring-blue-500"
                        }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('oldPassword')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
                    >
                      {showPasswords.oldPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="mt-1 text-sm text-red-400 text-center">
                      {passwordErrors.oldPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2 ml-[10%]">
                    New Password
                  </label>
                  <div className="relative w-4/5 mx-auto">
                    <input
                      type={showPasswords.newPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${passwordErrors.newPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-neutral-600 focus:ring-blue-500"
                        }`}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
                    >
                      {showPasswords.newPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-400 text-center">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2 ml-[10%]">
                    Confirm New Password
                  </label>
                  <div className="relative w-4/5 mx-auto">
                    <input
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${passwordErrors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-neutral-600 focus:ring-blue-500"
                        }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
                    >
                      {showPasswords.confirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400 text-center">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleCancelPasswordChange}
                  className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className={`px-4 py-2 rounded-lg transition duration-200 flex items-center ${passwordLoading
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {passwordLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </div>
          )}

          {!showPasswordForm && (
            <p className="text-neutral-400 text-sm">
              Keep your account secure by updating your password regularly.
            </p>
          )}
        </div>

        {/* Delete Account Section */}
        <div className="max-w-2xl mx-auto bg-red-900/20 border border-red-800 rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-red-400">Danger Zone</h2>
              <p className="text-red-300 text-sm mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            {!showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                Delete Account
              </button>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="space-y-4">
              {deleteMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${deleteMessage.includes("successfully")
                    ? "bg-green-800 text-green-200"
                    : "bg-red-800 text-red-200"
                    }`}
                >
                  {deleteMessage}
                </div>
              )}

              <div className="bg-red-800/30 border border-red-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-300 mb-2">
                  Are you absolutely sure?
                </h3>
                <p className="text-red-200 text-sm mb-4">
                  This action <strong>cannot be undone</strong>. This will permanently delete your account{" "}
                  <strong>@{user?.username}</strong> and remove all your data from our servers.
                </p>
                <div className="space-y-2 text-red-200 text-sm">
                  <p>• All your competitive programming profiles and statistics will be lost</p>
                  <p>• Your account settings and preferences will be deleted</p>
                  <p>• You will not be able to recover this data</p>
                </div>
              </div>

              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Confirm your password to delete account
                </label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full p-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-white"
                  >
                    {showDeletePassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                  className={`px-4 py-2 rounded-lg transition duration-200 flex items-center ${deleteLoading
                    ? "bg-red-400 text-white cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                >
                  {deleteLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
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
                      I understand, delete my account
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;