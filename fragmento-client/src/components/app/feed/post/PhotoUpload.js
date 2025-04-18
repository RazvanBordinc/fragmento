/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Upload, X, Camera, AlertCircle, Loader } from "lucide-react";
import { uploadImage, validateImage } from "@/lib/utils/ImageUploadService";

export default function PhotoUpload({ photoUrl, updateFormData }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewURL, setPreviewURL] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Initialize preview from props if available
  useEffect(() => {
    if (photoUrl && !previewURL) {
      setPreviewURL(photoUrl);
    }
  }, [photoUrl]);

  // Handle file drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]); // Only take the first file
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]); // Only take the first file
    }
  };

  // Process file selection and upload
  const handleFileSelection = async (file) => {
    // Reset error state
    setError(null);

    // Validate the file
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      // Show upload in progress
      setIsUploading(true);

      // Create local preview
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewURL(localPreviewUrl);

      // Upload the file
      const uploadedUrl = await uploadImage(file);

      // If upload successful, update form data
      if (uploadedUrl) {
        // Update parent component
        updateFormData("photoUrl", uploadedUrl);

        // Clean up local preview URL if it's different from the uploaded URL
        if (localPreviewUrl !== uploadedUrl) {
          URL.revokeObjectURL(localPreviewUrl);
          setPreviewURL(uploadedUrl);
        }
      } else {
        setError("Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Error processing image:", err);
      setError(err.message || "Failed to process image");

      // Maintain the local preview even if upload failed
      updateFormData("photoUrl", null);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle photo removal
  const removePhoto = () => {
    // Clean up the preview URL
    if (previewURL && !photoUrl) {
      URL.revokeObjectURL(previewURL);
    }

    // Reset states
    setPreviewURL(null);
    setError(null);

    // Update parent component
    updateFormData("photoUrl", null);
  };

  // Clean up ObjectURLs when component unmounts
  useEffect(() => {
    return () => {
      if (
        previewURL &&
        previewURL !== photoUrl &&
        previewURL.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL, photoUrl]);

  return (
    <div className="bg-gradient-to-br from-zinc-800 to-zinc-800/90 rounded-lg p-5 border border-zinc-700/80 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="bg-cyan-500/20 p-1.5 rounded-md mr-2">
          <Image className="h-5 w-5 text-cyan-400" />
        </span>
        Photo
      </h3>
      <p className="text-zinc-400 text-sm mb-4">
        Add a photo of your fragrance bottle or packaging (optional).
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
          <AlertCircle
            className="text-red-400 mr-2 mt-0.5 flex-shrink-0"
            size={16}
          />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {isUploading ? (
        /* Upload in progress */
        <div className="border-2 border-dashed border-cyan-500/50 bg-cyan-500/10 rounded-lg p-6 text-center">
          <Loader className="h-10 w-10 mx-auto text-cyan-400 mb-3 animate-spin" />
          <p className="text-zinc-300 font-medium mb-1">Uploading image...</p>
          <p className="text-zinc-500 text-sm">
            Please wait while your image is being processed
          </p>
        </div>
      ) : !previewURL ? (
        /* Drag and drop area - only show if no photo is selected */
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
            isDragging
              ? "border-cyan-500 bg-cyan-500/10"
              : "border-zinc-600 hover:border-cyan-500/50 hover:bg-zinc-700/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileInputChange}
          />

          <Upload className="h-10 w-10 mx-auto text-zinc-500 mb-3" />
          <p className="text-zinc-300 font-medium mb-1">
            Drag a photo here or click to upload
          </p>
          <p className="text-zinc-500 text-sm">
            Upload a single image (JPG, PNG, GIF, WEBP)
          </p>
        </div>
      ) : (
        /* Photo preview - show selected photo */
        <div className="mt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-zinc-300">
              Uploaded Photo
            </h4>
            <button
              type="button"
              onClick={removePhoto}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-square max-w-md mx-auto"
          >
            <img
              src={previewURL}
              alt="Fragrance photo"
              className="w-full h-full object-contain rounded-lg border border-zinc-600 bg-zinc-800/50"
              onError={(e) => {
                console.error("Error loading image:", previewURL);
                e.target.src =
                  "https://via.placeholder.com/400x400?text=Image+Error";
              }}
            />
          </motion.div>
        </div>
      )}

      {/* Photo tips */}
      <div className="mt-5 bg-zinc-700/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-zinc-300 mb-2">Photo Tips:</h4>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• Use good lighting to showcase the bottle details</li>
          <li>• Include the packaging if possible for better reference</li>
          <li>• Make sure the fragrance name is visible for credibility</li>
          <li>• Choose a clean background for a professional look</li>
        </ul>
      </div>
    </div>
  );
}
