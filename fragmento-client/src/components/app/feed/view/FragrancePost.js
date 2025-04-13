/** @format */
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Droplets,
  Sparkles,
  Star,
  Wind,
  Clock4,
  SprayCan,
  Gem,
  CalendarDays,
  ArrowUp,
  ArrowDown,
  Leaf,
} from "lucide-react";

import LoadingOverlay from "../post/LoadingOverlay";
import PostMenu from "../post/PostMenu";
import RatingStars from "./RatingStars";
import CollapsibleSection from "./CollapsibileSection";
import SeasonIndicator from "./SeasonIndicator";
import DayNightIndicator from "./DayNightIndicator";
import CommentsSection from "./CommentSection";

// Enhanced detection functions for "Not specified" values

// Helper function to check if ratings were explicitly set by user
const wasRatingSpecified = (ratings) => {
  if (!ratings) return false;

  // For version 1 of your app, let's consider:
  // 1. If all ratings have exactly the same value, they might be default unmodified values
  // 2. If ratings object doesn't have expected keys or they're all 0, they're unspecified

  // Get detailed ratings (excluding overall)
  const detailedRatings = Object.entries(ratings).filter(
    ([key]) => key !== "overall"
  );

  if (detailedRatings.length === 0) return false;

  // Get all values to check if they're all the same
  const values = detailedRatings.map(([_, value]) => value);
  const uniqueValues = new Set(
    values.filter((v) => v !== null && v !== undefined)
  );

  // If all values are the same, they might be defaults (unless they're different from 5)
  if (uniqueValues.size === 1) {
    // If the only value is 5 (possible default), return false
    return uniqueValues.has(5) ? false : true;
  }

  // If we have different values, user probably specified them
  return uniqueValues.size > 0;
};

// Helper function to check if seasons were explicitly set by user
const wereSeasonsSpecified = (seasons) => {
  if (!seasons) return false;

  // Get an array of season values
  const seasonValues = Object.values(seasons).filter(
    (v) => v !== null && v !== undefined
  );

  if (seasonValues.length === 0) return false;

  // Check if we have a mix of values (suggesting user customization)
  const uniqueValues = new Set(seasonValues);

  // If all seasons have the same value and it's a common default, likely unspecified
  if (uniqueValues.size === 1) {
    const value = seasonValues[0];
    // If all seasons are 5 or 3 (common defaults), consider unspecified
    return !(value === 3 || value === 5);
  }

  // If we have different values, user probably specified them
  return uniqueValues.size > 1;
};

// Helper function to check if day/night preference was explicitly set
const wasDayNightSpecified = (dayNight) => {
  // 50 might be the default (middle value for 0-100 scale)
  // 5 might be the default on a 0-10 scale
  if (dayNight === null || dayNight === undefined) return false;

  // Handle both 0-10 and 0-100 scales
  return dayNight !== 50 && dayNight !== 5;
};

const areAccordsSpecified = (accords) => {
  return Array.isArray(accords) && accords.length > 0;
};

const areNotesSpecified = (notes) => {
  return Array.isArray(notes) && notes.length > 0;
};

