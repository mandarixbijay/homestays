// src/components/landing-page/hero2.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CategoryCard from "./landing-page-components/cards/category-card";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";

const categoryCardsData = [
  { imageSrc: "/images/location/bhaktapur.avif", categoryName: "Bhaktapur", categoryColor: "bg-primary" }, // #1A403D
  { imageSrc: "/images/location/pokhara.avif", categoryName: "Pokhara", categoryColor: "bg-accent" }, // #D4A017
  { imageSrc: "/images/location/chitwan.avif", categoryName: "Chitwan", categoryColor: "bg-discount" }, // #A9CBB7
  { imageSrc: "/images/location/lumbini.avif", categoryName: "Lumbini", categoryColor: "bg-warning" }, // #f59e0b
  { imageSrc: "/images/location/bhairawa.avif", categoryName: "Bhairava", categoryColor: "bg-primary" }, // #1A403D
  { imageSrc: "/images/location/kathmandu.avif", categoryName: "Kathmandu", categoryColor: "bg-accent" }, // #D4A017
  { imageSrc: "/images/location/bandipur.avif", categoryName: "Bandipur", categoryColor: "bg-discount" }, // #A9CBB7
];

export default function Hero2() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false); // New state for window width
  const router = useRouter();

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

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.children[0]?.clientWidth || 360;
      scrollContainerRef.current.scrollTo({
        left: index * (cardWidth + 16), // Account for gap-4 (16px)
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const scrollLeft = () => {
    const newIndex = Math.max(currentIndex - (isMobile ? 1 : 3), 0);
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    const maxIndex = categoryCardsData.length - (isMobile ? 1 : 3);
    const newIndex = Math.min(currentIndex + (isMobile ? 1 : 3), maxIndex);
    scrollToIndex(newIndex);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = scrollContainerRef.current.children[0]?.clientWidth || 360;
      const index = Math.round(scrollLeft / (cardWidth + 16)); // Account for gap-4
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation variants with explicit typing
  const containerVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  const cardVariants: Variants = {
    initial: { opacity: 0, x: 30 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
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
              Top Destinations
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium">
              Discover Nepal’s most enchanting homestay locations
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
              onClick={() => router.push("/search")}
              aria-label="Explore all destinations"
            >
              Explore All Destinations
            </Button>
          </motion.div>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            onClick={scrollLeft}
            className="hidden sm:flex absolute -left-6 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur-md shadow-md hover:bg-primary/10 rounded-full z-10"
            aria-label="Scroll to previous destinations"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-center pb-4"
          >
            {categoryCardsData.map((card, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="snap-center w-[90vw] sm:w-[360px] max-w-[360px] flex-shrink-0 cursor-pointer group"
                onClick={() => router.push(`/search?destination=${card.categoryName.toLowerCase()}`)}
                whileHover="hover"
              >
                <CategoryCard {...card} />
              </motion.div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={scrollRight}
            className="hidden sm:flex absolute -right-6 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur-md shadow-md hover:bg-primary/10 rounded-full z-10"
            aria-label="Scroll to next destinations"
            disabled={currentIndex >= categoryCardsData.length - (isMobile ? 1 : 3)} // Use isMobile
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {categoryCardsData.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to destination ${index + 1}`}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                currentIndex === index ? "bg-primary scale-125 w-6" : "bg-muted hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}