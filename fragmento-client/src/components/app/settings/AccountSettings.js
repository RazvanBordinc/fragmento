/** @format */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Trash2,
  ChevronRight,
  AlertTriangle,
  X,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ToastNotification from "../feed/view/ToastNotification";
import LoadingOverlay from "../feed/post/LoadingOverlay";

export default function AccountSettings() {
  const router = useRouter();

  // State variables
  const [activeSection, setActiveSection] = useState("account");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password errors
  const [passwordErrors, setPasswordErrors] = useState({});

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when typing
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Updating password...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Show success message
      setToast({
        visible: true,
        message: "Password updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      setToast({
        visible: true,
        message: "Failed to update password. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setToast({
        visible: true,
        message: "Please type DELETE to confirm account deletion",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Deleting account...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Close modal
      setIsDeleteModalOpen(false);

      // Redirect to landing page
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setToast({
        visible: true,
        message: "Failed to delete account. Please try again.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  // Handle toggle changes
  const handleToggleChange = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));

    // Show toast notification
    setToast({
      visible: true,
      message: "Setting updated",
      type: "success",
    });
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true);
    setLoadingMessage("Logging out...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to landing page
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      setToast({
        visible: true,
        message: "Failed to logout. Please try again.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  // Close toast
  const closeToast = () => {
    setToast((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  // Sections config
  const sections = [
    {
      id: "account",
      label: "Account Information",
      icon: <User size={18} />,
    },
    {
      id: "password",
      label: "Password",
      icon: <Lock size={18} />,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-white pt-6 pb-12">
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />

      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={closeToast}
      />

      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Account Settings
          </h1>
          <p className="text-zinc-400">
            Manage your account preferences, privacy, and security
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
            <nav className="divide-y divide-zinc-700">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 cursor-pointer transition-colors ${
                    activeSection === section.id
                      ? "bg-zinc-700 text-orange-400"
                      : "text-zinc-300 hover:bg-zinc-700/70"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{section.icon}</span>
                    <span>{section.label}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={
                      activeSection === section.id
                        ? "text-orange-400"
                        : "text-zinc-500"
                    }
                  />
                </button>
              ))}
            </nav>

            {/* Logout and Delete Account */}
            <div className="p-4 bg-zinc-800 border-t border-zinc-700">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-lg text-red-400 hover:bg-zinc-700 transition-colors cursor-pointer mb-2"
              >
                <LogOut size={18} className="mr-3" />
                <span>Log Out</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center w-full px-3 py-2 rounded-lg text-red-400 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <Trash2 size={18} className="mr-3" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeSection === "account" && (
                <motion.div
                  key="account-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-zinc-800 rounded-lg border border-zinc-700 p-5"
                >
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User size={20} className="mr-2 text-orange-400" />
                    Account Information
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Username</p>
                      <p className="text-white font-medium">fragrancefan</p>
                    </div>

                    <div>
                      <p className="text-zinc-400 text-sm mb-1">
                        Email Address
                      </p>
                      <p className="text-white font-medium">user@example.com</p>
                    </div>

                    <div>
                      <p className="text-zinc-400 text-sm mb-1">
                        Account Created
                      </p>
                      <p className="text-white font-medium">January 15, 2023</p>
                    </div>

                    <div>
                      <Link
                        href="/app/profile"
                        className="text-orange-400 hover:text-orange-300 cursor-pointer transition-colors flex items-center"
                      >
                        <span>Edit Profile</span>
                        <ChevronRight size={16} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "password" && (
                <motion.div
                  key="password-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-zinc-800 rounded-lg border border-zinc-700 p-5"
                >
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Lock size={20} className="mr-2 text-orange-400" />
                    Change Password
                  </h2>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-zinc-400 text-sm mb-1"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 rounded-lg bg-zinc-700 text-white border ${
                          passwordErrors.currentPassword
                            ? "border-red-500"
                            : "border-zinc-600"
                        } focus:border-orange-500 focus:outline-none`}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-zinc-400 text-sm mb-1"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 rounded-lg bg-zinc-700 text-white border ${
                          passwordErrors.newPassword
                            ? "border-red-500"
                            : "border-zinc-600"
                        } focus:border-orange-500 focus:outline-none`}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-zinc-400 text-sm mb-1"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 rounded-lg bg-zinc-700 text-white border ${
                          passwordErrors.confirmPassword
                            ? "border-red-500"
                            : "border-zinc-600"
                        } focus:border-orange-500 focus:outline-none`}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="mt-6">
                      <motion.button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg cursor-pointer hover:bg-orange-500 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Update Password
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="w-full max-w-md bg-zinc-900 rounded-xl border border-red-800/50 overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <AlertTriangle className="text-red-500 mr-2" size={24} />
                    Delete Account
                  </h3>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="text-zinc-300 mb-6 space-y-4">
                  <p>
                    Are you sure you want to delete your account? This action is
                    permanent and cannot be undone.
                  </p>
                  <p>You will lose all of your data, including:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Your profile</li>
                    <li>All posts and comments</li>
                    <li>Collections and saved items</li>
                    <li>Follows and followers</li>
                  </ul>

                  <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-4 mt-4">
                    <p className="text-red-400 font-medium">
                      Type DELETE to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-zinc-800 border border-red-800/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                      placeholder="Type DELETE here"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <motion.button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-zinc-700 text-white rounded-lg cursor-pointer hover:bg-zinc-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-500"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete Account
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
