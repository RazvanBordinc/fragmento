/** @format */
import React from "react";
import { Sun, Moon } from "lucide-react";

export default function DayNightSlider({ dayNight, updateFormData }) {
  const handleChange = (value) => {
    updateFormData("dayNight", Number(value));
  };

  // Calculate the percentage for styling
  const dayNightPercentage = (dayNight / 10) * 100;

  // Determine which side is stronger
  const isDayDominant = dayNight < 5;
  const isNightDominant = dayNight > 5;
  const isBalanced = dayNight === 5;

  // Get appropriate class for the current value
  const getTextColor = () => {
    if (isDayDominant) return "text-yellow-400";
    if (isNightDominant) return "text-indigo-400";
    return "text-zinc-300";
  };

  // Get appropriate description for the current value
  const getDescription = () => {
    if (dayNight <= 2) return "Perfect for daytime";
    if (dayNight <= 4) return "Better for day than night";
    if (dayNight === 5) return "Good for any time";
    if (dayNight <= 7) return "Better for night than day";
    return "Perfect for nighttime";
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        Day or Night Preference
      </h3>
      <p className="text-zinc-400 text-sm mb-4">
        Is this fragrance better for day or night wear?
      </p>

      <div className="space-y-5">
        <div className="relative">
          {/* Gradient background showing day/night spectrum */}
          <div className="h-4 w-full rounded-full overflow-hidden bg-gradient-to-r from-yellow-500 via-zinc-500 to-indigo-800"></div>

          {/* Circular slider handle */}
          <div
            className="absolute top-0 h-4 w-4 bg-white rounded-full shadow-lg border-2 border-zinc-700 transform -translate-y-0 -translate-x-1/2 transition-all duration-200"
            style={{ left: `${dayNightPercentage}%` }}
          ></div>

          {/* Actual range input (invisible but functional) */}
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={dayNight}
            onChange={(e) => handleChange(e.target.value)}
            className="absolute inset-0 w-full h-4 appearance-none opacity-0 cursor-pointer"
          />
        </div>

        {/* Sun and Moon icons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Sun
              className={`h-6 w-6 mr-2 ${
                dayNight <= 4 ? "text-yellow-400" : "text-zinc-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                dayNight <= 4 ? "text-yellow-400" : "text-zinc-500"
              }`}
            >
              Day
            </span>
          </div>

          <div className={`text-sm font-medium ${getTextColor()}`}>
            {getDescription()}
          </div>

          <div className="flex items-center">
            <span
              className={`text-sm font-medium ${
                dayNight >= 6 ? "text-indigo-400" : "text-zinc-500"
              }`}
            >
              Night
            </span>
            <Moon
              className={`h-6 w-6 ml-2 ${
                dayNight >= 6 ? "text-indigo-400" : "text-zinc-500"
              }`}
            />
          </div>
        </div>

        {/* Visual representation of day/night strength */}
        <div className="grid grid-cols-11 gap-1">
          {[...Array(11)].map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full ${
                index === dayNight
                  ? "bg-white"
                  : index < 5
                  ? `bg-yellow-${Math.max(9 - Math.abs(index - 0), 3)}00`
                  : index > 5
                  ? `bg-indigo-${Math.max(9 - Math.abs(index - 10) * 0.8, 3)}00`
                  : "bg-zinc-400"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
