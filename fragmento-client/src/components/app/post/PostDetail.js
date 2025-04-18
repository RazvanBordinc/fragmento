/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { ArrowLeft, Loader, AlertTriangle, Share2, Flag } from "lucide-react";

import FragrancePost from "../feed/view/FragrancePost";
import { PostsApi } from "@/lib/api/posts-api";
import { useAuth } from "@/lib/auth/AuthContext";

export default function PostDetail({ postId, initialPostData = null }) {
  const router = useRouter();
  const { user } = useAuth();

  // State for post data and loading
  const [post, setPost] = useState(initialPostData);
  const [loading, setLoading] = useState(!initialPostData);
  const [error, setError] = useState(null);

  // Current user information (for commenting, etc.)
  const currentUser = {
    id: user?.id || "guest",
    username: user?.username || "guest",
    profilePic: null,
  };

  // Fetch post data if not provided initially
  useEffect(() => {
    if (!initialPostData && postId) {
      fetchPostData();
    }
  }, [postId, initialPostData]);

  // Fetch post data
  const fetchPostData = async () => {
    setLoading(true);
    setError(null);

    try {
      const postData = await PostsApi.getPost(postId);
      setPost(postData);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Failed to load post data");
    } finally {
      setLoading(false);
    }
  };

  // Handle going back
  const handleGoBack = () => {
    router.back(); // Go back to previous page
  };

  // Handle sharing
  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/app/post/${postId}`;

      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: post
            ? `${post.fragrance.brand} ${post.fragrance.name}`
            : "Shared fragrance post",
          text:
            post?.fragrance.description?.substring(0, 100) ||
            "Check out this fragrance post!",
          url: url,
        });
        return;
      }

      // Fall back to clipboard
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // Handle liking a post
  const handlePostLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await PostsApi.unlikePost(postId);
      } else {
        await PostsApi.likePost(postId);
      }

      // Update the post state
      setPost((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          isLiked: !isLiked,
          likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
        };
      });
    } catch (error) {
      console.error("Error liking/unliking post:", error);
      alert(`Failed to ${isLiked ? "unlike" : "like"} post: ${error.message}`);
    }
  };

  // Handle saving a post
  const handlePostSave = async (postId, isSaved) => {
    try {
      if (isSaved) {
        await PostsApi.unsavePost(postId);
      } else {
        await PostsApi.savePost(postId);
      }

      // Update the post state
      setPost((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          isSaved: !isSaved,
        };
      });
    } catch (error) {
      console.error("Error saving/unsaving post:", error);
      alert(`Failed to ${isSaved ? "unsave" : "save"} post: ${error.message}`);
    }
  };

  // Handle reporting
  const handleReport = async () => {
    alert("Report feature would open here");
  };

  // Handle post delete
  const handlePostDelete = async (postId) => {
    try {
      await PostsApi.deletePost(postId);
      router.push("/app"); // Redirect to main feed after deletion
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(`Failed to delete post: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button and actions */}
        <div className="mb-6 flex justify-between items-center">
          <motion.button
            onClick={handleGoBack}
            className="flex items-center text-zinc-400 hover:text-white cursor-pointer transition-colors"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back</span>
          </motion.button>

          <div className="flex space-x-3">
            <motion.button
              onClick={handleShare}
              className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 size={18} />
            </motion.button>

            <motion.button
              onClick={handleReport}
              className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Flag size={18} />
            </motion.button>
          </div>
        </div>

        {/* Main content */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader size={30} className="animate-spin text-orange-500 mb-4" />
              <p className="text-zinc-400">Loading post...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle size={40} className="text-orange-500 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Post Not Found
              </h2>
              <p className="text-zinc-400 mb-6">{error}</p>
              <motion.button
                onClick={handleGoBack}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg cursor-pointer transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Return to Previous Page
              </motion.button>
            </div>
          ) : (
            <div>
              {/* Post content */}
              <div className="mb-8">
                <FragrancePost
                  post={post}
                  currentUser={currentUser}
                  onPostDelete={handlePostDelete}
                  onPostLike={handlePostLike}
                  onPostSave={handlePostSave}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
