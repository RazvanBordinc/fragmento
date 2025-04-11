/** @format */

// Rating component for displaying stars
const RatingStars = ({ value, max = 10, post = false }) => {
  // Convert 0-10 scale to 0-5 stars
  const starValue = (value / max) * 5;

  return (
    <div className="flex items-center scale-100">
      <div className={` text-yellow-500 ${post ? "hidden md:flex" : "flex"}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            {/* Empty star (background) */}
            <svg
              className="w-4 h-4 text-orange-200"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>

            {/* Filled portion of star */}
            {starValue >= star ? (
              <svg
                className="w-4 h-4 text-yellow-400 absolute top-0 left-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : starValue > star - 1 ? (
              <svg
                className="w-4 h-4 absolute top-0 left-0 text-yellow-400"
                viewBox="0 0 20 20"
              >
                <defs>
                  <clipPath id={`clip-${star}`}>
                    <rect
                      x="0"
                      y="0"
                      width={`${(starValue - (star - 1)) * 100}%`}
                      height="100%"
                    />
                  </clipPath>
                </defs>
                <path
                  clipPath={`url(#clip-${star})`}
                  fill="currentColor"
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            ) : null}
          </div>
        ))}
      </div>
      <span
        className={`ml-2 bg-orange-700 text-orange-200 px-2 py-0.5 rounded-full border-orange-200 font-bold text-xs ${
          post ? "scale-90 md:scale-100" : "flex"
        }`}
      >
        {value}/10
      </span>
    </div>
  );
};
export default RatingStars;
