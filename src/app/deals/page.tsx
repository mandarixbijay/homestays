// src/app/deals/page.tsx
"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, Loader2, ChevronLeft, ChevronRight, Search as SearchIcon, X, Calendar as CalendarIcon, Users, Plus, Minus } from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import DealCard from "@/components/landing-page/landing-page-components/cards/deal-card";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchLocation, setSearchLocation] = useState(location || "");
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(initialDate);
  const [searchRooms, setSearchRooms] = useState<Room[]>(initialRooms);
  const [hasSearched, setHasSearched] = useState(false);
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const dealsPerPage = 12;

  // Transform availability check response to match last-minute-deals format
  const transformAvailabilityDeals = (homestays: any[]) => {
    return homestays.map((homestay) => {
      // If it already has the nested homestay structure, return as is
      if (homestay.homestay) {
        return homestay;
      }

      // Transform flat structure to nested structure
      const firstRoom = homestay.availableRooms?.[0] || homestay.rooms?.[0] || {};
      return {
        id: homestay.id,
        homestay: {
          id: homestay.id,
          name: homestay.name,
          address: homestay.address,
          rating: homestay.rating,
          reviews: homestay.reviews || 0,
          imageSrc: homestay.imageSrc || homestay.image,
          facilities: homestay.facilities || homestay.amenities || [],
        },
        rooms: homestay.availableRooms || homestay.rooms || [],
        originalPrice: firstRoom.originalPrice || homestay.originalPrice,
        discountedPrice: firstRoom.discountedPrice || homestay.discountedPrice,
        discount: firstRoom.discount || homestay.discount,
        discountType: firstRoom.discountType || homestay.discountType || 'PERCENTAGE',
      };
    });
  };

  // Fetch deals with availability check or all deals
  const fetchDeals = async (searchParams?: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    rooms?: Room[];
    page?: number;
  }) => {
    try {
      setLoading(true);

      // Check if this is a search request with filters
      const hasFilters = searchParams?.location || searchParams?.checkIn || searchParams?.checkOut;

      if (hasFilters) {
        // Use availability check endpoint for filtered searches
        const payload: any = {
          page: searchParams?.page || currentPage,
          limit: dealsPerPage,
        };

        if (searchParams?.location) {
          payload.location = searchParams.location;
        }

        if (searchParams?.checkIn && searchParams?.checkOut) {
          payload.checkIn = searchParams.checkIn;
          payload.checkOut = searchParams.checkOut;
        }

        if (searchParams?.rooms && searchParams.rooms.length > 0) {
          payload.rooms = searchParams.rooms;
        }

        const response = await fetch('/api/bookings/check-availability/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to fetch deals");
        const data = await response.json();

        console.log('Availability check response:', {
          totalCount: data.totalCount,
          homestaysLength: data.homestays?.length,
          sampleDeal: data.homestays?.[0]
        });

        // Transform the data to match expected format
        const transformedDeals = transformAvailabilityDeals(data.homestays || []);
        console.log('Transformed deal sample:', transformedDeals[0]);

        setDeals(transformedDeals);
        setTotalPages(data.totalPages || 1);
        setTotal(data.totalCount || 0);
      } else {
        // Use GET endpoint for all deals (no filters)
        const page = searchParams?.page || currentPage;
        const response = await fetch(`/api/homestays/last-minute-deals?page=${page}&limit=${dealsPerPage}`);

        if (!response.ok) throw new Error("Failed to fetch deals");
        const data = await response.json();

        // Transform the response to match the expected format
        setDeals(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }

      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching deals:", error);
      setDeals([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - fetch all deals
  useEffect(() => {
    fetchDeals({ page: 1 });
  }, []);

  // Search handler
  const handleSearchClick = () => {
    const searchParams: any = {
      page: 1, // Reset to page 1 on new search
    };

    if (searchLocation) {
      searchParams.location = searchLocation;
    }

    if (searchDate?.from && searchDate?.to) {
      searchParams.checkIn = format(searchDate.from, "yyyy-MM-dd");
      searchParams.checkOut = format(searchDate.to, "yyyy-MM-dd");
    }

    if (searchRooms && searchRooms.length > 0) {
      searchParams.rooms = searchRooms;
    }

    setCurrentPage(1);
    fetchDeals(searchParams);
  };

  // Clear search handler
  const handleClearSearch = () => {
    setSearchLocation("");
    setSearchDate(undefined);
    setSearchRooms([{ adults: 2, children: 0 }]);
    setCurrentPage(1);
    fetchDeals({ page: 1 });
  };

  // Handle pagination
  useEffect(() => {
    if (hasSearched && currentPage > 1) {
      const searchParams: any = { page: currentPage };

      if (searchLocation) searchParams.location = searchLocation;
      if (searchDate?.from && searchDate?.to) {
        searchParams.checkIn = format(searchDate.from, "yyyy-MM-dd");
        searchParams.checkOut = format(searchDate.to, "yyyy-MM-dd");
      }
      if (searchRooms) searchParams.rooms = searchRooms;

      fetchDeals(searchParams);
    }
  }, [currentPage]);

  // Compute guest summary
  const guestSummary = useMemo(() => {
    const totalGuests = searchRooms.reduce((sum, room) => sum + room.adults + room.children, 0);
    const totalRooms = searchRooms.length;
    return `${totalGuests} traveler${totalGuests !== 1 ? "s" : ""}, ${totalRooms} room${totalRooms !== 1 ? "s" : ""}`;
  }, [searchRooms]);

  // Compute date summary
  const dateSummary = useMemo(() => {
    if (searchDate?.from && searchDate?.to) {
      try {
        return `${format(searchDate.from, "MMM d")} - ${format(searchDate.to, "MMM d")}`;
      } catch (error) {
        console.error("Invalid date format:", error);
        return "Any dates";
      }
    }
    return "Any dates";
  }, [searchDate]);

  // Room management functions
  const addRoom = () => {
    setSearchRooms([...searchRooms, { adults: 2, children: 0 }]);
  };

  const removeRoom = (index: number) => {
    if (searchRooms.length > 1) {
      setSearchRooms(searchRooms.filter((_, i) => i !== index));
    }
  };

  const updateRoom = (index: number, field: "adults" | "children", value: number) => {
    const newRooms = [...searchRooms];
    newRooms[index][field] = Math.max(0, value);
    setSearchRooms(newRooms);
  };

  // Sort deals (no filtering needed, backend handles it)
  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      if (sortOption === "price-low-high") {
        return (a.discountedPrice || 0) - (b.discountedPrice || 0);
      } else if (sortOption === "price-high-low") {
        return (b.discountedPrice || 0) - (a.discountedPrice || 0);
      } else if (sortOption === "rating") {
        return (b.homestay?.rating || 0) - (a.homestay?.rating || 0);
      } else if (sortOption === "discount") {
        // Sort by discount value directly
        const getDiscountValue = (deal: any) => {
          if (deal.discountType === 'PERCENTAGE') {
            return deal.discount || 0;
          } else {
            // For fixed amount discounts, calculate percentage for comparison
            return deal.originalPrice ? ((deal.discount / deal.originalPrice) * 100) : 0;
          }
        };
        return getDiscountValue(b) - getDiscountValue(a);
      }
      return 0;
    });
  }, [sortOption, deals]);

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
        <div className="w-full max-w-6xl mx-auto bg-card/95 backdrop-blur-md rounded-2xl shadow-xl border border-border p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Location Search */}
            <div className="lg:col-span-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Location
              </label>
              <LocationAutocomplete
                value={searchLocation}
                onChange={setSearchLocation}
                placeholder="Search location..."
                className="h-11"
              />
            </div>

            {/* Check-in Date */}
            <div className="lg:col-span-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Check-in
              </label>
              <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !searchDate?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchDate?.from ? format(searchDate.from, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={searchDate?.from}
                    onSelect={(date) => {
                      setSearchDate({ from: date, to: searchDate?.to });
                      setIsCheckInOpen(false);
                      if (date && !searchDate?.to) {
                        setTimeout(() => setIsCheckOutOpen(true), 100);
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-out Date */}
            <div className="lg:col-span-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Check-out
              </label>
              <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !searchDate?.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchDate?.to ? format(searchDate.to, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={searchDate?.to}
                    onSelect={(date) => {
                      setSearchDate({ from: searchDate?.from, to: date });
                      setIsCheckOutOpen(false);
                    }}
                    disabled={(date) => {
                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                      if (searchDate?.from) {
                        return date <= searchDate.from || date < today;
                      }
                      return date < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guests & Rooms */}
            <div className="lg:col-span-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Guests
              </label>
              <Popover open={isGuestPopoverOpen} onOpenChange={setIsGuestPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-start text-left font-normal"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {guestSummary}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                  <div className="space-y-4">
                    {searchRooms.map((room, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-sm">Room {index + 1}</h4>
                          {searchRooms.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRoom(index)}
                              className="h-8 text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Adults</span>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateRoom(index, "adults", room.adults - 1)}
                                disabled={room.adults <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{room.adults}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateRoom(index, "adults", room.adults + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Children</span>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateRoom(index, "children", room.children - 1)}
                                disabled={room.children <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{room.children}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateRoom(index, "children", room.children + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={addRoom}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Room
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Search and Clear Buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleSearchClick}
              className="flex-1 sm:flex-none sm:min-w-[140px] h-11 bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Search Deals
                </>
              )}
            </Button>
            {(searchLocation || searchDate?.from || searchDate?.to) && (
              <Button
                variant="outline"
                onClick={handleClearSearch}
                className="h-11"
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
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
              {searchLocation || searchDate?.from
                ? "No deals match your search criteria. Try adjusting your location, dates, or number of guests."
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
                        imageSrc={deal.homestay?.imageSrc || "/images/placeholder-homestay.jpg"}
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