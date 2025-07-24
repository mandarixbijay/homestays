// src/components/homestay/components/details/about-property.tsx
"use client";

import React from "react";
import { Check } from "lucide-react";
import AmenitiesDialog from "@/components/homestay/components/dialogs/about-dialog";
import { motion } from "framer-motion";
import { Hero3Card } from "@/types/homestay";

interface AboutPropertyProps {
  homestay: Hero3Card;
}

export default function AboutProperty({ homestay }: AboutPropertyProps) {
  const amenities = homestay.features.length > 0 ? homestay.features : ["No amenities listed"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full text-left"
    >
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
        About {homestay.name}
      </h2>
      <p className="text-base text-gray-600 leading-relaxed mb-6 max-w-3xl">
        {homestay.aboutDescription !== "No description available"
          ? homestay.aboutDescription
          : `Enjoy a cozy stay at ${homestay.name} in ${homestay.city}, ${homestay.region}.`}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-base">
        {amenities.map((amenity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
            <span className="text-gray-600">{amenity}</span>
          </motion.div>
        ))}
      </div>
     
    </motion.div>
  );
}