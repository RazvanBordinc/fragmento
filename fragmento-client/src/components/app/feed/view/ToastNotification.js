/** @format */
"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function ToastNotification({
  message,
  type = "success",
  isVisible,
  onClose,
  autoClose = true,
  duration = 4000,
}) {
  useEffect(() => {
    let timer;
    if (isVisible && autoClose) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, onClose, autoClose, duration]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-300" size={18} />;
      case "error":
        return <AlertCircle className="text-red-300" size={18} />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600 border-green-600";
      case "error":
        return "bg-red-600 border-red-600";
      default:
        return "bg-zinc-600 border-zinc-600";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`flex items-center px-4 py-3 rounded-lg shadow-lg border ${getBgColor()}`}
          >
            <div className="mr-3">{getIcon()}</div>
            <div className="text-white text-sm flex-1">{message}</div>
            <button
              onClick={onClose}
              className="ml-3 text-zinc-200 cursor-pointer hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
