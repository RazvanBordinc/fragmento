/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import Comment from "./Comment";

// Helper function to generate truly unique IDs
const generateUniqueId = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function CommentsSection({
  postId,
  initialComments = [],
  currentUser,
}) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyUsername, setReplyUsername] = useState("");
  const commentInputRef = useRef(null);
  const commentsContainerRef = useRef(null);

  useEffect(() => {
    // When a new comment is added, scroll to the bottom of the comments container
    if (commentsContainerRef.current && isExpanded && comments.length > 0) {
      commentsContainerRef.current.scrollTop =
        commentsContainerRef.current.scrollHeight;
    }
  }, [comments.length, isExpanded]);

  const handleAddComment = () => {
    if (newComment.trim() === "") return;

    if (replyingTo) {
      // Add as a reply to an existing comment
      const newReply = {
        id: generateUniqueId("reply"),
        userId: currentUser.id,
        username: currentUser.username,
        profilePic: currentUser.profilePic,
        text: newComment,
        timestamp: "Just now",
        likes: 0,
        isLiked: false,
        parentId: replyingTo,
        replies: [], // Ensure replies array exists for nested replies
      };

      setComments((prevComments) => {
        // Create a deep copy to avoid mutation issues
        const deepCopy = JSON.parse(JSON.stringify(prevComments));

        // Helper function to find and update a comment at any nesting level
        const addReplyToComment = (comments, targetId) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i].id === targetId) {
              if (!comments[i].replies) {
                comments[i].replies = [];
              }
              comments[i].replies.push(newReply);
              return true;
            }

            if (comments[i].replies && comments[i].replies.length > 0) {
              const found = addReplyToComment(comments[i].replies, targetId);
              if (found) return true;
            }
          }
          return false;
        };

        addReplyToComment(deepCopy, replyingTo);
        return deepCopy;
      });

      // Reset reply state
      setReplyingTo(null);
      setReplyUsername("");
    } else {
      // Add as a new top-level comment
      const newCommentObj = {
        id: generateUniqueId("comment"),
        userId: currentUser.id,
        username: currentUser.username,
        profilePic: currentUser.profilePic,
        text: newComment,
        timestamp: "Just now",
        likes: 0,
        isLiked: false,
        replies: [],
      };

      setComments((prevComments) => [...prevComments, newCommentObj]);
    }

    setNewComment("");
  };

  const handleLikeComment = (commentId) => {
    setComments((prevComments) => {
      // Create a deep copy to avoid mutation issues
      const deepCopy = JSON.parse(JSON.stringify(prevComments));

      // Helper function to find and update a comment in any nesting level
      const updateComment = (comments) => {
        for (let i = 0; i < comments.length; i++) {
          if (comments[i].id === commentId) {
            comments[i] = {
              ...comments[i],
              likes: comments[i].isLiked
                ? comments[i].likes - 1
                : comments[i].likes + 1,
              isLiked: !comments[i].isLiked,
            };
            return true;
          }

          if (comments[i].replies && comments[i].replies.length > 0) {
            const found = updateComment(comments[i].replies);
            if (found) return true;
          }
        }
        return false;
      };

      updateComment(deepCopy);
      return deepCopy;
    });
  };

  const handleDeleteComment = (commentId) => {
    setComments((prevComments) => {
      // Create a deep copy to avoid mutation issues
      const deepCopy = JSON.parse(JSON.stringify(prevComments));

      // Helper function to find and remove a comment at any nesting level
      const removeComment = (comments) => {
        for (let i = 0; i < comments.length; i++) {
          if (comments[i].id === commentId) {
            comments.splice(i, 1);
            return true;
          }

          if (comments[i].replies && comments[i].replies.length > 0) {
            const found = removeComment(comments[i].replies);
            if (found) return true;
          }
        }
        return false;
      };

      removeComment(deepCopy);
      return deepCopy;
    });
  };

  const handleReplyToComment = (commentId, username) => {
    setReplyingTo(commentId);
    setReplyUsername(username);
    setIsExpanded(true);

    // Focus the input field with a small delay to ensure the UI has updated
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 100);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyUsername("");
  };

  // Calculate total comment count (including replies)
  const getTotalCommentCount = (comments) => {
    let count = comments.length;

    for (const comment of comments) {
      if (comment.replies && comment.replies.length > 0) {
        count += getTotalCommentCount(comment.replies); // Recursively count nested replies
      }
    }

    return count;
  };

  const totalCommentCount = getTotalCommentCount(comments);

  return (
    <div className="border-t border-zinc-700/60 pt-2">
      {/* Comment toggle button */}
      <button
        className="text-zinc-400 hover:text-zinc-300 text-sm font-medium px-4 py-2 flex items-center gap-1 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <>
            <ChevronUp size={16} />
            <span>Hide comments</span>
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            <span>View all {totalCommentCount} comments</span>
          </>
        )}
      </button>

      {/* Comments list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              ref={commentsContainerRef}
              className="px-4 py-2 space-y-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-zinc-800"
            >
              {comments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-zinc-500 text-center py-4"
                >
                  No comments yet. Be the first to comment!
                </motion.div>
              ) : (
                <AnimatePresence>
                  {comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      currentUser={currentUser}
                      onLike={handleLikeComment}
                      onDelete={handleDeleteComment}
                      onReply={handleReplyToComment}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add comment section */}
      <div className="px-4 py-3">
        {replyingTo && (
          <div className="flex items-center justify-between mb-2 bg-zinc-700/30 rounded-md px-3 py-1.5">
            <div className="text-xs text-zinc-300">
              Replying to{" "}
              <span className="text-orange-400">@{replyUsername}</span>
            </div>
            <button
              onClick={cancelReply}
              className="text-zinc-400 hover:text-zinc-300 text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-center">
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-zinc-800 font-bold text-xs mr-2 overflow-hidden flex-shrink-0">
            {currentUser.profilePic ? (
              <img
                src={currentUser.profilePic}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              currentUser.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              onClick={() => setIsExpanded(true)}
              placeholder={
                replyingTo ? `Reply to ${replyUsername}...` : "Add a comment..."
              }
              className="flex-1 bg-zinc-700/60 rounded-full px-3 py-1.5 text-zinc-300 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 placeholder-zinc-500"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddComment}
              disabled={newComment.trim() === ""}
              className={`rounded-full w-8 h-8 flex items-center justify-center ${
                newComment.trim() === ""
                  ? "bg-zinc-700/60 text-zinc-500 cursor-not-allowed"
                  : "bg-orange-600 text-white cursor-pointer"
              }`}
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
