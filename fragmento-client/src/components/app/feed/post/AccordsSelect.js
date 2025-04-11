/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Sparkles, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AccordsSelect({ accords, updateFormData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // All possible accords with colors
  const allAccords = [
    { name: "Amber", color: "bg-amber-600" },
    { name: "Animalic", color: "bg-stone-700" },
    { name: "Aquatic", color: "bg-cyan-600" },
    { name: "Aromatic", color: "bg-emerald-600" },
    { name: "Balsamic", color: "bg-amber-800" },
    { name: "Citrus", color: "bg-yellow-500" },
    { name: "Earthy", color: "bg-stone-600" },
    { name: "Floral", color: "bg-pink-500" },
    { name: "Fruity", color: "bg-red-500" },
    { name: "Green", color: "bg-green-600" },
    { name: "Leather", color: "bg-amber-900" },
    { name: "Musky", color: "bg-purple-600" },
    { name: "Oriental", color: "bg-orange-600" },
    { name: "Powdery", color: "bg-violet-300" },
    { name: "Smoky", color: "bg-gray-700" },
    { name: "Spicy", color: "bg-red-600" },
    { name: "Sweet", color: "bg-rose-400" },
    { name: "Vanilla", color: "bg-amber-300" },
    { name: "Woody", color: "bg-brown-600" },
  ];

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm(""); // Clear search when toggling
  };

  // Handle clicks outside the dropdown to close it
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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter accords based on search term
  const filteredAccords = allAccords.filter((accord) =>
    accord.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle an accord selection
  const toggleAccord = (accordName) => {
    if (accords.includes(accordName)) {
      updateFormData(
        "accords",
        accords.filter((a) => a !== accordName)
      );
    } else {
      updateFormData("accords", [...accords, accordName]);
    }
  };

  // Find the color for a given accord name
  const getAccordColor = (accordName) => {
    const accord = allAccords.find((a) => a.name === accordName);
    return accord ? accord.color : "bg-zinc-600";
  };

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
        <span className="bg-purple-500/20 p-1.5 rounded-md mr-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
        </span>
        Accords
      </h3>
      <p className="text-zinc-400 text-sm mb-4">
        Select the prominent accords in this fragrance.
      </p>

      {/* Selected accords display */}
      {accords.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-zinc-300 mb-2">
            Selected Accords:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {accords.map((accord, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-white ${getAccordColor(
                  accord
                )}`}
              >
                <span className="text-sm font-medium truncate pr-1">
                  {accord}
                </span>
                <button
                  type="button"
                  onClick={() => toggleAccord(accord)}
                  className="text-white/70 hover:text-white/90 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Custom dropdown */}
      <div className="relative mt-5" ref={dropdownRef}>
        <button
          type="button"
          onClick={toggleDropdown}
          className={`flex items-center justify-between w-full bg-zinc-700/70 text-white p-3 rounded-lg border border-zinc-600/80 transition-all duration-200 ${
            isOpen
              ? "ring-2 ring-purple-500/50 border-purple-500"
              : "hover:border-purple-500/50"
          }`}
        >
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-zinc-500 mr-2" />
            <span className="text-zinc-300">
              {accords.length > 0
                ? `${accords.length} accords selected`
                : "Select accords"}
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
              <div className="p-3 border-b border-zinc-700 sticky top-0 bg-zinc-800 z-10">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search accords..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-400 cursor-pointer"
                      onClick={() => setSearchTerm("")}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {filteredAccords.map((accord, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleAccord(accord.name)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-md transition-colors 
                        ${
                          accords.includes(accord.name)
                            ? `${accord.color} text-white`
                            : "text-zinc-300 hover:bg-zinc-700"
                        }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${accord.color}`}
                        ></div>
                        <span>{accord.name}</span>
                      </div>
                      {accords.includes(accord.name) && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>

                {filteredAccords.length === 0 && (
                  <div className="py-8 text-center text-zinc-500">
                    No accords found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Accords explanation */}
      <div className="mt-5 bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50">
        <h4 className="text-sm font-medium text-zinc-300 mb-1">
          What are accords?
        </h4>
        <p className="text-xs text-zinc-400">
          Accords are the dominant fragrance characteristics that define how a
          scent is perceived. They are combinations of notes that create a
          distinct olfactory impression.
        </p>
      </div>
    </div>
  );
}
