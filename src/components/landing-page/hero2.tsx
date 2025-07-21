"use client";

import React from "react";
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

export default function Hero2() {
  const router = useRouter();

  return (
    <section className="w-full px-4 sm:px-6 bg-white mt-8 sm:mt-12 md:mt-16 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 text-center sm:text-left">
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
        </div>

        <div
          className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory min-h-[300px] sm:min-h-[360px] md:min-h-[400px] touch-pan-x"
          role="region"
          aria-label="Top destinations carousel"
        >
          {categoryCardsData.map((card, index) => (
            <div
              key={index}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}