// Notes section component to organize notes by category
const NotesSection = ({ notes }) => {
  if (!areNotesSpecified(notes)) {
    return (
      <div className="text-center py-3 text-zinc-500">Notes not specified</div>
    );
  }

  // Helper function to group notes by category
  const groupNotesByCategory = (notes) => {
    const grouped = { top: [], middle: [], base: [], unspecified: [] };

    notes.forEach((note) => {
      if (typeof note === "object" && note.category) {
        grouped[note.category].push(note.name);
      } else if (typeof note === "string") {
        grouped.unspecified.push(note);
      } else if (typeof note === "object") {
        grouped.unspecified.push(note.name);
      }
    });

    return grouped;
  };

  // Category definitions with icons and colors
  const categories = {
    top: {
      name: "Top Notes",
      icon: <ArrowUp size={16} className="text-blue-400" />,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    middle: {
      name: "Middle Notes",
      icon: <Leaf size={16} className="text-green-400" />,
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    base: {
      name: "Base Notes",
      icon: <ArrowDown size={16} className="text-amber-400" />,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    unspecified: {
      name: "Notes",
      icon: <Droplets size={16} className="text-zinc-400" />,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
  };

  const groupedNotes = groupNotesByCategory(notes);

  return (
    <div className="space-y-4">
      {Object.entries(groupedNotes).map(
        ([category, categoryNotes]) =>
          categoryNotes.length > 0 && (
            <div key={category} className="space-y-2">
              <div className="flex items-center text-zinc-300 text-sm font-medium">
                {categories[category].icon}
                <span className="ml-1">{categories[category].name}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categoryNotes.map((note, index) => (
                  <span
                    key={index}
                    className={`inline-block px-2 py-0.5 rounded-full ${categories[category].color} text-xs border`}
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default function FragrancePost({
  post,
  currentUser,
  onPostDelete,
  onPostEdit,
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.fragrance.likes);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");

  const ratingIcons = [<Wind />, <Clock4 />, <SprayCan />, <Gem />];
  // Map of occasion IDs to emoji and text
  const occasions = {
    casual: { emoji: "👕", label: "Casual" },
    office: { emoji: "💼", label: "Office/Work" },
    date: { emoji: "💖", label: "Date Night" },
    formal: { emoji: "🤵", label: "Formal Event" },
    party: { emoji: "🎉", label: "Party" },
    outdoors: { emoji: "🌲", label: "Outdoors" },
    sport: { emoji: "🏃‍♂️", label: "Sport/Gym" },
    beach: { emoji: "🏖️", label: "Beach" },
    vacation: { emoji: "✈️", label: "Vacation" },
    special: { emoji: "🎭", label: "Special Occasion" },
    relaxing: { emoji: "🏠", label: "Relaxing at Home" },
  };

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  // Post action handlers
  const onDeletePost = async (postId) => {
    setIsLoading(true);
    setLoadingAction("Deleting post...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Call the parent component's handler if provided
      if (onPostDelete) {
        onPostDelete(postId);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      // Here you would handle errors
    } finally {
      setIsLoading(false);
    }
  };

  const onEditPost = (postId) => {
    // Call the parent component's handler if provided
    if (onPostEdit) {
      onPostEdit(postId, post);
    }
  };

  const onReportPost = async (postId) => {
    setIsLoading(true);
    setLoadingAction("Submitting report...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert("Thank you for your report. We'll review this post.");
    } catch (error) {
      console.error("Error reporting post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-md border border-zinc-700/70 relative">
      <LoadingOverlay
        isLoading={isLoading}
        message={loadingAction}
        subMessage="Please wait a moment..."
      />
      {/* User info header */}
      <div className="p-3 flex items-center justify-between border-b border-zinc-700/60">
        <div className="flex items-center">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-zinc-800 font-bold overflow-hidden">
            {post.user.profilePic ? (
              <img
                src={post.user.profilePic}
                alt={post.user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              post.user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="ml-2">
            <div className="text-white font-medium text-sm">
              {post.user.username}
            </div>
            <div className="text-zinc-500 text-xs">{post.timestamp}</div>
          </div>
        </div>{" "}
        <PostMenu
          postId={post.id}
          isOwnPost={post.user.id === currentUser.id}
          onEdit={onEditPost}
          onDelete={onDeletePost}
          onReport={onReportPost}
        />
      </div>

      {/* Fragrance basic info */}
      <div className="px-4 py-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">
              {post.fragrance.name}
            </h3>
            <div className="flex items-center text-zinc-400">
              <span className="text-sm">{post.fragrance.brand}</span>
              <span className="mx-1">•</span>
              <span className="text-sm">{post.fragrance.category}</span>
            </div>
          </div>

          <div className="flex items-center">
            <RatingStars value={post.fragrance.ratings.overall} />
          </div>
        </div>

        {/* Occasion badge */}
        {post.fragrance.occasion && occasions[post.fragrance.occasion] ? (
          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-zinc-700/70 text-sm">
            <span className="mr-1">
              {occasions[post.fragrance.occasion].emoji}
            </span>
            <span className="text-zinc-300">
              {occasions[post.fragrance.occasion].label}
            </span>
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-zinc-700/70 text-sm">
            <span className="text-zinc-500">Occasion not specified</span>
          </div>
        )}

        {/* Images would go here */}
        {post.fragrance.photos && post.fragrance.photos.length > 0 ? (
          <div className="mt-3 flex gap-1 overflow-x-auto pb-2">
            {post.fragrance.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={post.fragrance.name}
                className="h-64 rounded-md object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 h-64 bg-gradient-to-br from-zinc-700/60 to-zinc-800/70 rounded-md flex items-center justify-center">
            <div className="text-zinc-500 text-lg font-medium">No Images</div>
          </div>
        )}
      </div>

      {/* Tags section - always visible */}
      <div className="px-4 py-2 flex flex-wrap gap-1">
        {post.fragrance.tags && post.fragrance.tags.length > 0 ? (
          post.fragrance.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-zinc-500 text-sm">Tags not specified</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-2 flex items-center justify-between border-t border-zinc-700/60">
        <div className="flex items-center space-x-4">
          <button
            className={`flex items-center cursor-pointer ${
              liked ? "text-red-500" : "text-zinc-400 hover:text-zinc-300"
            }`}
            onClick={handleLike}
          >
            <motion.div
              whileTap={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Heart
                className="h-5 w-5"
                fill={liked ? "currentColor" : "none"}
              />
            </motion.div>
            <span className="ml-1 text-xs">{likeCount}</span>
          </button>

          <button className="flex items-center cursor-pointer text-zinc-400 hover:text-zinc-300">
            <motion.div
              whileTap={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <MessageCircle className="h-5 w-5" />
            </motion.div>
            <span className="ml-1 text-xs">
              {post.comments ? post.comments.length : 0}
            </span>
          </button>

          <button className="flex items-center cursor-pointer text-zinc-400 hover:text-zinc-300">
            <motion.div
              whileTap={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Share2 className="h-5 w-5" />
            </motion.div>
          </button>
        </div>

        <button
          className={`cursor-pointer ${
            saved ? "text-yellow-500" : "text-zinc-400 hover:text-zinc-300"
          }`}
          onClick={() => setSaved(!saved)}
        >
          <motion.div
            whileTap={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Bookmark
              className="h-5 w-5"
              fill={saved ? "currentColor" : "none"}
            />
          </motion.div>
        </button>
      </div>

      {/* Collapsible sections */}
      <div className="px-4">
        {/* Notes section */}
        <CollapsibleSection
          title="Notes"
          icon={<Droplets size={16} />}
          color="text-blue-400"
        >
          <NotesSection notes={post.fragrance.notes} />
        </CollapsibleSection>

        {/* Accords section */}
        <CollapsibleSection
          title="Accords"
          icon={<Sparkles size={16} />}
          color="text-purple-400"
        >
          {areAccordsSpecified(post.fragrance.accords) ? (
            <div className="flex flex-wrap gap-1.5">
              {post.fragrance.accords.map((accord, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20"
                >
                  {accord}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-zinc-500">
              Accords not specified
            </div>
          )}
        </CollapsibleSection>

        {/* Detailed ratings section - with enhanced detection */}
        <CollapsibleSection
          title="Detailed Ratings"
          icon={<Star size={16} />}
          color="text-yellow-400"
        >
          {wasRatingSpecified(post.fragrance.ratings) ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(post.fragrance.ratings)
                .filter(([key]) => key !== "overall")
                .map(([key, value], index) => (
                  <div
                    key={key}
                    className="flex items-center justify-between  shadow px-3 rounded-md bg-orange-500/10 py-2 text-orange-200"
                  >
                    <span className="capitalize flex items-center gap-1 md:gap-2 text-xs md:text-base">
                      <span className="text-orange-200 scale-90 md:scale-100">
                        {ratingIcons[index]}
                      </span>
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    {value !== null && value !== undefined && value > 0 ? (
                      <RatingStars post={true} value={value} />
                    ) : (
                      <span className="text-zinc-400 text-xs">
                        Not specified
                      </span>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-3 text-zinc-500">
              Detailed ratings not specified
            </div>
          )}
        </CollapsibleSection>

        {/* Seasons & Day/Night section - with enhanced detection */}
        <CollapsibleSection
          title="Seasonal & Time Fit"
          icon={<CalendarDays size={16} />}
          color="text-green-400"
        >
          {wereSeasonsSpecified(post.fragrance.seasons) ||
          wasDayNightSpecified(post.fragrance.dayNight) ? (
            <div className="space-y-3">
              {wereSeasonsSpecified(post.fragrance.seasons) ? (
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-300 text-xs mb-2 uppercase font-bold">
                    Seasons:
                  </span>
                  <SeasonIndicator seasons={post.fragrance.seasons} />
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-300 text-xs mb-2 uppercase font-bold">
                    Seasons:
                  </span>
                  <div className="text-zinc-500 text-sm">Not specified</div>
                </div>
              )}

              {wasDayNightSpecified(post.fragrance.dayNight) ? (
                <div className="flex flex-col gap-1 mt-5">
                  <span className="text-zinc-300 text-xs font-bold">
                    <span className="px-2 py-0.5 bg-yellow-700 rounded-full text-yellow-200 uppercase">
                      Day
                    </span>{" "}
                    /{" "}
                    <span className="px-2 py-0.5 bg-stone-700 rounded-full text-stone-200 uppercase">
                      Night
                    </span>{" "}
                    Preference:
                  </span>
                  <DayNightIndicator value={post.fragrance.dayNight} />
                </div>
              ) : (
                <div className="flex flex-col gap-1 mt-5">
                  <span className="text-zinc-300 text-xs font-bold">
                    Day/Night Preference:
                  </span>
                  <div className="text-zinc-500 text-sm">Not specified</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-3 text-zinc-500">
              Seasonal & Day/Night preferences not specified
            </div>
          )}
        </CollapsibleSection>
      </div>

      {/* Comments section */}
      <CommentsSection
        postId={post.id}
        initialComments={post.comments || []}
        currentUser={
          currentUser || {
            id: "current-user",
            username: "You",
            profilePic: null,
          }
        }
      />
    </div>
  );
}
