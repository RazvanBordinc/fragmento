/** @format */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthContext";
import { changePassword } from "@/lib/auth/AuthService";

export default function AccountSettings() {
  const { user, logout } = useAuth();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });

    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      // Call change password API
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Clear form and show success message
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password changed successfully");
    } catch (error) {
      console.error("Password change error:", error);
      setErrors({
        form: error.message || "Failed to change password. Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Improved handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Use the enhanced logout from AuthContext
      // This handles calling the API, clearing cookies, and redirecting
      await logout();
      // No need to redirect, the logout function handles that
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <motion.button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:bg-red-800 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoggingOut ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Logging out...
                </div>
              ) : (
                "Logout"
              )}
            </motion.button>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Account Information
            </h2>
            <div className="grid gap-4">
              <div>
                <p className="text-zinc-400 text-sm">Username</p>
                <p className="text-white font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Email</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Change Password
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-zinc-300 mb-1"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-zinc-700 border ${
                      errors.currentPassword
                        ? "border-red-500"
                        : "border-zinc-600"
                    } rounded-lg text-white focus:outline-none focus:border-orange-500`}
                  />
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-zinc-300 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-zinc-700 border ${
                      errors.newPassword ? "border-red-500" : "border-zinc-600"
                    } rounded-lg text-white focus:outline-none focus:border-orange-500`}
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-zinc-300 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-zinc-700 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-zinc-600"
                    } rounded-lg text-white focus:outline-none focus:border-orange-500`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Form error */}
                {errors.form && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-500">{errors.form}</p>
                  </div>
                )}

                {/* Success message */}
                {successMessage && (
                  <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-500">{successMessage}</p>
                  </div>
                )}

                {/* Submit button */}
                <div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg disabled:bg-orange-700 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting ? "Changing Password..." : "Change Password"}
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
