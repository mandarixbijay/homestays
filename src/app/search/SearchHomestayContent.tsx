// src/app/search/SearchHomestayContent.tsx
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  Loader2,
  Home,
  Users,
  Calendar,
  ArrowUpDown,
  Sparkles,
  Filter,
  TrendingUp,
  Wifi,
  Car,
  Coffee,
} from "lucide-react";
import { DateGuestLocationPicker } from "@/components/homestay/components/details/date-guest-location-picker";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useHomestayContext } from "@/context/HomestayContext";
import { Hero3Card } from "@/types/homestay";
import { useFavorite } from "@/hooks/useFavorite";
import { cn } from "@/lib/utils";

interface Room {
  adults: number;
  children: number;
}

interface FilterState {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  cities: string[];
  amenities: string[];
  vipOnly: boolean;
  availableRoomsMin: number;
}

interface SearchHomestayContentProps {
  initialHomestays: Hero3Card[];
  error: string | null;
  searchLocation: string;
  searchCheckIn: string;
  searchCheckOut: string;
  searchGuests: string;
  searchRooms: string;
}

type SortOption = "price_low" | "price_high" | "rating" | "reviews";
type ViewMode = "grid" | "list";

const ITEMS_PER_PAGE = 12;

const amenityIcons: Record<string, React.ReactNode> = {
  "Wifi": <Wifi className="h-3.5 w-3.5" />,
  "Free Wifi": <Wifi className="h-3.5 w-3.5" />,
  "Parking": <Car className="h-3.5 w-3.5" />,
  "Free Parking": <Car className="h-3.5 w-3.5" />,
  "Breakfast": <Coffee className="h-3.5 w-3.5" />,
};

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return "bg-green-600";
  if (rating >= 4.0) return "bg-green-500";
  if (rating >= 3.5) return "bg-yellow-500";
  return "bg-gray-500";
};

const getRatingText = (rating: number) => {
  if (rating >= 4.5) return "Exceptional";
  if (rating >= 4.0) return "Wonderful";
  if (rating >= 3.5) return "Very Good";
  if (rating > 0) return "Good";
  return "New";
};

