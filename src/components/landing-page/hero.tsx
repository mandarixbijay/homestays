"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import Image from "next/image";
import SignInCard from "../homestay/components/sign-in-card";
import { DateGuestLocationPicker } from "@/components/homestay/components/details/date-guest-location-picker";
import { DateRange } from "react-day-picker";

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
    <div className="relative w-full h-[60vh] min-h-[400px] sm:min-h-[500px] md:min-h-[600px] bg-background">
      <section id="home" className="w-full h-full relative pt-40 sm:pt-40 md:pt-44">
        <div className="relative z-30 px-4 sm:px-6 md:px-8">
          <div className="container mx-auto max-w-full sm:max-w-6xl md:max-w-7xl">
            {/* Search Bar in Card */}
            <div
              className="bg-white rounded-xl border border-gray-300 p-3 sm:p-4 md:p-5"
            >
              <DateGuestLocationPicker
                onSearch={handleSearch}
                initialDate={defaultDateRange}
              />
            </div>

            {/* New Card with Image, Text, and Buttons */}
            <div
              className="bg-white rounded-xl mt-6 sm:mt-8 flex overflow-hidden max-w-full sm:max-w-6xl md:max-w-7xl mx-auto min-h-[150px] sm:min-h-[180px] md:min-h-[200px]"
            >
              <div className="w-[30%] relative">
                <Image
                  src="/images/hero/hero1.avif"
                  alt="Traditional Nepalese homestay with mountain views"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="w-[70%] bg-gray-100 p-4 sm:p-5 flex items-center">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    Discover Authentic Homestays
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    Experience the warmth of Nepalese hospitality.
                  </p>
                </div>
                <div className="flex justify-end items-center space-x-3">
                  <button className="text-gray-800 px-4 py-2 rounded-full text-sm sm:text-base font-medium bg-yellow-100 hover:bg-yellow-200 transition-colors">
                    Learn More
                  </button>
                  <button className="text-gray-600 text-sm sm:text-base font-medium">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>

            {/* Sign In Card */}
            <SignInCard />

            {/* Three New Cards on Same Line */}
            <div className="flex flex-row sm:flex-row gap-4 mt-6 sm:mt-8 overflow-x-auto snap-x snap-mandatory">
              {newCards.map((card) => (
                <div
                  key={card.id}
                  className="flex-1 bg-[#FFF7E6] rounded-lg h-[140px] flex overflow-hidden snap-start min-w-[300px] sm:min-w-0"
                >
                  {/* Text and Link Section */}
                  <div className="w-[50%] p-3 sm:p-4 flex flex-col justify-center">
                    <div className="space-y-0.5">
                      {card.textLines.map((line, index) => (
                        <p
                          key={index}
                          className="text-xs sm:text-sm text-gray-900 font-bold line-clamp-1"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className="mt-2">
                      <button className="flex items-center gap-1 text-gray-800 text-[10px] sm:text-xs font-medium">
                        Explore Now
                        <ArrowRightSVG className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  {/* Image Section */}
                  <div className="w-[50%] relative">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      className="object-cover"
                      priority={card.id === 2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}