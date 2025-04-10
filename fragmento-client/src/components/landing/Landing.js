/** @format */
import React from "react";
import LandingAnimation from "@/components/landing/LandingAnimation";
import AuthForm from "./AuthForm";
import { Inter, Playfair_Display } from "next/font/google";

// Font setup
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export default function Landing() {
  return (
    <div
      className={`min-h-screen bg-zinc-900 ${inter.variable} ${playfair.variable} font-sans flex items-center justify-center`}
    >
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row lg:items-center lg:justify-center lg:min-h-screen">
        {/* Left side - Animation (on desktop) */}
        <div className="w-full lg:w-1/2 flex justify-center items-center order-2 lg:order-1 mt-6 lg:mt-0">
          <div className="transform scale-75 md:scale-90 lg:scale-100">
            <LandingAnimation />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start mb-6 lg:mb-0 order-1 lg:order-2">
          <div className="max-w-md w-full">
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-bold mb-4 font-playfair">
                Fragmento
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-300">
                Share your fragrances & memories
              </h2>
            </div>

            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}
