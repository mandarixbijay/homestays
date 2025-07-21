"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
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
   <section className="w-full pt-8 sm:pt-10 pb-16 px-6 sm:px-8 bg-background mt-96 sm:mt-32 md:mt-52 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 text-center sm:text-left">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Last-Minute Deals
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground font-medium">
              Deals for: <span className="text-accent">{dateRange}</span>
            </p>
          </div>
          <div>
            <Button
              variant="default"
              className="bg-primary text-white px-8 py-3 rounded-lg"
              onClick={() => router.push("/deals")}
              aria-label="See all last-minute deals"
            >
              See All Deals
            </Button>
          </div>
        </div>

        <div>
          <div
            ref={scrollContainerRef}
            className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory min-h-[300px] touch-pan-x"
            role="region"
            aria-label="Last-minute deals carousel"
          >
            {dealCardsData.map((card, index) => (
              <div
                key={card.slug}
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
              </div>
            ))}
          </div>
        </div>

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
    </section>
  );
}