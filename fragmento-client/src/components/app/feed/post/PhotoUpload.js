/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Upload, X, Camera } from "lucide-react";

export default function PhotoUpload({ photos, updateFormData }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewURL, setPreviewURL] = useState(null);
  const fileInputRef = useRef(null);

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
      handleFiles(e.dataTransfer.files[0]); // Only take the first file
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files[0]); // Only take the first file
    }
  };

  // Process file addition
  const handleFiles = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file only.");
      return;
    }

    // Clean up previous preview URL if exists
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }

    // Create new URL for preview
    const newURL = URL.createObjectURL(file);
    setPreviewURL(newURL);

    // Update form data with single photo
    updateFormData("photos", [file]);
  };

  // Handle photo removal
  const removePhoto = () => {
    // Clean up the preview URL
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }

    updateFormData("photos", []);
  };

  // Clean up ObjectURLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, []);

  // Initialize preview URL if photo exists
  useEffect(() => {
    if (photos.length > 0 && !previewURL) {
      const url = URL.createObjectURL(photos[0]);
      setPreviewURL(url);
    }
  }, [photos]);

  return (
    <div className="bg-gradient-to-br from-zinc-800 to-zinc-800/90 rounded-lg p-5 border border-zinc-700/80 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="bg-cyan-500/20 p-1.5 rounded-md mr-2">
          <Image className="h-5 w-5 text-cyan-400" />
        </span>
        Photo
      </h3>
      <p className="text-zinc-400 text-sm mb-4">
        Add a photo of your fragrance bottle or packaging.
      </p>

      {!photos.length || !previewURL ? (
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
            accept="image/*"
            onChange={handleFileInputChange}
          />

          <Upload className="h-10 w-10 mx-auto text-zinc-500 mb-3" />
          <p className="text-zinc-300 font-medium mb-1">
            Drag a photo here or click to upload
          </p>
          <p className="text-zinc-500 text-sm">
            Upload a single image (JPG, PNG)
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
              onClick={() => removePhoto()}
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