export function SearchHomestayContent({
  initialHomestays,
  error,
  searchLocation,
  searchCheckIn,
  searchCheckOut,
  searchGuests,
  searchRooms,
}: SearchHomestayContentProps) {
  const { setHomestays } = useHomestayContext();
  const [homestays, setLocalHomestays] = useState<Hero3Card[]>(initialHomestays);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(error);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("price_low");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 50000,
    minRating: 0,
    cities: [],
    amenities: [],
    vipOnly: false,
    availableRoomsMin: 0,
  });

  const router = useRouter();
  const { isFavorite, toggleFavorite, isToggling } = useFavorite();

  // Parse query parameters for DateGuestLocationPicker
  const initialDate: DateRange | undefined = searchCheckIn
    ? {
        from: new Date(searchCheckIn),
        to: searchCheckOut ? new Date(searchCheckOut) : undefined,
      }
    : undefined;

  const initialRooms: Room[] = searchGuests
    ? searchGuests.split(",").map((guest) => {
        const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
        return { adults, children };
      })
    : [{ adults: 2, children: 0 }];

  // Extract available data from homestays for filters
  const availableData = useMemo(() => {
    if (homestays.length === 0) return null;

    const cities = [...new Set(homestays.map((h) => h.city))].filter(Boolean).sort();
    const allAmenities = new Set<string>();
    homestays.forEach((homestay) => {
      (homestay.features || []).forEach((feature) => allAmenities.add(feature));
      homestay.rooms.forEach((room) => {
        (room.facilities || []).forEach((facility) => allAmenities.add(facility));
      });
    });
    const amenities = Array.from(allAmenities).filter(Boolean).sort();

    const prices = homestays.map((h) => parseFloat(h.price.replace("NPR ", "")));
    const priceRange = {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };

    return { cities, amenities, priceRange };
  }, [homestays]);

  // Update filters when available data changes
  useEffect(() => {
    if (availableData) {
      setFilters((prev) => ({
        ...prev,
        minPrice: availableData.priceRange.min,
        maxPrice: availableData.priceRange.max,
      }));
    }
  }, [availableData]);

  // Debounced search
  useEffect(() => {
    if (searchQuery) {
      setSearchLoading(true);
      const timer = setTimeout(() => {
        setSearchLoading(false);
        setCurrentPage(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Filter, search, and sort homestays
  const filteredHomestays = useMemo(() => {
    let result = [...homestays];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.address.toLowerCase().includes(query) ||
          h.city.toLowerCase().includes(query)
      );
    }

    // Price filter
    result = result.filter((homestay) => {
      const price = parseFloat(homestay.price.replace("NPR ", ""));
      return price >= filters.minPrice && price <= filters.maxPrice;
    });

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter((h) => h.rating >= filters.minRating);
    }

    // City filter
    if (filters.cities.length > 0) {
      result = result.filter((h) => filters.cities.includes(h.city));
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      result = result.filter((homestay) => {
        const homestayAmenities = [
          ...(homestay.features || []),
          ...homestay.rooms.flatMap((room) => room.facilities || []),
        ];
        return filters.amenities.every((amenity) => homestayAmenities.includes(amenity));
      });
    }

    // VIP filter
    if (filters.vipOnly) {
      result = result.filter((h) => h.vipAccess);
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        result.sort(
          (a, b) =>
            parseFloat(a.price.replace("NPR ", "")) - parseFloat(b.price.replace("NPR ", ""))
        );
        break;
      case "price_high":
        result.sort(
          (a, b) =>
            parseFloat(b.price.replace("NPR ", "")) - parseFloat(a.price.replace("NPR ", ""))
        );
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        result.sort((a, b) => (b.rooms[0]?.reviews || 0) - (a.rooms[0]?.reviews || 0));
        break;
    }

    return result;
  }, [homestays, searchQuery, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredHomestays.length / ITEMS_PER_PAGE);
  const paginatedHomestays = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHomestays.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHomestays, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Update context with initial homestays
  useEffect(() => {
    if (initialHomestays.length > 0) {
      setHomestays(initialHomestays);
      setLocalHomestays(initialHomestays);
      setFetchError(null);
    } else if (error) {
      setFetchError(error);
    }
  }, [initialHomestays, error, setHomestays]);

  // Handle search form submission
  const handleSearch = (searchData: {
    location: string | null;
    date: DateRange | undefined;
    rooms: Room[];
  }) => {
    setLoading(true);
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
      searchData.rooms.map((room) => `${room.adults}A${room.children}C`).join(",")
    );
    queryParams.append("rooms", searchData.rooms.length.toString());

    router.push(`/search?${queryParams.toString()}`);
  };

  // Generate profile slug
  const generateProfileSlug = (name: string, address: string, id: number) => {
    const combined = `${name}-${address}`;
    const slugified = combined
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    return `${slugified}-id-${id}`;
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      minPrice: availableData?.priceRange.min || 0,
      maxPrice: availableData?.priceRange.max || 50000,
      minRating: 0,
      cities: [],
      amenities: [],
      vipOnly: false,
      availableRoomsMin: 0,
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.minRating > 0) count++;
    if (filters.cities.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.vipOnly) count++;
    if (
      availableData &&
      (filters.minPrice > availableData.priceRange.min ||
        filters.maxPrice < availableData.priceRange.max)
    )
      count++;
    return count;
  }, [filters, availableData]);

  // Filter sidebar component
  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn("space-y-6", isMobile ? "p-4" : "")}>
      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Price Range</h3>
        <div className="px-2">
          <Slider
            value={[filters.minPrice, filters.maxPrice]}
            min={availableData?.priceRange.min || 0}
            max={availableData?.priceRange.max || 50000}
            step={100}
            onValueChange={([min, max]) => setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }))}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>NPR {filters.minPrice.toLocaleString()}</span>
            <span>NPR {filters.maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Minimum Rating</h3>
        <div className="flex flex-wrap gap-2">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilters((prev) => ({ ...prev, minRating: rating }))}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                filters.minRating === rating
                  ? "bg-[#214B3F] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {rating === 0 ? "Any" : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Cities */}
      {availableData && availableData.cities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">City</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableData.cities.map((city) => (
              <label key={city} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.cities.includes(city)}
                  onCheckedChange={(checked) => {
                    setFilters((prev) => ({
                      ...prev,
                      cities: checked
                        ? [...prev.cities, city]
                        : prev.cities.filter((c) => c !== city),
                    }));
                  }}
                />
                <span className="text-sm text-gray-700">{city}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {availableData && availableData.amenities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Amenities</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableData.amenities.slice(0, 10).map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.amenities.includes(amenity)}
                  onCheckedChange={(checked) => {
                    setFilters((prev) => ({
                      ...prev,
                      amenities: checked
                        ? [...prev.amenities, amenity]
                        : prev.amenities.filter((a) => a !== amenity),
                    }));
                  }}
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* VIP Only */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.vipOnly}
            onCheckedChange={(checked) =>
              setFilters((prev) => ({ ...prev, vipOnly: checked as boolean }))
            }
          />
          <span className="text-sm font-medium text-gray-700">VIP Access Only</span>
        </label>
      </div>

      {/* Reset Button */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={handleResetFilters}>
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#214B3F] via-[#2d6654] to-[#214B3F] pt-24 pb-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {searchLocation ? `Homestays in ${searchLocation}` : "Search Results"}
            </h1>
            <p className="text-white/70">
              {searchCheckIn && searchCheckOut && (
                <>
                  {format(new Date(searchCheckIn), "MMM d")} -{" "}
                  {format(new Date(searchCheckOut), "MMM d, yyyy")} •{" "}
                </>
              )}
              {initialRooms.reduce((sum, r) => sum + r.adults + r.children, 0)} Guest
              {initialRooms.reduce((sum, r) => sum + r.adults + r.children, 0) !== 1 ? "s" : ""} •{" "}
              {searchRooms} Room{parseInt(searchRooms) !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
              <DateGuestLocationPicker
                className="w-full"
                onSearch={handleSearch}
                initialLocation={searchLocation || undefined}
                initialDate={initialDate}
                initialRooms={initialRooms}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-[#214B3F] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Searching for the best homestays...</p>
            </div>
          </div>
        ) : fetchError ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-6">{fetchError}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </h2>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount} active</Badge>
                  )}
                </div>
                <FilterSidebar />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              {/* Search and Controls Bar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-10 h-11 rounded-xl border-gray-200"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                    {searchLoading && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#214B3F] animate-spin" />
                    )}
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl">
                      <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-2.5 rounded-lg transition-all",
                        viewMode === "grid"
                          ? "bg-white shadow-sm text-[#214B3F]"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <Grid3X3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "p-2.5 rounded-lg transition-all",
                        viewMode === "list"
                          ? "bg-white shadow-sm text-[#214B3F]"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Mobile Filter Button */}
                  <Drawer open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="lg:hidden h-11 gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[85vh]">
                      <DrawerHeader>
                        <DrawerTitle>Filters</DrawerTitle>
                        <DrawerDescription>Refine your search results</DrawerDescription>
                      </DrawerHeader>
                      <div className="overflow-y-auto pb-8">
                        <FilterSidebar isMobile />
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">{paginatedHomestays.length}</span>{" "}
                    of <span className="font-semibold text-gray-900">{filteredHomestays.length}</span>{" "}
                    homestays
                    {filteredHomestays.length !== homestays.length && (
                      <span className="text-gray-500"> (filtered from {homestays.length})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Results */}
              {filteredHomestays.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${viewMode}-${currentPage}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                          : "flex flex-col gap-4"
                      )}
                    >
                      {paginatedHomestays.map((homestay, index) => {
                        const homestayId = homestay.id;
                        const favorited = homestayId ? isFavorite(homestayId) : false;
                        const isTogglingThis = homestayId ? isToggling === homestayId : false;
                        const slug = generateProfileSlug(homestay.name, homestay.address, homestayId || 0);
                        const price = parseFloat(homestay.price.replace("NPR ", ""));
                        const discount = homestay.rooms[0]?.originalPrice
                          ? Math.round(
                              ((homestay.rooms[0].originalPrice - homestay.rooms[0].nightlyPrice) /
                                homestay.rooms[0].originalPrice) *
                                100
                            )
                          : null;

                        return (
                          <motion.div
                            key={homestay.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <Link href={`/homestays/profile/${slug}`}>
                              {viewMode === "grid" ? (
                                <Card className="group overflow-hidden rounded-2xl border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 h-full flex flex-col">
                                  <div className="relative h-52 overflow-hidden">
                                    <Image
                                      src={homestay.image || "/images/fallback-image.png"}
                                      alt={homestay.name}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                                    {homestay.vipAccess && (
                                      <Badge className="absolute top-3 left-3 bg-yellow-400 text-gray-900">
                                        VIP
                                      </Badge>
                                    )}
                                    {discount && discount > 0 && (
                                      <Badge className="absolute top-3 right-12 bg-red-500 text-white">
                                        {discount}% OFF
                                      </Badge>
                                    )}

                                    {/* Heart Button */}
                                    {homestayId && (
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleFavorite(homestayId, e);
                                        }}
                                        disabled={isTogglingThis}
                                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all disabled:opacity-50 z-10"
                                      >
                                        {isTogglingThis ? (
                                          <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                                        ) : (
                                          <Heart
                                            className={cn(
                                              "h-4 w-4 transition-colors",
                                              favorited
                                                ? "text-red-500 fill-red-500"
                                                : "text-gray-600 hover:text-red-500"
                                            )}
                                          />
                                        )}
                                      </button>
                                    )}

                                    {/* Rating Badge */}
                                    {homestay.rating > 0 && (
                                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-md">
                                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                        <span className="text-sm font-semibold text-gray-900">
                                          {homestay.rating.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <CardContent className="p-4 flex flex-col flex-grow">
                                    <div className="flex items-start gap-1 text-sm text-gray-500 mb-1">
                                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                      <span className="line-clamp-1">{homestay.address}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-[#214B3F] transition-colors">
                                      {homestay.name}
                                    </h3>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                      {(homestay.features || []).slice(0, 3).map((feature, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1"
                                        >
                                          {amenityIcons[feature]}
                                          {feature}
                                        </span>
                                      ))}
                                    </div>

                                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between">
                                      <div>
                                        <p className="text-xs text-gray-500">Starting from</p>
                                        <p className="text-lg font-bold text-[#214B3F]">
                                          NPR {price.toLocaleString()}
                                        </p>
                                      </div>
                                      <span className="text-sm font-medium text-[#214B3F] group-hover:underline">
                                        View Details →
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : (
                                <Card className="group overflow-hidden rounded-2xl border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                                  <div className="flex flex-col sm:flex-row">
                                    <div className="relative w-full sm:w-72 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                                      <Image
                                        src={homestay.image || "/images/fallback-image.png"}
                                        alt={homestay.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 sm:bg-gradient-to-t sm:from-black/40 sm:via-transparent sm:to-transparent" />

                                      {homestay.vipAccess && (
                                        <Badge className="absolute top-3 left-3 bg-yellow-400 text-gray-900">
                                          VIP
                                        </Badge>
                                      )}

                                      {/* Heart Button */}
                                      {homestayId && (
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleFavorite(homestayId, e);
                                          }}
                                          disabled={isTogglingThis}
                                          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all disabled:opacity-50 z-10"
                                        >
                                          {isTogglingThis ? (
                                            <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                                          ) : (
                                            <Heart
                                              className={cn(
                                                "h-4 w-4 transition-colors",
                                                favorited
                                                  ? "text-red-500 fill-red-500"
                                                  : "text-gray-600 hover:text-red-500"
                                              )}
                                            />
                                          )}
                                        </button>
                                      )}
                                    </div>

                                    <CardContent className="flex-1 p-5 flex flex-col">
                                      <div className="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#214B3F] transition-colors">
                                            {homestay.name}
                                          </h3>
                                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                            <MapPin className="h-4 w-4" />
                                            {homestay.address}
                                          </div>
                                        </div>
                                        {homestay.rating > 0 && (
                                          <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-3 py-1.5">
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-semibold text-amber-700">
                                              {homestay.rating.toFixed(1)}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap gap-2 mb-4">
                                        {(homestay.features || []).slice(0, 5).map((feature, idx) => (
                                          <span
                                            key={idx}
                                            className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1"
                                          >
                                            {amenityIcons[feature]}
                                            {feature}
                                          </span>
                                        ))}
                                      </div>

                                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between">
                                        <div>
                                          <p className="text-xs text-gray-500">Starting from</p>
                                          <p className="text-2xl font-bold text-[#214B3F]">
                                            NPR {price.toLocaleString()}
                                            <span className="text-sm font-normal text-gray-400">
                                              {" "}
                                              / night
                                            </span>
                                          </p>
                                        </div>
                                        <span className="px-5 py-2.5 bg-[#214B3F] text-white text-sm font-medium rounded-xl group-hover:bg-[#1a3d33] transition-colors">
                                          View Details
                                        </span>
                                      </div>
                                    </CardContent>
                                  </div>
                                </Card>
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>

                        <div className="hidden sm:flex items-center gap-1">
                          {getPageNumbers().map((page, index) =>
                            page === "..." ? (
                              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page as number)}
                                className={cn(
                                  "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                                  currentPage === page
                                    ? "bg-[#214B3F] text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100"
                                )}
                              >
                                {page}
                              </button>
                            )
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="gap-1"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Home className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No homestays found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery || activeFiltersCount > 0
                      ? "Try adjusting your search or filters to find more results."
                      : "No homestays available for your selected dates and location."}
                  </p>
                  {(searchQuery || activeFiltersCount > 0) && (
                    <Button variant="outline" onClick={handleResetFilters}>
                      Clear All Filters
                    </Button>
                  )}
                </motion.div>
              )}
            </main>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
