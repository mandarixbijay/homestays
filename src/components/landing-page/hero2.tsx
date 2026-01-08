"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CategoryCard from "./landing-page-components/cards/category-card";
import { useRouter } from "next/navigation";

interface Destination {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isTopDestination: boolean;
  priority: number | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    homestays: number;
  };
}

// Fallback static data in case API fails
const fallbackData = [
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
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch("/api/homestays/destinations/top");
        if (!response.ok) {
          throw new Error("Failed to fetch destinations");
        }
        const data = await response.json();
        setDestinations(data);
      } catch (err) {
        console.error("[Hero2] Error fetching destinations:", err);
        setError("Failed to load destinations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Transform API data to card format
  const categoryCardsData = destinations.length > 0
    ? destinations.map((dest) => ({
        imageSrc: dest.imageUrl,
        categoryName: dest.name,
        homestayCount: dest._count.homestays,
      }))
    : fallbackData.map((item) => ({ ...item, homestayCount: undefined }));

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
              Discover Nepal's most enchanting homestay locations
            </p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory min-h-[300px] sm:min-h-[360px] md:min-h-[400px]">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="snap-start w-[260px] sm:w-[300px] md:w-[340px] flex-shrink-0"
              >
                <div className="animate-pulse bg-gray-200 rounded-2xl h-[280px] sm:h-[320px] md:h-[360px]" />
              </div>
            ))}
          </div>
        ) : (
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
                <CategoryCard
                  imageSrc={card.imageSrc}
                  categoryName={card.categoryName}
                  homestayCount={card.homestayCount}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
