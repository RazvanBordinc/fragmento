/** @format */
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Share,
  Edit3,
  Grid,
  LogOut,
  HelpCircle,
  User,
  Heart,
} from "lucide-react";

import FragrancePost from "../feed/view/FragrancePost";
import ProfileHeader from "./ProfileHeader";
import FollowListModal from "./FollowListModal";
import ToastNotification from "../feed/view/ToastNotification";
import LoadingOverlay from "../feed/post/LoadingOverlay";
import ProfileEditModal from "./ProfileEditModal";

export default function ProfilePage() {
  // User data - removed displayName field
  const [userData, setUserData] = useState({
    id: "current-user-123",
    username: "fragrancefan",
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

  // Profile edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  // Updated to open the edit modal
  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  // Handle profile update from modal
  const handleSaveProfile = (updatedUserData) => {
    setUserData(updatedUserData);

    // Show success toast
    setToast({
      visible: true,
      message: "Profile updated successfully!",
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
  const filteredFollowers = followers.filter((follower) =>
    follower.username
      .toLowerCase()
      .includes(followModal.searchQuery.toLowerCase())
  );

  const filteredFollowing = following.filter((user) =>
    user.username.toLowerCase().includes(followModal.searchQuery.toLowerCase())
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white font-medium"
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
            <Heart size={18} />
            <span className="font-medium cursor-pointer">Liked</span>
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

      {/* Profile edit modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
        onSave={handleSaveProfile}
      />

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

// Sample data - updated to remove displayName
// Sample posts data with descriptions and comments included
// Sample posts data with single photo and descriptions
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
      description:
        "Light Blue by Dolce & Gabbana is my go-to summer fragrance. I discovered it during a trip to Italy last year, and it perfectly captures that Mediterranean vibe. The Sicilian lemon and apple notes create such a refreshing experience, and I've received numerous compliments when wearing it. It's not the longest-lasting fragrance, but the scent is so perfect for hot days that I don't mind reapplying. If you're looking for something light but distinctive, this is definitely worth trying!",
      likes: 245,
      occasion: "casual",
      // Single photo instead of photos array
      photo:
        "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3",
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
      description:
        "Tom Ford's Oud Wood is a masterpiece of modern perfumery. The first time I wore it to a formal dinner, I immediately felt more sophisticated and confident. The blend of rare oud wood with rosewood and cardamom creates a warm, mysterious aura that's perfect for evening events. Though quite expensive, a little goes a long way, and the compliments make it worth every penny. I particularly love wearing this during fall and winter months when the woody notes seem to shine even more. Definitely a signature-worthy scent for those who appreciate luxury fragrances.",
      likes: 384,
      occasion: "formal",
      // Single photo instead of photos array
      photo:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3",
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
      description:
        "Creed Aventus has been my special occasion fragrance for years now. From my wedding day to important business meetings, this scent never fails to make an impression. The opening blast of pineapple balanced with smoky birch creates a unique contrast that evolves beautifully throughout the day. While batch variations exist, I've found the core DNA remains consistent. Yes, it comes with a hefty price tag, but the confidence it gives me and the memories associated with it make Aventus worth the investment. A true modern classic that deserves its legendary status.",
      likes: 512,
      occasion: "special",
      // Single photo instead of photos array
      photo:
        "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
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
