/** @format */
"use server";

const API_URL = process.env.API_URL || "http://localhost:5293/api";

/**
 * Fetch posts for server rendering
 */
export async function fetchPosts(page = 1, pageSize = 20) {
  try {
    const response = await fetch(
      `${API_URL}/posts?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Don't cache this data
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      posts: [],
      pagination: { currentPage: 1, pageSize, totalCount: 0, hasMore: false },
    };
  }
}

/**
 * Fetch discover posts for server rendering
 */
export async function fetchDiscoverPosts(page = 1, pageSize = 20) {
  try {
    const response = await fetch(
      `${API_URL}/posts/discover?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Don't cache this data
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch discover posts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching discover posts:", error);
    return {
      posts: [],
      pagination: { currentPage: 1, pageSize, totalCount: 0, hasMore: false },
    };
  }
}

/**
 * Fetch a single post for server rendering
 */
export async function fetchPost(postId) {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache this data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    return null;
  }
}

/**
 * Fetch feed posts for a logged-in user from the server side
 * This requires authentication, so we need to accept a token
 */
export async function fetchFeedPosts(token, page = 1, pageSize = 20) {
  try {
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${API_URL}/posts/feed?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store", // Don't cache this data
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching feed:", error);
    return {
      posts: [],
      pagination: { currentPage: 1, pageSize, totalCount: 0, hasMore: false },
    };
  }
}

/**
 * Fetch saved posts for a logged-in user from the server side
 * For now, we'll simulate this until the API endpoint is available
 */
export async function fetchSavedPosts(token, page = 1, pageSize = 20) {
  try {
    if (!token) {
      throw new Error("Authentication required");
    }

    // Replace with the actual endpoint when available
    const response = await fetch(
      `${API_URL}/users/saved-posts?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store", // Don't cache this data
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch saved posts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return {
      posts: [],
      pagination: { currentPage: 1, pageSize, totalCount: 0, hasMore: false },
    };
  }
}
