/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader, BookmarkIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import PostDialog from "./view/PostDialog";
import FragrancePost from "./view/FragrancePost";
import ToastNotification from "./view/ToastNotification";
import { PostsApi } from "@/lib/posts/PostsApi";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  mapApiPostToComponentPost,
  mapComponentPostToApiPost,
} from "@/lib/utils/data-mappers";

export default function FeedLayout({ initialPosts = [], isSavedPage = false }) {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const pathname = usePathname();
  const { user } = useAuth();

  // Current user information - needed for comment functionality
  const currentUser = {
    id: user?.id || "guest",
    username: user?.username || "guest",
    profilePic: null,
  };

  useEffect(() => {
    // If no initial posts were provided, fetch them
    if (initialPosts.length === 0) {
      fetchPosts();
    }
  }, []);

  // Fetch posts based on current route
  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      setError(null);

      let response;

      // Determine which API endpoint to use based on the current path or prop
      if (isSavedPage) {
        // For saved posts using explicit prop
        if (!user) {
          setError("You must be logged in to view saved posts");
          setLoading(false);
          setIsLoadingMore(false);
          return;
        }
        // Use the saved posts endpoint
        response = await PostsApi.getSavedPosts(pageNum);
      } else if (pathname.includes("/discover")) {
        response = await PostsApi.getDiscover(pageNum);
      } else if (pathname.includes("/saved")) {
        // For saved posts using URL pattern
        if (!user) {
          setError("You must be logged in to view saved posts");
          setLoading(false);
          setIsLoadingMore(false);
          return;
        }
        // Use the saved posts endpoint
        response = await PostsApi.getSavedPosts(pageNum);
      } else {
        // Default to feed if logged in, or regular posts if not
        response = user
          ? await PostsApi.getFeed(pageNum)
          : await PostsApi.getPosts(pageNum);
      }

      // Map API posts to component format
      const newPosts = (response.posts || []).map((apiPost) =>
        mapApiPostToComponentPost(apiPost, currentUser)
      );

      // Update posts state based on page number
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      // Update pagination state
      setHasMore(response.pagination?.hasMore || false);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load more posts
  const loadMorePosts = () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    fetchPosts(page + 1);
  };

  const handlePostCreated = async (newPost) => {
    try {
      // Convert to API format
      const apiPostData = mapComponentPostToApiPost(newPost);

      // Submit to the API
      const response = await PostsApi.createPost(apiPostData);

      // Convert response back to component format
      const mappedPost = mapApiPostToComponentPost(response, currentUser);

      // Add the new post to the beginning of the list
      setPosts((prevPosts) => [mappedPost, ...prevPosts]);

      // Close the dialog
      setIsPostDialogOpen(false);

      // Show success toast
      setToast({
        visible: true,
        message: "Your fragrance post has been shared successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      setToast({
        visible: true,
        message: `Failed to create post: ${error.message}`,
        type: "error",
      });
    }
  };

  const handlePostDeleted = async (postId) => {
    try {
      // Call the API to delete the post
      await PostsApi.deletePost(postId);

      // Remove the post from the list
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      // Show success toast
      setToast({
        visible: true,
        message: "Your fragrance post has been deleted.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      setToast({
        visible: true,
        message: `Failed to delete post: ${error.message}`,
        type: "error",
      });
    }
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

  // Handle liking a post
  const handlePostLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await PostsApi.unlikePost(postId);
      } else {
        await PostsApi.likePost(postId);
      }

      // Update the post in state
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: !isLiked,
              likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error liking/unliking post:", error);
      setToast({
        visible: true,
        message: `Failed to ${isLiked ? "unlike" : "like"} post: ${
          error.message
        }`,
        type: "error",
      });
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

      // Update the post in state
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              isSaved: !isSaved,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error saving/unsaving post:", error);
      setToast({
        visible: true,
        message: `Failed to ${isSaved ? "unsave" : "save"} post: ${
          error.message
        }`,
        type: "error",
      });
    }
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
        <div className="absolute inset-0 blur-sm shadow-lg shadow-whitepo animate-pulse size-full"></div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader className="h-8 w-8 text-orange-500 animate-spin mb-4" />
            <p className="text-zinc-400">Loading posts...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-center my-6">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => fetchPosts()}
              className="mt-3 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

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
                  onPostLike={handlePostLike}
                  onPostSave={handlePostSave}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty state - different message based on page type */}
          {!loading && posts.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              {isSavedPage || pathname.includes("/saved") ? (
                <>
                  <BookmarkIcon className="mx-auto h-10 w-10 text-zinc-500 mb-4" />
                  <div className="text-zinc-400 text-lg">
                    No saved posts yet
                  </div>
                  <div className="text-zinc-500 mt-2">
                    Save posts you like by clicking the bookmark icon
                  </div>
                </>
              ) : pathname.includes("/discover") ? (
                <>
                  <div className="text-zinc-400 text-lg">
                    No trending posts to discover
                  </div>
                  <div className="text-zinc-500 mt-2">
                    Check back later for popular fragrances
                  </div>
                </>
              ) : (
                <>
                  <div className="text-zinc-400 text-lg">No posts yet</div>
                  <div className="text-zinc-500 mt-2">
                    {user
                      ? "Share your first fragrance to get started!"
                      : "Sign in to share your fragrances"}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Load more button */}
          {!loading && posts.length > 0 && hasMore && (
            <div className="flex justify-center my-6">
              <button
                onClick={loadMorePosts}
                disabled={isLoadingMore}
                className="px-6 py-2 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoadingMore ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Create button */}
        {user && (
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
        )}

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
