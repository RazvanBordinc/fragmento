/** @format */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inter, Playfair_Display } from "next/font/google";
import LoginForm from "@/lib/auth/LoginForm";
import RegisterForm from "@/lib/auth/RegisterForm";
import LandingAnimation from "@/components/landing/LandingAnimation";

// Font setup
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export default function Landing() {
  const [authView, setAuthView] = useState("selection"); // 'selection', 'login', 'register'

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div
      className={`min-h-screen bg-zinc-900 ${inter.variable} ${playfair.variable} font-sans flex items-center justify-center`}
    >
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row lg:items-center lg:justify-center lg:min-h-screen">
        {/* Left side - Animation (on desktop) */}
        <div className="w-full lg:w-1/2 flex justify-center items-center order-2 lg:order-1 mt-6 lg:mt-0">
          <div className="transform scale-75 md:scale-90 lg:scale-100">
            <LandingAnimation />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start mb-6 lg:mb-0 order-1 lg:order-2">
          <motion.div
            className="max-w-md w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="text-center lg:text-left mb-8"
              variants={itemVariants}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-bold mb-4 font-playfair">
                Fragmento
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-300">
                Share your fragrances & memories
              </h2>
            </motion.div>

            <AnimatePresence mode="wait">
              {authView === "selection" && (
                <motion.div
                  key="auth-selection"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-800/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-zinc-700/50 w-full"
                >
                  <motion.h3
                    variants={itemVariants}
                    className="text-3xl font-bold text-white mb-8 text-center"
                  >
                    Welcome to Fragmento
                  </motion.h3>

                  <motion.div
                    variants={itemVariants}
                    className="w-full space-y-4"
                  >
                    <motion.button
                      onClick={() => setAuthView("login")}
                      className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Login
                    </motion.button>

                    <motion.button
                      onClick={() => setAuthView("register")}
                      className="w-full py-3 px-6 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Create an Account
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}

              {authView === "login" && (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setAuthView("selection")}
                      className="text-zinc-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Back</span>
                    </button>
                  </div>
                  <LoginForm />
                  <div className="mt-4 text-center">
                    <p className="text-zinc-400">
                      Don't have an account?{" "}
                      <button
                        onClick={() => setAuthView("register")}
                        className="text-orange-500 hover:text-orange-400 cursor-pointer"
                      >
                        Register
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {authView === "register" && (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setAuthView("selection")}
                      className="text-zinc-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Back</span>
                    </button>
                  </div>
                  <RegisterForm />
                  <div className="mt-4 text-center">
                    <p className="text-zinc-400">
                      Already have an account?{" "}
                      <button
                        onClick={() => setAuthView("login")}
                        className="text-orange-500 hover:text-orange-400 cursor-pointer"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
