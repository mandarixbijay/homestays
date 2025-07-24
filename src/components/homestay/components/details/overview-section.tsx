// src/components/homestay/components/details/overview-section.tsx
"use client";

import React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero3Card } from "@/types/homestay";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface OverviewSectionProps {
  homestay: Hero3Card;
  slug: string;
}

export default function OverviewSection({ homestay }: OverviewSectionProps) {
  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4) return "Very Good";
    if (rating >= 3.5) return "Good";
    if (rating >= 3) return "Average";
    if (rating >= 2) return "Fair";
    return "Poor";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full text-left"
    >
      <p className="text-base text-gray-600 mb-3">{homestay.city}, {homestay.region}</p>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1" aria-label={`Rating: ${homestay.rating} out of 5`}>
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={cn(
                "h-5 w-5",
                index < Math.round(homestay.rating)
                  ? "text-amber-500 fill-amber-500"
                  : "text-gray-300 fill-gray-300"
              )}
            />
          ))}
        </div>
        <Button
          className="px-3 h-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full"
          aria-label={`Rating: ${homestay.rating}`}
        >
          {homestay.rating.toFixed(1)}
        </Button>
        <span className="text-base text-gray-600">
          {getRatingLabel(homestay.rating)} ({homestay.rooms[0]?.reviews || 0} reviews)
        </span>
      </div>
      <p className="text-base text-gray-600 leading-relaxed max-w-3xl">
        {homestay.aboutDescription !== "No description available"
          ? homestay.aboutDescription
          : `Discover a charming stay at ${homestay.name} in ${homestay.city}, ${homestay.region}.`}
      </p>
    </motion.div>
  );
}