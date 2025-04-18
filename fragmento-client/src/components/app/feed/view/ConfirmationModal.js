/** @format */
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, CheckCircle, AlertCircle } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "confirm", // 'confirm', 'error', 'info'
  isLoading = false,
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case "info":
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-800 rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-4 py-3 flex items-center justify-between ${
                type === "error"
                  ? "bg-red-900/30"
                  : type === "info"
                  ? "bg-blue-900/30"
                  : "bg-orange-900/30"
              }`}
            >
              <div className="flex items-center">
                {getIcon()}
                <h3 className="ml-2 text-lg font-medium text-white">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <p className="text-zinc-300">{message}</p>

              <div className="mt-4 flex justify-end space-x-2">
                {type === "confirm" && (
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 transition-colors"
                    disabled={isLoading}
                  >
                    {cancelText}
                  </button>
                )}

                <button
                  onClick={type === "confirm" ? onConfirm : onClose}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    type === "error"
                      ? "bg-red-700 hover:bg-red-600 text-white"
                      : type === "info"
                      ? "bg-blue-700 hover:bg-blue-600 text-white"
                      : "bg-orange-600 hover:bg-orange-500 text-white"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
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
                      Processing...
                    </div>
                  ) : type === "confirm" ? (
                    confirmText
                  ) : (
                    "OK"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
