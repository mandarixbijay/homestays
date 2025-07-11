"use client";

import React from "react";
import { Umbrella, Coffee, Check, Waves, Bus, Wifi } from "lucide-react";
import AmenitiesDialog from "@/components/homestay/components/dialogs/about-dialog";
import { motion } from "framer-motion";

export default function AboutProperty() {
  const amenities = [
    { icon: Umbrella, text: "Direct access to private beach" },
    { icon: Waves, text: "Infinity pool" },
    { icon: Coffee, text: "Cooked-to-order breakfast available" },
    { icon: Bus, text: "24-hour airport shuttle available" },
    { icon: Check, text: "Self-parking included" },
    { icon: Wifi, text: "Free WiFi" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="about-property-container w-full max-w-4xl text-left"
    >
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
        About This Property
      </h2>
      <p className="text-base text-gray-600 leading-relaxed mb-6 max-w-2xl">
        Stylish beach retreat with 2 outdoor pools, offering a perfect blend of relaxation and modern amenities.
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
            <amenity.icon className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <span className="text-gray-600">{amenity.text}</span>
          </motion.div>
        ))}
      </div>
      <AmenitiesDialog>
        <motion.a
          href="#"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-6 inline-block transition-all duration-300"
          whileHover={{ x: 5 }}
          aria-label="See all property amenities and details"
        >
          See all amenities and details &gt;
        </motion.a>
      </AmenitiesDialog>
    </motion.div>
  );
}