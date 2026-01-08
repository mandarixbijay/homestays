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
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Loader2,
  Home,
  Wifi,
  Car,
  Coffee,
  Users,
  BedDouble,
  Check,
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
  amenities: string[];
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

type SortOption = "recommended" | "price_low" | "price_high" | "rating";

const ITEMS_PER_PAGE = 15;

// Rating label helper
const getRatingLabel = (rating: number) => {
  if (rating >= 4.5) return { label: "Exceptional", color: "bg-[#214B3F]" };
  if (rating >= 4.0) return { label: "Wonderful", color: "bg-[#2d6357]" };
  if (rating >= 3.5) return { label: "Very Good", color: "bg-[#3a7d6f]" };
  if (rating >= 3.0) return { label: "Good", color: "bg-[#4a9687]" };
  return { label: "Pleasant", color: "bg-gray-500" };
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
  const [fetchError, setFetchError] = useState<string | null>(error);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    price: true,
    rating: true,
    location: false,
    amenities: false,
  });
  const [filters, setFilters] = useState<FilterState>({
    minPrice: "",
    maxPrice: "",
    minRating: 0,
    cities: [],
    vipOnly: false,
    amenities: [],
  });

  const router = useRouter();
  const { isFavorite, toggleFavorite, isToggling } = useFavorite();

  // Parse query parameters
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

  const totalGuests = initialRooms.reduce((sum, r) => sum + r.adults + r.children, 0);
  const nightsCount = searchCheckIn && searchCheckOut
    ? Math.ceil((new Date(searchCheckOut).getTime() - new Date(searchCheckIn).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  // Extract available data from homestays
  const availableData = useMemo(() => {
    const cities = [...new Set(homestays.map((h) => h.city))].filter(Boolean).sort();
    const allAmenities = new Set<string>();
    homestays.forEach((homestay) => {
      (homestay.features || []).forEach((f) => allAmenities.add(f));
    });
    return { cities, amenities: Array.from(allAmenities).sort() };
  }, [homestays]);

  // Filter and sort homestays
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

    // Amenities filter
    if (filters.amenities.length > 0) {
      result = result.filter((h) => {
        const homestayFeatures = h.features || [];
        return filters.amenities.every((a) => homestayFeatures.includes(a));
      });
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => parseFloat(a.price.replace("NPR ", "")) - parseFloat(b.price.replace("NPR ", "")));
        break;
      case "price_high":
        result.sort((a, b) => parseFloat(b.price.replace("NPR ", "")) - parseFloat(a.price.replace("NPR ", "")));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Recommended: mix of rating and price
        result.sort((a, b) => {
          const scoreA = a.rating * 1000 - parseFloat(a.price.replace("NPR ", "")) * 0.01;
          const scoreB = b.rating * 1000 - parseFloat(b.price.replace("NPR ", "")) * 0.01;
          return scoreB - scoreA;
        });
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

  // Update context
  useEffect(() => {
    if (initialHomestays.length > 0) {
      setHomestays(initialHomestays);
      setLocalHomestays(initialHomestays);
      setFetchError(null);
    } else if (error) {
      setFetchError(error);
    }
  }, [initialHomestays, error, setHomestays]);

  // Handle search - no loading state needed, page will refresh with new data
  const handleSearch = (searchData: {
    location: string | null;
    date: DateRange | undefined;
    rooms: Room[];
  }) => {
    const queryParams = new URLSearchParams();
    if (searchData.location) queryParams.append("location", searchData.location);
    if (searchData.date?.from) queryParams.append("checkIn", format(searchData.date.from, "yyyy-MM-dd"));
    if (searchData.date?.to) queryParams.append("checkOut", format(searchData.date.to, "yyyy-MM-dd"));
    queryParams.append("guests", searchData.rooms.map((room) => `${room.adults}A${room.children}C`).join(","));
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
      amenities: [],
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
    if (filters.amenities.length > 0) count++;
    return count;
  }, [filters]);

  const toggleFilterSection = (section: string) => {
    setExpandedFilters((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Collapsible Filter Section Component
  const FilterSection = ({
    title,
    section,
    children,
  }: {
    title: string;
    section: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleFilterSection(section)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-semibold text-gray-900">{title}</span>
        {expandedFilters[section] ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {expandedFilters[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Filter Sidebar Content
  const FilterContent = () => (
    <div className="divide-y divide-gray-200">
      {/* Search within results */}
      <div className="pb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Search by property name</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="e.g. Himalayan Lodge"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-10 border-gray-300"
          />
        </div>
      </div>

      {/* Popular Filters */}
      <div className="py-4">
        <h3 className="font-semibold text-gray-900 mb-3">Popular filters</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={filters.vipOnly}
              onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, vipOnly: checked as boolean }))}
              className="border-gray-400 data-[state=checked]:bg-[#214B3F] data-[state=checked]:border-[#214B3F]"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">VIP Access</span>
          </label>
          {filters.minRating === 0 && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.minRating >= 4}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, minRating: checked ? 4 : 0 }))}
                className="border-gray-400 data-[state=checked]:bg-[#214B3F] data-[state=checked]:border-[#214B3F]"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">Highly rated (4+)</span>
            </label>
          )}
        </div>
      </div>

      {/* Price Range */}
      <FilterSection title="Price per night" section="price">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
              className="h-10 border-gray-300"
            />
          </div>
          <span className="text-gray-400">–</span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
              className="h-10 border-gray-300"
            />
          </div>
        </div>
      </FilterSection>

      {/* Guest Rating */}
      <FilterSection title="Guest rating" section="rating">
        <div className="space-y-2">
          {[
            { value: 4.5, label: "Exceptional 4.5+" },
            { value: 4, label: "Wonderful 4+" },
            { value: 3.5, label: "Very Good 3.5+" },
            { value: 3, label: "Good 3+" },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.minRating === value}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, minRating: checked ? value : 0 }))}
                className="border-gray-400 data-[state=checked]:bg-[#214B3F] data-[state=checked]:border-[#214B3F]"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Location/City */}
      {availableData.cities.length > 0 && (
        <FilterSection title="Neighborhood" section="location">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableData.cities.map((city) => (
              <label key={city} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={filters.cities.includes(city)}
                  onCheckedChange={(checked) => {
                    setFilters((prev) => ({
                      ...prev,
                      cities: checked ? [...prev.cities, city] : prev.cities.filter((c) => c !== city),
                    }));
                  }}
                  className="border-gray-400 data-[state=checked]:bg-[#214B3F] data-[state=checked]:border-[#214B3F]"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{city}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Amenities */}
      {availableData.amenities.length > 0 && (
        <FilterSection title="Amenities" section="amenities">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableData.amenities.slice(0, 10).map((amenity) => (
              <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={filters.amenities.includes(amenity)}
                  onCheckedChange={(checked) => {
                    setFilters((prev) => ({
                      ...prev,
                      amenities: checked ? [...prev.amenities, amenity] : prev.amenities.filter((a) => a !== amenity),
                    }));
                  }}
                  className="border-gray-400 data-[state=checked]:bg-[#214B3F] data-[state=checked]:border-[#214B3F]"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{amenity}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <div className="pt-4">
          <Button variant="outline" className="w-full border-[#214B3F] text-[#214B3F] hover:bg-[#214B3F]/10" onClick={handleResetFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Search Header */}
      <div className="bg-[#214B3F] pt-20 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-3 shadow-lg">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {fetchError ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-6">{fetchError}</p>
            <Button onClick={() => window.location.reload()} className="bg-[#214B3F] hover:bg-[#1a3d33]">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="bg-white rounded-xl p-5 shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Filter by</h2>
                  {activeFiltersCount > 0 && (
                    <span className="text-sm text-[#214B3F]">{activeFiltersCount} active</span>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {searchLocation || "All"} homestays
                  </h1>
                  <p className="text-sm text-gray-600">
                    {filteredHomestays.length} properties found
                    {searchCheckIn && searchCheckOut && ` • ${nightsCount} night${nightsCount !== 1 ? "s" : ""}`}
                    {totalGuests > 0 && ` • ${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Drawer open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="lg:hidden gap-2 border-gray-300">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge className="bg-[#214B3F] text-white ml-1">{activeFiltersCount}</Badge>
                        )}
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[90vh]">
                      <DrawerHeader className="border-b">
                        <DrawerTitle>Filters</DrawerTitle>
                      </DrawerHeader>
                      <div className="overflow-y-auto p-4 pb-24">
                        <FilterContent />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
                        <DrawerClose asChild>
                          <Button className="w-full bg-[#214B3F] hover:bg-[#1a3d33]">
                            Show {filteredHomestays.length} properties
                          </Button>
                        </DrawerClose>
                      </div>
                    </DrawerContent>
                  </Drawer>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-48 bg-white border-gray-300">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price_low">Price (low to high)</SelectItem>
                      <SelectItem value="price_high">Price (high to low)</SelectItem>
                      <SelectItem value="rating">Guest rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results List */}
              {filteredHomestays.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {paginatedHomestays.map((homestay, index) => {
                      const homestayId = homestay.id;
                      const favorited = homestayId ? isFavorite(homestayId) : false;
                      const isTogglingThis = homestayId ? isToggling === homestayId : false;
                      const slug = generateProfileSlug(homestay.name, homestay.address, homestayId || 0);
                      const price = parseFloat(homestay.price.replace("NPR ", ""));
                      const totalPrice = price * nightsCount;
                      const ratingInfo = getRatingLabel(homestay.rating);
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
                            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group">
                              <div className="flex flex-col md:flex-row">
                                {/* Image Section */}
                                <div className="relative w-full md:w-80 h-52 md:h-auto flex-shrink-0">
                                  <Image
                                    src={homestay.image || "/images/fallback-image.png"}
                                    alt={homestay.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 320px"
                                  />

                                  {/* Heart Button */}
                                  {homestayId && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleFavorite(homestayId, e);
                                      }}
                                      disabled={isTogglingThis}
                                      className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-50"
                                    >
                                      {isTogglingThis ? (
                                        <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
                                      ) : (
                                        <Heart
                                          className={cn(
                                            "h-5 w-5",
                                            favorited ? "text-red-500 fill-red-500" : "text-gray-600"
                                          )}
                                        />
                                      )}
                                    </button>
                                  )}

                                  {/* Badges */}
                                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {homestay.vipAccess && (
                                      <Badge className="bg-yellow-400 text-yellow-900 font-semibold">
                                        VIP Access
                                      </Badge>
                                    )}
                                    {discount && discount > 0 && (
                                      <Badge className="bg-green-600 text-white font-semibold">
                                        {discount}% off
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 p-4 md:p-5 flex flex-col">
                                  <div className="flex-1">
                                    {/* Title and Location */}
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-[#214B3F] group-hover:underline line-clamp-1">
                                          {homestay.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                          <MapPin className="h-4 w-4 flex-shrink-0" />
                                          <span className="line-clamp-1">{homestay.address}</span>
                                        </div>
                                      </div>

                                      {/* Rating Badge */}
                                      {homestay.rating > 0 && (
                                        <div className="flex flex-col items-end flex-shrink-0">
                                          <div className="flex items-center gap-2">
                                            <div className="text-right">
                                              <p className="text-sm font-semibold text-gray-900">{ratingInfo.label}</p>
                                              {homestay.rooms[0]?.reviews > 0 && (
                                                <p className="text-xs text-gray-500">
                                                  {homestay.rooms[0].reviews} reviews
                                                </p>
                                              )}
                                            </div>
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold", ratingInfo.color)}>
                                              {homestay.rating.toFixed(1)}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Features */}
                                    {homestay.features && homestay.features.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {homestay.features.slice(0, 4).map((feature, idx) => (
                                          <span
                                            key={idx}
                                            className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                                          >
                                            <Check className="h-3 w-3 text-green-600" />
                                            {feature}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {/* Room Info */}
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <BedDouble className="h-4 w-4" />
                                        {homestay.rooms.length} room{homestay.rooms.length !== 1 ? "s" : ""} available
                                      </span>
                                      {homestay.rooms[0]?.bedType && (
                                        <span className="flex items-center gap-1">
                                          <Users className="h-4 w-4" />
                                          {homestay.rooms[0].bedType}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Price Section */}
                                  <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                                    <div className="text-sm text-gray-500">
                                      {nightsCount} night{nightsCount !== 1 ? "s" : ""}, {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
                                    </div>
                                    <div className="text-right">
                                      <div className="flex items-baseline gap-2">
                                        {homestay.rooms[0]?.originalPrice && homestay.rooms[0].originalPrice > price && (
                                          <span className="text-sm text-gray-400 line-through">
                                            NPR {homestay.rooms[0].originalPrice.toLocaleString()}
                                          </span>
                                        )}
                                        <span className="text-xl font-bold text-gray-900">
                                          NPR {price.toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500">per night</p>
                                      {nightsCount > 1 && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          NPR {totalPrice.toLocaleString()} total
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-gray-300"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={cn(
                              "min-w-10",
                              currentPage === pageNum
                                ? "bg-[#214B3F] hover:bg-[#1a3d33]"
                                : "border-gray-300"
                            )}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-gray-300"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search criteria.
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={handleResetFilters} className="border-[#214B3F] text-[#214B3F]">
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
