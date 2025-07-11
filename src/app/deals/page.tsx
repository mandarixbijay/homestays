// src/app/deals/page.tsx
"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { DateGuestLocationPicker } from "@/components/homestay/components/details/date-guest-location-picker";
import { dealCardsData, DealCardData } from "@/data/deals";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import DealCard from "@/components/landing-page/landing-page-components/cards/deal-card";
import { Skeleton } from "@/components/ui/skeleton";

const heroVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const searchBarVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
  },
};

const imageVariants: Variants = {
  initial: { scale: 1.2, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: "easeOut" },
  },
};

interface Room {
  adults: number;
  children: number;
}

function DealsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse query parameters
  const location = searchParams.get("location");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");
  const rooms = searchParams.get("rooms");

  // Initialize DateGuestLocationPicker state
  const initialDate: DateRange | undefined = checkIn
    ? {
        from: new Date(checkIn),
        to: checkOut ? new Date(checkOut) : undefined,
      }
    : undefined;

  const initialRooms: Room[] = guests
    ? guests.split(",").map((guest) => {
        const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
        return { adults, children };
      })
    : [{ adults: 2, children: 0 }];

  const [sortOption, setSortOption] = useState("price-low-high");

  // Compute guest summary
  const guestSummary = useMemo(() => {
    const totalGuests = initialRooms.reduce((sum, room) => sum + room.adults + room.children, 0);
    const totalRooms = initialRooms.length;
    return `${totalGuests} traveler${totalGuests !== 1 ? "s" : ""}, ${totalRooms} room${totalRooms !== 1 ? "s" : ""}`;
  }, [initialRooms]);

  // Compute date summary
  const dateSummary = useMemo(() => {
    if (checkIn && checkOut) {
      try {
        return `${format(new Date(checkIn), "MMM d")} - ${format(new Date(checkOut), "MMM d")}`;
      } catch (error) {
        console.error("Invalid date format:", error);
        return "Any dates";
      }
    }
    return "Any dates";
  }, [checkIn, checkOut]);

  // Handle search from DateGuestLocationPicker
  const handleSearch = (searchData: {
    location: string | null;
    date: DateRange | undefined;
    rooms: Room[];
  }) => {
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

    router.push(`/deals?${queryParams.toString()}`);
  };

  // Filter deals based on location
  const filteredDeals = useMemo(() => {
    return dealCardsData.filter((deal) => {
      if (!location || location === "") {
        return true;
      }
      return deal.location.toLowerCase() === location.toLowerCase();
    });
  }, [location]);

  // Sort filtered deals
  const sortedDeals = useMemo(() => {
    return [...filteredDeals].sort((a, b) => {
      if (sortOption === "price-low-high") {
        return parseFloat(a.totalPrice.replace("$", "")) - parseFloat(b.totalPrice.replace("$", ""));
      } else if (sortOption === "price-high-low") {
        return parseFloat(b.totalPrice.replace("$", "")) - parseFloat(a.totalPrice.replace("$", ""));
      } else if (sortOption === "rating") {
        return parseFloat(b.rating) - parseFloat(a.rating);
      }
      return 0;
    });
  }, [sortOption, filteredDeals]);

  // Build query string for navigation
  const buildQueryString = () => {
    const queryParams = new URLSearchParams();
    if (location) queryParams.append("location", location);
    if (checkIn) queryParams.append("checkIn", checkIn);
    if (checkOut) queryParams.append("checkOut", checkOut);
    if (guests) queryParams.append("guests", guests);
    if (rooms) queryParams.append("rooms", rooms);
    return queryParams.toString();
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px]">
        <motion.div
          variants={imageVariants}
          initial="initial"
          animate="animate"
          className="relative w-full h-full"
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%)",
          }}
        >
          <Image
            src="/images/deals_hero.avif"
            alt="Discover amazing weekend getaway deals in Nepal"
            fill
            className="object-cover brightness-75"
            sizes="100vw"
            quality={85}
            priority
            placeholder="blur"
            blurDataURL="/images/placeholder-homestay.jpg"
            onError={(e) => {
              console.error("❌ Failed to load image: /images/deals_hero.avif");
              e.currentTarget.src = "/images/fallback-image.png";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </motion.div>
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="animate"
          className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg tracking-tight leading-tight">
            Unmissable <span className="text-accent">Weekend Getaways</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl mt-4 max-w-2xl font-medium">
            Save up to <span className="font-semibold text-accent">30% off</span> on your next adventure!
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={searchBarVariants}
        initial="hidden"
        animate="animate"
        className="container mx-auto -mt-16 sm:-mt-20 md:-mt-24 z-10 px-4 sm:px-6"
      >
        <div className="w-full max-w-5xl mx-auto bg-card/90 backdrop-blur-md rounded-2xl shadow-md border border-border p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <DateGuestLocationPicker
              onSearch={handleSearch}
              initialLocation={location || ""}
              initialDate={initialDate}
              initialRooms={initialRooms}
            />
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Explore Our Deals
          </h2>
          <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-0">
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Showing deals for: <span className="font-semibold">{dateSummary}</span> • {guestSummary}
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="button-outline flex items-center gap-2 rounded-full"
                  aria-label="Sort deals"
                >
                  <Filter className="w-4 h-4" />
                  Sort
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant={sortOption === "default" ? "default" : "outline"}
                    onClick={() => setSortOption("default")}
                    className="justify-start text-sm"
                  >
                    Default
                  </Button>
                  <Button
                    variant={sortOption === "price-low-high" ? "default" : "outline"}
                    onClick={() => setSortOption("price-low-high")}
                    className="justify-start text-sm"
                  >
                    Price: Low to High
                  </Button>
                  <Button
                    variant={sortOption === "price-high-low" ? "default" : "outline"}
                    onClick={() => setSortOption("price-high-low")}
                    className="justify-start text-sm"
                  >
                    Price: High to Low
                  </Button>
                  <Button
                    variant={sortOption === "rating" ? "default" : "outline"}
                    onClick={() => setSortOption("rating")}
                    className="justify-start text-sm"
                  >
                    Rating
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {filteredDeals.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-text-secondary text-lg"
          >
            No deals found matching your criteria.
          </motion.p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {sortedDeals.map((deal, index) => (
                <motion.div
                  key={`${deal.slug}-${index}`}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, delay: index * 0.1, ease: "easeOut" },
                    },
                    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
                    hover: { scale: 1.03, transition: { duration: 0.3 } },
                  }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover="hover"
                  className="cursor-pointer"
                  onClick={() => {
                    const queryString = buildQueryString();
                    router.push(
                      `/homestays/${deal.slug}?imageUrl=${encodeURIComponent(
                        deal.imageSrc ||
                        "https://via.placeholder.com/350x208?text=No+Image+Available"
                      )}${queryString ? `&${queryString}` : ""}`
                    );
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      const queryString = buildQueryString();
                      router.push(
                        `/homestays/${deal.slug}?imageUrl=${encodeURIComponent(
                          deal.imageSrc ||
                          "https://via.placeholder.com/350x208?text=No+Image+Available"
                        )}${queryString ? `&${queryString}` : ""}`
                      );
                    }
                  }}
                  aria-label={`View details for ${deal.hotelName}`}
                >
                  <DealCard {...deal} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <Footer />
    </section>
  );
}

export default function DealsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex flex-col items-center bg-gradient-to-b from-background to-muted/30">
          <Navbar />
          <Skeleton className="w-full h-[400px] sm:h-[500px] md:h-[600px]" />
          <div className="container mx-auto -mt-16 sm:-mt-20 md:-mt-24 z-10 px-4 sm:px-6">
            <Skeleton className="w-full max-w-5xl h-16 mx-auto rounded-2xl" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-8 w-1/4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          <Footer />
        </div>
      }
    >
      <DealsPageContent />
    </Suspense>
  );
}