"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CategoryCard from "./landing-page-components/cards/category-card";
import { useRouter } from "next/navigation";

const categoryCardsData = [
  { imageSrc: "/images/location/bhaktapur.avif", categoryName: "Bhaktapur" },
  { imageSrc: "/images/location/pokhara.avif", categoryName: "Pokhara" },
  { imageSrc: "/images/location/chitwan.avif", categoryName: "Chitwan" },
  { imageSrc: "/images/location/lumbini.avif", categoryName: "Lumbini" },
  { imageSrc: "/images/location/bhairawa.avif", categoryName: "Bhairava" },
  { imageSrc: "/images/location/kathmandu.avif", categoryName: "Kathmandu" },
  { imageSrc: "/images/location/bandipur.avif", categoryName: "Bandipur" },
];

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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function Hero2() {
  const router = useRouter();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
      className="w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-white overflow-x-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div
          variants={sectionVariants}
          className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 text-center sm:text-left"
        >
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Top Destinations
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium">
              Discover Nepal’s most enchanting homestay locations
            </p>
          </div>
          {/* <div>
            <Button
              variant="default"
              className="bg-primary text-white px-8 py-3 rounded-lg"
              onClick={() => router.push("/search")}
              aria-label="Explore all destinations"
            >
              Explore All Destinations
            </Button>
          </div> */}
        </motion.div>

        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory min-h-[300px] sm:min-h-[360px] md:min-h-[400px] touch-pan-x"
          role="region"
          aria-label="Top destinations carousel"
        >
          {categoryCardsData.map((card, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="snap-start w-[260px] sm:w-[300px] md:w-[340px] flex-shrink-0 cursor-pointer"
              onClick={() => router.push(`/search?destination=${card.categoryName.toLowerCase()}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.push(`/search?destination=${card.categoryName.toLowerCase()}`);
                }
              }}
              aria-label={`View homestays in ${card.categoryName}`}
            >
              <CategoryCard {...card} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}