"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import DealCard from "./landing-page-components/cards/deal-card";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";

// Import dealCardsData from a shared source to avoid duplication
import { dealCardsData as sharedDealCardsData } from "@/data/deals";

// Deal card data
export const dealCardsData = [
  {
    imageSrc: "/images/deal/sitapaila_homestay.webp",
    location: "Kathmandu",
    hotelName: "Sitapaila Homestay",
    rating: "9.6",
    reviews: "Exceptional (25 reviews)",
    originalPrice: "$26",
    nightlyPrice: "$18",
    totalPrice: "$18",
    categoryColor: "bg-primary",
    slug: "sitapaila-homestay",
    features: ["Free WiFi", "Breakfast included", "Parking"],
  },
  {
    imageSrc: "/images/deal/Dorje_Homestay.jpg",
    location: "Kathmandu",
    hotelName: "Dorje Homestay",
    rating: "9.0",
    reviews: "Wonderful (239 reviews)",
    originalPrice: "$28",
    nightlyPrice: "$22",
    totalPrice: "$22",
    categoryColor: "bg-accent",
    slug: "dorje-homestay",
    features: ["Free WiFi", "Family rooms", "Airport shuttle"],
  },
  {
    imageSrc: "/images/deal/tibetan_homestay.jpg",
    location: "Pokhara",
    hotelName: "Tibetan Homestay",
    rating: "9.0",
    reviews: "Wonderful (2,253 reviews)",
    originalPrice: "$25",
    nightlyPrice: "$18",
    totalPrice: "$18",
    vipAccess: false,
    categoryColor: "bg-discount",
    slug: "tibetan-homestay",
    features: ["Mountain view", "Breakfast included", "Pet friendly"],
  },
  {
    imageSrc: "/images/deal/satkhauluwa_homestay.jpg",
    location: "Thori",
    hotelName: "Satkhaluwa Homestay",
    rating: "9.6",
    reviews: "Exceptional (41 reviews)",
    originalPrice: "$28",
    nightlyPrice: "$22.9",
    totalPrice: "$22.9",
    discount: "18% off",
    categoryColor: "bg-warning",
    slug: "satkhaluwa-homestay",
    features: ["Free WiFi", "Breakfast included", "Garden"],
  },
  {
    imageSrc: "/images/deal/corridor_homestays.jpg",
    location: "Bardiya",
    hotelName: "Corridor Homestays",
    rating: "9.0",
    reviews: "Wonderful (239 reviews)",
    originalPrice: "$25",
    nightlyPrice: "$17",
    totalPrice: "$17",
    categoryColor: "bg-primary",
    slug: "corridor-homestays",
    features: ["Free parking", "Family rooms", "Breakfast included"],
  },
];

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function Hero1() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Get current date and next day for dynamic date range
  const currentDate = new Date();
  const nextDate = addDays(currentDate, 1);
  const dateRange = `${format(currentDate, "MMM d")} - ${format(nextDate, "MMM d")}`;

  // Set isMobile based on window width on client side
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoize card width calculation
  const getCardWidth = useCallback(() => {
    return scrollContainerRef.current?.children[0]?.clientWidth || 240;
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (scrollContainerRef.current) {
        const cardWidth = getCardWidth();
        scrollContainerRef.current.scrollTo({
          left: index * (cardWidth + 24), // Adjusted for gap-6 (24px)
          behavior: "smooth",
        });
        setCurrentIndex(index);
      }
    },
    [getCardWidth]
  );

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = getCardWidth();
      const index = Math.round(scrollLeft / (cardWidth + 24)); // Adjusted for gap-6 (24px)
      setCurrentIndex(index);
    }
  }, [getCardWidth]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
   <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
      className="w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-background to-gray-50/50 overflow-x-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div
          variants={sectionVariants}
          className="flex flex-col sm:flex-row justify-between items-center mb-8 text-center sm:text-left"
        >
          <div className="mb-4 sm:mb-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Last-Minute Deals
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium">
              Deals for: <span className="text-accent">{dateRange}</span>
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="default"
              className="bg-primary text-white px-8 py-3 rounded-lg"
              onClick={() => router.push("/deals")}
              aria-label="See all last-minute deals"
            >
              See All Deals
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <div
            ref={scrollContainerRef}
            className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory min-h-[300px] touch-pan-x"
            role="region"
            aria-label="Last-minute deals carousel"
          >
            {dealCardsData.map((card, index) => (
              <motion.div
                key={card.slug}
                variants={cardItemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="snap-start w-[240px] sm:w-[260px] flex-shrink-0 cursor-pointer"
                onClick={() => router.push(`/deals`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    router.push(`/deals`);
                  }
                }}
                aria-label={`View details for ${card.hotelName}`}
              >
                <DealCard {...card} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-center gap-3 mt-6">
          {dealCardsData.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to deal ${index + 1}`}
              className={`h-4 w-4 rounded-full ${
                currentIndex === index ? "bg-primary w-8 scale-125" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}