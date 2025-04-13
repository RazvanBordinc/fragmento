/** @format */
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, Reply } from "lucide-react";
import Link from "next/link";

const Comment = ({ comment, currentUser, onLike, onDelete, onReply }) => {
  const isOwnComment = comment.userId === currentUser.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className="flex items-start gap-2"
    >
      <Link href={`/app/${comment.username}`} className="cursor-pointer">
        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-zinc-800 font-bold overflow-hidden flex-shrink-0">
          {comment.profilePic ? (
            <img
              src={comment.profilePic}
              alt={comment.username}
              className="w-full h-full object-cover"
            />
          ) : (
            comment.username.charAt(0).toUpperCase()
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
            <Link href={`/app/${comment.username}`} className="cursor-pointer">
              <div className="text-white text-xs font-medium hover:text-orange-400 transition-colors">
                {comment.username}
              </div>
            </Link>
            <div className="text-zinc-500 text-xs">{comment.timestamp}</div>
          </div>
          <div className="text-zinc-300 text-sm mt-1">{comment.text}</div>
        </motion.div>

        <div className="flex items-center mt-1 text-xs space-x-3">
          <button
            className={`flex items-center cursor-pointer ${
              comment.isLiked
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
                fill={comment.isLiked ? "currentColor" : "none"}
              />
            </motion.div>
            <span className="ml-1">{comment.likes}</span>
          </button>

          <button
            className="flex items-center text-zinc-500 hover:text-zinc-400 cursor-pointer"
            onClick={() => onReply(comment.id, comment.username)}
          >
            <motion.div
              whileTap={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Reply size={12} />
            </motion.div>
            <span className="ml-1">Reply</span>
          </button>

          {isOwnComment && (
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

// Export as default to avoid circular dependency issues with recursion
export default Comment;
