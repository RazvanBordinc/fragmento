/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, ChevronUp, Loader } from "lucide-react";
import Comment from "./Comment";
import { CommentsApi } from "@/lib/comments/CommentsApi";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatDistanceToNow } from "date-fns";
import ConfirmationModal from "./ConfirmationModal";

export default function CommentsSection({
  postId,
  initialComments = [],
  currentUser,
}) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyUsername, setReplyUsername] = useState("");
  const commentInputRef = useRef(null);
  const commentsContainerRef = useRef(null);

  // Loading and pagination states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [totalComments, setTotalComments] = useState(initialComments.length);
  const [commentsInitialized, setCommentsInitialized] = useState(false);

  // Action states
  const [submittingComment, setSubmittingComment] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [processingLikeIds, setProcessingLikeIds] = useState(new Set());

  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "confirm", // confirm, error, info
    onConfirm: () => {},
    confirmText: "Confirm",
    isLoading: false,
  });

  // Track which comments have all replies loaded
  const [loadedReplies, setLoadedReplies] = useState({});

  useEffect(() => {
    // Initialize with any initialComments that were passed in
    if (initialComments.length > 0 && !commentsInitialized) {
      // Check which comments already have their full replies loaded
      initialComments.forEach((comment) => {
        if (
          comment.replies &&
          comment.replies.length > 0 &&
          comment.replies.length >= comment.repliesCount
        ) {
          setLoadedReplies((prev) => ({
            ...prev,
            [comment.id]: true,
          }));
        }
      });

      setComments(normalizeComments(initialComments));
      setCommentsInitialized(true);
      setTotalComments(initialComments.length);
    }
  }, [initialComments, commentsInitialized]);

  // Function to normalize comments and ensure consistent structure
  const normalizeComments = (commentsArray) => {
    if (!Array.isArray(commentsArray)) return [];

    // Debug information
    console.log(`Normalizing ${commentsArray.length} comments`);

    return commentsArray.map((comment) => {
      // Ensure each comment has all required properties with fallbacks
      const normalizedComment = {
        id: comment.id || "",
        text: comment.text || "",
        createdAt:
          comment.createdAt || comment.timestamp || new Date().toISOString(),
        updatedAt: comment.updatedAt || null,
        likesCount: comment.likesCount || comment.likes || 0,
        repliesCount: comment.repliesCount || 0,
        // Use either property for like status
        isLiked: comment.isLiked || comment.isLikedByCurrentUser || false,
        isLikedByCurrentUser:
          comment.isLikedByCurrentUser || comment.isLiked || false,
        canEdit:
          comment.canEdit ||
          comment.userId === currentUser?.id ||
          comment.user?.id === currentUser?.id ||
          false,
        canDelete:
          comment.canDelete ||
          comment.userId === currentUser?.id ||
          comment.user?.id === currentUser?.id ||
          false,
        // Ensure user object is consistent
        user: {
          id: comment.user?.id || comment.userId || "",
          username: comment.user?.username || comment.username || "unknown",
          profilePictureUrl:
            comment.user?.profilePictureUrl || comment.profilePic || null,
        },
        // Handle replies recursively if they exist
        replies: Array.isArray(comment.replies)
          ? normalizeComments(comment.replies)
          : [],
      };

      return normalizedComment;
    });
  };

  // Fetch comments when expanded for the first time
  useEffect(() => {
    if (isExpanded && !commentsInitialized && postId) {
      fetchComments(1);
    }
  }, [isExpanded, commentsInitialized, postId]);

  // Scroll to bottom when a new comment is added
  useEffect(() => {
    if (
      commentsContainerRef.current &&
      isExpanded &&
      submittingComment === false
    ) {
      commentsContainerRef.current.scrollTop =
        commentsContainerRef.current.scrollHeight;
    }
  }, [comments.length, isExpanded, submittingComment]);

  // Open modal helper
  const openModal = (config) => {
    setModal({
      isOpen: true,
      title: "Confirmation",
      message: "Are you sure?",
      type: "confirm",
      onConfirm: () => {},
      confirmText: "Confirm",
      isLoading: false,
      ...config,
    });
  };

  // Close modal helper
  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Show error modal helper
  const showErrorModal = (message) => {
    openModal({
      title: "Error",
      message: message,
      type: "error",
      confirmText: "OK",
    });
  };

  // Fetch comments from the API
  const fetchComments = async (page = 1) => {
    if (!postId) return;

    if (page === 1) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }

    setError(null);

    try {
      console.log(`Fetching comments for post ${postId}, page ${page}`);

      const response = await CommentsApi.getComments(postId, {
        page,
        pageSize: 10,
        sortBy: "createdAt",
        descending: true,
        onlyTopLevel: true,
      });

      console.log("Comments API response:", response);

      // Handle both camelCase and PascalCase property names in the response
      const commentsData = response.comments || response.Comments || [];
      const totalCommentsCount =
        response.totalComments || response.TotalComments || 0;
      const currentPageNumber =
        response.currentPage || response.CurrentPage || 1;
      const hasNextPageFlag =
        response.hasNextPage || response.HasNextPage || false;

      // Map API data to frontend format with consistent structure
      const mappedComments = normalizeComments(
        commentsData.map((comment) =>
          CommentsApi.mapApiCommentToFrontend(comment, currentUser)
        )
      );

      // Check which comments already have their full replies loaded
      mappedComments.forEach((comment) => {
        if (
          comment.replies &&
          comment.replies.length > 0 &&
          comment.replies.length >= comment.repliesCount
        ) {
          setLoadedReplies((prev) => ({
            ...prev,
            [comment.id]: true,
          }));
        }
      });

      // If it's the first page, replace comments; otherwise append
      if (page === 1) {
        setComments(mappedComments);
      } else {
        setComments((prev) => [...prev, ...mappedComments]);
      }

      // Update pagination state
      setCurrentPage(currentPageNumber);
      setHasMoreComments(hasNextPageFlag);
      setTotalComments(totalCommentsCount);
      setCommentsInitialized(true);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more comments
  const loadMoreComments = () => {
    if (loadingMore || !hasMoreComments) return;
    fetchComments(currentPage + 1);
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (newComment.trim() === "" || submittingComment) return;

    if (!isAuthenticated) {
      openModal({
        title: "Authentication Required",
        message: "Please sign in to comment",
        type: "info",
        confirmText: "OK",
      });
      return;
    }

    setSubmittingComment(true);

    try {
      const commentData = {
        postId: postId,
        text: newComment,
        parentCommentId: replyingTo || null,
      };

      console.log("Submitting new comment:", commentData);

      const response = await CommentsApi.createComment(commentData);
      console.log("Create comment response:", response);

      // Map the new comment to frontend format
      const newCommentFormatted = CommentsApi.mapApiCommentToFrontend(
        response,
        currentUser
      );

      if (replyingTo) {
        // Add as a reply to an existing comment
        setComments((prevComments) => {
          // Use a deep update function to maintain the tree structure
          return updateCommentTreeForReply(
            prevComments,
            replyingTo,
            newCommentFormatted
          );
        });

        // Reset reply state
        setReplyingTo(null);
        setReplyUsername("");
      } else {
        // Add as a new top-level comment
        setComments((prevComments) => [
          normalizeComments([newCommentFormatted])[0],
          ...prevComments,
        ]);

        // Increment total count
        setTotalComments((prev) => prev + 1);
      }

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      showErrorModal(
        "Failed to add comment: " + (error.message || "Unknown error")
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  // Better function to update the comment tree when adding a reply
  const updateCommentTreeForReply = (comments, parentId, newReply) => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        // This is the parent comment, add the reply to it
        const updatedComment = {
          ...comment,
          replies: [
            normalizeComments([newReply])[0],
            ...(comment.replies || []),
          ],
          repliesCount: (comment.repliesCount || 0) + 1,
        };
        return updatedComment;
      }

      // If this comment has replies, recursively check them
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentTreeForReply(
            comment.replies,
            parentId,
            newReply
          ),
        };
      }

      // No match, return the comment unchanged
      return comment;
    });
  };

  // Handle liking a comment
  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      openModal({
        title: "Authentication Required",
        message: "Please sign in to like comments",
        type: "info",
        confirmText: "OK",
      });
      return;
    }

    // Prevent duplicate likes while processing
    if (processingLikeIds.has(commentId)) {
      console.log(`Already processing like for comment ${commentId}`);
      return;
    }

    // Add this comment ID to the processing set
    setProcessingLikeIds((prev) => new Set([...prev, commentId]));

    try {
      // Find comment in state to check if it's already liked
      const isLiked =
        findCommentProperty(comments, commentId, "isLiked") ||
        findCommentProperty(comments, commentId, "isLikedByCurrentUser");

      console.log(
        `Liking comment ${commentId}, current state: ${
          isLiked ? "liked" : "not liked"
        }`
      );

      // Optimistic update
      setComments((prevComments) =>
        updateCommentInTree(prevComments, commentId, (comment) => ({
          ...comment,
          isLiked: !isLiked,
          isLikedByCurrentUser: !isLiked,
          likesCount: isLiked
            ? Math.max(0, comment.likesCount - 1)
            : comment.likesCount + 1,
        }))
      );

      // Call appropriate API endpoint
      if (isLiked) {
        await CommentsApi.unlikeComment(commentId);
      } else {
        await CommentsApi.likeComment(commentId);
      }

      console.log(
        `Successfully ${isLiked ? "unliked" : "liked"} comment ${commentId}`
      );
    } catch (error) {
      console.error("Error liking/unliking comment:", error);

      // Revert optimistic update on error
      const isLiked = !findCommentProperty(comments, commentId, "isLiked");
      setComments((prevComments) =>
        updateCommentInTree(prevComments, commentId, (comment) => ({
          ...comment,
          isLiked: isLiked,
          isLikedByCurrentUser: isLiked,
          likesCount: isLiked
            ? comment.likesCount + 1
            : Math.max(0, comment.likesCount - 1),
        }))
      );

      showErrorModal(
        "Failed to like comment: " + (error.message || "Unknown error")
      );
    } finally {
      // Remove this comment ID from the processing set
      setProcessingLikeIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) {
      openModal({
        title: "Authentication Required",
        message: "Please sign in to delete comments",
        type: "info",
        confirmText: "OK",
      });
      return;
    }

    if (pendingActionId === commentId) return;

    // Show confirmation modal
    openModal({
      title: "Delete Comment",
      message:
        "Are you sure you want to delete this comment? This action cannot be undone.",
      type: "confirm",
      confirmText: "Delete",
      isLoading: false,
      onConfirm: async () => {
        // Update modal state to show loading
        setModal((prev) => ({ ...prev, isLoading: true }));
        setPendingActionId(commentId);

        try {
          await CommentsApi.deleteComment(commentId);

          // Find the comment and determine if it's a top-level comment
          const isTopLevel = comments.some((c) => c.id === commentId);

          // Find the parent comment ID if it's a reply
          let parentCommentId = null;
          for (const comment of comments) {
            if (
              comment.replies &&
              comment.replies.some((r) => r.id === commentId)
            ) {
              parentCommentId = comment.id;
              break;
            }
          }

          // Remove comment from state - with proper tree structure maintenance
          setComments((prevComments) => {
            // First, check if it's a top-level comment
            const filteredTopLevel = prevComments.filter(
              (c) => c.id !== commentId
            );

            if (filteredTopLevel.length !== prevComments.length) {
              // It was a top-level comment
              return filteredTopLevel;
            }

            // It's a nested comment, so we need to update the tree
            return prevComments.map((comment) => {
              if (
                comment.replies &&
                comment.replies.some((r) => r.id === commentId)
              ) {
                // This comment contains the reply we want to delete
                return {
                  ...comment,
                  replies: comment.replies.filter((r) => r.id !== commentId),
                  repliesCount: comment.repliesCount - 1,
                };
              }

              // If this comment has replies, recursively check them
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: comment.replies.map((reply) => {
                    if (
                      reply.replies &&
                      reply.replies.some((r) => r.id === commentId)
                    ) {
                      return {
                        ...reply,
                        replies: reply.replies.filter(
                          (r) => r.id !== commentId
                        ),
                        repliesCount: reply.repliesCount - 1,
                      };
                    }
                    return reply;
                  }),
                };
              }

              return comment;
            });
          });

          // Update total comment count if it was a top-level comment
          if (isTopLevel) {
            setTotalComments((prev) => Math.max(0, prev - 1));
          }

          // Close the modal
          closeModal();
        } catch (error) {
          console.error("Error deleting comment:", error);

          // Update modal to show error
          setModal((prev) => ({
            ...prev,
            title: "Error",
            message:
              "Failed to delete comment: " + (error.message || "Unknown error"),
            type: "error",
            isLoading: false,
            confirmText: "OK",
          }));
        } finally {
          setPendingActionId(null);
        }
      },
    });
  };

  // Handle replying to a comment
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

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
    setReplyUsername("");
  };

  // Find a comment by ID in the comment tree (recursive)
  const findCommentById = (comments, commentId) => {
    for (const comment of comments) {
      if (comment.id === commentId) {
        return comment;
      }

      if (comment.replies && comment.replies.length > 0) {
        const foundComment = findCommentById(comment.replies, commentId);
        if (foundComment) return foundComment;
      }
    }
    return null;
  };

  // Get property of a comment by ID (recursive)
  const findCommentProperty = (comments, commentId, property) => {
    for (const comment of comments) {
      if (comment.id === commentId) {
        return comment[property];
      }

      if (comment.replies && comment.replies.length > 0) {
        const foundProperty = findCommentProperty(
          comment.replies,
          commentId,
          property
        );
        if (foundProperty !== undefined) return foundProperty;
      }
    }
    return undefined;
  };

  // Update a comment in the comment tree (recursive)
  const updateCommentInTree = (comments, commentId, updateFn) => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return updateFn(comment);
      }

      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, updateFn),
        };
      }

      return comment;
    });
  };

  // Load replies for a comment
  const handleLoadReplies = async (commentId) => {
    if (pendingActionId === commentId) return;
    setPendingActionId(commentId);

    try {
      console.log(`Loading replies for comment ${commentId}`);

      const response = await CommentsApi.getReplies(commentId, {
        page: 1,
        pageSize: 20, // Get a good number of replies
        sortBy: "createdAt",
        descending: true,
      });

      console.log(`Replies response for comment ${commentId}:`, response);

      // Handle both camelCase and PascalCase property names
      const repliesData = response.comments || response.Comments || [];

      // Map replies to frontend format with consistent structure
      const mappedReplies = normalizeComments(
        repliesData.map((reply) =>
          CommentsApi.mapApiCommentToFrontend(reply, currentUser)
        )
      );

      console.log(
        `Mapped ${mappedReplies.length} replies for comment ${commentId}`
      );

      // Update comments state to include all replies
      setComments((prevComments) => {
        return prevComments.map((comment) => {
          if (comment.id === commentId) {
            // Found the parent comment, update its replies
            return {
              ...comment,
              replies: mappedReplies,
            };
          }

          // If this comment has replies, recursively check them
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map((reply) => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  replies: mappedReplies,
                };
              }
              return reply;
            });

            // Check if any replies were updated
            if (updatedReplies.some((r, i) => r !== comment.replies[i])) {
              return {
                ...comment,
                replies: updatedReplies,
              };
            }
          }

          return comment;
        });
      });

      // Mark this comment as having loaded all replies
      setLoadedReplies((prev) => ({
        ...prev,
        [commentId]: true,
      }));
    } catch (error) {
      console.error("Error loading replies:", error);
      showErrorModal(
        "Failed to load replies: " + (error.message || "Unknown error")
      );
    } finally {
      setPendingActionId(null);
    }
  };

  // Format createdAt timestamps for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="border-t border-zinc-700/60 pt-2">
      {/* Confirmation/Error Modal */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        type={modal.type}
        isLoading={modal.isLoading}
      />

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
            <span>View all {totalComments} comments</span>
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
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader className="animate-spin text-orange-500" size={24} />
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <div className="text-center py-4">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => fetchComments(1)}
                  className="mt-2 px-3 py-1 bg-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Comments container */}
            <div
              ref={commentsContainerRef}
              className="px-4 py-2 space-y-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-zinc-800"
            >
              {!isLoading && !error && comments.length === 0 ? (
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
                      onLoadReplies={handleLoadReplies}
                      formatTimestamp={formatTimestamp}
                      isProcessing={
                        pendingActionId === comment.id ||
                        processingLikeIds.has(comment.id)
                      }
                      hasLoadedAllReplies={loadedReplies[comment.id] || false}
                    />
                  ))}
                </AnimatePresence>
              )}

              {/* Load more comments button */}
              {hasMoreComments && !isLoading && comments.length > 0 && (
                <div className="pt-2 pb-1 text-center">
                  <button
                    onClick={loadMoreComments}
                    disabled={loadingMore}
                    className="text-orange-500 hover:text-orange-400 text-sm font-medium px-4 py-1 rounded-full disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingMore ? (
                      <span className="flex items-center justify-center">
                        <Loader size={14} className="animate-spin mr-2" />
                        Loading...
                      </span>
                    ) : (
                      "Load more comments"
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add comment section */}
      <div className="px-4 py-3">
        {/* Reply indicator */}
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
          {/* User avatar */}
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-zinc-800 font-bold text-xs mr-2 overflow-hidden flex-shrink-0">
            {currentUser?.profilePic ? (
              <img
                src={currentUser.profilePic}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              (currentUser?.username || "").charAt(0).toUpperCase()
            )}
          </div>

          {/* Comment input */}
          <div className="flex-1 flex gap-2">
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              onClick={() => setIsExpanded(true)}
              placeholder={
                replyingTo
                  ? `Reply to ${replyUsername}...`
                  : isAuthenticated
                  ? "Add a comment..."
                  : "Sign in to comment..."
              }
              disabled={!isAuthenticated || submittingComment}
              className={`flex-1 bg-zinc-700/60 rounded-full px-3 py-1.5 text-zinc-300 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 placeholder-zinc-500 ${
                !isAuthenticated ? "cursor-not-allowed" : ""
              }`}
            />

            {/* Submit button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddComment}
              disabled={
                newComment.trim() === "" ||
                !isAuthenticated ||
                submittingComment
              }
              className={`rounded-full w-8 h-8 flex items-center justify-center ${
                newComment.trim() === "" ||
                !isAuthenticated ||
                submittingComment
                  ? "bg-zinc-700/60 text-zinc-500 cursor-not-allowed"
                  : "bg-orange-600 text-white cursor-pointer"
              }`}
            >
              {submittingComment ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
