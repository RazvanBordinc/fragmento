/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Droplets, Search, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotesSelect({ notes, updateFormData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Common fragrance notes collection
  const commonNotes = [
    // Top notes
    { name: "Bergamot", category: "top" },
    { name: "Lemon", category: "top" },
    { name: "Orange", category: "top" },
    { name: "Grapefruit", category: "top" },
    { name: "Lime", category: "top" },
    { name: "Mandarin", category: "top" },
    { name: "Apple", category: "top" },
    { name: "Pear", category: "top" },
    { name: "Blackcurrant", category: "top" },
    { name: "Lavender", category: "top" },
    { name: "Mint", category: "top" },
    { name: "Pepper", category: "top" },

    // Middle notes
    { name: "Rose", category: "middle" },
    { name: "Jasmine", category: "middle" },
    { name: "Ylang-Ylang", category: "middle" },
    { name: "Violet", category: "middle" },
    { name: "Lily", category: "middle" },
    { name: "Iris", category: "middle" },
    { name: "Geranium", category: "middle" },
    { name: "Cinnamon", category: "middle" },
    { name: "Nutmeg", category: "middle" },
    { name: "Cardamom", category: "middle" },
    { name: "Orange Blossom", category: "middle" },
    { name: "Tuberose", category: "middle" },

    // Base notes
    { name: "Vanilla", category: "base" },
    { name: "Musk", category: "base" },
    { name: "Amber", category: "base" },
    { name: "Sandalwood", category: "base" },
    { name: "Oud", category: "base" },
    { name: "Vetiver", category: "base" },
    { name: "Cedar", category: "base" },
    { name: "Patchouli", category: "base" },
    { name: "Oakmoss", category: "base" },
    { name: "Tonka Bean", category: "base" },
    { name: "Leather", category: "base" },
    { name: "Benzoin", category: "base" },
  ];

  // Close dropdown when clicking outside
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

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm(""); // Clear search when toggling
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle a note
  const toggleNote = (noteName) => {
    if (notes.includes(noteName)) {
      updateFormData(
        "notes",
        notes.filter((note) => note !== noteName)
      );
    } else {
      updateFormData("notes", [...notes, noteName]);
    }
  };

  // Add a custom note that's not in the list
  const addCustomNote = () => {
    if (
      searchTerm.trim() &&
      !notes.includes(searchTerm.trim()) &&
      !commonNotes.some(
        (note) => note.name.toLowerCase() === searchTerm.trim().toLowerCase()
      )
    ) {
      updateFormData("notes", [...notes, searchTerm.trim()]);
      setSearchTerm("");
    }
  };

  // Filter notes based on search term
  const getFilteredNotes = () => {
    if (!searchTerm) return commonNotes;

    return commonNotes.filter((note) =>
      note.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Group notes by category
  const groupedNotes = getFilteredNotes().reduce(
    (acc, note) => {
      if (!acc[note.category]) {
        acc[note.category] = [];
      }
      acc[note.category].push(note);
      return acc;
    },
    { top: [], middle: [], base: [] }
  );

  // Map category to readable name
  const categoryNames = {
    top: "Top Notes",
    middle: "Middle Notes",
    base: "Base Notes",
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
        <span className="bg-blue-500/20 p-1.5 rounded-md mr-2">
          <Droplets className="h-5 w-5 text-blue-400" />
        </span>
        Fragrance Notes
      </h3>
      <p className="text-zinc-400 text-sm mb-4">
        Select the fragrance notes you can detect.
      </p>

      {/* Dropdown container */}
      <div className="relative mb-5" ref={dropdownRef}>
        <button
          type="button"
          onClick={toggleDropdown}
          className={`flex items-center justify-between w-full bg-zinc-700/70 text-white p-3 rounded-lg border border-zinc-600/80 transition-all duration-200 cursor-pointer ${
            isOpen
              ? "ring-2 ring-blue-500/50 border-blue-500"
              : "hover:border-blue-500/50"
          }`}
        >
          <div className="flex items-center">
            <Droplets className="h-5 w-5 text-zinc-500 mr-2" />
            <span className={notes.length > 0 ? "text-white" : "text-zinc-500"}>
              {notes.length > 0
                ? `${notes.length} notes selected`
                : "Select notes"}
            </span>
          </div>
          <svg
            className={`h-5 w-5 text-zinc-400 transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl mt-2 overflow-hidden z-30 relative"
              style={{ position: "relative", transformOrigin: "top" }}
            >
              {/* Search box */}
              <div className="p-3 border-b border-zinc-700 sticky top-0 bg-zinc-800 z-10">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search notes or type custom note..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Option to add custom note */}
                {searchTerm &&
                  !commonNotes.some(
                    (note) =>
                      note.name.toLowerCase() ===
                      searchTerm.trim().toLowerCase()
                  ) &&
                  !notes.includes(searchTerm.trim()) && (
                    <button
                      type="button"
                      onClick={addCustomNote}
                      className="mt-2 w-full flex items-center px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md text-sm transition-colors cursor-pointer"
                    >
                      <span className="mr-1">+</span> Add "{searchTerm}" as
                      custom note
                    </button>
                  )}
              </div>

              {/* Notes list */}
              <div className="max-h-80 overflow-y-auto p-1">
                {Object.keys(categoryNames).map(
                  (category) =>
                    groupedNotes[category] &&
                    groupedNotes[category].length > 0 && (
                      <div key={category} className="mb-2">
                        <div className="px-3 py-1.5 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          {categoryNames[category]}
                        </div>
                        {groupedNotes[category].map((note, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`flex items-center justify-between w-full px-3 py-2.5 text-left rounded-md transition-colors cursor-pointer ${
                              notes.includes(note.name)
                                ? "bg-blue-500/20 text-blue-300"
                                : "text-zinc-300 hover:bg-zinc-700"
                            }`}
                            onClick={() => toggleNote(note.name)}
                          >
                            {note.name}
                            {notes.includes(note.name) && (
                              <Check className="h-4 w-4 text-blue-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )
                )}

                {/* No results message */}
                {getFilteredNotes().length === 0 && (
                  <div className="py-8 text-center text-zinc-500">
                    No matching notes found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected notes display */}
      {notes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-zinc-300 mb-2">
            Selected Notes:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {notes.map((note, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between bg-zinc-700/60 rounded-lg px-3 py-2 border border-zinc-600/40 group"
              >
                <span className="text-zinc-200 text-sm truncate pr-1">
                  {note}
                </span>
                <button
                  type="button"
                  onClick={() => toggleNote(note)}
                  className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
