/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader,
  AlertTriangle,
  Share2,
  Flag,
  MessageSquare,
  Users,
} from "lucide-react";

import FragrancePost from "../feed/view/FragrancePost";

export default function PostDetail({ postId }) {
  const router = useRouter();

  // State for post data and loading
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  // Current user information (for commenting, etc.)
  const [currentUser, setCurrentUser] = useState({
    id: "current-user-123",
    username: "fragrancefan",
    profilePic: null,
  });

  // Fetch post data when component mounts
  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real app, this would be an API call to get the post data
        // For now, we'll simulate a delay and use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Find the post in our sample data
        const foundPost = samplePosts.find((p) => p.id === postId);

        if (foundPost) {
          setPost(foundPost);

          // Find related posts (same brand or similar notes)
          const related = samplePosts
            .filter(
              (p) =>
                p.id !== postId &&
                (p.fragrance.brand === foundPost.fragrance.brand ||
                  p.fragrance.accords.some((accord) =>
                    foundPost.fragrance.accords.includes(accord)
                  ))
            )
            .slice(0, 2); // Limit to 2 related posts

          setRelatedPosts(related);
        } else {
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post data");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostData();
    }
  }, [postId]);

  // Handle going back
  const handleGoBack = () => {
    router.back(); // Go back to previous page
  };

  // Handle sharing
  const handleShare = async () => {
    try {
      // In a real app, you'd use Web Share API or copy to clipboard
      await navigator.clipboard.writeText(
        `https://fragmento.com/app/post/${postId}`
      );
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // Handle reporting
  const handleReport = () => {
    // In a real app, you'd open a report modal or navigate to report page
    alert("Report feature would open here");
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
                <FragrancePost post={post} currentUser={currentUser} />
              </div>

              {/* Post metadata */}
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-8">
                <h2 className="text-white font-medium mb-3 flex items-center">
                  <MessageSquare size={18} className="text-orange-500 mr-2" />
                  Post Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-zinc-300 text-sm">
                    <span className="text-zinc-500 mr-2">Posted by:</span>
                    <Link
                      href={`/app/${post.user.username}`}
                      className="text-orange-400 hover:underline cursor-pointer"
                    >
                      @{post.user.username}
                    </Link>
                  </div>
                  <div className="flex items-center text-zinc-300 text-sm">
                    <span className="text-zinc-500 mr-2">Posted:</span>
                    <span>{post.timestamp}</span>
                  </div>
                  <div className="flex items-center text-zinc-300 text-sm">
                    <span className="text-zinc-500 mr-2">Comments:</span>
                    <span>{post.comments ? post.comments.length : 0}</span>
                  </div>
                  <div className="flex items-center text-zinc-300 text-sm">
                    <span className="text-zinc-500 mr-2">Likes:</span>
                    <span>{post.fragrance.likes}</span>
                  </div>
                </div>
              </div>

              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div>
                  <h2 className="text-white font-medium mb-4 flex items-center">
                    <Users size={18} className="text-orange-500 mr-2" />
                    Related Posts
                  </h2>

                  <div className="space-y-6">
                    {relatedPosts.map((relatedPost) => (
                      <motion.div
                        key={relatedPost.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FragrancePost
                          post={relatedPost}
                          currentUser={currentUser}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sample posts data - same as in previous components
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
            replies: [],
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
  {
    id: "post123",
    user: {
      id: "user654",
      username: "aromatic_adventures",
      profilePic: null,
    },
    timestamp: "4 days ago",
    fragrance: {
      id: "frag4",
      name: "Light Blue",
      brand: "Dolce & Gabbana",
      category: "Fresh/Citrus",
      description:
        "Just picked this up for the summer and absolutely love it. The citrus notes are perfectly balanced with the musk base. Great for hot days when you want something refreshing but still distinctive.",
      likes: 189,
      occasion: "casual",
      photo:
        "https://images.unsplash.com/photo-1622618991746-fe6004db3a47?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3",
      tags: ["fresh", "summer", "citrus", "light", "everyday"],
      notes: ["Sicilian lemon", "Apple", "Cedar", "White rose"],
      accords: ["Citrus", "Fresh", "Aquatic"],
      ratings: {
        overall: 4.3,
        longevity: 3.0,
        sillage: 3.2,
        scent: 4.8,
        value: 4.2,
      },
      seasons: {
        spring: 4,
        summer: 5,
        fall: 2,
        winter: 1,
      },
      dayNight: 80,
    },
    comments: [
      {
        id: "comment-a1",
        userId: "current-user-123",
        username: "fragrancefan",
        profilePic: null,
        text: "Great choice! How's the longevity for you?",
        timestamp: "3 days ago",
        likes: 7,
        isLiked: false,
        replies: [
          {
            id: "reply-a1",
            userId: "user654",
            username: "aromatic_adventures",
            profilePic: null,
            text: "About 4-5 hours in hot weather. I carry a small decant for reapplication!",
            timestamp: "3 days ago",
            likes: 2,
            isLiked: false,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: "post456",
    user: {
      id: "user789",
      username: "scentexplorer",
      profilePic: null,
    },
    timestamp: "1 week ago",
    fragrance: {
      id: "frag5",
      name: "Aventus",
      brand: "Creed",
      category: "Fruity/Chypre",
      description:
        "After saving up for months, I finally got my bottle of Aventus. The hype is real! The pineapple opening is incredible, and the dry down is sophisticated and complex. Perfect for important occasions when you want to make an impression.",
      likes: 327,
      occasion: "special",
      photo:
        "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
      tags: ["pineapple", "smoky", "niche", "luxury", "signature"],
      notes: ["Pineapple", "Blackcurrant", "Birch", "Ambergris", "Vanilla"],
      accords: ["Fruity", "Smoky", "Woody"],
      ratings: {
        overall: 5.0,
        longevity: 4.5,
        sillage: 4.7,
        scent: 5.0,
        value: 3.5,
      },
      seasons: {
        spring: 3,
        summer: 4,
        fall: 5,
        winter: 3,
      },
      dayNight: 65,
    },
    comments: [
      {
        id: "comment-b1",
        userId: "user456",
        username: "perfumemaster",
        profilePic: null,
        text: "Great choice! Which batch did you get?",
        timestamp: "6 days ago",
        likes: 15,
        isLiked: false,
        replies: [],
      },
      {
        id: "comment-b2",
        userId: "user999",
        username: "fragranceboutique",
        profilePic: null,
        text: "The king of fragrances for a reason. Enjoy it!",
        timestamp: "5 days ago",
        likes: 8,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: "post789",
    user: {
      id: "user999",
      username: "fragranceboutique",
      profilePic: null,
    },
    timestamp: "2 weeks ago",
    fragrance: {
      id: "frag6",
      name: "Oud Wood",
      brand: "Tom Ford",
      category: "Woody/Oriental",
      description:
        "Oud Wood is the epitome of sophistication. A true masterclass in blending traditional oud with modern sensibilities. The wood and spice combination creates an aura of mystery and luxury that's perfect for evening events and special occasions.",
      likes: 412,
      occasion: "formal",
      photo:
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3",
      tags: ["oud", "tom ford", "woody", "spicy", "formal"],
      notes: ["Oud", "Rosewood", "Cardamom", "Amber", "Tonka Bean"],
      accords: ["Woody", "Spicy", "Warm", "Oriental"],
      ratings: {
        overall: 4.9,
        longevity: 4.7,
        sillage: 4.3,
        scent: 5.0,
        value: 3.2,
      },
      seasons: {
        spring: 2,
        summer: 1,
        fall: 5,
        winter: 5,
      },
      dayNight: 25,
    },
    comments: [
      {
        id: "comment-c1",
        userId: "user321",
        username: "oudlover",
        profilePic: null,
        text: "The best oud fragrance on the market, hands down!",
        timestamp: "13 days ago",
        likes: 31,
        isLiked: true,
        replies: [],
      },
      {
        id: "comment-c2",
        userId: "current-user-123",
        username: "fragrancefan",
        profilePic: null,
        text: "I've been wanting to try this. Is it worth the price?",
        timestamp: "10 days ago",
        likes: 7,
        isLiked: false,
        replies: [
          {
            id: "reply-c1",
            userId: "user999",
            username: "fragranceboutique",
            profilePic: null,
            text: "Absolutely! A little goes a long way, so the bottle lasts forever.",
            timestamp: "10 days ago",
            likes: 5,
            isLiked: false,
            replies: [],
          },
        ],
      },
    ],
  },
];
