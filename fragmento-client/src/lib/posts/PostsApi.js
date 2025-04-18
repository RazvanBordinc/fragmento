/** @format */

import { logApiRequest, logApiResponse } from "@/lib/utils/debuggingUtiliy";

// Base API URL - replace with your actual backend URL
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
      // Check different possible error message formats from .NET
      errorMessage =
        errorData.message ||
        errorData.Message ||
        errorData.error ||
        errorData.Error ||
        JSON.stringify(errorData) ||
        `Error: ${response.status} ${response.statusText}`;

      // If there's a validation dictionary, format it nicely
      if (errorData.errors && typeof errorData.errors === "object") {
        const validationErrors = Object.entries(errorData.errors)
          .map(
            ([field, messages]) =>
              `${field}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
              }`
          )
          .join("; ");

        if (validationErrors) {
          errorMessage = `Validation errors: ${validationErrors}`;
        }
      }
    } catch (e) {
      console.error("Error parsing error response:", e);
      errorMessage = `Error: ${response.status} ${response.statusText}`;
    }

    console.error("API Error Response:", errorMessage);
    throw new Error(errorMessage);
  }
  return response.json();
};

/**
 * API functions for posts
 */
export const PostsApi = {
  // Get paginated posts (can be used in both client and server components)
  getPosts: async (page = 1, pageSize = 20) => {
    const response = await fetch(
      `${API_BASE_URL}/posts?page=${page}&pageSize=${pageSize}`,
      buildRequestOptions()
    );
    return handleResponse(response);
  },

  // Get post feed (requires authentication)
  getFeed: async (page = 1, pageSize = 20) => {
    const response = await fetch(
      `${API_BASE_URL}/posts/feed?page=${page}&pageSize=${pageSize}`,
      buildRequestOptions()
    );
    return handleResponse(response);
  },

  // Get saved posts (requires authentication)
  getSavedPosts: async (page = 1, pageSize = 20) => {
    const response = await fetch(
      `${API_BASE_URL}/users/saved-posts?page=${page}&pageSize=${pageSize}`,
      buildRequestOptions()
    );
    return handleResponse(response);
  },

  // Get discover posts
  getDiscover: async (page = 1, pageSize = 20) => {
    const response = await fetch(
      `${API_BASE_URL}/posts/discover?page=${page}&pageSize=${pageSize}`,
      buildRequestOptions()
    );
    return handleResponse(response);
  },

  // Get a single post by ID
  getPost: async (postId) => {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}`,
      buildRequestOptions()
    );
    return handleResponse(response);
  },

  // Create a new post
  createPost: async (postData) => {
    // Log the request for debugging
    logApiRequest(
      `${API_BASE_URL}/posts`,
      buildRequestOptions("POST", postData),
      postData
    );

    const response = await fetch(
      `${API_BASE_URL}/posts`,
      buildRequestOptions("POST", postData)
    );

    // Log the response for debugging
    await logApiResponse(response);

    return handleResponse(response);
  },

  // Update an existing post
  updatePost: async (postId, postData) => {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}`,
      buildRequestOptions("PUT", postData)
    );
    return handleResponse(response);
  },

  // Delete a post
  deletePost: async (postId) => {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}`,
      buildRequestOptions("DELETE")
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    return true;
  },

  // Like a post
  likePost: async (postId) => {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/like`,
      buildRequestOptions("POST")
    );
    return handleResponse(response);
  },

  // Unlike a post
  unlikePost: async (postId) => {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/like`,
      buildRequestOptions("DELETE")
    );
    return handleResponse(response);
  },

  // Save a post
  savePost: async (postId) => {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/save`,
      buildRequestOptions("POST")
    );
    return handleResponse(response);
  },

  // Unsave a post
  unsavePost: async (postId) => {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/save`,
      buildRequestOptions("DELETE")
    );
    return handleResponse(response);
  },
};

/**
 * Server-side fetch functions for Next.js App Router
 */

export async function fetchPostsServer(page = 1, pageSize = 20) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts?page=${page}&pageSize=${pageSize}`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch posts");
    return response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      posts: [],
      pagination: { currentPage: 1, pageSize, totalCount: 0, hasMore: false },
    };
  }
}

export async function fetchDiscoverPostsServer(page = 1, pageSize = 20) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts/discover?page=${page}&pageSize=${pageSize}`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch discover posts");
    return response.json();
  } catch (error) {
    console.error("Error fetching discover posts:", error);
    return {
      posts: [],
      pagination: { currentPage: 1, pageSize, totalCount: 0, hasMore: false },
    };
  }
}

export async function fetchPostServer(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch post");
    return response.json();
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    return null;
  }
}
