/** @format */
import React from "react";
import { Flame, Snowflake, Flower, Leaf } from "lucide-react";

export default function SeasonSliders({ seasons, updateNestedFormData }) {
  const seasonOptions = [
    {
      id: "spring",
      label: "Spring",
      icon: <Flower className="h-5 w-5 text-green-400" />,
      color: "green",
    },
    {
      id: "summer",
      label: "Summer",
      icon: <Flame className="h-5 w-5 text-orange-400" />,
      color: "orange",
    },
    {
      id: "autumn",
      label: "Autumn",
      icon: <Leaf className="h-5 w-5 text-amber-500" />,
      color: "amber",
    },
    {
      id: "winter",
      label: "Winter",
      icon: <Snowflake className="h-5 w-5 text-blue-400" />,
      color: "blue",
    },
  ];

  const handleChange = (field, value) => {
    updateNestedFormData("seasons", field, Number(value));
  };

  // Function to get color values for each season
  const getColorForSeason = (season, value) => {
    const colorMap = {
      spring: `bg-green-${Math.min(Math.round(value / 1.5) + 3, 9)}00`,
      summer: `bg-orange-${Math.min(Math.round(value / 1.5) + 3, 9)}00`,
      autumn: `bg-amber-${Math.min(Math.round(value / 1.5) + 3, 9)}00`,
      winter: `bg-blue-${Math.min(Math.round(value / 1.5) + 3, 9)}00`,
    };

    return colorMap[season] || "bg-zinc-600";
  };

  // Get text suggestion based on value
  const getSuggestionText = (value) => {
    if (value <= 2) return "Not suitable";
    if (value <= 5) return "Acceptable";
    if (value <= 7) return "Good choice";
    return "Perfect match";
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        Seasonal Suitability
      </h3>
      <p className="text-zinc-400 text-sm mb-4">
        How well does this fragrance suit each season?
      </p>

      <div className="space-y-6">
        {seasonOptions.map((season) => (
          <div key={season.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">{season.icon}</span>
                <label
                  htmlFor={season.id}
                  className="text-sm font-medium text-zinc-300"
                >
                  {season.label}
                </label>
              </div>
              <div className="text-sm text-zinc-400">
                {getSuggestionText(seasons[season.id])}
              </div>
            </div>

            <div className="relative">
              <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    season.id === "spring"
                      ? "bg-green-500"
                      : season.id === "summer"
                      ? "bg-orange-500"
                      : season.id === "autumn"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${(seasons[season.id] / 10) * 100}%` }}
                ></div>
              </div>

              <input
                type="range"
                id={season.id}
                min="0"
                max="10"
                step="1"
                value={seasons[season.id]}
                onChange={(e) => handleChange(season.id, e.target.value)}
                className="absolute inset-0 w-full h-2 appearance-none opacity-0 cursor-pointer"
              />

              <div className="flex justify-between text-xs text-zinc-500 px-1 mt-1">
                <span>Not suitable</span>
                <span>Perfect match</span>
              </div>
            </div>

            {/* Season intensity markers */}
            <div className="flex justify-between mt-1">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    seasons[season.id] >= index * 2.5
                      ? season.id === "spring"
                        ? "bg-green-500/20 text-green-400"
                        : season.id === "summer"
                        ? "bg-orange-500/20 text-orange-400"
                        : season.id === "autumn"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                      : "bg-zinc-700/30 text-zinc-500"
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
