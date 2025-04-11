/** @format */
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserMinus, UserX } from "lucide-react";

export default function FollowListModal({
  isOpen,
  onClose,
  type,
  users,
  searchQuery,
  onSearchChange,
  onRemoveFollower,
  onUnfollow,
  currentUserId,
}) {
  // Calculate date display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years > 1 ? "s" : ""} ago`;
    }
  };

  // Generate initials for profile picture
  const getInitials = (displayName) => {
    return displayName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
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
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xl bg-zinc-900 rounded-xl overflow-hidden shadow-xl border border-zinc-700"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-zinc-800 p-4 flex justify-between items-center border-b border-zinc-700">
              <h2 className="text-lg font-semibold text-white capitalize">
                {type}
              </h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search input */}
            <div className="p-4 border-b border-zinc-700/50">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${type}...`}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">
                  <Search size={18} />
                </div>
              </div>
            </div>

            {/* User list */}
            <div className="max-h-96 overflow-y-auto">
              {users.length > 0 ? (
                <ul className="divide-y divide-zinc-800">
                  {users.map((user) => (
                    <motion.li
                      key={user.id}
                      className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                      whileHover={{ backgroundColor: "rgba(41, 37, 46, 0.7)" }}
                      layout
                    >
                      <div className="flex items-center">
                        {/* User avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center text-base font-semibold text-white">
                          {user.profilePic ? (
                            <img
                              src={user.profilePic}
                              alt={user.displayName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(user.displayName)
                          )}
                        </div>

                        {/* User info */}
                        <div className="ml-3">
                          <div className="font-medium text-white">
                            {user.displayName}
                          </div>
                          <div className="text-sm text-zinc-400">
                            @{user.username}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {type === "followers"
                              ? "Followed you"
                              : "Following since"}{" "}
                            {formatDate(user.followedAt)}
                          </div>
                        </div>
                      </div>

                      {/* Action button */}
                      {user.id !== currentUserId && (
                        <motion.button
                          className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                            type === "followers"
                              ? "bg-red-900/20 text-red-400 hover:bg-red-900/40"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          } transition-colors`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            type === "followers"
                              ? onRemoveFollower(user.id)
                              : onUnfollow(user.id)
                          }
                        >
                          {type === "followers" ? (
                            <>
                              <UserX size={14} />
                              <span className="cursor-pointer">Remove</span>
                            </>
                          ) : (
                            <>
                              <UserMinus size={14} />
                              <span className="cursor-pointer">Unfollow</span>
                            </>
                          )}
                        </motion.button>
                      )}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-zinc-400 text-center">
                    {searchQuery
                      ? `No ${type} found matching "${searchQuery}"`
                      : `No ${type} yet`}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
