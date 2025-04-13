/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, X } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Mock users data - in a real app this would come from an API
  const mockUsers = [
    { id: "user123", username: "perfumemaster", profilePic: null },
    { id: "user456", username: "scentexplorer", profilePic: null },
    { id: "user789", username: "fragranceboutique", profilePic: null },
    { id: "user111", username: "aromatic_adventures", profilePic: null },
    { id: "user222", username: "oudlover", profilePic: null },
    { id: "user333", username: "perfume_passion", profilePic: null },
    { id: "user444", username: "fragrancefan", profilePic: null },
    { id: "user555", username: "scentcollector", profilePic: null },
    { id: "user666", username: "fragrance_enthusiast", profilePic: null },
    { id: "user777", username: "cologne_connoisseur", profilePic: null },
  ];

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        if (!inputRef.current?.value) {
          setIsExpanded(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation in search results
  useEffect(() => {
    function handleKeyDown(e) {
      if (!showResults) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;

        case "Enter":
          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            e.preventDefault();
            router.push(`/app/${searchResults[selectedIndex].username}`);
            setShowResults(false);
            setSearchQuery("");
            setIsExpanded(false);
          } else if (searchQuery.trim()) {
            e.preventDefault();
            performSearch();
          }
          break;

        case "Escape":
          e.preventDefault();
          setShowResults(false);
          if (!searchQuery) {
            setIsExpanded(false);
          }
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showResults, selectedIndex, searchResults, router, searchQuery]);

  // Perform search
  const performSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setShowResults(true);

      // Simulate API call delay
      setTimeout(() => {
        // Filter users based on search query
        const results = mockUsers.filter((user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(results);
        setIsSearching(false);
        setSelectedIndex(-1);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Handle input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Toggle search bar expansion
  const toggleSearchBar = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setShowResults(false);
      setSearchQuery("");
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Generate profile picture or initial
  const getProfileDisplay = (user) => {
    if (user.profilePic) {
      return (
        <img
          src={user.profilePic}
          alt={user.username}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    } else {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center text-white font-medium">
          {user.username.charAt(0).toUpperCase()}
        </div>
      );
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Collapsed search button - show when not expanded */}
      {!isExpanded ? (
        <motion.button
          onClick={toggleSearchBar}
          className="flex items-center justify-center text-zinc-400 hover:text-white p-2 rounded-lg cursor-pointer focus:outline-none transition duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open search"
        >
          <Search size={22} />
        </motion.button>
      ) : (
        <div className="flex items-center">
          {/* Search input with search button - show when expanded */}
          <div className="relative">
            <div className="flex items-center">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    id="search-navbar"
                    className="block w-full p-2 pl-3 pr-10 text-sm text-white border border-zinc-700 rounded-lg bg-zinc-800 focus:ring-orange-500 focus:border-orange-500 placeholder-zinc-400 transition-colors duration-200"
                    placeholder="Search people"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    aria-expanded={showResults}
                    aria-autocomplete="list"
                    aria-controls="search-results"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <motion.button
                  type="submit"
                  className="ml-2 flex items-center justify-center bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-lg transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Search"
                >
                  <Search size={16} />
                </motion.button>
              </form>

              <motion.button
                onClick={toggleSearchBar}
                className="ml-2 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-zinc-300 p-2 rounded-lg transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close search"
              >
                <X size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Search results dropdown */}
      <AnimatePresence>
        {isExpanded && showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 w-64 right-0 md:left-0 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50"
            style={{ transformOrigin: "top" }}
            id="search-results"
          >
            {isSearching ? (
              <div className="p-4 text-center text-zinc-400">
                <div className="animate-spin inline-block w-5 h-5 border-2 border-zinc-400 border-t-orange-500 rounded-full mb-2"></div>
                <p>Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto">
                {searchResults.map((user, index) => (
                  <li key={user.id}>
                    <Link
                      href={`/app/${user.username}`}
                      onClick={() => {
                        setShowResults(false);
                        setIsExpanded(false);
                      }}
                    >
                      <motion.div
                        className={`flex items-center p-3 cursor-pointer transition-colors ${
                          index === selectedIndex
                            ? "bg-zinc-700"
                            : "hover:bg-zinc-700"
                        }`}
                        whileHover={{
                          backgroundColor: "rgba(63, 63, 70, 0.8)",
                        }}
                        tabIndex="0"
                        role="option"
                        aria-selected={index === selectedIndex}
                      >
                        {getProfileDisplay(user)}
                        <div className="ml-3">
                          <p className="text-white font-medium">
                            @{user.username}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-zinc-400">
                <User size={24} className="mx-auto mb-2 text-zinc-500" />
                <p>No users found matching "{searchQuery}"</p>
              </div>
            )}

            {/* Footer with keyboard shortcuts help */}
            {searchResults.length > 0 && (
              <div className="border-t border-zinc-700 px-3 py-2">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-400 text-xs">
                        ↑
                      </kbd>
                      <kbd className="ml-1 px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-400 text-xs">
                        ↓
                      </kbd>
                      <span className="ml-1">to navigate</span>
                    </span>
                    <span className="flex items-center">
                      <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-400 text-xs">
                        Enter
                      </kbd>
                      <span className="ml-1">to select</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
