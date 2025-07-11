// src/components/landing-page/hero.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { DateGuestLocationPicker } from "@/components/homestay/components/details/date-guest-location-picker";
import { DateRange } from "react-day-picker";

// Data for hero images and text
const data = [
  { id: 1, image: "/images/hero/hero1.avif", alt: "Traditional Nepalese homestay with mountain views" },
  { id: 2, image: "/images/hero/hero2.avif", alt: "Scenic homestay in Himalayan foothills" },
  { id: 3, image: "/images/hero/hero3.avif", alt: "Cultural homestay experience with local family" },
  { id: 4, image: "/images/hero/hero4.avif", alt: "Traditional architecture homestay" },
  { id: 5, image: "/images/hero/hero5.avif", alt: "Premium homestay with modern amenities" },
  { id: 6, image: "/images/hero/hero6.avif", alt: "Mountain view homestay with terraced fields" },
];

const textOptions = [
  {
    title: "Discover Nepal",
    subtitle: "Homestays",
    description: "Immerse in local culture with family stays",
    highlight: "Up to 30% off first booking",
  },
  {
    title: "Nature's",
    subtitle: "Paradise",
    description: "Breathtaking mountain views await",
    highlight: "500+ verified homestays",
  },
  {
    title: "Unforgettable",
    subtitle: "Memories",
    description: "Experience true Nepalese hospitality",
    highlight: "Rated 4.9/5 by travelers",
  },
  {
    title: "Live Local",
    subtitle: "in Nepal",
    description: "Stay with families, explore traditions",
    highlight: "Exclusive deals available",
  },
  {
    title: "Adventure",
    subtitle: "Awaits",
    description: "Discover unique homestay experiences",
    highlight: "Flexible cancellations",
  },
  {
    title: "Serenity &",
    subtitle: "Culture",
    description: "Relax in cozy Nepalese homestays",
    highlight: "Top-rated hosts",
  },
];

interface Room {
  adults: number;
  children: number;
}

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoadErrorMap, setImageLoadErrorMap] = useState<Record<number, boolean>>({});
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.8]);
  const router = useRouter();

  // Dynamic date (today: July 10, 2025)
  const currentDate = new Date(2025, 6, 10);
  const dateString = format(currentDate, "MMM d, yyyy");

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const imageVariants: Variants = {
    active: { opacity: 1, scale: 1.02, transition: { duration: 1, ease: "easeInOut" } },
    inactive: { opacity: 0, scale: 1, transition: { duration: 1, ease: "easeInOut" } },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const handleDotClick = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const handleSearch = useCallback(
    (searchData: { location: string | null; date: DateRange | undefined; rooms: Room[] }) => {
      const queryParams = new URLSearchParams();
      if (searchData.location) {
        queryParams.append("location", searchData.location);
      }
      if (searchData.date?.from) {
        queryParams.append("checkIn", format(searchData.date.from, "yyyy-MM-dd"));
      }
      if (searchData.date?.to) {
        queryParams.append("checkOut", format(searchData.date.to, "yyyy-MM-dd"));
      }
      queryParams.append(
        "guests",
        searchData.rooms
          .map((room) => `${room.adults}A${room.children}C`)
          .join(",")
      );
      queryParams.append("rooms", searchData.rooms.length.toString());

      router.push(`/search?${queryParams.toString()}`);
    },
    [router]
  );

  return (
    <div className="relative w-full h-screen min-h-[500px] sm:min-h-[600px] md:min-h-[700px] overflow-hidden">
      <section id="home" className="w-full h-full relative">
        {/* Background Image */}
        <motion.div className="absolute inset-0 z-0" style={{ y: parallaxY, opacity }}>
          {data.map((item, index) => (
            <motion.div
              key={item.id}
              className="absolute inset-0"
              variants={imageVariants}
              animate={currentSlide === index ? "active" : "inactive"}
              initial="inactive"
            >
              <Image
                src={imageLoadErrorMap[item.id] ? "/images/fallback-image.png" : item.image}
                alt={item.alt}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
                placeholder="blur"
                blurDataURL="/images/placeholder-homestay.jpg"
                onError={() => setImageLoadErrorMap((prev) => ({ ...prev, [item.id]: true }))}
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          ))}
        </motion.div>

        {/* Text Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 z-10">
          <motion.div
            key={currentSlide}
            variants={textVariants}
            initial="hidden"
            animate="animate"
            className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg leading-tight">
              <span className="block">{textOptions[currentSlide].title}</span>
              <span className="block text-accent">{textOptions[currentSlide].subtitle}</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/90 drop-shadow-md max-w-xl">
              {textOptions[currentSlide].description}
            </p>
            <p className="text-xs sm:text-sm md:text-base text-white bg-accent/20 rounded-full px-4 py-2 inline-block shadow-md">
              {textOptions[currentSlide].highlight}
            </p>
          </motion.div>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {data.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-3 w-3 rounded-full transition-all duration-300",
                currentSlide === index
                  ? "bg-accent scale-125 w-6"
                  : "bg-white/50 hover:bg-white/80"
              )}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index ? "true" : "false"}
            />
          ))}
        </div>

        {/* Search Bar */}
        <div className="absolute bottom-4 left-0 right-0 z-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-card/95 backdrop-blur-lg rounded-xl shadow-lg border border-border p-4 sm:p-6 ">
              <DateGuestLocationPicker onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}