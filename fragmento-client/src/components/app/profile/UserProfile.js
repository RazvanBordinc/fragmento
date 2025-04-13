/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Grid, Heart, Flag, UserPlus, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";

import FragrancePost from "../feed/view/FragrancePost";
import ProfileHeader from "./ProfileHeader";
import FollowListModal from "./FollowListModal";
import ToastNotification from "../feed/view/ToastNotification";
import LoadingOverlay from "../feed/post/LoadingOverlay";
import SignatureFragrance from "./SignatureFragrance";

export default function UserProfile({ username }) {
  const router = useRouter();

  // State for current user (the viewer)
  const [currentUser, setCurrentUser] = useState({
    id: "current-user-123",
    username: "fragrancefan",
    profilePic: null,
  });

  // Profile user data (the profile being viewed)
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading profile...");
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
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

  // Posts data
  const [posts, setPosts] = useState([]);

  // Manage followers/following lists
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setLoadingMessage("Loading profile...");

      try {
        // In a real app, this would be an API call
        // For now, let's simulate a delay and use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Find user in sample data
        const user = sampleUsers.find(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );

        if (user) {
          setUserData(user);
          setPosts(
            samplePosts.filter(
              (post) =>
                post.user.username.toLowerCase() === username.toLowerCase()
            )
          );
          setFollowers(user.followers || []);
          setFollowing(user.following || []);

          // Check if current user is following this profile
          setIsFollowing(user.followers.some((f) => f.id === currentUser.id));
        } else {
          //do something
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Handle error state
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username, router]);

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

  const handleToggleFollow = async () => {
    setIsLoading(true);
    setLoadingMessage(isFollowing ? "Unfollowing..." : "Following...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (isFollowing) {
        // Remove current user from followers
        setFollowers((prev) => prev.filter((f) => f.id !== currentUser.id));

        // Update user stats
        setUserData((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers - 1,
          },
        }));

        setToast({
          visible: true,
          message: `Unfollowed @${userData.username}`,
          type: "success",
        });
      } else {
        // Add current user to followers
        const newFollower = {
          id: currentUser.id,
          username: currentUser.username,
          profilePic: currentUser.profilePic,
          followedAt: new Date().toISOString(),
        };

        setFollowers((prev) => [...prev, newFollower]);

        // Update user stats
        setUserData((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers + 1,
          },
        }));

        setToast({
          visible: true,
          message: `Now following @${userData.username}`,
          type: "success",
        });
      }

      // Toggle following state
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      setToast({
        visible: true,
        message: "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareProfile = async () => {
    setIsLoading(true);
    setLoadingMessage("Preparing to share...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Copy profile link to clipboard
      const profileLink = `https://fragrancesocial.com/app/${userData.username}`;
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

  const handleReportUser = async () => {
    setIsLoading(true);
    setLoadingMessage("Submitting report...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setToast({
        visible: true,
        message: "Thank you for your report. We'll review this account.",
        type: "success",
      });
    } catch (error) {
      console.error("Error reporting user:", error);
      setToast({
        visible: true,
        message: "Failed to submit report",
        type: "error",
      });
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

  if (isLoading && !userData) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <LoadingOverlay isLoading={true} message={loadingMessage} />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
          <p className="text-zinc-400">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

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
        isOwnProfile={false}
      />

      {/* Action buttons */}
      <div className="max-w-4xl mx-auto px-4 flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <motion.button
            onClick={handleToggleFollow}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer ${
              isFollowing
                ? "bg-zinc-700 text-white"
                : "bg-orange-600 text-white"
            }`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isFollowing ? (
              <>
                <UserMinus size={16} />
                <span>Unfollow</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Follow</span>
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleShareProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 text-white font-medium cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Share size={16} />
            <span>Share</span>
          </motion.button>
        </div>

        <motion.button
          onClick={handleReportUser}
          className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-zinc-800 text-zinc-400 cursor-pointer"
          whileHover={{ scale: 1.03, color: "#f97316" }}
          whileTap={{ scale: 0.97 }}
        >
          <Flag size={16} />
          <span className="hidden sm:inline">Report</span>
        </motion.button>
      </div>

      {/* Signature Fragrance Section */}
      {userData.signatureFragrance && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <SignatureFragrance fragrance={userData.signatureFragrance} />
        </div>
      )}

      {/* Content tabs */}
      <div className="max-w-4xl mx-auto px-4 border-b border-zinc-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 cursor-pointer ${
              activeTab === "posts"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            } transition-colors`}
          >
            <Grid size={18} />
            <span className="font-medium">Posts</span>
          </button>

          <button
            onClick={() => setActiveTab("liked")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 cursor-pointer ${
              activeTab === "liked"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            } transition-colors`}
          >
            <Heart size={18} />
            <span className="font-medium">Liked</span>
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
                  <FragrancePost post={post} currentUser={currentUser} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16">
                <p className="text-zinc-400 text-lg">No posts yet</p>
                <p className="text-zinc-500 mt-2">
                  {userData.username} hasn't shared any fragrances yet
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-lg">No liked posts to show</p>
            <p className="text-zinc-500 mt-2">
              Fragrances that {userData.username} likes will appear here
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
        onRemoveFollower={() => {}} // Not allowed on another user's profile
        onUnfollow={() => {}} // Not allowed on another user's profile
        currentUserId={currentUser.id}
        isOwnProfile={false}
      />
    </div>
  );
}

// Sample users data
const sampleUsers = [
  {
    id: "user456",
    username: "perfumemaster",
    bio: "Luxury fragrance collector and reviewer. 10+ years of experience in the perfume industry.",
    profilePic: null,
    coverPic: null,
    stats: {
      posts: 87,
      followers: 1248,
      following: 342,
    },
    signatureFragrance: {
      name: "Tobacco Vanille",
      brand: "Tom Ford",
      category: "Eau de Parfum",
      photo:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3",
      description:
        "My absolute signature for fall and winter. Rich, warm and distinctive.",
      notes: ["Tobacco Leaf", "Vanilla", "Cacao", "Tonka Bean", "Dried Fruits"],
    },
    followers: [
      {
        id: "current-user-123",
        username: "fragrancefan",
        profilePic: null,
        followedAt: "2023-09-15T14:32:21Z",
      },
    ],
    following: [
      {
        id: "user789",
        username: "scentexplorer",
        profilePic: null,
        followedAt: "2023-08-12T10:15:43Z",
      },
    ],
  },
  {
    id: "user789",
    username: "scentexplorer",
    bio: "Exploring unique fragrances from around the world. Niche perfume enthusiast.",
    profilePic: null,
    coverPic: null,
    stats: {
      posts: 42,
      followers: 573,
      following: 201,
    },
    signatureFragrance: {
      name: "Aventus",
      brand: "Creed",
      category: "Eau de Parfum",
      photo:
        "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
      description: "My go-to signature fragrance that always gets compliments.",
      notes: ["Pineapple", "Bergamot", "Black Currant", "Apple", "Birch"],
    },
    followers: [],
    following: [],
  },
  {
    id: "user999",
    username: "fragranceboutique",
    bio: "Official account of The Fragrance Boutique. Luxury and niche perfumes.",
    profilePic: null,
    coverPic: null,
    stats: {
      posts: 156,
      followers: 4892,
      following: 103,
    },
    signatureFragrance: {
      name: "Baccarat Rouge 540",
      brand: "Maison Francis Kurkdjian",
      category: "Extrait de Parfum",
      photo:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3",
      description: "The scent that defines our boutique's atmosphere.",
      notes: ["Saffron", "Jasmine", "Cedarwood", "Ambergris", "Fir Resin"],
    },
    followers: [],
    following: [],
  },
];

// Sample posts data - same as in your original code but with clickable users
// These are the posts that will appear on the user profiles
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
      dayNight: 70,
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
            replies: [],
          },
        ],
      },
      {
        id: "comment2",
        userId: "current-user-123",
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
      dayNight: 30,
    },
    comments: [
      {
        id: "comment3",
        userId: "user789",
        username: "scentexplorer",
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
      id: "user789",
      username: "scentexplorer",
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
