/** @format */
import React from "react";
import { Star, Clock, Wind, SprayCan, DollarSign } from "lucide-react";

export default function RatingSliders({ ratings, updateNestedFormData }) {
  const ratingOptions = [
    {
      id: "overall",
      label: "Overall Rating",
      icon: <Star className="h-5 w-5" />,
    },
    { id: "scent", label: "Scent", icon: <SprayCan className="h-5 w-5" /> },
    {
      id: "longevity",
      label: "Longevity",
      icon: <Clock className="h-5 w-5" />,
    },
    { id: "sillage", label: "Sillage", icon: <Wind className="h-5 w-5" /> },

    {
      id: "valueForMoney",
      label: "Value for Money",
      icon: <DollarSign className="h-5 w-5" />,
    },
  ];

  const handleChange = (field, value) => {
    updateNestedFormData("ratings", field, Number(value));
  };

  // Function to get gradient color class based on rating value
  const getRatingColor = (value) => {
    if (value <= 3) return "from-red-500 to-red-600";
    if (value <= 6) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  // Function to get text label for rating value
  const getRatingLabel = (value) => {
    if (value <= 2) return "Poor";
    if (value <= 4) return "Below Average";
    if (value <= 6) return "Average";
    if (value <= 8) return "Good";
    return "Excellent";
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
      <h3 className="text-lg font-semibold text-white mb-4">Ratings</h3>
      <p className="text-zinc-400 text-sm mb-4">
        Rate the fragrance from 1-10 in these categories.
      </p>

      <div className="space-y-5">
        {ratingOptions.map((option) => (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-zinc-300">
                <span className="text-zinc-400 mr-2">{option.icon}</span>
                <label htmlFor={option.id} className="text-sm font-medium">
                  {option.label}
                </label>
              </div>
              <div className="flex items-center">
                <span
                  className={`text-lg font-semibold ${
                    ratings[option.id] >= 7
                      ? "text-green-500"
                      : ratings[option.id] >= 4
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {ratings[option.id]}
                </span>
                <span className="ml-2 text-xs text-zinc-400">
                  {getRatingLabel(ratings[option.id])}
                </span>
              </div>
            </div>

            <div className="relative">
              <input
                type="range"
                id={option.id}
                min="0"
                max="10"
                step="1"
                value={ratings[option.id]}
                onChange={(e) => handleChange(option.id, e.target.value)}
                className="w-full h-2 appearance-none rounded cursor-pointer accent-orange-500"
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                    ratings[option.id] * 10
                  }%, rgb(63 63 70) ${
                    ratings[option.id] * 10
                  }%, rgb(63 63 70) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-zinc-500 px-1 mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
