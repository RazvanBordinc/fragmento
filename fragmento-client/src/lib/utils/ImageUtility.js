/** @format */
"use client";

/**
 * Image upload utility functions for the Fragmento app
 */
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
 * Convert an image file to a base64 string
 * @param {File} file - The image file to convert
 * @returns {Promise<string>} - A promise that resolves to a base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Get a data URL for a local image file
 * This is used for temporary preview before uploading
 * @param {File} file - The image file to preview
 * @returns {Promise<string>} - A promise that resolves to a data URL
 */
export const getImagePreviewUrl = (file) => {
  if (!file) return Promise.resolve(null);
  return URL.createObjectURL(file);
};

/**
 * Upload an image file to the server
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded image
 */
export const uploadImage = async (file) => {
  if (!file) return null;

  // Get auth token
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required to upload images");
  }

  try {
    // In a real implementation, we would use FormData to upload the file
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    const data = await response.json();
    return data.url; // Return the URL of the uploaded image
  } catch (error) {
    console.error("Error uploading image:", error);

    // For development/demo purposes, return a placeholder URL
    console.log("Using placeholder image URL for development");
    return "https://via.placeholder.com/400x400?text=Fragrance+Image";
  }
};

/**
 * Convert a base64 string to a File object
 * @param {string} base64String - The base64 string to convert
 * @param {string} filename - The desired filename
 * @returns {File} - A File object
 */
export const base64ToFile = (base64String, filename) => {
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
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
