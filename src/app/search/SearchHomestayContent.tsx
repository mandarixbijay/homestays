// src/app/search/SearchHomestayContent.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  ArrowUpDown,
} from "lucide-react";
import { DateGuestLocationPicker } from "@/components/homestay/components/details/date-guest-location-picker";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { useHomestayContext } from "@/context/HomestayContext";
import { Hero3Card } from "@/types/homestay";
import { useFavorite } from "@/hooks/useFavorite";
import { cn } from "@/lib/utils";

interface Room {
  adults: number;
  children: number;
}

interface FilterState {
  minPrice: string;
  maxPrice: string;
  minRating: number;
  cities: string[];
  vipOnly: boolean;
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
    minPrice: "",
    maxPrice: "",
    minRating: 0,
    cities: [],
    vipOnly: false,
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

  // Extract available cities from homestays
  const availableCities = useMemo(() => {
    return [...new Set(homestays.map((h) => h.city))].filter(Boolean).sort();
  }, [homestays]);

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
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      result = result.filter((h) => parseFloat(h.price.replace("NPR ", "")) >= min);
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      result = result.filter((h) => parseFloat(h.price.replace("NPR ", "")) <= max);
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter((h) => h.rating >= filters.minRating);
    }

    // City filter
    if (filters.cities.length > 0) {
      result = result.filter((h) => filters.cities.includes(h.city));
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
      minPrice: "",
      maxPrice: "",
      minRating: 0,
      cities: [],
      vipOnly: false,
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.minRating > 0) count++;
    if (filters.cities.length > 0) count++;
    if (filters.vipOnly) count++;
    return count;
  }, [filters]);

  // Filter sidebar component
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Price Range (NPR)</h3>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
            className="h-10"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
            className="h-10"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Minimum Rating</h3>
        <div className="flex flex-wrap gap-2">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilters((prev) => ({ ...prev, minRating: rating }))}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                filters.minRating === rating
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              )}
            >
              {rating === 0 ? "Any" : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Cities */}
      {availableCities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Location</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableCities.map((city) => (
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
                <span className="text-sm text-foreground">{city}</span>
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
          <span className="text-sm font-medium text-foreground">VIP Access Only</span>
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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Clean and Simple */}
      <section className="bg-primary pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
              {searchLocation ? `Homestays in ${searchLocation}` : "Search Results"}
            </h1>
            <p className="text-primary-foreground/70 text-sm">
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
            <div className="bg-card rounded-xl p-2 shadow-lg">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Searching for the best homestays...</p>
            </div>
          </div>
        ) : fetchError ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-6">{fetchError}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-foreground">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              {/* Controls Bar */}
              <div className="bg-card rounded-xl border border-border p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 h-10"
                    />
                    {searchQuery && !searchLoading && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
                    )}
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-full sm:w-44 h-10">
                      <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
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
                  <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === "grid"
                          ? "bg-background shadow-sm text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === "list"
                          ? "bg-background shadow-sm text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Mobile Filter Button */}
                  <Drawer open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="lg:hidden h-10 gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[85vh]">
                      <DrawerHeader className="border-b border-border">
                        <DrawerTitle>Filters</DrawerTitle>
                      </DrawerHeader>
                      <div className="overflow-y-auto p-4 pb-8">
                        <FilterContent />
                      </div>
                      <div className="p-4 border-t border-border">
                        <DrawerClose asChild>
                          <Button className="w-full">Apply Filters</Button>
                        </DrawerClose>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">{paginatedHomestays.length}</span>{" "}
                    of <span className="font-medium text-foreground">{filteredHomestays.length}</span>{" "}
                    homestays
                    {filteredHomestays.length !== homestays.length && (
                      <span className="text-muted-foreground"> (filtered from {homestays.length})</span>
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                          >
                            <Link href={`/homestays/profile/${slug}`}>
                              {viewMode === "grid" ? (
                                /* Grid Card */
                                <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                    <Image
                                      src={homestay.image || "/images/fallback-image.png"}
                                      alt={homestay.name}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />

                                    {homestay.vipAccess && (
                                      <Badge className="absolute top-3 left-3 bg-yellow-500 text-yellow-950 text-xs">
                                        VIP
                                      </Badge>
                                    )}
                                    {discount && discount > 0 && (
                                      <Badge className="absolute top-3 right-12 bg-green-600 text-white text-xs">
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
                                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all disabled:opacity-50"
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

                                  <div className="p-4 flex flex-col flex-grow">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                      <MapPin className="h-3 w-3 flex-shrink-0" />
                                      <span className="line-clamp-1">{homestay.address}</span>
                                    </div>

                                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                      {homestay.name}
                                    </h3>

                                    {/* Rating */}
                                    {homestay.rating > 0 && (
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center gap-1 bg-primary/10 text-primary rounded px-2 py-0.5">
                                          <Star className="h-3 w-3 fill-current" />
                                          <span className="text-xs font-semibold">{homestay.rating.toFixed(1)}</span>
                                        </div>
                                        {homestay.rooms[0]?.reviews > 0 && (
                                          <span className="text-xs text-muted-foreground">
                                            ({homestay.rooms[0].reviews} reviews)
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    <div className="mt-auto pt-3 border-t border-border flex items-end justify-between">
                                      <div>
                                        <p className="text-xs text-muted-foreground">From</p>
                                        <p className="text-lg font-bold text-foreground">
                                          NPR {price.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">per night</p>
                                      </div>
                                      <span className="text-sm font-medium text-primary group-hover:underline">
                                        View →
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* List Card */
                                <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                                  <div className="flex flex-col sm:flex-row">
                                    <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden bg-muted">
                                      <Image
                                        src={homestay.image || "/images/fallback-image.png"}
                                        alt={homestay.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 640px) 100vw, 256px"
                                      />

                                      {homestay.vipAccess && (
                                        <Badge className="absolute top-3 left-3 bg-yellow-500 text-yellow-950 text-xs">
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
                                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all disabled:opacity-50"
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

                                    <div className="flex-1 p-5 flex flex-col">
                                      <div className="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                            {homestay.name}
                                          </h3>
                                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {homestay.address}
                                          </div>
                                        </div>
                                        {homestay.rating > 0 && (
                                          <div className="flex items-center gap-1 bg-primary/10 text-primary rounded px-2 py-1">
                                            <Star className="h-3.5 w-3.5 fill-current" />
                                            <span className="text-sm font-semibold">{homestay.rating.toFixed(1)}</span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="mt-auto pt-4 border-t border-border flex items-end justify-between">
                                        <div>
                                          <p className="text-xs text-muted-foreground">Starting from</p>
                                          <p className="text-xl font-bold text-foreground">
                                            NPR {price.toLocaleString()}
                                            <span className="text-sm font-normal text-muted-foreground">
                                              {" "}/ night
                                            </span>
                                          </p>
                                        </div>
                                        <span className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg group-hover:bg-primary/90 transition-colors">
                                          View Details
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
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
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>

                        <div className="hidden sm:flex items-center gap-1">
                          {getPageNumbers().map((page, index) =>
                            page === "..." ? (
                              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page as number)}
                                className={cn(
                                  "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                                  currentPage === page
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-muted"
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
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card rounded-xl border border-border p-12 text-center"
                >
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No homestays found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
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
