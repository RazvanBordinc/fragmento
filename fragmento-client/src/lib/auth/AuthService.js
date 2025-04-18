/**
 * Auth Service - Handles API calls to the .NET auth endpoints
 *
 * @format
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5293";

/**
 * Convert PascalCase object properties to camelCase
 * This handles the mismatch between .NET's PascalCase and JavaScript's camelCase
 */
const normalizeCasing = (data) => {
  if (!data || typeof data !== "object") return data;

  return Object.keys(data).reduce((result, key) => {
    // Convert first character to lowercase
    const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
    result[normalizedKey] = data[key];
    return result;
  }, {});
};

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
      }),
      credentials: "include",
    });

    const rawData = await response.json();
    const data = normalizeCasing(rawData);

    if (!response.ok) {
      const formattedErrors = data.message
        ? data.message
        : Object.values(data.errors).flat();

      const errorMessage = formattedErrors || "Registration failed";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    const responseText = await response.text();

    let rawData;
    try {
      rawData = JSON.parse(responseText);
      const data = normalizeCasing(rawData);

      if (!response.ok) {
        const formattedErrors = data.message
          ? data.message
          : Object.values(data.errors).flat();
        const errorMessage = formattedErrors || "Login failed";
        throw new Error(errorMessage);
      }

      return data;
    } catch (e) {
      throw new Error(e.message);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh auth token
 */
export const refreshToken = async (refreshTokenValue) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
      credentials: "include",
    });

    const rawData = await response.json();
    const data = normalizeCasing(rawData);

    if (!response.ok) {
      const errorMessage =
        data.message || rawData.Message || "Token refresh failed";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
/**
 * Updated logoutUser function for AuthService.js
 *
 * Replace the existing logoutUser function with this one:
 */

/**
 * Logout user
 */
export const logoutUser = async (refreshTokenValue) => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem("token");

    // Only proceed with API call if we have a token and refresh token
    if (token && refreshTokenValue) {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
        credentials: "include", // Important for cookies
      });

      // Even if the response is not OK, we still want to clear local data
      if (!response.ok) {
        console.warn("Server logout returned error status:", response.status);
      }
    }

    return true;
  } catch (error) {
    console.error("Logout error:", error);
    // Still return true so the UI can proceed with local logout
    return true;
  }
};
/**
 * Validate current token
 */
export const validateToken = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return false;
    }

    const response = await fetch(`${API_URL}/api/auth/validate`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Change user password
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(passwordData),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Password change failed");
    }

    return true;
  } catch (error) {
    throw error;
  }
};
