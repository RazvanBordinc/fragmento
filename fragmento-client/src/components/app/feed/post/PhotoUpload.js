/** @format */
"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Upload, X, RotateCw, Camera } from "lucide-react";

export default function PhotoUpload({ photos, updateFormData }) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewURLs, setPreviewURLs] = useState([]);
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
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Process file additions
  const handleFiles = (files) => {
    const fileList = Array.from(files);
    const imageFiles = fileList.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      alert("Please upload image files only.");
      return;
    }

    // Limit to 10 photos
    const totalPhotos = [...photos, ...imageFiles];
    if (totalPhotos.length > 10) {
      alert("You can upload a maximum of 10 photos.");
      return;
    }

    // Create new URLs for preview
    const newURLs = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewURLs((prev) => [...prev, ...newURLs]);

    // Update form data
    updateFormData("photos", [...photos, ...imageFiles]);
  };

  // Handle photo removal
  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);

    // Clean up the preview URL
    URL.revokeObjectURL(previewURLs[index]);
    const newURLs = [...previewURLs];
    newURLs.splice(index, 1);

    setPreviewURLs(newURLs);
    updateFormData("photos", newPhotos);
  };

  // Clean up ObjectURLs when component unmounts
  React.useEffect(() => {
    return () => {
      previewURLs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Initialize preview URLs if photos exist
  React.useEffect(() => {
    if (photos.length > 0 && previewURLs.length === 0) {
      const urls = photos.map((file) => URL.createObjectURL(file));
      setPreviewURLs(urls);
    }
  }, [photos]);

  return (
    <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
      <h3 className="text-lg font-semibold text-white mb-4">Photo Gallery</h3>
      <p className="text-zinc-400 text-sm mb-4">
        Add photos of your fragrance bottle or packaging.
      </p>

      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
          isDragging
            ? "border-orange-500 bg-orange-500/10"
            : "border-zinc-600 hover:border-orange-500/50 hover:bg-zinc-700/50"
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
          multiple
          onChange={handleFileInputChange}
        />

        <Upload className="h-10 w-10 mx-auto text-zinc-500 mb-3" />
        <p className="text-zinc-300 font-medium mb-1">
          Drag photos here or click to upload
        </p>
        <p className="text-zinc-500 text-sm">
          Upload up to 10 images (JPG, PNG)
        </p>
      </div>

      {/* Photo preview grid */}
      {photos.length > 0 && (
        <div className="mt-5">
          <h4 className="text-md font-medium text-zinc-300 mb-3">
            Uploaded Photos ({photos.length}/10)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    transition: { duration: 0.2 },
                  }}
                  transition={{ duration: 0.3 }}
                  className="relative group aspect-square"
                >
                  <img
                    src={previewURLs[index] || URL.createObjectURL(photo)}
                    alt={`Fragrance photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-zinc-600"
                  />

                  {/* Photo options overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="p-2 bg-red-600/80 hover:bg-red-600 rounded-full text-white transition-colors duration-200 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add more button (if less than 10 photos) */}
            {photos.length < 10 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="aspect-square bg-zinc-700/50 border border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-6 w-6 text-zinc-400 mb-2" />
                <span className="text-sm text-zinc-400">Add More</span>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Photo tips */}
      <div className="mt-5 bg-zinc-700/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-zinc-300 mb-2">Photo Tips:</h4>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• Use good lighting to showcase the bottle details</li>
          <li>• Include a photo of the packaging if possible</li>
          <li>
            • For better credibility, add a photo with the fragrance name
            visible
          </li>
          <li>• Show size comparison if it's a unique bottle size</li>
        </ul>
      </div>
    </div>
  );
}
