/** @format */
"use client";
import React from "react";
import { motion } from "framer-motion";

export default function ProfileHeader({
  userData,
  onOpenFollowModal,
  isOwnProfile = true,
}) {
  // Generate a random gradient for cover image if none provided
  const randomGradient = `linear-gradient(135deg, #653d84 0%, #333399 50%, #00a8cc 100%)`;

  // Generate initials for profile picture if none provided
  const initials = userData.username.charAt(0).toUpperCase();

  return (
    <div className="mb-4">
      {/* Cover photo */}
      <div
        className="h-48 md:h-64 w-full bg-cover bg-center"
        style={{
          backgroundImage: userData.coverPic
            ? `url(${userData.coverPic})`
            : randomGradient,
        }}
      >
        {/* Empty div for cover */}
      </div>

      {/* Profile content */}
      <div className="max-w-4xl mx-auto px-4 relative">
        {/* Profile picture */}
        <div className="absolute -top-20 left-4 rounded-full border-4 border-zinc-900 overflow-hidden shadow-lg">
          <div className="w-32 h-32 bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-4xl font-semibold text-white">
            {userData.profilePic ? (
              <img
                src={userData.profilePic}
                alt={userData.username}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </div>

        {/* Profile info */}
        <div className="pt-16 pb-4">
          {/* Display username as the main title */}
          <h1 className="text-2xl font-bold text-white">
            @{userData.username}
          </h1>

          {userData.bio && (
            <p className="text-zinc-300 mb-5 max-w-xl">{userData.bio}</p>
          )}

          {/* Stats counters with hover animation */}
          <div className="flex flex-wrap gap-6 text-center">
            <motion.div
              className="cursor-pointer group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xl font-bold text-white">
                {userData.stats.posts}
              </div>
              <div className="text-zinc-400 text-sm">Posts</div>
            </motion.div>

            <motion.div
              className="cursor-pointer group"
              onClick={() => onOpenFollowModal("followers")}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xl font-bold text-white">
                {userData.stats.followers}
              </div>
              <div className="text-zinc-400 text-sm group-hover:text-orange-400 transition-colors">
                Followers
              </div>
            </motion.div>

            <motion.div
              className="cursor-pointer group"
              onClick={() => onOpenFollowModal("following")}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xl font-bold text-white">
                {userData.stats.following}
              </div>
              <div className="text-zinc-400 text-sm group-hover:text-orange-400 transition-colors">
                Following
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
