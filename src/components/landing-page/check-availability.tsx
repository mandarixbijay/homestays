"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import SignInCard from "../homestay/components/sign-in-card";
import { DateGuestLocationPicker } from "@/components/homestay/components/details/date-guest-location-picker";
import { DateRange } from "react-day-picker";
import { AnimatedCounter } from "@/components/ui/animated-counter";

// Custom SVG for Arrow Icon
const ArrowRightSVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface Room {
  adults: number;
  children: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const cardStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function CheckAvailability() {
  const router = useRouter();

  // Dynamic date (today: July 21, 2025)
  const currentDate = new Date();
  const defaultDateRange: DateRange = { from: currentDate, to: addDays(currentDate, 2) };

  const handleSearch = useCallback(
    (searchData: { location: string | null; date: DateRange | undefined; rooms: Room[] }) => {
      const queryParams = new URLSearchParams();
      if (searchData.location) queryParams.append("location", searchData.location);
      if (searchData.date?.from) queryParams.append("checkIn", format(searchData.date.from, "yyyy-MM-dd"));
      if (searchData.date?.to) queryParams.append("checkOut", format(searchData.date.to, "yyyy-MM-dd"));
      queryParams.append("guests", searchData.rooms.map((room) => `${room.adults}A${room.children}C`).join(","));
      queryParams.append("rooms", searchData.rooms.length.toString());

      router.push(`/search?${queryParams.toString()}`);
    },
    [router]
  );

  // Data for the three new cards
  const newCards = [
    {
      id: 2,
      image: "/images/hero/hero2.avif",
      alt: "Scenic mountain homestay",
      textLines: [
        "Immerse in local culture",
        "Share meals with families",
        "Authentic village experience",
      ],
    },
    {
      id: 6,
      image: "/images/hero/hero6.avif",
      alt: "Cozy rural homestay",
      textLines: [
        "Stay in historic homes",
        "Admire unique designs",
        "Blend of tradition & comfort",
      ],
    },
    {
      id: 5,
      image: "/images/hero/hero5.avif",
      alt: "Premium homestay with modern amenities",
      textLines: [
        "Luxury meets homestay",
        "Modern amenities included",
        "Relax in premium comfort",
      ],
    },
  ];

  return (
    <div className="relative w-full min-h-[500px] sm:min-h-[250px] md:min-h-[300px] bg-gradient-to-br from-primary-30/10 via-background to-accent-50">
      <section id="home" className="w-full h-full relative pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16">
        <motion.div
          className="relative z-30 px-4 sm:px-6 md:px-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="container mx-auto max-w-full sm:max-w-6xl md:max-w-7xl">
            {/* Search Bar in Card with improved styling */}
            <motion.div
              variants={itemVariants}
              className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <DateGuestLocationPicker
                onSearch={handleSearch}
                initialDate={defaultDateRange}
              />
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}