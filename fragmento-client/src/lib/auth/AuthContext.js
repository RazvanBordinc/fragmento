/** @format */

"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateToken, refreshToken } from "./AuthService"; // Adjust the import path as needed

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

        // Try to get user from localStorage
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        const storedRefreshToken = localStorage.getItem("refreshToken");

        if (storedUser && storedToken) {
          // Check if token is valid
          const isValid = await validateToken();

          if (isValid) {
            setUser(JSON.parse(storedUser));
          } else if (storedRefreshToken) {
            // Try to refresh the token
            try {
              const refreshResult = await refreshToken(storedRefreshToken);

              // Save new tokens
              localStorage.setItem("token", refreshResult.token);
              localStorage.setItem("refreshToken", refreshResult.refreshToken);

              // Update user if needed
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

    // Save in localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: userData.id,
        username: userData.username,
        email: userData.email,
      })
    );
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);

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
  const logout = () => {
    // Clear user from state
    setUser(null);

    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    // Redirect to home/login page
    router.push("/");
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
