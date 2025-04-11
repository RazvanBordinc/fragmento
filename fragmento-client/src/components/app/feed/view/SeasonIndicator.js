/** @format */

// Season indicator component
const SeasonIndicator = ({ seasons }) => {
  const seasonIcons = {
    spring: "🌱 Spring",
    summer: "☀️ Summer",
    fall: "🍂 Autumn",
    winter: "❄️ Winter",
  };
  const colors = {
    spring: "text-green-400 bg-green-500/10",
    summer: "text-yellow-400 bg-yellow-500/10",
    autumn: "text-orange-400 bg-orange-500/10",
    winter: "text-blue-400 bg-blue-500/10",
  };

  return (
    <div className="flex items-center gap-1 text-xs flex-wrap">
      {Object.entries(seasons).map(([season, value]) => (
        <div
          key={season}
          className={`flex items-center gap-0.5 px-1.5 py-0.5 ${colors[season]} rounded-full border `}
          title={`${season}: ${value}/10`}
        >
          <span className={` px-2 py-1 `}>{seasonIcons[season]}</span>
          <span className=" text-white px-2 py-0.5 rounded-full font-black">
            {value} / 5
          </span>
        </div>
      ))}
    </div>
  );
};
export default SeasonIndicator;
