/** @format */
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, Reply } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const Comment = ({ comment, currentUser, onLike, onDelete, onReply }) => {
  // Check if current user is the owner of the comment
  const isOwnComment = comment.userId === currentUser.id || comment.canEdit;

  // Format the timestamp
  const formatTimestamp = (timestamp) => {
    // If it's a date string from the API, format it nicely
    if (typeof timestamp === "string" && timestamp.includes("T")) {
      try {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
      } catch (e) {
        return timestamp;
      }
    }
    // Otherwise, use the provided string (like "Just now")
    return timestamp;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className="flex items-start gap-2"
    >
      <Link
        href={`/app/${comment.user?.username || comment.username}`}
        className="cursor-pointer"
      >
        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-zinc-800 font-bold overflow-hidden flex-shrink-0">
          {comment.user?.profilePictureUrl || comment.profilePic ? (
            <img
              src={comment.user?.profilePictureUrl || comment.profilePic}
              alt={comment.user?.username || comment.username}
              className="w-full h-full object-cover"
            />
          ) : (
            (comment.user?.username || comment.username).charAt(0).toUpperCase()
          )}
        </div>
      </Link>

      <div className="flex-1">
        <motion.div
          className="bg-zinc-700/30 rounded-lg p-2"
          whileHover={{ backgroundColor: "rgba(161, 161, 170, 0.15)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-between items-start">
            <Link
              href={`/app/${comment.user?.username || comment.username}`}
              className="cursor-pointer"
            >
              <div className="text-white text-xs font-medium hover:text-orange-400 transition-colors">
                {comment.user?.username || comment.username}
              </div>
            </Link>
            <div className="text-zinc-500 text-xs">
              {formatTimestamp(comment.createdAt || comment.timestamp)}
            </div>
          </div>
          <div className="text-zinc-300 text-sm mt-1">{comment.text}</div>
        </motion.div>

        <div className="flex items-center mt-1 text-xs space-x-3">
          <button
            className={`flex items-center cursor-pointer ${
              comment.isLiked || comment.isLikedByCurrentUser
                ? "text-red-500"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
            onClick={() => onLike(comment.id)}
          >
            <motion.div
              whileTap={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Heart
                size={12}
                fill={
                  comment.isLiked || comment.isLikedByCurrentUser
                    ? "currentColor"
                    : "none"
                }
              />
            </motion.div>
            <span className="ml-1">{comment.likesCount}</span>
          </button>

          <button
            className="flex items-center text-zinc-500 hover:text-zinc-400 cursor-pointer"
            onClick={() =>
              onReply(comment.id, comment.user?.username || comment.username)
            }
          >
            <motion.div
              whileTap={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Reply size={12} />
            </motion.div>
            <span className="ml-1">Reply</span>
          </button>

          {(isOwnComment || comment.canDelete) && (
            <button
              className="flex items-center text-zinc-500 hover:text-red-400 cursor-pointer"
              onClick={() => onDelete(comment.id)}
            >
              <motion.div
                whileTap={{ scale: 1.3 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Trash2 size={12} />
              </motion.div>
              <span className="ml-1">Delete</span>
            </button>
          )}
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4 mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                onLike={onLike}
                onDelete={onDelete}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Comment;
