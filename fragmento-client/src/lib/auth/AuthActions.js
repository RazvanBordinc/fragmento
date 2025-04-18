/** @format */

"use server";

const API_URL = process.env.API_URL || "http://localhost:5293/api";

/**
 * Server action to register a user
 * This runs on the server and can be called from both client and server components
 */
export async function registerUserAction(formData) {
  const userData = {
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.errors || "Registration failed" };
    }

    return {
      success: true,
      data: {
        id: data.id,
        username: data.username,
        email: data.email,
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpiration: data.tokenExpiration,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration service unavailable" };
  }
}

/**
 * Server action to login a user
 */
export async function loginUserAction(formData) {
  const credentials = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Login failed" };
    }

    return {
      success: true,
      data: {
        id: data.id,
        username: data.username,
        email: data.email,
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpiration: data.tokenExpiration,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Login service unavailable" };
  }
}

/**
 * Server action to validate a token
 * This is useful for protecting server components/pages
 */
export async function validateTokenAction(token) {
  try {
    if (!token) {
      return false;
    }

    const response = await fetch(`${API_URL}/auth/validate`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return response.ok;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}
