/** @format */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { loginUser } from "./AuthService";
import { useAuth } from "./AuthContext";

export default function LoginForm() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
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

    if (!credentials.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
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
      // Call login API
      const response = await loginUser(credentials);

      // Update auth context
      login(
        {
          id: response.id,
          username: response.username,
          email: response.email,
        },
        response.token,
        response.refreshToken,
        response.tokenExpiration
      );

      // Redirect to app
      router.push("/app");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        form: error.message || "Invalid username or password",
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
      <h2 className="text-2xl font-bold text-white mb-6">Log In</h2>

      <form onSubmit={handleSubmit}>
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
            value={credentials.username}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-zinc-700 border ${
              errors.username ? "border-red-500" : "border-zinc-600"
            } rounded-lg text-white focus:outline-none focus:border-orange-500`}
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
          )}
        </div>

        {/* Password input */}
        <div className="mb-6">
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
            value={credentials.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-zinc-700 border ${
              errors.password ? "border-red-500" : "border-zinc-600"
            } rounded-lg text-white focus:outline-none focus:border-orange-500`}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
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
              Signing In...
            </div>
          ) : (
            "Sign In"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
