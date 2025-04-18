/** @format */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { registerUser } from "./AuthService";
import { useAuth } from "./AuthContext";
import { storeAuthData } from "./CookieService";

/**
 * Helper function to get property value regardless of casing (camelCase or PascalCase)
 */
const getProperty = (obj, camelCaseProp) => {
  if (!obj) return undefined;

  // Try camelCase first (e.g. "token")
  if (obj[camelCaseProp] !== undefined) {
    return obj[camelCaseProp];
  }

  // Try PascalCase (e.g. "Token")
  const pascalCaseProp =
    camelCaseProp.charAt(0).toUpperCase() + camelCaseProp.slice(1);
  return obj[pascalCaseProp];
};

export default function RegisterForm() {
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });

    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!userData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Username validation
    if (!userData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (userData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (!userData.password) {
      newErrors.password = "Password is required";
    } else if (userData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!userData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create register payload
      const registerPayload = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
      };

      // Call register API
      const response = await registerUser(registerPayload);

      // Extract values using our helper function that checks both camelCase and PascalCase
      const token = getProperty(response, "token");
      const refreshToken = getProperty(response, "refreshToken");
      const tokenExpiration = getProperty(response, "tokenExpiration");
      const userId = getProperty(response, "id");
      const username = getProperty(response, "username");
      const email = getProperty(response, "email");

      // Check if we have a valid token
      if (!token) {
        throw new Error(
          "Invalid response from server. Missing authentication token."
        );
      }

      // Store in cookies for middleware
      try {
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7 days

        document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}`;
        document.cookie = `userId=${userId}; path=/; expires=${expires.toUTCString()}`;
        document.cookie = `username=${username}; path=/; expires=${expires.toUTCString()}`;
      } catch (cookieError) {
        console.error("Error setting cookies directly:", cookieError);
      }

      // Store auth data in both localStorage and cookies
      storeAuthData({
        id: userId,
        username: username,
        email: email,
        token: token,
        refreshToken: refreshToken,
        tokenExpiration: tokenExpiration,
      });

      // Update auth context
      login(
        {
          id: userId,
          username: username,
          email: email,
        },
        token,
        refreshToken,
        tokenExpiration
      );

      // Redirect to app
      router.push("/app");
    } catch (error) {
      setErrors({
        form: error.message || "Registration failed, please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-800 p-6 rounded-lg shadow-md border border-zinc-700 w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Create an Account</h2>

      <form onSubmit={handleSubmit}>
        {/* Email input */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-300 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-zinc-700 border ${
              errors.email ? "border-red-500" : "border-zinc-600"
            } rounded-lg text-white focus:outline-none focus:border-orange-500`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Username input */}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-zinc-300 mb-1"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={userData.username}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-zinc-700 border ${
              errors.username ? "border-red-500" : "border-zinc-600"
            } rounded-lg text-white focus:outline-none focus:border-orange-500`}
            placeholder="Choose a username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
          )}
        </div>

        {/* Password input */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-300 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-zinc-700 border ${
              errors.password ? "border-red-500" : "border-zinc-600"
            } rounded-lg text-white focus:outline-none focus:border-orange-500`}
            placeholder="Create a strong password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password input */}
        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-zinc-300 mb-1"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={userData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-zinc-700 border ${
              errors.confirmPassword ? "border-red-500" : "border-zinc-600"
            } rounded-lg text-white focus:outline-none focus:border-orange-500`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Form error */}
        {errors.form && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-500">{errors.form}</p>
          </div>
        )}

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-orange-800 disabled:cursor-not-allowed transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
