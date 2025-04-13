/** @format */
"use client";
import React from "react";
import { motion } from "framer-motion";
import { SprayCan, Star, Droplets } from "lucide-react";
import Image from "next/image";

export default function SignatureFragrance({ fragrance }) {
  if (!fragrance) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-orange-900/20 to-zinc-800 border border-orange-800/30 rounded-lg overflow-hidden shadow-lg"
    >
      <div className="p-4 md:p-5">
        <div className="flex items-center mb-3">
          <div className="bg-orange-500/20 p-1.5 rounded-md mr-2">
            <SprayCan className="h-5 w-5 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Signature Fragrance
          </h3>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Fragrance Image */}
          <div className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-5">
            <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 relative">
              {fragrance.photo ? (
                <img
                  src={fragrance.photo}
                  alt={`${fragrance.brand} ${fragrance.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                  <SprayCan size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Fragrance Details */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {fragrance.name}
                </h2>
                <div className="text-zinc-400 text-sm">
                  {fragrance.brand} • {fragrance.category}
                </div>
              </div>
              <div className="flex items-center mt-2 md:mt-0">
                <div className="bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/30 flex items-center">
                  <Star className="h-4 w-4 text-orange-400 mr-1" />
                  <span className="text-xs font-bold text-orange-300">
                    SIGNATURE
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {fragrance.description && (
              <div className="mt-3 text-zinc-300 text-sm">
                <p>{fragrance.description}</p>
              </div>
            )}

            {/* Notes */}
            {fragrance.notes && fragrance.notes.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center text-sm text-zinc-300 mb-2">
                  <Droplets className="h-4 w-4 text-blue-400 mr-1" />
                  <span>Key Notes:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {fragrance.notes.map((note, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
