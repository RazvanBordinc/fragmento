/**
 * Image Upload Service - Handles API calls to upload images
 * @format
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5293/api";

/**
 * Get the authentication token from cookies or localStorage
 */
const getAuthToken = () => {
  // Try cookies first
  if (typeof document !== "undefined") {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // Fall back to localStorage
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("token");
  }

  return "";
};

/**
 * Upload a file using FormData
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded image
 */
export const uploadImage = async (file) => {
  if (!file) {
    console.error("No file provided for upload");
    return null;
  }

  try {
    // Get auth token
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required to upload images");
    }

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    // Send request
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    // Check response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    // Parse response and return URL
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading image:", error);

    // For development/testing - return a placeholder instead of failing
    if (process.env.NODE_ENV === "development") {
      console.log("Using placeholder image for development");
      return "https://via.placeholder.com/400x400?text=Fragrance+Image";
    }

    throw error;
  }
};

/**
 * Upload a base64 encoded image
 * @param {string} base64Data - The base64 encoded image data
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded image
 */
export const uploadBase64Image = async (base64Data) => {
  if (!base64Data) {
    console.error("No base64 data provided for upload");
    return null;
  }

  try {
    // Get auth token
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required to upload images");
    }

    // Send request
    const response = await fetch(`${API_BASE_URL}/files/upload-base64`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ base64Image: base64Data }),
    });

    // Check response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    // Parse response and return URL
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading base64 image:", error);

    // For development/testing - return a placeholder instead of failing
    if (process.env.NODE_ENV === "development") {
      console.log("Using placeholder image for development");
      return "https://via.placeholder.com/400x400?text=Fragrance+Image";
    }

    throw error;
  }
};

/**
 * Convert a File to base64
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - A promise that resolves to a base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validate an image file (size, type, etc.)
 * @param {File} file - The image file to validate
 * @returns {Object} - An object with validation result
 */
export const validateImage = (file) => {
  // Maximum file size: 5MB
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  // Allowed image types
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File size exceeds 5MB limit" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "File type not supported. Please use JPG, PNG, GIF, or WEBP",
    };
  }

  return { valid: true };
};
