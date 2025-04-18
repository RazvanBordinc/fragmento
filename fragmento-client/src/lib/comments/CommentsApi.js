/** @format */
"use client";

// Base API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5293/api";

/**
 * Get the authentication token from cookies
 */
const getAuthToken = () => {
  if (typeof document !== "undefined") {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
  return "";
};

/**
 * Helper function to build request options with authentication
 */
const buildRequestOptions = (method = "GET", body = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies in requests
  };

  // Add the token to the Authorization header if available
  const token = getAuthToken();
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  // Add the body for POST, PUT methods
  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  return options;
};

/**
 * Handle API response and errors
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    // Attempt to parse error message from response
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage =
        errorData.message || errorData.Message || `Error: ${response.status}`;
    } catch (e) {
      errorMessage = `Error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  // Return empty object for 204 responses
  if (response.status === 204) {
    return { success: true };
  }

  // Parse the response JSON
  const data = await response.json();
  return data;
};

/**
 * Map API comment to frontend format
 * @param {Object} apiComment - Comment from the API
 * @param {Object} currentUser - Current user info
 * @returns {Object} Formatted comment for frontend
 */
const mapApiCommentToFrontend = (apiComment, currentUser) => {
  if (!apiComment) return null;

  // Handle both camelCase and PascalCase property names
  const user = apiComment.user || apiComment.User || {};
  const replies = apiComment.replies || apiComment.Replies || [];

  return {
    id: apiComment.id || apiComment.Id || "",
    userId: user.id || user.Id || "",
    username: user.username || user.Username || "",
    profilePic: user.profilePictureUrl || user.ProfilePictureUrl || null,
    text: apiComment.text || apiComment.Text || "",
    timestamp:
      apiComment.createdAt || apiComment.CreatedAt || new Date().toISOString(),
    createdAt:
      apiComment.createdAt || apiComment.CreatedAt || new Date().toISOString(),
    updatedAt: apiComment.updatedAt || apiComment.UpdatedAt || null,
    likes: apiComment.likesCount || apiComment.LikesCount || 0,
    likesCount: apiComment.likesCount || apiComment.LikesCount || 0,
    repliesCount: apiComment.repliesCount || apiComment.RepliesCount || 0,
    isLiked:
      apiComment.isLikedByCurrentUser ||
      apiComment.IsLikedByCurrentUser ||
      false,
    isLikedByCurrentUser:
      apiComment.isLikedByCurrentUser ||
      apiComment.IsLikedByCurrentUser ||
      false,
    canEdit: apiComment.canEdit || apiComment.CanEdit || false,
    canDelete: apiComment.canDelete || apiComment.CanDelete || false,
    user: user,
    parentCommentId:
      apiComment.parentCommentId || apiComment.ParentCommentId || null,
    replies: Array.isArray(replies)
      ? replies.map((reply) => mapApiCommentToFrontend(reply, currentUser))
      : [],
  };
};

/**
 * Map frontend comment format to API format
 * @param {Object} frontendComment - Comment from frontend
 * @returns {Object} Formatted comment for API
 */
const mapFrontendCommentToApi = (frontendComment) => {
  return {
    postId: frontendComment.postId,
    text: frontendComment.text,
    parentCommentId: frontendComment.parentCommentId || null,
  };
};

/**
 * API functions for comments
 */
export const CommentsApi = {
  // Get comments for a post with pagination and filtering
  getComments: async (postId, options = {}) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        sortBy = "createdAt",
        descending = true,
        onlyTopLevel = true,
      } = options;

      const queryParams = new URLSearchParams({
        page,
        pageSize,
        sortBy,
        descending,
        onlyTopLevel,
      }).toString();

      const response = await fetch(
        `${API_BASE_URL}/comments/post/${postId}?${queryParams}`,
        buildRequestOptions()
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // Get replies for a comment
  getReplies: async (commentId, options = {}) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        sortBy = "createdAt",
        descending = true,
      } = options;

      const queryParams = new URLSearchParams({
        page,
        pageSize,
        sortBy,
        descending,
      }).toString();

      const response = await fetch(
        `${API_BASE_URL}/comments/${commentId}/replies?${queryParams}`,
        buildRequestOptions()
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching replies:", error);
      throw error;
    }
  },

  // Create a new comment
  createComment: async (comment) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/comments`,
        buildRequestOptions("POST", comment)
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  // Update an existing comment
  updateComment: async (commentId, comment) => {
    try {
      // Make sure we're sending what the API expects - just the text in an object
      const updateData = {
        text: typeof comment === "string" ? comment : comment.text,
      };

      const response = await fetch(
        `${API_BASE_URL}/comments/${commentId}`,
        buildRequestOptions("PUT", updateData)
      );

      if (!response.ok) {
        let errorMessage = "Failed to update comment";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message ||
            errorData.Message ||
            "Failed to update comment";
        } catch (e) {
          // If parsing the error response fails, use the default message
        }
        throw new Error(errorMessage);
      }

      return response.status === 204
        ? { success: true }
        : await response.json();
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/comments/${commentId}`,
        buildRequestOptions("DELETE")
      );

      if (!response.ok) {
        let errorMessage = "Failed to delete comment";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.Message || errorMessage;
        } catch (e) {
          // If parsing the error response fails, use the default message
        }
        throw new Error(errorMessage);
      }

      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Like a comment
  likeComment: async (commentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/comments/${commentId}/like`,
        buildRequestOptions("POST")
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Error liking comment:", error);
      throw error;
    }
  },

  // Unlike a comment
  unlikeComment: async (commentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/comments/${commentId}/like`,
        buildRequestOptions("DELETE")
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Error unliking comment:", error);
      throw error;
    }
  },

  // Mapping functions
  mapApiCommentToFrontend,
  mapFrontendCommentToApi,
};

export default CommentsApi;
