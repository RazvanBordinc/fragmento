/** @format */

"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateToken, refreshToken, logoutUser } from "./AuthService";
import { storeAuthData, clearAuthData, getCookie } from "./CookieService";

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Check for token in cookies first (for SSR/middleware compatibility)
        const cookieToken = getCookie("token");

        // Then check localStorage (client-side)
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        const storedRefreshToken = localStorage.getItem("refreshToken");

        // Prioritize cookie token (for middleware compatibility)
        const token = cookieToken || storedToken;

        if (token) {
          // Check if token is valid
          const isValid = await validateToken();

          if (isValid) {
            // If we have cookie data, reconstruct the user object
            if (cookieToken) {
              const cookieUserId = getCookie("userId");
              const cookieUsername = getCookie("username");

              setUser({
                id: cookieUserId,
                username: cookieUsername,
                // Email might not be in cookie to keep cookie size small
                email: storedUser ? JSON.parse(storedUser).email : "",
              });
            } else if (storedUser) {
              // Otherwise use localStorage data
              setUser(JSON.parse(storedUser));
            }
          } else if (storedRefreshToken) {
            // Try to refresh the token
            try {
              const refreshResult = await refreshToken(storedRefreshToken);

              // Store all auth data in both localStorage and cookies
              storeAuthData(refreshResult);

              // Update user
              setUser({
                id: refreshResult.id,
                username: refreshResult.username,
                email: refreshResult.email,
              });
            } catch (refreshError) {
              // If refresh fails, clear everything
              logout();
            }
          } else {
            // Clear everything if no refresh token
            logout();
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError("Failed to initialize authentication");
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = (userData, token, refreshToken, tokenExpiration) => {
    // Set user in state
    setUser({
      id: userData.id,
      username: userData.username,
      email: userData.email,
    });

    // Save user in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: userData.id,
        username: userData.username,
        email: userData.email,
      })
    );

    // Store auth data in both localStorage and cookies
    storeAuthData({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      token,
      refreshToken,
      tokenExpiration,
    });

    // If expiration is provided, set a timer to refresh token
    if (tokenExpiration) {
      const expiryTime = new Date(tokenExpiration).getTime();
      const timeToExpiry = expiryTime - Date.now() - 60 * 1000; // Refresh 1 minute before expiry

      if (timeToExpiry > 0) {
        setTimeout(async () => {
          try {
            const refreshResult = await refreshToken(
              localStorage.getItem("refreshToken")
            );
            login(
              {
                id: refreshResult.id,
                username: refreshResult.username,
                email: refreshResult.email,
              },
              refreshResult.token,
              refreshResult.refreshToken,
              refreshResult.tokenExpiration
            );
          } catch (error) {
            console.error("Token refresh failed:", error);
            logout();
          }
        }, timeToExpiry);
      }
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      // Get the refresh token before clearing storage
      const refreshTokenValue = localStorage.getItem("refreshToken");

      // Try to call the backend logout API if we have a refresh token
      if (refreshTokenValue) {
        try {
          await logoutUser(refreshTokenValue);
        } catch (error) {
          console.error("Error calling logout API:", error);
          // Continue with local logout even if API call fails
        }
      }

      // Clear user from state
      setUser(null);

      // Clear all storage with our enhanced method
      clearAuthData();

      // Also clear user object from localStorage
      localStorage.removeItem("user");

      // Force expiration of token cookie by setting to past date
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "username=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

      // Redirect to home/login page
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, try to redirect to login
      router.push("/");
    }
  };

  // Create the context value
  const contextValue = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
