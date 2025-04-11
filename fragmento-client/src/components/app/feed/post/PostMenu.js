/** @format */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Trash2, Edit, Flag } from "lucide-react";

export default function PostMenu({
  postId,
  isOwnPost,
  onEdit,
  onDelete,

  onReport,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    ...(isOwnPost
      ? [
          {
            id: "edit",
            label: "Edit Post",
            icon: <Edit size={14} />,
            action: () => {
              onEdit(postId);
              setIsOpen(false);
            },
            color: "text-blue-400 hover:bg-blue-500/10",
          },
          {
            id: "delete",
            label: "Delete Post",
            icon: <Trash2 size={14} />,
            action: () => {
              onDelete(postId);
              setIsOpen(false);
            },
            color: "text-red-400 hover:bg-red-500/10",
          },
        ]
      : []),

    ...(isOwnPost
      ? []
      : [
          {
            id: "report",
            label: "Report Post",
            icon: <Flag size={14} />,
            action: () => {
              onReport(postId);
              setIsOpen(false);
            },
            color: "text-orange-400 hover:bg-orange-500/10",
          },
        ]),
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="text-zinc-400 hover:text-zinc-300 p-1 rounded-full transition-colors cursor-pointer"
      >
        <MoreVertical size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-8 z-50 min-w-[160px] bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden"
            style={{ transformOrigin: "top right" }}
          >
            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center px-3 py-2 text-sm ${item.color} text-left transition-colors cursor-pointer`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
