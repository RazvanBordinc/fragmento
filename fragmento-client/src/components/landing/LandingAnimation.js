/** @format */

"use client";
import { motion } from "framer-motion";

export default function LandingAnimation() {
  return (
    <div className="flex space-x-6 items-center md:scale-100 scale-[0.4] ">
      <motion.svg
        className="bg-zinc-700"
        animate={{ height: [500, 350, 400, 350, 500] }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        style={{
          width: 100,
          height: 500,
          borderRadius: "1000px",
        }}
      >
        <motion.rect
          x="10"
          y="100"
          width="50"
          height="500"
          rx="8"
          style={{ fill: "#ff5500" }}
          animate={{
            x: [0, 120, 0, 120, 0],
            y: [0, 55, 0, 55, 0],
            rotate: [0, 90, 180, 90, 0],
            scale: [4, 2, 3, 2, 4],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
        />
      </motion.svg>
      <motion.svg
        className="bg-zinc-700"
        animate={{ height: [500, 270, 250, 270, 500] }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        style={{
          width: 100,
          height: 500,
          borderRadius: "1000px",
        }}
      >
        <motion.rect
          x="10"
          y="100"
          width="50"
          height="500"
          rx="8"
          style={{ fill: "#ff5500" }}
          animate={{
            x: [0, 120, 0, 120, 0],
            y: [0, 55, 0, 55, 0],
            rotate: [0, 90, 180, 90, 0],
            scale: [4, 2, 3, 2, 4],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
        />
      </motion.svg>
      <motion.svg
        className="bg-zinc-700"
        animate={{ height: [500, 350, 400, 350, 500] }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        style={{
          width: 100,
          height: 500,
          borderRadius: "1000px",
        }}
      >
        <motion.rect
          x="10"
          y="100"
          width="50"
          height="500"
          rx="8"
          style={{ fill: "#ff5500" }}
          animate={{
            x: [0, 120, 0, 120, 0],
            y: [0, 55, 0, 55, 0],
            rotate: [0, 90, 180, 90, 0],
            scale: [4, 2, 3, 2, 4],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
        />
      </motion.svg>
    </div>
  );
}
