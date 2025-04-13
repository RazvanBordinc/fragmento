/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  SprayCan,
  Plus,
  ChevronDown,
} from "lucide-react";
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
    signatureFragrance: null,
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [newCoverPic, setNewCoverPic] = useState(null);
  const [newFragrancePic, setNewFragrancePic] = useState(null);
  const [activeSection, setActiveSection] = useState("profile"); // 'profile' or 'signature'

  // Preview URLs for newly selected images
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [coverPicPreview, setCoverPicPreview] = useState(null);
  const [fragrancePicPreview, setFragrancePicPreview] = useState(null);

  // Initialize form data when modal opens or userData changes
  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        username: userData.username || "",
        bio: userData.bio || "",
        profilePic: userData.profilePic || null,
        coverPic: userData.coverPic || null,
        signatureFragrance: userData.signatureFragrance || null,
      });

      // Reset section
      setActiveSection("profile");

      // Reset errors
      setErrors({});
    }
  }, [isOpen, userData]);

  // Clean up object URLs when component unmounts or when new files are selected
  useEffect(() => {
    return () => {
      if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
      if (coverPicPreview) URL.revokeObjectURL(coverPicPreview);
      if (fragrancePicPreview) URL.revokeObjectURL(fragrancePicPreview);
    };
  }, [profilePicPreview, coverPicPreview, fragrancePicPreview]);

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

  // Handle signature fragrance input changes
  const handleFragranceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      signatureFragrance: {
        ...prev.signatureFragrance,
        [name]: value,
      },
    }));

    // Clear error when typing
    if (errors[`fragrance_${name}`]) {
      setErrors((prev) => ({
        ...prev,
        [`fragrance_${name}`]: "",
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

  // Handle fragrance pic change
  const handleFragrancePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewFragrancePic(file);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      if (fragrancePicPreview) URL.revokeObjectURL(fragrancePicPreview);
      setFragrancePicPreview(previewUrl);

      // Update form data
      setFormData((prev) => ({
        ...prev,
        signatureFragrance: {
          ...prev.signatureFragrance,
          photo: previewUrl,
        },
      }));
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

  // Remove fragrance pic
  const removeFragrancePic = () => {
    setNewFragrancePic(null);
    setFragrancePicPreview(null);
    setFormData((prev) => ({
      ...prev,
      signatureFragrance: {
        ...prev.signatureFragrance,
        photo: null,
      },
    }));
  };

  // Add signature fragrance
  const addSignatureFragrance = () => {
    if (!formData.signatureFragrance) {
      setFormData((prev) => ({
        ...prev,
        signatureFragrance: {
          name: "",
          brand: "",
          category: "Eau de Parfum",
          photo: null,
          description: "",
          notes: [],
        },
      }));
    }
    setActiveSection("signature");
  };

  // Remove signature fragrance
  const removeSignatureFragrance = () => {
    setFormData((prev) => ({
      ...prev,
      signatureFragrance: null,
    }));
    setActiveSection("profile");
  };

  // Handle note input changes
  const handleNoteChange = (e, index) => {
    const { value } = e.target;
    setFormData((prev) => {
      const updatedNotes = [...prev.signatureFragrance.notes];
      updatedNotes[index] = value;

      return {
        ...prev,
        signatureFragrance: {
          ...prev.signatureFragrance,
          notes: updatedNotes,
        },
      };
    });
  };

  // Add new note
  const addNote = () => {
    setFormData((prev) => ({
      ...prev,
      signatureFragrance: {
        ...prev.signatureFragrance,
        notes: [...prev.signatureFragrance.notes, ""],
      },
    }));
  };

  // Remove note
  const removeNote = (index) => {
    setFormData((prev) => {
      const updatedNotes = [...prev.signatureFragrance.notes];
      updatedNotes.splice(index, 1);

      return {
        ...prev,
        signatureFragrance: {
          ...prev.signatureFragrance,
          notes: updatedNotes,
        },
      };
    });
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Validate signature fragrance if it exists
    if (formData.signatureFragrance) {
      if (!formData.signatureFragrance.name.trim()) {
        newErrors.fragrance_name = "Fragrance name is required";
      }

      if (!formData.signatureFragrance.brand.trim()) {
        newErrors.fragrance_brand = "Brand name is required";
      }
    }

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
        signatureFragrance: formData.signatureFragrance
          ? {
              ...formData.signatureFragrance,
              photo: newFragrancePic
                ? fragrancePicPreview
                : formData.signatureFragrance.photo,
            }
          : null,
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

  const sectionVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
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
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-white">
                  Edit Profile
                </h2>

                {/* Section tabs */}
                <div className="ml-6 flex">
                  <button
                    type="button"
                    onClick={() => setActiveSection("profile")}
                    className={`px-3 py-1 text-sm rounded-l-lg cursor-pointer ${
                      activeSection === "profile"
                        ? "bg-orange-600 text-white"
                        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      activeSection === "signature"
                        ? setActiveSection("profile")
                        : addSignatureFragrance()
                    }
                    className={`px-3 py-1 text-sm rounded-r-lg cursor-pointer flex items-center ${
                      activeSection === "signature"
                        ? "bg-orange-600 text-white"
                        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                    }`}
                  >
                    <SprayCan size={14} className="mr-1" />
                    Signature
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-zinc-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[70vh] overflow-y-auto"
            >
              <AnimatePresence mode="wait">
                {activeSection === "profile" ? (
                  <motion.div
                    key="profile-section"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-4"
                  >
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
                              className="absolute top-2 right-2 bg-zinc-900/70 p-1 rounded-full text-red-400 hover:bg-zinc-900 cursor-pointer"
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
                                className="absolute -top-0 -right-0 bg-zinc-900/70 p-1 rounded-full text-red-400 hover:bg-zinc-900 cursor-pointer"
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
                        <p className="text-red-500 text-xs mt-1">
                          {errors.username}
                        </p>
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

                    {/* Signature fragrance section */}
                    {!formData.signatureFragrance ? (
                      <div className="mb-6">
                        <button
                          type="button"
                          onClick={addSignatureFragrance}
                          className="flex items-center text-orange-500 hover:text-orange-400 cursor-pointer"
                        >
                          <Plus size={16} className="mr-1" />
                          <span>Add Signature Fragrance</span>
                        </button>
                      </div>
                    ) : (
                      <div className="mb-6 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <SprayCan
                              size={16}
                              className="text-orange-500 mr-2"
                            />
                            <span className="text-zinc-300">
                              {formData.signatureFragrance.name ||
                                "Signature Fragrance"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveSection("signature")}
                            className="text-xs px-2 py-1 bg-orange-600 rounded text-white cursor-pointer hover:bg-orange-500 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="signature-section"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-4"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <SprayCan size={18} className="text-orange-500 mr-2" />
                        Signature Fragrance
                      </h3>
                      <button
                        type="button"
                        onClick={removeSignatureFragrance}
                        className="text-red-400 hover:text-red-300 cursor-pointer flex items-center"
                      >
                        <Trash2 size={16} className="mr-1" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>

                    {/* Fragrance Name and Brand */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor="fragrance-name"
                          className="block text-sm font-medium text-zinc-300 mb-2"
                        >
                          Fragrance Name*
                        </label>
                        <input
                          type="text"
                          id="fragrance-name"
                          name="name"
                          value={formData.signatureFragrance?.name || ""}
                          onChange={handleFragranceChange}
                          className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border ${
                            errors.fragrance_name
                              ? "border-red-500"
                              : "border-zinc-700"
                          } focus:border-orange-500 focus:outline-none`}
                          placeholder="Enter fragrance name"
                        />
                        {errors.fragrance_name && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.fragrance_name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="fragrance-brand"
                          className="block text-sm font-medium text-zinc-300 mb-2"
                        >
                          Brand*
                        </label>
                        <input
                          type="text"
                          id="fragrance-brand"
                          name="brand"
                          value={formData.signatureFragrance?.brand || ""}
                          onChange={handleFragranceChange}
                          className={`w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border ${
                            errors.fragrance_brand
                              ? "border-red-500"
                              : "border-zinc-700"
                          } focus:border-orange-500 focus:outline-none`}
                          placeholder="Enter brand name"
                        />
                        {errors.fragrance_brand && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.fragrance_brand}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                      <label
                        htmlFor="fragrance-category"
                        className="block text-sm font-medium text-zinc-300 mb-2"
                      >
                        Category
                      </label>
                      <div className="relative">
                        <select
                          id="fragrance-category"
                          name="category"
                          value={
                            formData.signatureFragrance?.category ||
                            "Eau de Parfum"
                          }
                          onChange={handleFragranceChange}
                          className="appearance-none w-full px-4 py-2 pr-8 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-orange-500 focus:outline-none cursor-pointer"
                        >
                          <option value="Eau de Parfum">Eau de Parfum</option>
                          <option value="Eau de Toilette">
                            Eau de Toilette
                          </option>
                          <option value="Parfum">Parfum</option>
                          <option value="Eau de Cologne">Eau de Cologne</option>
                          <option value="Eau Fraiche">Eau Fraiche</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronDown size={16} className="text-zinc-500" />
                        </div>
                      </div>
                    </div>

                    {/* Fragrance Photo */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Fragrance Photo
                      </label>
                      <div className="relative bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                        {formData.signatureFragrance?.photo ||
                        fragrancePicPreview ? (
                          <div className="relative aspect-square max-w-full h-48 mx-auto">
                            <img
                              src={
                                fragrancePicPreview ||
                                formData.signatureFragrance?.photo
                              }
                              alt="Fragrance"
                              className="w-full h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={removeFragrancePic}
                              className="absolute top-2 right-2 bg-zinc-900/70 p-1 rounded-full text-red-400 hover:bg-zinc-900 cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center">
                            <label className="cursor-pointer flex flex-col items-center text-zinc-400 hover:text-zinc-300 transition-colors">
                              <SprayCan size={24} className="mb-2" />
                              <span className="text-xs">
                                Add Fragrance Photo
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFragrancePicChange}
                                disabled={isSubmitting}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label
                        htmlFor="fragrance-description"
                        className="block text-sm font-medium text-zinc-300 mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        id="fragrance-description"
                        name="description"
                        value={formData.signatureFragrance?.description || ""}
                        onChange={handleFragranceChange}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-orange-500 focus:outline-none resize-none"
                        placeholder="Why is this your signature fragrance?"
                      ></textarea>
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-zinc-300">
                          Key Notes
                        </label>
                        <button
                          type="button"
                          onClick={addNote}
                          className="text-orange-500 hover:text-orange-400 text-sm flex items-center cursor-pointer"
                        >
                          <Plus size={14} className="mr-1" />
                          Add Note
                        </button>
                      </div>

                      {formData.signatureFragrance?.notes?.length > 0 ? (
                        <div className="space-y-2">
                          {formData.signatureFragrance.notes.map(
                            (note, index) => (
                              <div key={index} className="flex items-center">
                                <input
                                  type="text"
                                  value={note}
                                  onChange={(e) => handleNoteChange(e, index)}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-orange-500 focus:outline-none"
                                  placeholder={`Note #${index + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeNote(index)}
                                  className="ml-2 text-zinc-500 hover:text-red-400 cursor-pointer"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center p-4 border border-dashed border-zinc-700 rounded-lg">
                          <p className="text-zinc-500 text-sm">
                            No notes added yet. Click "Add Note" to begin.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form error message */}
              {errors.form && (
                <div className="px-4 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {errors.form}
                </div>
              )}

              {/* Submit button */}
              <div className="p-4 bg-zinc-800/50 border-t border-zinc-700 flex justify-end">
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
