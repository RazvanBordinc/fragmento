/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lavishly_Yours } from "next/font/google";
import {
  Search,
  Heart,
  User,
  Menu,
  X,
  House,
  Telescope,
  Bookmark,
  HelpCircle,
  Bell,
} from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";

const lavishly_Yours = Lavishly_Yours({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export default function Navbar() {
  // State hooks
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Example unread count
  const pathname = usePathname();

  // Refs for detecting outside clicks
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Handle clicks outside to close menu and notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close notifications if menu is opening
    if (!isMenuOpen) setIsNotificationsOpen(false);
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    // Reset unread count when opening
    if (!isNotificationsOpen) setUnreadNotifications(0);
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

  // Check if a specific route is active
  const isActive = (route) => {
    return pathname === route;
  };

  // Get styles based on active route
  const getNavStyles = (route) => {
    if (isActive(route)) {
      if (route === "/app") {
        return "text-orange-500";
      } else if (route === "/app/discover") {
        return "text-blue-500";
      } else if (route === "/app/saved") {
        return "text-purple-500";
      } else if (route === "/app/notifications") {
        return "text-orange-500";
      }
    }

    if (route === "/app") {
      return "text-white hover:text-orange-400";
    } else if (route === "/app/discover") {
      return "text-white hover:text-blue-400";
    } else if (route === "/app/saved") {
      return "text-white hover:text-purple-400";
    } else if (route === "/app/notifications") {
      return "text-white hover:text-orange-400";
    }

    return "text-white hover:text-orange-400";
  };

  // Get mobile active background color
  const getMobileActiveClass = (route) => {
    if (isActive(route)) {
      if (route === "/app") {
        return "bg-orange-600 text-white";
      } else if (route === "/app/discover") {
        return "bg-blue-600 text-white";
      } else if (route === "/app/saved") {
        return "bg-purple-600 text-white";
      } else if (route === "/app/notifications") {
        return "bg-orange-600 text-white";
      } else if (route === "/app/help") {
        return "bg-zinc-700 text-white";
      }
    }
    return "text-white hover:bg-zinc-700";
  };

  const getBorderColor = (route) => {
    if (isActive(route)) {
      if (route === "/app") {
        return "border-orange-500";
      } else if (route === "/app/discover") {
        return "border-blue-500";
      } else if (route === "/app/saved") {
        return "border-purple-500";
      } else if (route === "/app/notifications") {
        return "border-orange-500";
      }
    }
    return "border-zinc-500";
  };

  return (
    <nav
      className={`bg-zinc-900 border-b ${getBorderColor(
        pathname
      )} sticky top-0 z-50`}
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <span className="flex items-center space-x-3 cursor-pointer transition-transform duration-200 hover:scale-105">
          <Image
            className="w-auto h-auto"
            src="/Logo.png"
            alt="Fragmento Logo"
            width={24}
            height={24}
          />
          <span
            className={`self-center text-4xl font-semibold whitespace-nowrap text-white hidden md:block ${lavishly_Yours.className} tracking`}
          >
            Fragmento
          </span>
        </span>

        {/* Desktop Navigation WITH TEXT */}
        <div className="hidden md:flex md:order-1 md:w-auto items-center">
          <ul className="flex flex-row p-0 mt-0 space-x-8 font-medium">
            <li className="relative">
              <Link
                href="/app"
                className={`py-2 px-3 cursor-pointer transition-colors duration-200 flex items-center ${getNavStyles(
                  "/app"
                )}`}
                aria-current={isActive("/app") ? "page" : undefined}
              >
                <House className="mr-2" size={18} />
                <span>For You</span>
              </Link>
            </li>
            <li className="relative">
              <Link
                href="/app/discover"
                className={`py-2 px-3 cursor-pointer transition-colors duration-200 flex items-center ${getNavStyles(
                  "/app/discover"
                )}`}
                aria-current={isActive("/app/discover") ? "page" : undefined}
              >
                <Telescope className="mr-2" size={18} />
                <span>Discover</span>
              </Link>
            </li>
            <li className="relative">
              <Link
                href="/app/saved"
                className={`py-2 px-3 cursor-pointer transition-colors duration-200 flex items-center ${getNavStyles(
                  "/app/saved"
                )}`}
                aria-current={isActive("/app/saved") ? "page" : undefined}
              >
                <Bookmark className="mr-2" size={18} />
                <span>Saved</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile Navigation - CENTERED with ICONS + SMALL TEXT */}
        {!isMenuOpen && (
          <div className="flex md:hidden items-center justify-center space-x-8 absolute left-1/2 transform pr-4 -translate-x-1/2 z-10">
            <Link href="/app">
              <motion.div
                className={`flex flex-col items-center relative cursor-pointer ${
                  isActive("/app")
                    ? "text-orange-500"
                    : "text-zinc-400 hover:text-orange-400"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <House size={20} />
                <span className="text-[10px] mt-0.5">For You</span>
                {isActive("/app") && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500 mx-auto w-full rounded-full"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            </Link>

            <Link href="/app/discover">
              <motion.div
                className={`flex flex-col items-center relative cursor-pointer ${
                  isActive("/app/discover")
                    ? "text-blue-500"
                    : "text-zinc-400 hover:text-blue-400"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Telescope size={20} />
                <span className="text-[10px] mt-0.5">Discover</span>
                {isActive("/app/discover") && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 mx-auto w-full rounded-full"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            </Link>

            <Link href="/app/saved">
              <motion.div
                className={`flex flex-col items-center relative cursor-pointer ${
                  isActive("/app/saved")
                    ? "text-purple-500"
                    : "text-zinc-400 hover:text-purple-400"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bookmark size={20} />
                <span className="text-[10px] mt-0.5">Saved</span>
                {isActive("/app/saved") && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-500 mx-auto w-full rounded-full"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            </Link>
          </div>
        )}

        {/* Desktop Search and Mobile Toggle */}
        <div className="flex md:order-2 relative z-20">
          {/* Mobile search button */}

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
                className="block w-full p-2 ps-10 text-sm text-white border border-zinc-700 rounded-lg bg-zinc-800 focus:ring-orange-500 focus:border-orange-500 placeholder-zinc-400 transition-colors duration-200 cursor-pointer"
                placeholder="Search people"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
          </div>

          {/* Notifications Button (Desktop) */}
          <div className="hidden md:block ml-3 relative" ref={notificationsRef}>
            <motion.button
              onClick={toggleNotifications}
              className="flex items-center justify-center text-zinc-400 hover:text-white p-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-700 transition duration-200 relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={22} />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadNotifications}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {isNotificationsOpen && <NotificationsDropdown />}
            </AnimatePresence>
          </div>

          {/* Help Center Button (Desktop) */}
          <div className="hidden md:block ml-1">
            <Link href="/app/help">
              <motion.button
                className="flex items-center justify-center text-zinc-400 hover:text-white p-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-700 transition duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <HelpCircle size={22} />
                <span className="sr-only">Help Center</span>
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

        {/* Mobile Menu - Keep the original implementation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="items-center justify-between w-full md:hidden md:w-auto md:order-1 z-30"
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
                    className="block w-full p-2 ps-10 text-sm text-white border border-zinc-700 rounded-lg bg-zinc-800 focus:ring-orange-500 focus:border-orange-500 placeholder-zinc-400 transition-colors duration-200 cursor-pointer"
                    placeholder="Search fragrances or people..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </form>
              </div>

              {/* Mobile Navigation - Same as original but with active states */}
              <ul className="flex flex-col p-4 mt-4 border border-zinc-700 rounded-lg bg-zinc-800">
                <li>
                  <Link
                    href="/app"
                    className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 ${getMobileActiveClass(
                      "/app"
                    )} cursor-pointer`}
                    aria-current={isActive("/app") ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <House className="mr-2" size={18} />
                    For You
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/discover"
                    className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 mt-2 ${getMobileActiveClass(
                      "/app/discover"
                    )} cursor-pointer`}
                    aria-current={
                      isActive("/app/discover") ? "page" : undefined
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Telescope className="mr-2" size={18} />
                    Discover
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/saved"
                    className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 mt-2 ${getMobileActiveClass(
                      "/app/saved"
                    )} cursor-pointer`}
                    aria-current={isActive("/app/saved") ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bookmark className="mr-2" size={18} />
                    Saved
                  </Link>
                </li>

                {/* Notifications (Mobile) */}
                <li>
                  <Link
                    href="/app/notifications"
                    className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 mt-2 ${getMobileActiveClass(
                      "/app/notifications"
                    )} cursor-pointer`}
                    aria-current={
                      isActive("/app/notifications") ? "page" : undefined
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bell className="mr-2" size={18} />
                    Notifications
                    {unreadNotifications > 0 && (
                      <span className="ml-2 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {unreadNotifications}
                      </span>
                    )}
                  </Link>
                </li>

                {/* Profile */}
                <li>
                  <Link
                    href="/app/profile"
                    className="flex items-center py-2 px-3 text-white rounded-lg hover:bg-zinc-700 transition-colors duration-200 mt-2 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2" size={18} />
                    Profile
                  </Link>
                </li>

                {/* Help Center */}
                <li>
                  <Link
                    href="/app/help"
                    className={`flex items-center py-2 px-3 rounded-lg transition-colors duration-200 mt-2 ${getMobileActiveClass(
                      "/app/help"
                    )} cursor-pointer`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle className="mr-2" size={18} />
                    Help Center
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
