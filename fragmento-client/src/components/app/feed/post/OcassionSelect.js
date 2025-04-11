/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OccasionSelect({ occasion, updateFormData }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // List of occasions with icons
  const occasions = [
    {
      id: "casual",
      label: "Casual",
      icon: "👕",
      description:
        "Everyday scents that are easy to wear and not overwhelming.",
    },
    {
      id: "office",
      label: "Office/Work",
      icon: "💼",
      description: "Professional scents that are subtle and not distracting.",
    },
    {
      id: "date",
      label: "Date Night",
      icon: "💖",
      description:
        "Intimate and attractive scents that leave a lasting impression.",
    },
    {
      id: "formal",
      label: "Formal Event",
      icon: "🤵",
      description:
        "Sophisticated and elegant scents perfect for upscale events.",
    },
    {
      id: "party",
      label: "Party",
      icon: "🎉",
      description: "Fun, noticeable scents that stand out in social settings.",
    },
    {
      id: "outdoors",
      label: "Outdoors",
      icon: "🌲",
      description: "Fresh scents that complement outdoor activities.",
    },
    {
      id: "sport",
      label: "Sport/Gym",
      icon: "🏃‍♂️",
      description: "Light, energizing scents suitable for active situations.",
    },
    {
      id: "beach",
      label: "Beach",
      icon: "🏖️",
      description: "Aquatic or tropical scents that evoke sunny destinations.",
    },
    {
      id: "vacation",
      label: "Vacation",
      icon: "✈️",
      description:
        "Memorable scents that can become a signature for your trip.",
    },
    {
      id: "special",
      label: "Special Occasion",
      icon: "🎭",
      description: "Unique, stand-out fragrances for memorable moments.",
    },
    {
      id: "relaxing",
      label: "Relaxing at Home",
      icon: "🏠",
      description: "Calming, comfortable scents for unwinding at home.",
    },
  ];

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Select an occasion
  const selectOccasion = (occasionId) => {
    updateFormData("occasion", occasionId);
    setIsOpen(false);
  };

  // Get occasion object from ID
  const getOccasion = (occasionId) => {
    return occasions.find((o) => o.id === occasionId);
  };

  const selectedOccasion = getOccasion(occasion);

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: {
      opacity: 1,
      y: 0,
      height: "auto",
      transition: { duration: 0.2 },
    },
    exit: { opacity: 0, y: -10, height: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="bg-gradient-to-br from-zinc-800 to-zinc-800/90 rounded-lg p-5 border border-zinc-700/80 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="bg-pink-500/20 p-1.5 rounded-md mr-2">
          <CalendarDays className="h-5 w-5 text-pink-400" />
        </span>
        Best Occasion
      </h3>
      <p className="text-zinc-400 text-sm mb-4">
        What occasion is this fragrance best suited for?
      </p>

      {/* Selected occasion display */}
      {selectedOccasion && (
        <div className="mb-5 bg-gradient-to-r from-pink-500/10 to-zinc-800/30 rounded-lg p-4 border border-pink-500/30">
          <div className="flex items-center mb-2">
            <span className="text-3xl mr-3">{selectedOccasion.icon}</span>
            <span className="text-lg font-medium text-white">
              {selectedOccasion.label}
            </span>
          </div>
          <p className="text-zinc-300 text-sm">
            {selectedOccasion.description}
          </p>
        </div>
      )}

      {/* Dropdown selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={toggleDropdown}
          className={`flex items-center justify-between w-full bg-zinc-700/70 text-white p-3 rounded-lg border border-zinc-600/80 transition-all duration-200 ${
            isOpen
              ? "ring-2 ring-pink-500/50 border-pink-500"
              : "hover:border-pink-500/50"
          }`}
        >
          <div className="flex items-center">
            <CalendarDays className="h-5 w-5 text-zinc-500 mr-2" />
            <span className={occasion ? "text-white" : "text-zinc-500"}>
              {occasion
                ? `${selectedOccasion.label} selected`
                : "Select an occasion"}
            </span>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-zinc-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl mt-2 overflow-hidden z-30"
              style={{ position: "relative", transformOrigin: "top" }}
            >
              <div className="max-h-80 overflow-y-auto">
                {occasions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`w-full text-left px-4 py-3 flex items-center hover:bg-zinc-700 border-b border-zinc-700/50 last:border-b-0 transition-colors ${
                      occasion === option.id ? "bg-pink-500/20" : ""
                    }`}
                    onClick={() => selectOccasion(option.id)}
                  >
                    <span className="text-2xl mr-3 min-w-[2rem]">
                      {option.icon}
                    </span>
                    <div>
                      <div
                        className={`font-medium ${
                          occasion === option.id
                            ? "text-pink-400"
                            : "text-zinc-200"
                        }`}
                      >
                        {option.label}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                        {option.description}
                      </div>
                    </div>
                    {occasion === option.id && (
                      <span className="ml-auto bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips about choosing occasions */}
      <div className="mt-5 text-xs text-zinc-500">
        <p>
          Tip: Choose the occasion where this fragrance would make the strongest
          positive impression.
        </p>
      </div>
    </div>
  );
}
