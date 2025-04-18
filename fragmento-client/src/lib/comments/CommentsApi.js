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

  // Clone the response for debugging
  const clonedResponse = response.clone();
  try {
    const textResponse = await clonedResponse.text();
    // console.log("API response text:", textResponse.substring(0, 200) + "...");
  } catch (e) {
    // Ignore error
  }

  // Parse the response JSON
  const data = await response.json();
  return data;
};

/**
 * Safely get property regardless of case
 * @param {Object} obj - The object to get the property from
 * @param {string} propName - The property name to get (camelCase)
 * @param {any} defaultValue - The default value if property doesn't exist
 * @returns {any} The property value or default
 */
const getProperty = (obj, propName, defaultValue = undefined) => {
  if (!obj) return defaultValue;

  // Try camelCase
  if (obj[propName] !== undefined) return obj[propName];

  // Try PascalCase
  const pascalCase = propName.charAt(0).toUpperCase() + propName.slice(1);
  if (obj[pascalCase] !== undefined) return obj[pascalCase];

  return defaultValue;
};

/**
 * Map API comment to frontend format
 * @param {Object} apiComment - Comment from the API
 * @param {Object} currentUser - Current user info
 * @returns {Object} Formatted comment for frontend
 */
const mapApiCommentToFrontend = (apiComment, currentUser) => {
  if (!apiComment) return null;

  const user = getProperty(apiComment, "user", {});
  const replies = getProperty(apiComment, "replies", []);

  // Get like status from both possible property names for consistency
  const isLiked = getProperty(apiComment, "isLiked", false);
  const isLikedByCurrentUser = getProperty(
    apiComment,
    "isLikedByCurrentUser",
    false
  );
  // Use either value that's true - handle the inconsistency in API response
  const hasLiked = isLiked || isLikedByCurrentUser;

  return {
    id: getProperty(apiComment, "id", ""),
    userId: getProperty(user, "id", ""),
    user: {
      id: getProperty(user, "id", ""),
      username: getProperty(user, "username", "unknown"),
      profilePictureUrl: getProperty(user, "profilePictureUrl", null),
    },
    text: getProperty(apiComment, "text", ""),
    createdAt: getProperty(apiComment, "createdAt", new Date().toISOString()),
    updatedAt: getProperty(apiComment, "updatedAt", null),
    likesCount: getProperty(apiComment, "likesCount", 0),
    repliesCount: getProperty(apiComment, "repliesCount", 0),
    // Set both properties to the same value for consistency
    isLiked: hasLiked,
    isLikedByCurrentUser: hasLiked,
    canEdit: getProperty(apiComment, "canEdit", false),
    canDelete: getProperty(apiComment, "canDelete", false),
    parentCommentId: getProperty(apiComment, "parentCommentId", null),
    // Recursively map nested replies
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
      console.log(
        `Fetching comments for post ${postId} with options:`,
        options
      );

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

      console.log(`Comments response status: ${response.status}`);

      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // Get replies for a comment
  getReplies: async (commentId, options = {}) => {
    try {
      console.log(
        `Fetching replies for comment ${commentId} with options:`,
        options
      );

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

      console.log(`Replies response status: ${response.status}`);

      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching replies:", error);
      throw error;
    }
  },

  // Create a new comment
  createComment: async (comment) => {
    try {
      console.log("Creating comment:", comment);

      const response = await fetch(
        `${API_BASE_URL}/comments`,
        buildRequestOptions("POST", comment)
      );

      console.log(`Create comment response status: ${response.status}`);

      return handleResponse(response);
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  // Update an existing comment
  updateComment: async (commentId, comment) => {
    try {
      console.log(`Updating comment ${commentId}:`, comment);

      // Make sure we're sending what the API expects - just the text in an object
      const updateData = {
        text: typeof comment === "string" ? comment : comment.text,
      };

      const response = await fetch(
        `${API_BASE_URL}/comments/${commentId}`,
        buildRequestOptions("PUT", updateData)
      );

      console.log(`Update comment response status: ${response.status}`);

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
      console.log(`Deleting comment ${commentId}`);

      const response = await fetch(
        `${API_BASE_URL}/comments/${commentId}`,
        buildRequestOptions("DELETE")
      );

      console.log(`Delete comment response status: ${response.status}`);

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
      console.log(`Liking comment ${commentId}`);

      const response = await fetch(
        `${API_BASE_URL}/comments/${commentId}/like`,
        buildRequestOptions("POST")
      );

      console.log(`Like comment response status: ${response.status}`);

      // If the response indicates the comment is already liked, handle it gracefully
      if (response.status === 409) {
        console.log("Comment already liked");
        return { liked: true };
      }

      return handleResponse(response);
    } catch (error) {
      console.error("Error liking comment:", error);
      throw error;
    }
  },

  // Unlike a comment
  unlikeComment: async (commentId) => {
    try {
      console.log(`Unliking comment ${commentId}`);

      const response = await fetch(
        `${API_BASE_URL}/comments/${commentId}/like`,
        buildRequestOptions("DELETE")
      );

      console.log(`Unlike comment response status: ${response.status}`);

      // If the response indicates the comment wasn't liked, handle it gracefully
      if (response.status === 404) {
        console.log("Comment not liked previously");
        return { liked: false };
      }

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
