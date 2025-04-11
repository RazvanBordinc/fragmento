/** @format */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
// Collapsible section component
const CollapsibleSection = ({
  title,
  icon,
  children,
  initialState = false,
  color,
}) => {
  const [isOpen, setIsOpen] = useState(initialState);

  return (
    <div className="border-t border-zinc-800 py-2 ">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-1 text-zinc-300 hover:text-white cursor-pointer"
      >
        <div className="flex items-center">
          <span className={`mr-2 ${color}`}>{icon}</span>
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 text-sm text-zinc-400 ">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default CollapsibleSection;
