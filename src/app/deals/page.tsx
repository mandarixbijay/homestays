// src/app/deals/page.tsx
"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { DateGuestLocationPicker } from "@/components/homestay/components/details/date-guest-location-picker";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import DealCard from "@/components/landing-page/landing-page-components/cards/deal-card";
import { Skeleton } from "@/components/ui/skeleton";

// Helper functions from hero1.tsx
const getRatingColor = (rating: number | null) => {
  if (!rating) return "bg-gray-500";
  if (rating >= 9.5) return "bg-primary";
  if (rating >= 9.0) return "bg-accent";
  if (rating >= 8.0) return "bg-warning";
  return "bg-gray-500";
};

const getRatingText = (rating: number | null, reviews: number) => {
  if (!rating) return "No rating";
  if (rating >= 9.5) return "Exceptional";
  if (rating >= 9.0) return "Wonderful";
  if (rating >= 8.0) return "Very Good";
  return "Good";
};

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
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const dealsPerPage = 12;

  // Fetch deals from API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/homestays/last-minute-deals?page=${currentPage}&limit=${dealsPerPage}`
        );
        if (!response.ok) throw new Error("Failed to fetch deals");
        const data = await response.json();
        setDeals(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Error fetching deals:", error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [currentPage]);

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
    return deals.filter((deal) => {
      if (!location || location === "") {
        return true;
      }
      return deal.homestay?.address?.toLowerCase().includes(location.toLowerCase());
    });
  }, [location, deals]);

  // Sort filtered deals
  const sortedDeals = useMemo(() => {
    return [...filteredDeals].sort((a, b) => {
      if (sortOption === "price-low-high") {
        return (a.discountedPrice || 0) - (b.discountedPrice || 0);
      } else if (sortOption === "price-high-low") {
        return (b.discountedPrice || 0) - (a.discountedPrice || 0);
      } else if (sortOption === "rating") {
        return (b.homestay?.rating || 0) - (a.homestay?.rating || 0);
      } else if (sortOption === "discount") {
        // Sort by discount amount/percentage
        return (b.discount || 0) - (a.discount || 0);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Explore Our Deals
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading deals...
                </span>
              ) : (
                <>Showing {sortedDeals.length} of {total} deals</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="hidden lg:block text-sm text-muted-foreground font-medium">
              {dateSummary} • {guestSummary}
            </div>
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
              <PopoverContent className="w-56 p-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant={sortOption === "default" ? "default" : "ghost"}
                    onClick={() => setSortOption("default")}
                    className="justify-start text-sm"
                  >
                    Default
                  </Button>
                  <Button
                    variant={sortOption === "price-low-high" ? "default" : "ghost"}
                    onClick={() => setSortOption("price-low-high")}
                    className="justify-start text-sm"
                  >
                    Price: Low to High
                  </Button>
                  <Button
                    variant={sortOption === "price-high-low" ? "default" : "ghost"}
                    onClick={() => setSortOption("price-high-low")}
                    className="justify-start text-sm"
                  >
                    Price: High to Low
                  </Button>
                  <Button
                    variant={sortOption === "rating" ? "default" : "ghost"}
                    onClick={() => setSortOption("rating")}
                    className="justify-start text-sm"
                  >
                    Highest Rated
                  </Button>
                  <Button
                    variant={sortOption === "discount" ? "default" : "ghost"}
                    onClick={() => setSortOption("discount")}
                    className="justify-start text-sm"
                  >
                    Biggest Discount
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : sortedDeals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <Filter className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No deals found</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {location
                ? `No deals available in "${location}" right now. Try adjusting your search.`
                : "No deals available at the moment. Check back soon for amazing offers!"
              }
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence mode="popLayout">
                {sortedDeals.map((deal, index) => {
                  const rating = deal.homestay?.rating || null;
                  const reviews = deal.homestay?.reviews || 0;
                  const ratingText = getRatingText(rating, reviews);

                  return (
                    <motion.div
                      key={`deal-${deal.id}`}
                      variants={{
                        initial: { opacity: 0, y: 20 },
                        animate: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.4,
                            delay: Math.min(index * 0.05, 0.4),
                            ease: "easeOut"
                          },
                        },
                        exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
                      }}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                      className="cursor-pointer"
                      onClick={() => {
                        const queryString = buildQueryString();
                        // Navigate to homestay detail page
                        router.push(
                          `/homestays/${deal.homestay?.id || deal.id}${queryString ? `?${queryString}` : ""}`
                        );
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          const queryString = buildQueryString();
                          router.push(
                            `/homestays/${deal.homestay?.id || deal.id}${queryString ? `?${queryString}` : ""}`
                          );
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
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mt-12"
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(page)}
                          disabled={loading}
                          className="rounded-full w-10 h-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-muted-foreground">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="rounded-full"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </>
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