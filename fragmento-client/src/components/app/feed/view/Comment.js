/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, Reply, Edit, X, Save, Loader } from "lucide-react";
import Link from "next/link";
import { CommentsApi } from "@/lib/comments/CommentsApi";

const Comment = ({
  comment,
  currentUser,
  onLike,
  onDelete,
  onReply,
  onLoadReplies,
  formatTimestamp,
  isProcessing = false,
  hasLoadedAllReplies = false,
  level = 0, // Track nesting depth
}) => {
  // States for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Check if current user is the owner of the comment (can edit/delete)
  const isOwnComment =
    comment.canEdit ||
    comment.isOwner ||
    comment.userId === currentUser?.id ||
    comment.user?.id === currentUser?.id;

  // Check if comment is liked by current user - check BOTH properties to handle inconsistencies
  const isLiked = comment.isLiked || comment.isLikedByCurrentUser;

  // Maximum nesting level to prevent excessive nesting
  const MAX_NESTING_LEVEL = 5;

  // Load nested replies if needed
  useEffect(() => {
    // If this comment has replies but they're not loaded and we haven't already tried loading them
    if (
      comment.repliesCount > 0 &&
      (!comment.replies || comment.replies.length < comment.repliesCount) &&
      !hasLoadedAllReplies &&
      !isProcessing &&
      onLoadReplies
    ) {
      console.log(
        `Comment ${comment.id} has ${comment.repliesCount} replies but only ${
          comment.replies?.length || 0
        } are loaded. Loading more replies.`
      );

      // Load the replies
      onLoadReplies(comment.id);
    }
  }, [
    comment.id,
    comment.repliesCount,
    comment.replies,
    hasLoadedAllReplies,
    isProcessing,
    onLoadReplies,
  ]);

  // Handle keypress in edit mode (Enter to save, Escape to cancel)
  const handleEditKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Format the timestamp
  const displayTimestamp = formatTimestamp
    ? formatTimestamp(comment.createdAt || comment.timestamp)
    : comment.createdAt || comment.timestamp;

  // Handle starting edit mode
  const handleStartEdit = () => {
    setEditText(comment.text);
    setIsEditing(true);
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(comment.text);
  };

  // Handle saving edits
  const handleSaveEdit = async () => {
    if (editText.trim() === "" || editText === comment.text) {
      setIsEditing(false);
      return;
    }

    setIsSubmittingEdit(true);

    try {
      // Send the edit request to the API
      await CommentsApi.updateComment(comment.id, editText);

      // Update local state
      comment.text = editText;
      comment.updatedAt = new Date().toISOString(); // Add updated timestamp
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
      // The parent component will handle the error modal
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle like button click - delegate to parent
  const handleLike = () => {
    if (!isProcessing && onLike) {
      onLike(comment.id);
    }
  };

  // Calculate indentation for nested replies
  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : "";

  // Debug info for tracing nested replies
  const hasNestedReplies = comment.replies && comment.replies.length > 0;
  if (hasNestedReplies) {
    console.log(
      `Comment ${comment.id} at level ${level} has ${comment.replies.length} replies`
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className={`flex items-start gap-2 ${indentClass}`}
    >
      {/* User avatar */}
      <Link
        href={`/app/${comment.user?.username || comment.username}`}
        className="cursor-pointer"
      >
        <div className="w-7 h-7 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-200 font-bold overflow-hidden flex-shrink-0">
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

      <div className="flex-1 min-w-0">
        <motion.div
          className="bg-zinc-700/30 rounded-lg p-2"
          whileHover={{ backgroundColor: "rgba(161, 161, 170, 0.15)" }}
          transition={{ duration: 0.2 }}
        >
          {/* Comment header */}
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
              {displayTimestamp}
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <span className="ml-1 italic">(edited)</span>
              )}
            </div>
          </div>

          {/* Comment content - editable or static */}
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyPress}
                disabled={isSubmittingEdit}
                className="w-full bg-zinc-800 text-zinc-300 text-sm p-2 rounded border border-zinc-600 focus:outline-none focus:border-orange-500 resize-none min-h-[60px]"
                autoFocus
              />
              <div className="flex justify-end mt-1 space-x-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSubmittingEdit}
                  className="text-zinc-400 hover:text-zinc-300 text-xs flex items-center"
                >
                  <X size={12} className="mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={
                    isSubmittingEdit ||
                    editText.trim() === "" ||
                    editText === comment.text
                  }
                  className={`text-xs flex items-center ${
                    isSubmittingEdit ||
                    editText.trim() === "" ||
                    editText === comment.text
                      ? "text-zinc-500 cursor-not-allowed"
                      : "text-green-500 hover:text-green-400"
                  }`}
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader size={12} className="animate-spin mr-1" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={12} className="mr-1" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-zinc-300 text-sm mt-1 break-words">
              {comment.text}
            </div>
          )}
        </motion.div>

        {/* Comment actions */}
        <div className="flex items-center mt-1 text-xs space-x-3">
          {/* Like button - allow for own comments too */}
          <button
            className={`flex items-center cursor-pointer ${
              isLiked ? "text-red-500" : "text-zinc-500 hover:text-zinc-400"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleLike}
            disabled={isProcessing}
          >
            <motion.div
              whileTap={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Heart
                size={12}
                fill={isLiked ? "currentColor" : "none"}
                className={isProcessing ? "animate-pulse" : ""}
              />
            </motion.div>
            <span className="ml-1">
              {comment.likesCount || comment.likes || 0}
            </span>
          </button>

          {/* Reply button - only show if below max nesting level */}
          {level < MAX_NESTING_LEVEL && (
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
          )}

          {/* Edit button - only shown for own comments */}
          {isOwnComment && !isEditing && (
            <button
              className="flex items-center text-zinc-500 hover:text-zinc-400 cursor-pointer"
              onClick={handleStartEdit}
            >
              <motion.div
                whileTap={{ scale: 1.3 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Edit size={12} />
              </motion.div>
              <span className="ml-1">Edit</span>
            </button>
          )}

          {/* Delete button - only shown for own comments */}
          {(isOwnComment || comment.canDelete) && (
            <button
              className={`flex items-center text-zinc-500 hover:text-red-400 cursor-pointer ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => !isProcessing && onDelete(comment.id)}
              disabled={isProcessing}
            >
              <motion.div
                whileTap={{ scale: 1.3 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Trash2
                  size={12}
                  className={isProcessing ? "animate-pulse" : ""}
                />
              </motion.div>
              <span className="ml-1">Delete</span>
            </button>
          )}
        </div>

        {/* Nested replies with proper indentation */}
        {comment.repliesCount > 0 && (
          <div className="mt-3 space-y-3">
            {/* Loading indicator for replies */}
            {isProcessing &&
              (!comment.replies ||
                comment.replies.length < comment.repliesCount) && (
                <div className="flex items-center text-xs text-zinc-500 py-1">
                  <Loader size={10} className="animate-spin mr-1" />
                  <span>Loading replies...</span>
                </div>
              )}

            {/* Render existing replies with incremented level */}
            {comment.replies && comment.replies.length > 0 && (
              <>
                {comment.replies.map((reply) => (
                  <Comment
                    key={reply.id}
                    comment={{
                      ...reply,
                      // Ensure these properties are correctly passed to nested replies
                      canEdit:
                        reply.canEdit ||
                        reply.isOwner ||
                        reply.userId === currentUser?.id ||
                        reply.user?.id === currentUser?.id,
                      canDelete:
                        reply.canDelete ||
                        reply.isOwner ||
                        reply.userId === currentUser?.id ||
                        reply.user?.id === currentUser?.id,
                      // Ensure both isLiked and isLikedByCurrentUser are set correctly
                      isLiked:
                        reply.isLiked || reply.isLikedByCurrentUser || false,
                      isLikedByCurrentUser:
                        reply.isLiked || reply.isLikedByCurrentUser || false,
                    }}
                    currentUser={currentUser}
                    onLike={onLike}
                    onDelete={onDelete}
                    onReply={onReply}
                    onLoadReplies={onLoadReplies}
                    formatTimestamp={formatTimestamp}
                    isProcessing={isProcessing && reply.id === comment.id}
                    hasLoadedAllReplies={hasLoadedAllReplies}
                    level={level + 1} // Increment nesting level
                  />
                ))}
              </>
            )}

            {/* Show "Load replies" button when needed */}
            {(!comment.replies || comment.replies.length === 0) &&
              comment.repliesCount > 0 &&
              !isProcessing && (
                <div className="text-center text-xs text-zinc-500 py-1">
                  <button
                    onClick={() => onLoadReplies(comment.id)}
                    className="text-orange-500 hover:text-orange-400"
                  >
                    Load {comment.repliesCount}{" "}
                    {comment.repliesCount === 1 ? "reply" : "replies"}
                  </button>
                </div>
              )}

            {/* Show "Load more replies" button when some replies are loaded but not all */}
            {comment.replies &&
              comment.replies.length > 0 &&
              comment.replies.length < comment.repliesCount &&
              !isProcessing && (
                <div className="text-center text-xs text-zinc-500 py-1">
                  <button
                    onClick={() => onLoadReplies(comment.id)}
                    className="text-orange-500 hover:text-orange-400"
                  >
                    Load {comment.repliesCount - comment.replies.length} more{" "}
                    {comment.repliesCount - comment.replies.length === 1
                      ? "reply"
                      : "replies"}
                  </button>
                </div>
              )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Comment;
