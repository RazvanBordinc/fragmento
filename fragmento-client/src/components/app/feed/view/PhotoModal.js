/** @format */
"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Share2 } from "lucide-react";

export default function PhotoModal({
  isOpen,
  onClose,
  photoUrl,
  fragranceName,
}) {
  const [scale, setScale] = React.useState(1);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Handle zoom in/out
  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  };

  // Handle share action (placeholder function)
  const handleShare = () => {
    alert("Sharing functionality would be implemented here");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Main image */}
          <motion.div
            className="max-w-4xl max-h-[80vh] w-fit h-fit flex items-center justify-center p-4  "
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              src={photoUrl}
              alt={fragranceName || "Fragrance"}
              className="max-w-full max-h-full object-contain"
              style={{ scale }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center items-center bg-gradient-to-t from-zinc-900/80 to-transparent">
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  zoomOut();
                }}
                className="text-white bg-zinc-800/80 hover:bg-zinc-700/80 p-2 rounded-full transition-colors cursor-pointer"
                disabled={scale <= 0.5}
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-white bg-zinc-800/80 hover:bg-zinc-700/80 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  zoomIn();
                }}
                className="text-white bg-zinc-800/80 hover:bg-zinc-700/80 p-2 rounded-full transition-colors cursor-pointer"
                disabled={scale >= 3}
              >
                <ZoomIn size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
