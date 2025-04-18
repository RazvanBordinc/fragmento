/** @format */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import PostForm from "../post/PostForm";
import { PostsApi } from "@/lib/posts/PostsApi";
import {
  mapComponentPostToApiPost,
  mapApiPostToComponentPost,
} from "@/lib/utils/data-mappers";

export default function PostDialog({ isOpen, onClose, onPostCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError(null);
    }
  };

  const handlePostSubmit = async (formData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert form data to API format using our mapper
      const postData = mapComponentPostToApiPost(formData);

      // For clarity, log the data we're about to send
      console.log("Submitting post data:", postData);

      // For simplicity, we're not handling photo uploads completely
      // In a real app, you would upload the photo to a server/cloud storage
      // and then include the URL in the post data

      let photoUrl = null;
      if (formData.photoUrl) {
        // This would normally be replaced with actual file upload code
        // For now, we'll just use a placeholder URL if there's a photo
        photoUrl = "https://via.placeholder.com/400x400";

        // In a real implementation, you might do something like:
        // const formDataForUpload = new FormData();
        // formDataForUpload.append('file', formData.photos[0]);
        // const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formDataForUpload });
        // const uploadResult = await uploadResponse.json();
        // photoUrl = uploadResult.url;
      }

      // Add the photo URL to the post data
      postData.photoUrl = photoUrl;

      // Send to API
      const response = await PostsApi.createPost(postData);

      // Map API response back to component format
      const mappedResponse = mapApiPostToComponentPost(response);

      // Call the parent component's callback with the new post
      if (onPostCreated) {
        // Just pass the already created post to the parent
        onPostCreated(mappedResponse);
      }

      // Close the dialog
      handleClose();
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.message || "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const dialogVariants = {
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
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-3 flex justify-between items-center">
              <h2 className="text-white font-bold">Create New Post</h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className={`text-white rounded-full p-1 hover:bg-white/20 transition-colors cursor-pointer ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 m-4 p-3 rounded-md">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Overlay while submitting */}
            <AnimatePresence>
              {isSubmitting && (
                <motion.div
                  className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="bg-zinc-800 rounded-lg p-6 shadow-xl flex flex-col items-center"
                  >
                    <Loader2
                      size={40}
                      className="text-orange-500 animate-spin mb-4"
                    />
                    <p className="text-white font-medium text-lg mb-1">
                      Posting...
                    </p>
                    <p className="text-zinc-400 text-sm">
                      Sharing your fragrance with the community
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="max-h-[80vh] overflow-y-auto">
              <PostForm onSubmit={handlePostSubmit} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
