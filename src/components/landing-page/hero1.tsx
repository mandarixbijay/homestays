// src/components/landing-page/hero1.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DealCard from "./landing-page-components/cards/deal-card";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";

// Import dealCardsData from a shared source to avoid duplication
import { dealCardsData as sharedDealCardsData } from "@/data/deals";

// Deal card data (temporary, ideally use shared data)
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
    slug: "sitapaila-homestay", // Add slug
    features: ["Free WiFi", "Breakfast included", "Parking"], // Example features
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
    slug: "dorje-homestay", // Add slug
    features: ["Free WiFi", "Family rooms", "Airport shuttle"], // Example features
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
    slug: "tibetan-homestay", // Add slug
    features: ["Mountain view", "Breakfast included", "Pet friendly"], // Example features
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
    slug: "satkhaluwa-homestay", // Add slug
    features: ["Free WiFi", "Breakfast included", "Garden"], // Example features
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
    slug: "corridor-homestays", // Add slug
    features: ["Free parking", "Family rooms", "Breakfast included"], // Example features
  },
];

export default function Hero1() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false); // New state for window width
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

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoize card width calculation for performance
  const getCardWidth = useCallback(() => {
    return scrollContainerRef.current?.children[0]?.clientWidth || 260;
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (scrollContainerRef.current) {
        const cardWidth = getCardWidth();
        scrollContainerRef.current.scrollTo({
          left: index * (cardWidth + 16), // Account for gap-4 (16px)
          behavior: "smooth",
        });
        setCurrentIndex(index);
      }
    },
    [getCardWidth]
  );

  const scrollLeft = useCallback(() => {
    const cardsPerView = isMobile ? 1 : 3; // Use isMobile
    const newIndex = Math.max(currentIndex - cardsPerView, 0);
    scrollToIndex(newIndex);
  }, [currentIndex, scrollToIndex, isMobile]);

  const scrollRight = useCallback(() => {
    const cardsPerView = isMobile ? 1 : 3; // Use isMobile
    const maxIndex = dealCardsData.length - cardsPerView;
    const newIndex = Math.min(currentIndex + cardsPerView, maxIndex);
    scrollToIndex(newIndex);
  }, [currentIndex, scrollToIndex, isMobile]);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = getCardWidth();
      const index = Math.round(scrollLeft / (cardWidth + 16));
      setCurrentIndex(index);
    }
  }, [getCardWidth]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Animation variants
  const containerVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants: Variants = {
    initial: { opacity: 0, x: 30 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    hover: { scale: 1.03, transition: { duration: 0.3 } },
  };

  return (
    <section className="w-full py-12 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 text-center sm:text-left">
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="mb-4 sm:mb-0"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Last-Minute Deals
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium">
              Deals for: <span className="text-accent">{dateRange}</span>
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="default"
              className="button-primary px-8 py-3 rounded-full"
              onClick={() => router.push("/deals")}
              aria-label="See all last-minute deals"
            >
              See All Deals
            </Button>
          </motion.div>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            onClick={scrollLeft}
            className="hidden sm:flex absolute -left-8 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur-md shadow-md hover:bg-primary/10 rounded-full z-10"
            aria-label="Scroll to previous deals"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            role="region"
            aria-label="Last-minute deals carousel"
          >
            {dealCardsData.map((card, index) => (
              <motion.div
                key={card.slug} // Use slug for unique key
                variants={cardVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="snap-start w-[260px] flex-shrink-0 cursor-pointer"
                onClick={() => router.push(`/deals`)}
                whileHover="hover"
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
          <Button
            variant="outline"
            onClick={scrollRight}
            className="hidden sm:flex absolute -right-8 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur-md shadow-md hover:bg-primary/10 rounded-full z-10"
            aria-label="Scroll to next deals"
            disabled={currentIndex >= dealCardsData.length - (isMobile ? 1 : 3)} // Use isMobile
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {dealCardsData.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to deal ${index + 1}`}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "bg-primary scale-125 w-6"
                  : "bg-muted hover:bg-muted-foreground/50"
              }`}
              aria-current={currentIndex === index ? "true" : "false"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}