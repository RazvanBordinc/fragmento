/** @format */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Share,
  Edit3,
  Grid,
  Bookmark,
  LogOut,
  Shield,
  HelpCircle,
  Bell,
  User,
} from "lucide-react";

import FragrancePost from "../feed/view/FragrancePost";
import ProfileHeader from "./ProfileHeader";
import FollowListModal from "./FollowListModal";
import ToastNotification from "../feed/view/ToastNotification";
import LoadingOverlay from "../feed/post/LoadingOverlay";

export default function ProfilePage() {
  // User data
  const [userData, setUserData] = useState({
    id: "current-user-123",
    username: "fragrancefan",
    displayName: "Fragrance Enthusiast",
    bio: "Passionate about discovering unique scents. Coffee lover, dog person, and fragrance collector since 2018.",
    profilePic: null,
    coverPic: null,
    stats: {
      posts: 12,
      followers: 248,
      following: 156,
    },
  });

  // Posts data
  const [posts, setPosts] = useState(samplePosts);

  // UI state
  const [activeTab, setActiveTab] = useState("posts");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // Follow list modals
  const [followModal, setFollowModal] = useState({
    isOpen: false,
    type: null, // 'followers' or 'following'
    searchQuery: "",
  });

  // Manage followers/following lists
  const [followers, setFollowers] = useState(sampleFollowers);
  const [following, setFollowing] = useState(sampleFollowing);

  // Event handlers
  const handleOpenFollowModal = (type) => {
    setFollowModal({
      isOpen: true,
      type,
      searchQuery: "",
    });
  };

  const handleCloseFollowModal = () => {
    setFollowModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleRemoveFollower = async (userId) => {
    setIsLoading(true);
    setLoadingMessage("Removing follower...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Update followers list
      setFollowers((prev) => prev.filter((follower) => follower.id !== userId));

      // Update stats
      setUserData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          followers: prev.stats.followers - 1,
        },
      }));

      // Show toast
      setToast({
        visible: true,
        message: "Follower removed successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error removing follower:", error);
      setToast({
        visible: true,
        message: "Failed to remove follower",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    setIsLoading(true);
    setLoadingMessage("Unfollowing user...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Update following list
      setFollowing((prev) => prev.filter((user) => user.id !== userId));

      // Update stats
      setUserData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          following: prev.stats.following - 1,
        },
      }));

      // Show toast
      setToast({
        visible: true,
        message: "Unfollowed successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      setToast({
        visible: true,
        message: "Failed to unfollow user",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    // Would open profile edit modal in a real app
    setToast({
      visible: true,
      message: "Edit profile feature coming soon!",
      type: "success",
    });
  };

  const handleShareProfile = async () => {
    setIsLoading(true);
    setLoadingMessage("Preparing to share...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Copy profile link to clipboard
      const profileLink = `https://fragrancesocial.com/profile/${userData.username}`;
      navigator.clipboard.writeText(profileLink);

      setToast({
        visible: true,
        message: "Profile link copied to clipboard!",
        type: "success",
      });
    } catch (error) {
      console.error("Error sharing profile:", error);
      setToast({
        visible: true,
        message: "Failed to share profile",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    // Remove post from list
    setPosts((prev) => prev.filter((post) => post.id !== postId));

    // Update stats
    setUserData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        posts: prev.stats.posts - 1,
      },
    }));

    // Show toast
    setToast({
      visible: true,
      message: "Post deleted successfully",
      type: "success",
    });
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setLoadingMessage("Logging out...");
    setIsSettingsOpen(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, would redirect to login page or home
      setToast({
        visible: true,
        message: "Logged out successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Filter followers/following based on search query
  const filteredFollowers = followers.filter(
    (follower) =>
      follower.username
        .toLowerCase()
        .includes(followModal.searchQuery.toLowerCase()) ||
      follower.displayName
        .toLowerCase()
        .includes(followModal.searchQuery.toLowerCase())
  );

  const filteredFollowing = following.filter(
    (user) =>
      user.username
        .toLowerCase()
        .includes(followModal.searchQuery.toLowerCase()) ||
      user.displayName
        .toLowerCase()
        .includes(followModal.searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />

      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={closeToast}
      />

      {/* Profile header */}
      <ProfileHeader
        userData={userData}
        onOpenFollowModal={handleOpenFollowModal}
      />

      {/* Action buttons */}
      <div className="max-w-4xl mx-auto px-4 flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <motion.button
            onClick={handleEditProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white font-medium "
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Edit3 size={16} />
            <span className="cursor-pointer">Edit Profile</span>
          </motion.button>

          <motion.button
            onClick={handleShareProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 text-white font-medium"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Share size={16} />
            <span className="cursor-pointer">Share</span>
          </motion.button>
        </div>

        <div className="relative">
          <motion.button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-full hover:bg-zinc-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="cursor-pointer" size={20} />
          </motion.button>

          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-zinc-800 rounded-lg shadow-lg overflow-hidden z-10 border border-zinc-700"
                style={{ transformOrigin: "top right" }}
              >
                <div className="py-1">
                  {[
                    {
                      id: "account",
                      label: "Account Settings",
                      icon: <User size={16} />,
                    },
                    {
                      id: "notifications",
                      label: "Notifications",
                      icon: <Bell size={16} />,
                    },
                    {
                      id: "privacy",
                      label: "Privacy & Security",
                      icon: <Shield size={16} />,
                    },
                    {
                      id: "help",
                      label: "Help Center",
                      icon: <HelpCircle size={16} />,
                    },
                    {
                      id: "logout",
                      label: "Log Out",
                      icon: <LogOut size={16} />,
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={item.id === "logout" ? handleLogout : () => {}}
                      className="w-full flex items-center px-4 py-2 text-sm text-left hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <span className="mr-3 text-zinc-400">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content tabs */}
      <div className="max-w-4xl mx-auto px-4 border-b border-zinc-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 ${
              activeTab === "posts"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            } transition-colors`}
          >
            <Grid size={18} />
            <span className="font-medium cursor-pointer">Posts</span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 ${
              activeTab === "saved"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            } transition-colors`}
          >
            <Bookmark size={18} />
            <span className="font-medium cursor-pointer">Saved</span>
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "posts" && (
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                >
                  <FragrancePost
                    post={post}
                    currentUser={userData}
                    onPostDelete={handlePostDelete}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16">
                <p className="text-zinc-400 text-lg">No posts yet</p>
                <p className="text-zinc-500 mt-2">
                  Share your first fragrance to get started!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-lg">No saved posts yet</p>
            <p className="text-zinc-500 mt-2">
              Posts you save will appear here for easy reference
            </p>
          </div>
        )}
      </div>

      {/* Followers/Following Modal */}
      <FollowListModal
        isOpen={followModal.isOpen}
        onClose={handleCloseFollowModal}
        type={followModal.type}
        users={
          followModal.type === "followers"
            ? filteredFollowers
            : filteredFollowing
        }
        searchQuery={followModal.searchQuery}
        onSearchChange={(query) =>
          setFollowModal((prev) => ({ ...prev, searchQuery: query }))
        }
        onRemoveFollower={handleRemoveFollower}
        onUnfollow={handleUnfollow}
        currentUserId={userData.id}
      />
    </div>
  );
}

// Sample data
const samplePosts = [
  {
    id: "post1",
    user: {
      id: "current-user-123",
      username: "fragrancefan",
      profilePic: null,
    },
    timestamp: "3 hours ago",
    fragrance: {
      id: "frag1",
      name: "Light Blue",
      brand: "Dolce & Gabbana",
      category: "Fresh/Citrus",
      likes: 32,
      occasion: "casual",
      photos: [],
      tags: ["fresh", "summer", "citrus", "light", "everyday"],
      notes: ["Sicilian lemon", "Apple", "Cedar", "Bamboo", "White rose"],
      accords: ["Citrus", "Woody", "Fresh"],
      ratings: {
        overall: 4.5,
        longevity: 3.5,
        sillage: 3.0,
        scent: 4.8,
        value: 4.0,
      },
      seasons: {
        spring: 4,
        summer: 5,
        fall: 2,
        winter: 1,
      },
      dayNight: 70,
    },
    comments: [
      {
        id: "comment1",
        userId: "user789",
        username: "scentexplorer",
        profilePic: null,
        text: "Great review! I also love this fragrance.",
        timestamp: "2 hours ago",
        likes: 4,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: "post2",
    user: {
      id: "current-user-123",
      username: "fragrancefan",
      profilePic: null,
    },
    timestamp: "2 days ago",
    fragrance: {
      id: "frag2",
      name: "Aventus",
      brand: "Creed",
      category: "Fruity/Woody",
      likes: 78,
      occasion: "special",
      photos: [],
      tags: ["pineapple", "smoky", "luxurious", "signature", "niche"],
      notes: ["Pineapple", "Bergamot", "Birch", "Patchouli", "Musk"],
      accords: ["Fruity", "Woody", "Fresh", "Smoky"],
      ratings: {
        overall: 4.9,
        longevity: 4.5,
        sillage: 4.0,
        scent: 5.0,
        value: 3.5,
      },
      seasons: {
        spring: 4,
        summer: 4,
        fall: 4,
        winter: 3,
      },
      dayNight: 60,
    },
    comments: [
      {
        id: "comment2",
        userId: "user456",
        username: "perfumemaster",
        profilePic: null,
        text: "Classic choice! How do you like the latest batch?",
        timestamp: "1 day ago",
        likes: 2,
        isLiked: false,
        replies: [
          {
            id: "reply1",
            userId: "current-user-123",
            username: "fragrancefan",
            profilePic: null,
            text: "It's really good! I find the pineapple note more pronounced in this batch.",
            timestamp: "1 day ago",
            likes: 1,
            isLiked: false,
            replies: [],
          },
        ],
      },
    ],
  },
];

const sampleFollowers = [
  {
    id: "user123",
    username: "scent_lover",
    displayName: "Scent Enthusiast",
    profilePic: null,
    followedAt: "2023-05-12T10:30:00Z",
  },
  {
    id: "user456",
    username: "perfumemaster",
    displayName: "Perfume Master",
    profilePic: null,
    followedAt: "2023-08-22T14:15:00Z",
  },
  {
    id: "user789",
    username: "scentexplorer",
    displayName: "Scent Explorer",
    profilePic: null,
    followedAt: "2024-01-30T09:45:00Z",
  },
  {
    id: "user101",
    username: "fragrancelover",
    displayName: "Fragrance Lover",
    profilePic: null,
    followedAt: "2024-02-15T11:20:00Z",
  },
  {
    id: "user202",
    username: "aromaaddict",
    displayName: "Aroma Addict",
    profilePic: null,
    followedAt: "2024-03-05T16:40:00Z",
  },
];

const sampleFollowing = [
  {
    id: "user303",
    username: "perfumery",
    displayName: "The Perfumery",
    profilePic: null,
    followedAt: "2023-04-18T12:30:00Z",
  },
  {
    id: "user404",
    username: "scentcritic",
    displayName: "Scent Critic",
    profilePic: null,
    followedAt: "2023-07-29T15:45:00Z",
  },
  {
    id: "user505",
    username: "fragranceworld",
    displayName: "Fragrance World",
    profilePic: null,
    followedAt: "2023-10-11T08:20:00Z",
  },
  {
    id: "user606",
    username: "perfumetrends",
    displayName: "Perfume Trends",
    profilePic: null,
    followedAt: "2024-01-05T10:10:00Z",
  },
  {
    id: "user707",
    username: "scentstudio",
    displayName: "Scent Studio",
    profilePic: null,
    followedAt: "2024-03-18T14:30:00Z",
  },
];
