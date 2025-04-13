/** @format */
"use client";

// This is the updated notes section inside the CollapsibleSection in FragrancePost.js
// Only the notes section is modified, rest of the component remains the same

import { ArrowUp, ArrowDown, Leaf, Droplets } from "lucide-react";

// Notes section to be used within the original FragrancePost component
const NotesSection = ({ notes }) => {
  // Helper function to group notes by category
  const groupNotesByCategory = (notes) => {
    const grouped = { top: [], middle: [], base: [], unspecified: [] };

    notes.forEach((note) => {
      if (typeof note === "object" && note.category) {
        grouped[note.category].push(note.name);
      } else if (typeof note === "string") {
        grouped.unspecified.push(note);
      } else if (typeof note === "object") {
        grouped.unspecified.push(note.name);
      }
    });

    return grouped;
  };

  // Category definitions with icons and colors
  const categories = {
    top: {
      name: "Top Notes",
      icon: <ArrowUp size={16} className="text-blue-400" />,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    middle: {
      name: "Middle Notes",
      icon: <Leaf size={16} className="text-green-400" />,
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    base: {
      name: "Base Notes",
      icon: <ArrowDown size={16} className="text-amber-400" />,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    unspecified: {
      name: "Notes",
      icon: <Droplets size={16} className="text-zinc-400" />,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
  };

  const groupedNotes = groupNotesByCategory(notes);

  return (
    <div className="space-y-4">
      {Object.entries(groupedNotes).map(
        ([category, categoryNotes]) =>
          categoryNotes.length > 0 && (
            <div key={category} className="space-y-2">
              <div className="flex items-center text-zinc-300 text-sm font-medium">
                {categories[category].icon}
                <span className="ml-1">{categories[category].name}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categoryNotes.map((note, index) => (
                  <span
                    key={index}
                    className={`inline-block px-2 py-0.5 rounded-full ${categories[category].color} text-xs border`}
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
};
export default NotesSection;
