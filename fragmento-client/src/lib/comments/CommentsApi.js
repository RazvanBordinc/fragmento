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
      errorMessage = errorData.message || `Error: ${response.status}`;
    } catch (e) {
      errorMessage = `Error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

/**
 * API functions for comments
 */
export const CommentsApi = {
  // Get comments for a post with pagination and filtering
  getComments: async (postId, options = {}) => {
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
  },

  // Get replies for a comment
  getReplies: async (commentId, options = {}) => {
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
  },

  // Create a new comment
  createComment: async (comment) => {
    const response = await fetch(
      `${API_BASE_URL}/comments`,
      buildRequestOptions("POST", comment)
    );
    return handleResponse(response);
  },

  // Update an existing comment
  updateComment: async (commentId, comment) => {
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}`,
      buildRequestOptions("PUT", comment)
    );
    return handleResponse(response);
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}`,
      buildRequestOptions("DELETE")
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    return true;
  },

  // Like a comment
  likeComment: async (commentId) => {
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}/like`,
      buildRequestOptions("POST")
    );
    return handleResponse(response);
  },

  // Unlike a comment
  unlikeComment: async (commentId) => {
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}/like`,
      buildRequestOptions("DELETE")
    );
    return handleResponse(response);
  },
};
