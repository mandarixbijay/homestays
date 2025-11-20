"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import DealCard from "./landing-page-components/cards/deal-card";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";

// Helper function to get rating category color
const getRatingColor = (rating: number | null) => {
  if (!rating) return "bg-gray-500";
  if (rating >= 9.5) return "bg-primary";
  if (rating >= 9.0) return "bg-accent";
  if (rating >= 8.0) return "bg-warning";
  return "bg-gray-500";
};

// Helper function to format rating text
const getRatingText = (rating: number | null, reviews: number) => {
  if (!rating) return "No rating";
  if (rating >= 9.5) return "Exceptional";
  if (rating >= 9.0) return "Wonderful";
  if (rating >= 8.0) return "Very Good";
  return "Good";
};

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
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get current date and next day for dynamic date range
  const currentDate = new Date();
  const nextDate = addDays(currentDate, 1);
  const dateRange = `${format(currentDate, "MMM d")} - ${format(nextDate, "MMM d")}`;

  // Fetch deals from API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/homestays/last-minute-deals?page=1&limit=12');
        if (!response.ok) throw new Error("Failed to fetch deals");
        const data = await response.json();
        console.log("API Response:", data);
        console.log("Deals data:", data.data);
        setDeals(data.data || []);
      } catch (error) {
        console.error("Error fetching deals:", error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Set isMobile based on window width on client side
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoize card width and gap calculation
  const getCardMetrics = useCallback(() => {
    const firstChild = scrollContainerRef.current?.children[0];
    if (!firstChild) {
      return { cardWidth: 240, gap: 24 };
    }
    const cardWidth = firstChild.clientWidth;
    // Gap is 24px (gap-6) on mobile, 32px (gap-8) on sm and up
    const gap = window.innerWidth < 640 ? 24 : 32;
    return { cardWidth, gap };
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (scrollContainerRef.current && deals.length > 0) {
        const { cardWidth, gap } = getCardMetrics();
        scrollContainerRef.current.scrollTo({
          left: index * (cardWidth + gap),
          behavior: "smooth",
        });
        setCurrentIndex(index);
      }
    },
    [getCardMetrics, deals.length]
  );

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current && deals.length > 0) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const { cardWidth, gap } = getCardMetrics();
      const index = Math.round(scrollLeft / (cardWidth + gap));
      setCurrentIndex(Math.min(Math.max(0, index), deals.length - 1));
    }
  }, [getCardMetrics, deals.length]);

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
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : deals.length === 0 ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <p className="text-muted-foreground">No deals available at the moment.</p>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory min-h-[300px] touch-pan-x"
              role="region"
              aria-label="Last-minute deals carousel"
            >
              {deals.map((deal, index) => {
                const rating = deal.homestay?.rating || null;
                const reviews = deal.homestay?.reviews || 0;
                const ratingText = getRatingText(rating, reviews);

                return (
                  <motion.div
                    key={deal.id}
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
                    aria-label={`View details for ${deal.homestay?.name}`}
                  >
                    <DealCard
                      imageSrc={deal.homestay?.imageSrc || "/images/placeholder.jpg"}
                      location={deal.homestay?.address || "Unknown"}
                      hotelName={deal.homestay?.name || "Unnamed Homestay"}
                      rating={rating ? rating.toFixed(1) : "N/A"}
                      reviews={`${ratingText} (${reviews} reviews)`}
                      originalPrice={`NPR ${Math.round(deal.originalPrice).toLocaleString()}`}
                      nightlyPrice={`NPR ${Math.round(deal.discountedPrice).toLocaleString()}`}
                      totalPrice={`NPR ${Math.round(deal.discountedPrice).toLocaleString()}`}
                      categoryColor={getRatingColor(rating)}
                      slug={`deal-${deal.id}`}
                      features={deal.homestay?.facilities || []}
                      discount={deal.discountType === 'PERCENTAGE' ? `${deal.discount}% off` : `NPR ${deal.discount} off`}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {!loading && deals.length > 0 && (
          <div className="flex justify-center gap-3 mt-6">
            {deals.map((_, index) => (
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
        )}
      </div>
    </motion.section>
  );
}