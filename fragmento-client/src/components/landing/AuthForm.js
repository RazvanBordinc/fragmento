/** @format */
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const router = useRouter();

  // Form mode states
  const [formMode, setFormMode] = useState("selection"); // "selection", "login", "register"
  const [currentStep, setCurrentStep] = useState(0);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  });

  // Error and submission states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Form fields configuration - defines the order and validation for each step
  const loginFields = [
    {
      name: "username", // Changed from email to username for login as per AuthController.cs
      label: "What's your username?",
      type: "text",
      placeholder: "your_username",
      validate: (value) => {
        if (!value) return "Username is required";
        return "";
      },
    },
    {
      name: "password",
      label: "Enter your password",
      type: "password",
      placeholder: "Your password",
      validate: (value) => {
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      },
    },
  ];

  const registerFields = [
    {
      name: "email",
      label: "What's your email?",
      type: "email",
      placeholder: "your@email.com",
      validate: (value) => {
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid";
        return "";
      },
    },
    {
      name: "username",
      label: "Choose a username",
      type: "text",
      placeholder: "Your username",
      validate: (value) => {
        if (!value) return "Username is required";
        return "";
      },
    },
    {
      name: "password",
      label: "Create a password",
      type: "password",
      placeholder: "Your password",
      validate: (value) => {
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      },
    },
    {
      name: "confirmPassword",
      label: "Confirm your password",
      type: "password",
      placeholder: "Confirm your password",
      validate: (value) => {
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      },
    },
  ];

  // Get current fields based on mode
  const getCurrentFields = () => {
    return formMode === "login" ? loginFields : registerFields;
  };

  // Get current field
  const getCurrentField = () => {
    const fields = getCurrentFields();
    return currentStep < fields.length ? fields[currentStep] : null;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Start login flow
  const startLogin = () => {
    setFormMode("login");
    setCurrentStep(0);
    setErrors({});
    setApiError(null);
    setFormData({
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    });
  };

  // Start registration flow
  const startRegistration = () => {
    setFormMode("register");
    setCurrentStep(0);
    setErrors({});
    setApiError(null);
    setFormData({
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    });
  };

  // Go back to selection
  const backToSelection = () => {
    setFormMode("selection");
    setCurrentStep(0);
    setFormCompleted(false);
    setApiError(null);
  };

  // Validate current field and move to next if valid
  const validateAndProceed = () => {
    const currentField = getCurrentField();
    if (!currentField) return;

    const error = currentField.validate(formData[currentField.name]);
    if (error) {
      setErrors({
        ...errors,
        [currentField.name]: error,
      });
      return false;
    }

    const fields = getCurrentFields();
    if (currentStep < fields.length - 1) {
      // Move to next field
      setCurrentStep(currentStep + 1);
    } else {
      // Form completed, submit
      setFormCompleted(true);
      handleSubmit();
    }

    return true;
  };

  // Handle key press (Enter)
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateAndProceed();
    }
  };

  // API URL
  const API_URL = "http://localhost:5293"; // Using the HTTP port from launchSettings.json

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      if (formMode === "login") {
        // Login API call
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("tokenExpiration", data.tokenExpiration);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);

        // Redirect to app page
        router.push("/app");
      } else {
        // Register API call
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        // Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("tokenExpiration", data.tokenExpiration);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);

        // Redirect to app page
        router.push("/app");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setApiError(error.message || "Authentication failed. Please try again.");
      setFormCompleted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const currentField = getCurrentField();

  return (
    <motion.div
      className="bg-zinc-800/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-zinc-700/50 w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {formMode === "selection" ? (
          <motion.div
            key="selection"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center"
          >
            <motion.h3
              variants={itemVariants}
              className="text-3xl font-bold text-white mb-8 text-center"
            >
              Welcome to Fragmento
            </motion.h3>

            <motion.div variants={itemVariants} className="w-full space-y-4">
              <motion.button
                onClick={startLogin}
                className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Login
              </motion.button>

              <motion.button
                onClick={startRegistration}
                className="w-full py-3 px-6 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Create an Account
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={`form-${formMode}-${currentStep}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col"
          >
            <motion.div
              variants={itemVariants}
              className="flex items-center mb-8"
            >
              <button
                onClick={backToSelection}
                className="text-zinc-400 hover:text-white mr-3 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-2xl font-bold text-white">
                {formMode === "login" ? "Login" : "Create Account"}
              </h3>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4">
              <form>
                {/* Show progress indicator */}
                <div className="flex mb-8">
                  {getCurrentFields().map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 ${index === 0 ? "rounded-l-full" : ""} ${
                        index === getCurrentFields().length - 1
                          ? "rounded-r-full"
                          : ""
                      } flex-1 mx-0.5 ${
                        index < currentStep
                          ? "bg-orange-500"
                          : index === currentStep
                          ? "bg-orange-400"
                          : "bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>

                {currentField && (
                  <div className="mb-6">
                    <motion.label
                      variants={itemVariants}
                      htmlFor={currentField.name}
                      className="block text-2xl text-white mb-4 font-medium"
                    >
                      {currentField.label}
                    </motion.label>

                    <motion.input
                      variants={itemVariants}
                      type={currentField.type}
                      id={currentField.name}
                      name={currentField.name}
                      className={`w-full px-4 py-3 rounded-lg bg-zinc-700/80 text-white border-2 ${
                        errors[currentField.name]
                          ? "border-red-500"
                          : "border-zinc-600"
                      } focus:border-orange-500 focus:outline-none transition-all duration-200`}
                      placeholder={currentField.placeholder}
                      value={formData[currentField.name]}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />

                    {errors[currentField.name] && (
                      <motion.p
                        variants={itemVariants}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-2"
                      >
                        {errors[currentField.name]}
                      </motion.p>
                    )}
                  </div>
                )}

                {/* API Error Display */}
                {apiError && (
                  <motion.div
                    variants={itemVariants}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm"
                  >
                    {apiError}
                  </motion.div>
                )}

                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={validateAndProceed}
                  className="w-full mt-4 py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                      Processing...
                    </span>
                  ) : currentStep < getCurrentFields().length - 1 ? (
                    <span className="flex items-center">
                      Continue
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  ) : formMode === "login" ? (
                    "Login"
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </form>
            </motion.div>

            {formCompleted && !apiError && isSubmitting && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-4 text-green-400"
              >
                {formMode === "login"
                  ? "Logging in..."
                  : "Creating your account..."}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
