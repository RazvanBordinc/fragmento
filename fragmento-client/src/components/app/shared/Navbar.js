/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, User, Menu, X } from "lucide-react";

export default function Navbar() {
  // State hooks
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Ref for detecting outside clicks
  const menuRef = useRef(null);

  // Handle clicks outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality here
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-700 sticky top-0 z-50">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-3 cursor-pointer transition-transform duration-200 hover:scale-105"
        >
          <Image
            src="/Logo.png"
            className="h-8 w-auto"
            alt="Fragmento Logo"
            width={32}
            height={32}
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            Fragmento
          </span>
        </Link>

        {/* Desktop Search and Mobile Toggle */}
        <div className="flex md:order-2">
          {/* Mobile search button */}
          <motion.button
            type="button"
            onClick={toggleMenu}
            aria-controls="navbar-search"
            aria-expanded={isMenuOpen}
            className="md:hidden text-zinc-400 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-700 rounded-lg text-sm p-2.5 me-1 cursor-pointer transition duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={20} />
            <span className="sr-only">Search</span>
          </motion.button>

          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Search className="w-4 h-4 text-zinc-400" />
              <span className="sr-only">Search icon</span>
            </div>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                id="search-navbar"
                className="block w-full p-2 ps-10 text-sm text-white border border-zinc-700 rounded-lg bg-zinc-800 focus:ring-orange-500 focus:border-orange-500 placeholder-zinc-400 transition-colors duration-200"
                placeholder="Search people"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
          </div>

          {/* Wishlist Button (Desktop) */}
          <div className="hidden md:block ml-3">
            <Link href="/wishlist">
              <motion.button
                className="flex items-center justify-center text-zinc-400 hover:text-white p-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-700 transition duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart size={22} />
                <span className="sr-only">Wishlist</span>
              </motion.button>
            </Link>
          </div>

          {/* Profile Button (Desktop) */}
          <div className="hidden md:block ml-1">
            <Link href="/app/profile">
              <motion.button
                className="flex items-center justify-center text-zinc-400 hover:text-white p-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-700 transition duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User size={22} />
                <span className="sr-only">Profile</span>
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            type="button"
            onClick={toggleMenu}
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-zinc-400 rounded-lg md:hidden hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-700 cursor-pointer transition duration-200"
            aria-controls="navbar-search"
            aria-expanded={isMenuOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="sr-only">
              {isMenuOpen ? "Close menu" : "Open menu"}
            </span>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>

        {/* Navigation and Search (Mobile) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="items-center justify-between w-full md:hidden md:w-auto md:order-1"
              id="navbar-search"
            >
              {/* Mobile Search */}
              <div className="relative mt-3">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <Search className="w-4 h-4 text-zinc-400" />
                </div>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    id="search-navbar-mobile"
                    className="block w-full p-2 ps-10 text-sm text-white border border-zinc-700 rounded-lg bg-zinc-800 focus:ring-orange-500 focus:border-orange-500 placeholder-zinc-400 transition-colors duration-200"
                    placeholder="Search fragrances or people..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </form>
              </div>

              {/* Mobile Navigation */}
              <ul className="flex flex-col p-4 mt-4 border border-zinc-700 rounded-lg bg-zinc-800">
                <li>
                  <Link
                    href="/app"
                    className="flex items-center py-2 px-3 text-white bg-orange-600 rounded-lg md:bg-transparent md:text-orange-500 md:p-0 cursor-pointer transition-colors duration-200"
                    aria-current="page"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    For You
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/discover"
                    className="flex items-center py-2 px-3 text-white rounded-lg hover:bg-zinc-700 md:hover:bg-transparent md:hover:text-orange-500 md:p-0 cursor-pointer transition-colors duration-200 mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Discover
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collections"
                    className="flex items-center py-2 px-3 text-white rounded-lg hover:bg-zinc-700 md:hover:bg-transparent md:hover:text-orange-500 md:p-0 cursor-pointer transition-colors duration-200 mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Collections
                  </Link>
                </li>

                {/* Mobile Wishlist */}
                <li>
                  <Link
                    href="/wishlist"
                    className="flex items-center py-2 px-3 text-white rounded-lg hover:bg-zinc-700 md:hover:bg-transparent md:hover:text-orange-500 md:p-0 cursor-pointer transition-colors duration-200 mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="mr-2" size={18} />
                    Wishlist
                  </Link>
                </li>

                {/* Mobile Profile */}
                <li>
                  <Link
                    href="/app/profile"
                    className="flex items-center py-2 px-3 text-white rounded-lg hover:bg-zinc-700 md:hover:bg-transparent md:hover:text-orange-500 md:p-0 cursor-pointer transition-colors duration-200 mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2" size={18} />
                    Profile
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:order-1 md:w-auto items-center">
          <ul className="flex flex-row p-0 mt-0 space-x-8 font-medium">
            <li>
              <Link
                href="/app"
                className="block py-2 px-3 text-white hover:text-orange-400 cursor-pointer transition-colors duration-200"
                aria-current="page"
              >
                For You
              </Link>
            </li>
            <li>
              <Link
                href="/app/discover"
                className="block py-2 px-3 text-white hover:text-orange-400 cursor-pointer transition-colors duration-200"
              >
                Discover
              </Link>
            </li>
            <li>
              <Link
                href="/collections"
                className="block py-2 px-3 text-white hover:text-orange-400 cursor-pointer transition-colors duration-200"
              >
                Collections
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
