/** @format */
"use client";
import React, { useState } from "react";
import { Tag, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TagsInput({ tags, updateFormData }) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !tags.includes(trimmedInput)) {
      updateFormData("tags", [...tags, trimmedInput]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) => {
    updateFormData(
      "tags",
      tags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Sample tag suggestions
  const suggestedTags = [
    "Woody",
    "Floral",
    "Oriental",
    "Fresh",
    "Spicy",
    "Sweet",
    "Gourmand",
    "Citrus",
    "Aromatic",
    "Green",
    "Aquatic",
    "Powdery",
  ];

  // Filter out already selected tags
  const availableSuggestions = suggestedTags.filter(
    (tag) => !tags.includes(tag)
  );

  return (
    <div className="bg-gradient-to-br from-zinc-800 to-zinc-800/90 rounded-lg p-5 border border-zinc-700/80 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="bg-orange-500/20 p-1.5 rounded-md mr-2">
          <Tag className="h-5 w-5 text-orange-400" />
        </span>
        Tags
      </h3>
      <p className="text-zinc-400 text-sm mb-4">
        Add tags to help others discover your fragrance post.
      </p>

      {/* Tag Input */}
      <div className="relative mb-4">
        <div className="flex items-center bg-zinc-700/70 rounded-lg border border-zinc-600/80 overflow-hidden transition-all focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/50">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type tags and press Enter"
            className="bg-transparent text-white flex-grow py-3 px-4 focus:outline-none placeholder-zinc-500"
          />
          <button
            type="button"
            onClick={addTag}
            className="flex items-center justify-center h-full px-4 text-zinc-400 hover:text-orange-400 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Selected Tags Grid */}
      <div className="mb-4">
        <AnimatePresence>
          {tags.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {tags.map((tag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between bg-zinc-700/60 rounded-lg px-3 py-2 border border-zinc-600/40 group"
                >
                  <span className="text-zinc-200 text-sm truncate pr-1">
                    {tag}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-zinc-500 bg-zinc-800/50 rounded-lg border border-dashed border-zinc-700">
              No tags added yet
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Tag Suggestions */}
      {availableSuggestions.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">
            Suggested tags:
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => updateFormData("tags", [...tags, suggestion])}
                className="px-3 py-1.5 text-sm bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-full transition-colors duration-200 border border-zinc-700/50"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-zinc-500">
        Press Enter or comma to add a tag
      </div>
    </div>
  );
}
