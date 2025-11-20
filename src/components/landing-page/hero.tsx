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

export default function Hero() {
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
    <div className="relative w-full min-h-[500px] sm:min-h-[550px] md:min-h-[600px] bg-gradient-to-br from-primary-30/10 via-background to-accent-50">
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

            {/* Trust Indicators with animations */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm text-muted-foreground"
            >
              <motion.div
                className="flex items-center gap-1.5"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.svg
                  className="w-4 h-4 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </motion.svg>
                <span className="font-medium">
                  <AnimatedCounter to={1000} duration={2.5} suffix="+" /> Verified Homestays
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-1.5"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.svg
                  className="w-4 h-4 text-accent"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4, type: "spring" }}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </motion.svg>
                <span className="font-medium">
                  <AnimatedCounter to={4.8} decimals={1} />★ Average Rating
                </span>
              </motion.div>
              <motion.div
                className="flex items-center gap-1.5"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.4, type: "spring" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </motion.svg>
                <span className="font-medium">Safe & Secure Booking</span>
              </motion.div>
            </motion.div>

            {/* Promotional Card with improved design */}
            <motion.div
              variants={itemVariants}
              className="bg-card rounded-2xl mt-6 sm:mt-8 flex overflow-hidden max-w-full sm:max-w-6xl md:max-w-7xl mx-auto min-h-[160px] sm:min-h-[180px] md:min-h-[200px] shadow-md hover:shadow-lg transition-shadow duration-300 border border-border"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-[35%] sm:w-[30%] relative">
                <Image
                  src="/images/hero/hero1.avif"
                  alt="Traditional Nepalese homestay with mountain views"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="w-[65%] sm:w-[70%] bg-gradient-to-br from-muted/30 to-card p-4 sm:p-5 flex items-center">
                <div className="flex-1">
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold text-card-foreground mb-1.5">
                    Discover Authentic Homestays
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Experience the warmth of Nepalese hospitality in traditional homes.
                  </p>
                </div>
                <div className="hidden sm:flex justify-end items-center gap-3 ml-4">
                  <button className="text-card-foreground px-5 py-2.5 rounded-full text-sm font-semibold bg-accent/20 hover:bg-accent/30 transition-all duration-200 hover:scale-105 shadow-sm">
                    Learn More
                  </button>
                  <button className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Sign In Card */}
            <SignInCard />

            {/* Three Feature Cards - Improved Mobile Responsiveness with Stagger */}
            <motion.div
              variants={cardStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-6 sm:mt-8"
            >
              {newCards.map((card) => (
                <motion.div
                  key={card.id}
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-accent/10 rounded-xl h-[150px] sm:h-[160px] flex overflow-hidden shadow-sm hover:shadow-md border border-border"
                >
                  {/* Text and Link Section */}
                  <div className="w-[50%] p-4 sm:p-5 flex flex-col justify-between">
                    <div className="space-y-1">
                      {card.textLines.map((line, index) => (
                        <p
                          key={index}
                          className="text-xs sm:text-sm text-card-foreground font-semibold leading-snug"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                    <button className="flex items-center gap-1.5 text-foreground text-xs sm:text-sm font-medium hover:gap-2 transition-all group-hover:text-primary">
                      Explore Now
                      <ArrowRightSVG className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </div>
                  {/* Image Section */}
                  <div className="w-[50%] relative overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      priority={card.id === 2}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}