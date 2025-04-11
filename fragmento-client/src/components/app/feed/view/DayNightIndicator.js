/** @format */
import { Sun, Moon } from "lucide-react";
// Day/Night indicator component
const DayNightIndicator = ({ value }) => {
  // 0 = Day, 10 = Night
  const isDayLeaning = value < 5;
  const isNightLeaning = value > 5;

  return (
    <div className="flex items-center text-xs gap-1.5 mt-4">
      <span
        className={`flex items-center gap-0.5 ${
          isDayLeaning ? "text-yellow-400" : "text-zinc-500"
        }`}
      >
        <Sun size={20} /> {isDayLeaning ? "+" : ""}
      </span>
      <div className="w-2/3 h-3 bg-zinc-700 rounded-full relative">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-yellow-400 to-indigo-500"
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute top-0 h-full w-2 bg-white rounded-full transform -translate-x-1/2"
          style={{ left: `${value * 10}%` }}
        />
      </div>
      <span
        className={`flex items-center gap-0.5 ${
          isNightLeaning ? "text-indigo-400" : "text-zinc-500"
        }`}
      >
        <Moon size={20} /> {isNightLeaning ? "+" : ""}
      </span>
    </div>
  );
};
export default DayNightIndicator;
