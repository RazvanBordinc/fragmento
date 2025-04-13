/** @format */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

import PostDialog from "./view/PostDialog";
import FragrancePost from "./view/FragrancePost";
import ToastNotification from "./view/ToastNotification";
import { usePathname } from "next/navigation";

export default function FeedLayout() {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [posts, setPosts] = useState(samplePosts);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const pathname = usePathname();
  // Current user information - needed for comment functionality
  const currentUser = {
    id: "current-user-123",
    username: "fragrancefan",
    profilePic: null,
  };

  const handlePostCreated = (newPost) => {
    // Add the new post to the beginning of the list
    setPosts((prevPosts) => [newPost, ...prevPosts]);

    // Close the dialog
    setIsPostDialogOpen(false);

    // Show success toast
    setToast({
      visible: true,
      message: "Your fragrance post has been shared successfully!",
      type: "success",
    });
  };

  const handlePostDeleted = (postId) => {
    // Remove the post from the list
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

    // Show success toast
    setToast({
      visible: true,
      message: "Your fragrance post has been deleted.",
      type: "success",
    });
  };
  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };
  const handlePostEdit = (postId, postData) => {
    // Here you would open the edit dialog with the post data
    // For now, just show a toast
    setToast({
      visible: true,
      message: "Post editing is not implemented yet.",
      type: "success",
    });
  };

  return (
    <div className="flex min-h-screen bg-zinc-900">
      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={closeToast}
      />

      {/* Left sidebar */}
      <div
        className={`w-1/4 hidden md:block border-r-2border-zinc-800 bg-gradient-to-l from-zinc-800  to-zinc-950`}
      >
        {/* Sidebar content would go here */}
      </div>

      {/* Main content */}
      <div className="mx-auto w-full md:w-3/6 px-4 py-6 z-20 relative">
        <div className="absolute inset-0 blur-sm shadow-lg shadow-white animate-pulse size-full"></div>
        {/* Feed of posts */}
        <div className="space-y-6">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                layout
              >
                <FragrancePost
                  post={post}
                  currentUser={currentUser}
                  onPostDelete={handlePostDeleted}
                  onPostEdit={handlePostEdit}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-zinc-400 text-lg">No posts yet</div>
              <div className="text-zinc-500 mt-2">
                Share your first fragrance to get started!
              </div>
            </motion.div>
          )}
        </div>

        {/* Create button */}
        <motion.button
          onClick={() => setIsPostDialogOpen(true)}
          className="fixed bottom-6 right-6 flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-lg z-10 cursor-pointer"
          whileHover={{
            scale: 1.05,
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
            delay: 0.3,
          }}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:block">Create Post</span>
        </motion.button>

        {/* Post dialog */}
        <PostDialog
          isOpen={isPostDialogOpen}
          onClose={() => setIsPostDialogOpen(false)}
          onPostCreated={handlePostCreated}
        />
      </div>

      {/* Right sidebar */}
      <div
        className={`w-1/4 hidden md:block border-l border-zinc-800 bg-gradient-to-r from-zinc-800 to-zinc-950`}
      >
        {/* Sidebar content would go here */}
      </div>
    </div>
  );
}

// Sample posts data with comments included
const samplePosts = [
  {
    id: "post1",
    user: {
      id: "user456",
      username: "perfumemaster",
      profilePic: null,
    },
    timestamp: "3 hours ago",
    fragrance: {
      id: "frag1",
      name: "Light Blue",
      brand: "Dolce & Gabbana",
      category: "Fresh/Citrus",
      likes: 245,
      occasion: "casual",
      photos: [],
      tags: ["fresh", "summer", "citrus", "light", "everyday"],
      notes: ["Sicilian lemon", "Apple", "Cedar", "Bamboo", "White rose"],
      accords: ["Citrus", "Woody", "Fresh"],
      ratings: {
        overall: 4.5,
        longevity: 3.5,
        sillage: 3.0,
        scent: 2.5,
        value: 4.0,
      },
      seasons: {
        spring: 4,
        summer: 5,
        fall: 2,
        winter: 1,
      },
      dayNight: 70, // 0 = Night, 100 = Day
    },
    comments: [
      {
        id: "comment1",
        userId: "user789",
        username: "scentexplorer",
        profilePic: null,
        text: "This is my favorite summer fragrance! The citrus notes are perfect for hot days.",
        timestamp: "2 hours ago",
        likes: 12,
        isLiked: false,
        replies: [
          {
            id: "reply1",
            userId: "user456",
            username: "perfumemaster",
            profilePic: null,
            text: "I agree! It's definitely a summer staple. Have you tried the Intense version?",
            timestamp: "1 hour ago",
            likes: 3,
            isLiked: false,
            replies: [], // Add empty replies array for nested replies
          },
        ],
      },
      {
        id: "comment2",
        userId: "current-user-123", // Current user's comment
        username: "fragrancefan",
        profilePic: null,
        text: "I find the longevity to be a bit weak. Anyone else have this issue?",
        timestamp: "1 hour ago",
        likes: 5,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: "post2",
    user: {
      id: "user999",
      username: "fragranceboutique",
      profilePic: null,
    },
    timestamp: "Yesterday",
    fragrance: {
      id: "frag2",
      name: "Oud Wood",
      brand: "Tom Ford",
      category: "Woody/Oriental",
      likes: 384,
      occasion: "formal",
      photos: [],
      tags: ["oud", "luxury", "woody", "spicy", "sophisticated"],
      notes: ["Oud wood", "Rosewood", "Chinese pepper", "Amber", "Vanilla"],
      accords: ["Woody", "Oud", "Spicy", "Warm"],
      ratings: {
        overall: 4.8,
        longevity: 4.5,
        sillage: 4.2,
        scent: 4.0,
        value: 3.0,
      },
      seasons: {
        spring: 2,
        summer: 1,
        fall: 4,
        winter: 5,
      },
      dayNight: 30, // 0 = Night, 100 = Day
    },
    comments: [
      {
        id: "comment3",
        userId: "user321",
        username: "oudlover",
        profilePic: null,
        text: "My signature scent. Worth every penny!",
        timestamp: "8 hours ago",
        likes: 22,
        isLiked: true,
        replies: [],
      },
    ],
  },
  {
    id: "post3",
    user: {
      id: "user777",
      username: "scentcollector",
      profilePic: null,
    },
    timestamp: "2 days ago",
    fragrance: {
      id: "frag3",
      name: "Aventus",
      brand: "Creed",
      category: "Fruity/Chypre",
      likes: 512,
      occasion: "special",
      photos: [],
      tags: ["pineapple", "smoky", "fresh", "fruity", "niche"],
      notes: ["Pineapple", "Bergamot", "Birch", "Ambergris", "Musk"],
      accords: ["Fruity", "Smoky", "Fresh", "Woody"],
      ratings: {
        overall: 4.9,
        longevity: 4.0,
        sillage: 4.3,
        scent: 3.8,
        value: 2.5,
      },
      seasons: {
        spring: 4,
        summer: 3,
        fall: 4,
        winter: 3,
      },
      dayNight: 60,
    },
    comments: [],
  },
];
