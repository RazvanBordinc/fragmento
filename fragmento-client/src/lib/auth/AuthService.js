/**
 * Auth Service - Handles API calls to the .NET auth endpoints
 *
 * @format
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5293/api";

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
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
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || "Registration failed";
      console.error("Registration error details:", data);
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || "Registration failed";
      console.error("Registration error details:", data);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Refresh auth token
 */
export const refreshToken = async (refreshToken) => {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || "Registration failed";
      console.error("Registration error details:", data);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = async (refreshToken) => {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorMessage = data.message || "Registration failed";
      console.error("Registration error details:", data);
      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
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

    const response = await fetch(`${API_URL}/auth/validate`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

/**
 * Change user password
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
      const errorMessage = data.message || "Registration failed";
      console.error("Registration error details:", data);
      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error("Password change error:", error);
    throw error;
  }
};
