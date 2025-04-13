/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Camera, Image as ImageIcon, Trash2 } from "lucide-react";
import LoadingOverlay from "../feed/post/LoadingOverlay";

export default function ProfileEditModal({
  isOpen,
  onClose,
  userData,
  onSave,
}) {
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    profilePic: null,
    coverPic: null,
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [newCoverPic, setNewCoverPic] = useState(null);

  // Preview URLs for newly selected images
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [coverPicPreview, setCoverPicPreview] = useState(null);

  // Initialize form data when modal opens or userData changes
  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        username: userData.username || "",
        bio: userData.bio || "",
        profilePic: userData.profilePic || null,
        coverPic: userData.coverPic || null,
      });
    }
  }, [isOpen, userData]);

  // Clean up object URLs when component unmounts or when new files are selected
  useEffect(() => {
    return () => {
      if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
      if (coverPicPreview) URL.revokeObjectURL(coverPicPreview);
    };
  }, [profilePicPreview, coverPicPreview]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle profile pic change
  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfilePic(file);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
      setProfilePicPreview(previewUrl);
    }
  };

  // Handle cover pic change
  const handleCoverPicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCoverPic(file);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      if (coverPicPreview) URL.revokeObjectURL(coverPicPreview);
      setCoverPicPreview(previewUrl);
    }
  };

  // Remove profile pic
  const removeProfilePic = () => {
    setNewProfilePic(null);
    setProfilePicPreview(null);
    setFormData((prev) => ({
      ...prev,
      profilePic: null,
    }));
  };

  // Remove cover pic
  const removeCoverPic = () => {
    setNewCoverPic(null);
    setCoverPicPreview(null);
    setFormData((prev) => ({
      ...prev,
      coverPic: null,
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Add additional validation if needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create updated user data object
      const updatedUserData = {
        ...userData,
        username: formData.username,
        bio: formData.bio,
        profilePic: newProfilePic ? profilePicPreview : userData.profilePic,
        coverPic: newCoverPic ? coverPicPreview : userData.coverPic,
      };

      // Call onSave prop with updated data
      onSave(updatedUserData);

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors((prev) => ({
        ...prev,
        form: "Failed to update profile. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 500 },
    },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xl bg-zinc-900 rounded-xl overflow-hidden shadow-xl border border-zinc-700"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <LoadingOverlay
              isLoading={isSubmitting}
              message="Updating profile..."
              subMessage="Please wait"
            />

            {/* Header */}
            <div className="bg-zinc-800 p-4 flex justify-between items-center border-b border-zinc-700">
              <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-zinc-400 hover:text-white p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              {/* Cover photo section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Cover Photo
                </label>
                <div className="relative bg-zinc-800 rounded-lg overflow-hidden h-32 border border-zinc-700 mb-2">
                  {formData.coverPic || coverPicPreview ? (
                    <div className="w-full h-full relative">
                      <img
                        src={coverPicPreview || formData.coverPic}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeCoverPic}
                        className="absolute top-2 right-2 bg-zinc-900/70 p-1 rounded-full text-red-400 hover:bg-zinc-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <label className="cursor-pointer flex flex-col items-center text-zinc-400 hover:text-zinc-300 transition-colors">
                        <ImageIcon size={24} className="mb-2" />
                        <span className="text-xs">Add Cover Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverPicChange}
                          disabled={isSubmitting}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile photo section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    {formData.profilePic || profilePicPreview ? (
                      <div className="w-full h-full relative">
                        <img
                          src={profilePicPreview || formData.profilePic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeProfilePic}
                          className="absolute -top-0 -right-0 bg-zinc-900/70 p-1 rounded-full text-red-400 hover:bg-zinc-900"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {formData.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <label className="cursor-pointer flex items-center px-3 py-2 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                    <Camera size={18} className="mr-2" />
                    <span className="text-sm">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicChange}
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              </div>

              {/* Username field */}
              <div className="mb-6">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border ${
                    errors.username ? "border-red-500" : "border-zinc-700"
                  } focus:border-orange-500 focus:outline-none transition-all duration-200`}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              {/* Bio field */}
              <div className="mb-6">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-orange-500 focus:outline-none transition-all duration-200 resize-none"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>

              {/* Form error message */}
              {errors.form && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {errors.form}
                </div>
              )}

              {/* Submit button */}
              <div className="flex justify-end">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-zinc-700 text-white font-medium mr-2 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white font-medium cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
