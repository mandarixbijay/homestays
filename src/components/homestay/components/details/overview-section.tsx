"use client";

import React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hero3Card } from "@/data/homestays";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface OverviewSectionProps {
  homestay: Hero3Card;
  slug: string;
}

export default function OverviewSection({ homestay, slug }: OverviewSectionProps) {
  const formatSlug = (slug: string) =>
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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
      className="overview-section-container w-full max-w-4xl text-left"
    >
      {/* Location */}
      <p className="text-sm font-medium text-gray-600 mb-2">
         {homestay.region}
      </p>

      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
        {formatSlug(slug)}
      </h2>

      {/* Rating, Price, and Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" aria-label={`Rating: ${homestay.rating} out of 5`}>
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  index < Math.round(homestay.rating)
                    ? "text-amber-500 fill-amber-500"
                    : "text-gray-300 fill-gray-300"
                )}
              />
            ))}
          </div>
          <Button
            className="px-3 h-8 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full  transition-all duration-300"
            aria-label={`Rating: ${homestay.rating}`}
          >
            {homestay.rating.toFixed(1)}
          </Button>
          <span className="text-sm font-medium text-gray-600">
            {getRatingLabel(homestay.rating)}
          </span>
        </div>
        {homestay.breakfast && (
          <Badge className="bg-amber-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
            {homestay.breakfast}
          </Badge>
        )}
       
      </div>

    

      {/* Description */}
      <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
        Discover a charming homestay in the heart of {homestay.city}, {homestay.region}. Enjoy modern amenities, warm hospitality, and a perfect base for your getaway.
      </p>
    </motion.div>
  );
}