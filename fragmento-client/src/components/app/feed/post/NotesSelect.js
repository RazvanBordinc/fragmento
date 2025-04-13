/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Droplets,
  Search,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Leaf,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotesSelect({ notes, updateFormData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("unspecified");
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
  const toggleNote = (noteName, noteCategory) => {
    // Check if the note is already added
    const existingNoteIndex = notes.findIndex((note) =>
      typeof note === "object" ? note.name === noteName : note === noteName
    );

    if (existingNoteIndex >= 0) {
      // Remove note
      const updatedNotes = [...notes];
      updatedNotes.splice(existingNoteIndex, 1);
      updateFormData("notes", updatedNotes);
    } else {
      // Add note with category
      const newNote = noteCategory
        ? { name: noteName, category: noteCategory }
        : noteName;
      updateFormData("notes", [...notes, newNote]);
    }
  };

  // Add a custom note that's not in the list
  const addCustomNote = () => {
    if (searchTerm.trim()) {
      const existingNote = notes.find((note) =>
        typeof note === "object"
          ? note.name === searchTerm.trim()
          : note === searchTerm.trim()
      );

      const existingCommonNote = commonNotes.find(
        (note) => note.name.toLowerCase() === searchTerm.trim().toLowerCase()
      );

      if (!existingNote && !existingCommonNote) {
        // Add note with the selected category
        const newNote =
          selectedCategory !== "unspecified"
            ? { name: searchTerm.trim(), category: selectedCategory }
            : searchTerm.trim();

        updateFormData("notes", [...notes, newNote]);
        setSearchTerm("");
      }
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

  // Map category to readable name and icon
  const categoryInfo = {
    top: {
      name: "Top Notes",
      icon: <ArrowUp size={14} className="text-blue-400" />,
    },
    middle: {
      name: "Middle Notes",
      icon: <Leaf size={14} className="text-green-400" />,
    },
    base: {
      name: "Base Notes",
      icon: <ArrowDown size={14} className="text-amber-400" />,
    },
    unspecified: {
      name: "Unspecified",
      icon: <Droplets size={14} className="text-zinc-400" />,
    },
  };

  // Group user-selected notes by category
  const groupUserNotes = () => {
    const grouped = { top: [], middle: [], base: [], unspecified: [] };

    notes.forEach((note) => {
      if (typeof note === "object" && note.category) {
        grouped[note.category].push(note);
      } else {
        grouped.unspecified.push({
          name: typeof note === "object" ? note.name : note,
        });
      }
    });

    return grouped;
  };

  const userGroupedNotes = groupUserNotes();

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

  // Helper function to check if a note is in the selected notes array
  const isNoteSelected = (noteName) => {
    return notes.some((note) =>
      typeof note === "object" ? note.name === noteName : note === noteName
    );
  };

  // Get the category of a selected note
  const getSelectedNoteCategory = (noteName) => {
    const note = notes.find((note) =>
      typeof note === "object" ? note.name === noteName : note === noteName
    );

    return typeof note === "object" && note.category
      ? note.category
      : "unspecified";
  };

  // Get color for note based on category
  const getCategoryColor = (category) => {
    switch (category) {
      case "top":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "middle":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "base":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-700/60 text-zinc-200 border-zinc-600/40";
    }
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
        Select the fragrance notes you can detect and specify their category.
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

                {/* Option to add custom note with category selection */}
                {searchTerm &&
                  !commonNotes.some(
                    (note) =>
                      note.name.toLowerCase() ===
                      searchTerm.trim().toLowerCase()
                  ) &&
                  !isNoteSelected(searchTerm.trim()) && (
                    <div className="mt-2 bg-blue-500/10 p-2 rounded-md">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Object.keys(categoryInfo).map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className={`flex items-center cursor-pointer px-2 py-1 text-xs rounded-full border ${
                              selectedCategory === category
                                ? getCategoryColor(category)
                                : "bg-zinc-700 text-zinc-300 border-zinc-600"
                            }`}
                          >
                            <span className="mr-1">
                              {categoryInfo[category].icon}
                            </span>
                            {categoryInfo[category].name}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addCustomNote}
                        className="w-full flex items-center justify-center px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md text-sm transition-colors cursor-pointer"
                      >
                        <span className="mr-1">+</span> Add "{searchTerm}" as{" "}
                        {selectedCategory} note
                      </button>
                    </div>
                  )}
              </div>

              {/* Notes list grouped by category */}
              <div className="max-h-80 overflow-y-auto p-1">
                {Object.keys(categoryInfo)
                  .slice(0, 3)
                  .map(
                    (category) =>
                      groupedNotes[category] &&
                      groupedNotes[category].length > 0 && (
                        <div key={category} className="mb-2">
                          <div className="px-3 py-1.5 flex items-center text-xs font-medium uppercase tracking-wider">
                            {categoryInfo[category].icon}
                            <span className="ml-1 text-zinc-400">
                              {categoryInfo[category].name}
                            </span>
                          </div>
                          {groupedNotes[category].map((note, index) => (
                            <button
                              key={index}
                              type="button"
                              className={`flex items-center justify-between w-full px-3 py-2.5 text-left rounded-md transition-colors cursor-pointer ${
                                isNoteSelected(note.name)
                                  ? `${getCategoryColor(
                                      getSelectedNoteCategory(note.name)
                                    )}`
                                  : "text-zinc-300 hover:bg-zinc-700"
                              }`}
                              onClick={() =>
                                toggleNote(note.name, note.category)
                              }
                            >
                              {note.name}
                              {isNoteSelected(note.name) && (
                                <Check
                                  className={`h-4 w-4 ${
                                    getSelectedNoteCategory(note.name) === "top"
                                      ? "text-blue-400"
                                      : getSelectedNoteCategory(note.name) ===
                                        "middle"
                                      ? "text-green-400"
                                      : getSelectedNoteCategory(note.name) ===
                                        "base"
                                      ? "text-amber-400"
                                      : "text-zinc-400"
                                  }`}
                                />
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

      {/* Selected notes display grouped by category */}
      {notes.length > 0 && (
        <div className="mt-4 space-y-4">
          {Object.entries(userGroupedNotes).map(
            ([category, categoryNotes]) =>
              categoryNotes.length > 0 && (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    {categoryInfo[category].icon}
                    <span className="ml-1 text-zinc-300">
                      {categoryInfo[category].name}:
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {categoryNotes.map((note, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 border ${getCategoryColor(
                          category
                        )}`}
                      >
                        <span className="text-sm truncate pr-1">
                          {typeof note === "object" ? note.name : note}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            toggleNote(
                              typeof note === "object" ? note.name : note
                            )
                          }
                          className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
