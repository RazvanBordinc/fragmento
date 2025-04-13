/** @format */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import PostForm from "../post/PostForm";

export default function PostDialog({ isOpen, onClose, onPostCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handlePostSubmit = async (formData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Simulate API call with a delay
      // In a real app, you would replace this with an actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a new post object from the form data
      const newPost = {
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: {
          id: "current-user-123", // This would come from your auth system
          username: "fragrancefan", // This would come from your auth system
          profilePic: null,
        },
        timestamp: "Just now",
        fragrance: {
          id: `frag-${Date.now()}`,
          name: formData.name,
          brand: formData.brand,
          category: formData.category,
          likes: 0,
          occasion: formData.occasion,
          photos: formData.photos.map((photo) => URL.createObjectURL(photo)),
          tags: formData.tags,
          notes: formData.notes,
          accords: formData.accords,
          ratings: {
            overall: formData.ratings.overall || 5,
            longevity: formData.ratings.longevity || 5,
            sillage: formData.ratings.sillage || 5,
            scent: formData.ratings.scent || 5,
            value: formData.ratings.valueForMoney || 5,
          },
          seasons: {
            spring: formData.seasons.spring || 3,
            summer: formData.seasons.summer || 3,
            fall: formData.seasons.autumn || 3,
            winter: formData.seasons.winter || 3,
          },
          dayNight: formData.dayNight * 10, // Convert to 0-100 scale
        },
        comments: [],
      };
      console.log("newpost", newPost);

      // Call the onPostCreated callback with the new post
      onPostCreated(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      // Here you would handle errors, maybe show a notification
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
