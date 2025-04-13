/** @format */
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FlaskRound,
  List,
  Grid3X3,
  ChevronDown,
  Target,
  AlignLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BasicInfo({
  name,
  brand,
  category,
  description,
  updateFormData,
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

  // Category options
  const categories = [
    "Eau de Parfum",
    "Eau de Toilette",
    "Parfum",
    "Eau de Cologne",
    "Eau Fraiche",
  ];

  // Handle outside clicks for category dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle category dropdown
  const toggleCategory = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };

  // Select a category
  const selectCategory = (value) => {
    updateFormData("category", value);
    setIsCategoryOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-800 to-zinc-800/90 rounded-lg p-5 border border-zinc-700/80 shadow-lg">
      <div className="space-y-5">
        {/* Fragrance Name */}
        <div>
          <label
            htmlFor="name"
            className="flex text-zinc-300 text-sm font-medium mb-2 items-center"
          >
            <span className="bg-orange-500/20 p-1.5 rounded-md mr-2">
              <FlaskRound className="h-5 w-5 text-orange-400" />
            </span>{" "}
            Fragrance Name*
          </label>
          <div className="relative group">
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => updateFormData("name", e.target.value)}
              className="bg-zinc-700/70 text-white block w-full p-1.5 pl-4 rounded-lg border border-zinc-600/80 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 placeholder-zinc-500"
              placeholder="Enter fragrance name"
              required
            />
            <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 w-0 group-hover:w-full transition-all duration-300 opacity-50 group-hover:opacity-100"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Brand Input */}
          <div>
            <label
              htmlFor="brand"
              className="flex text-zinc-300 text-sm font-medium mb-2 items-center"
            >
              <span className="bg-orange-500/20 p-1.5 rounded-md mr-2">
                <Target className="h-5 w-5 text-orange-400" />
              </span>{" "}
              Brand*
            </label>
            <div className="relative group">
              <input
                type="text"
                id="brand"
                name="brand"
                value={brand}
                onChange={(e) => updateFormData("brand", e.target.value)}
                className="bg-zinc-700/70 text-white block w-full p-1.5 pl-4 rounded-lg border border-zinc-600/80 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 placeholder-zinc-500"
                placeholder="Enter brand name"
                required
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 w-0 group-hover:w-full transition-all duration-300 opacity-50 group-hover:opacity-100"></div>
            </div>
          </div>

          {/* Category Custom Select */}
          <div ref={categoryRef}>
            <label
              htmlFor="category"
              className="flex text-zinc-300 text-sm font-medium mb-2 items-center"
            >
              {" "}
              <span className="bg-orange-500/20 p-1.5 rounded-md mr-2">
                <List className="h-5 w-5 text-orange-400" />
              </span>{" "}
              Category*
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={toggleCategory}
                className={`flex items-center justify-between w-full bg-zinc-700/70 text-white p-1.5 rounded-lg border border-zinc-600/80 transition-all duration-200 cursor-pointer ${
                  isCategoryOpen
                    ? "ring-2 ring-orange-500/50 border-orange-500"
                    : "hover:border-orange-500/50"
                }`}
              >
                <div className="flex items-center">
                  <Grid3X3 className="h-5 w-5 text-zinc-500 mr-2" />
                  <span className={category ? "text-white" : "text-zinc-500"}>
                    {category || "Select a category"}
                  </span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-zinc-400 transition-transform duration-200 ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-100 mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg"
                  >
                    <div className="py-1 max-h-60 overflow-auto">
                      {categories.map((cat, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`flex items-center w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors duration-150 cursor-pointer ${
                            category === cat
                              ? "bg-zinc-700 text-orange-400"
                              : "text-zinc-200"
                          }`}
                          onClick={() => selectCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label
            htmlFor="description"
            className="flex text-zinc-300 text-sm font-medium mb-2 items-center"
          >
            <span className="bg-orange-500/20 p-1.5 rounded-md mr-2">
              <AlignLeft className="h-5 w-5 text-orange-400" />
            </span>{" "}
            Description
          </label>
          <div className="relative group">
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => updateFormData("description", e.target.value)}
              className="bg-zinc-700/70 text-white block w-full p-3 rounded-lg border border-zinc-600/80 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 placeholder-zinc-500 min-h-[100px] resize-none"
              placeholder="Share your thoughts and experiences with this fragrance..."
            />
            <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 w-0 group-hover:w-full transition-all duration-300 opacity-50 group-hover:opacity-100"></div>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Describe your experience, when to wear it, or any personal stories
            with this fragrance
          </p>
        </div>

        {/* Visual indicator of completion */}
        {name && brand && category && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-xs text-green-500 flex items-center"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1.5 fill-current">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
            </svg>
            Completed
          </motion.div>
        )}
      </div>
    </div>
  );
}
