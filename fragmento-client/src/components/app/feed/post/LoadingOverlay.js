/** @format */
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoadingOverlay({ isLoading, message, subMessage }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-zinc-800 rounded-lg p-6 shadow-xl flex flex-col items-center"
          >
            <Loader2 size={40} className="text-orange-500 animate-spin mb-4" />
            <p className="text-white font-medium text-lg mb-1">
              {message || "Loading..."}
            </p>
            {subMessage && (
              <p className="text-zinc-400 text-sm">{subMessage}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
