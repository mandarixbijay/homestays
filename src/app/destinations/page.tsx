"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Star, MapPin, Wifi, Car, Coffee, ChevronLeft, ChevronRight,
  Search as SearchIcon, SlidersHorizontal, X, Users, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { useFavorite } from "@/hooks/useFavorite";

interface Destination {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isTopDestination: boolean;
  priority: number | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    homestays: number;
  };
}

interface Homestay {
  id: number;
  name: string;
  address: string;
  rating: number | null;
  reviews: number;
  imageSrc: string;
  facilities: string[];
  nightlyPrice: number;
  originalPrice: number | null;
  maxOccupancy: number;
}

interface DestinationResponse {
  destination: {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
  };
  data: Homestay[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const amenityIcons: Record<string, React.ReactNode> = {
  "Wifi": <Wifi className="h-3.5 w-3.5" />,
  "Parking": <Car className="h-3.5 w-3.5" />,
  "Geyser": <Coffee className="h-3.5 w-3.5" />,
  "Breakfast": <Coffee className="h-3.5 w-3.5" />,
};

const getRatingColor = (rating: number | null) => {
  if (!rating) return "bg-gray-500";
  if (rating >= 4.5) return "bg-green-600";
  if (rating >= 4.0) return "bg-green-500";
  if (rating >= 3.5) return "bg-yellow-500";
  return "bg-gray-500";
};

const getRatingText = (rating: number | null) => {
  if (!rating) return "New";
  if (rating >= 4.5) return "Exceptional";
  if (rating >= 4.0) return "Wonderful";
  if (rating >= 3.5) return "Very Good";
  return "Good";
};

export default function DestinationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destinationParam = searchParams.get("destination");

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHomestays, setLoadingHomestays] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("price_low");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch("/api/homestays/destinations/top");
        if (response.ok) {
          const data = await response.json();
          setDestinations(data);

          if (data.length > 0) {
            const fromParam = destinationParam
              ? data.find((d: Destination) => d.name.toLowerCase() === destinationParam.toLowerCase())
              : null;
            setSelectedDestination(fromParam || data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [destinationParam]);

  // Fetch homestays for selected destination
  useEffect(() => {
    const fetchHomestays = async () => {
      if (!selectedDestination) return;

      setLoadingHomestays(true);
      try {
        const response = await fetch(
          `/api/homestays/destinations/${selectedDestination.id}?page=${page}&limit=12`
        );
        if (response.ok) {
          const data: DestinationResponse = await response.json();
          setHomestays(data.data || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      } catch (error) {
        console.error("Error fetching homestays:", error);
      } finally {
        setLoadingHomestays(false);
      }
    };

    fetchHomestays();
  }, [selectedDestination, page]);

  // Filter and sort homestays
  const filteredHomestays = useMemo(() => {
    let result = [...homestays];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.address.toLowerCase().includes(query)
      );
    }

    // Price filters
    if (minPrice) {
      result = result.filter((h) => h.nightlyPrice >= parseInt(minPrice));
    }
    if (maxPrice) {
      result = result.filter((h) => h.nightlyPrice <= parseInt(maxPrice));
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.nightlyPrice - b.nightlyPrice);
        break;
      case "price_high":
        result.sort((a, b) => b.nightlyPrice - a.nightlyPrice);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return result;
  }, [homestays, searchQuery, minPrice, maxPrice, sortBy]);

  // Handle destination selection
  const handleDestinationSelect = (dest: Destination) => {
    setSelectedDestination(dest);
    setPage(1);
    setSearchQuery("");
    router.push(`/destinations?destination=${dest.name.toLowerCase()}`, { scroll: false });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("price_low");
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

  // Favorites hook
  const { isFavorite, toggleFavorite, isToggling } = useFavorite();

  const HomestayCard = ({ homestay }: { homestay: Homestay }) => {
    const slug = generateProfileSlug(homestay.name, homestay.address, homestay.id);
    const displayRating = homestay.rating || 0;
    const discount =
      homestay.originalPrice && homestay.originalPrice > homestay.nightlyPrice
        ? Math.round(
            ((homestay.originalPrice - homestay.nightlyPrice) / homestay.originalPrice) * 100
          )
        : null;
    const favorited = isFavorite(homestay.id);
    const isTogglingThis = isToggling === homestay.id;

    return (
      <Card
        className="w-full rounded-xl border-none shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden bg-card"
        onClick={() => router.push(`/homestays/profile/${slug}`)}
      >
        <div className="relative w-full h-48">
          <Image
            src={homestay.imageSrc}
            alt={homestay.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 350px"
            quality={80}
            onError={(e) => {
              e.currentTarget.src = "/images/fallback-image.png";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {discount && (
            <Badge className="absolute top-3 right-12 bg-red-500 text-white font-semibold px-3 py-1 rounded-full text-xs">
              {discount}% OFF
            </Badge>
          )}

          {/* Favorite Heart Button */}
          <button
            onClick={(e) => toggleFavorite(homestay.id, e)}
            disabled={isTogglingThis}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 disabled:opacity-50 z-10"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            {isTogglingThis ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
            ) : (
              <Heart
                className={`h-4 w-4 transition-colors ${
                  favorited ? "text-red-500 fill-red-500" : "text-gray-600 hover:text-red-500"
                }`}
              />
            )}
          </button>
        </div>

        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {homestay.address}
          </p>
          <CardTitle className="text-lg font-bold text-foreground line-clamp-1 mt-1 group-hover:text-primary transition-colors">
            {homestay.name}
          </CardTitle>

          <div className="flex items-center gap-2 mt-2">
            <Badge className={`${getRatingColor(homestay.rating)} text-white text-xs font-semibold px-2 py-0.5 rounded-sm`}>
              {displayRating > 0 ? displayRating.toFixed(1) : "New"}
            </Badge>
            <span className="text-sm text-muted-foreground">{getRatingText(homestay.rating)}</span>
            {homestay.reviews > 0 && (
              <span className="text-xs text-muted-foreground">({homestay.reviews} reviews)</span>
            )}
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {homestay.facilities.slice(0, 4).map((facility, idx) => (
                <span
                  key={idx}
                  className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md flex items-center gap-1"
                >
                  {amenityIcons[facility]}
                  {facility}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Up to {homestay.maxOccupancy}
            </div>
            <div className="text-right">
              {homestay.originalPrice && homestay.originalPrice > homestay.nightlyPrice && (
                <p className="text-xs text-muted-foreground line-through">
                  NPR {homestay.originalPrice.toLocaleString()}
                </p>
              )}
              <p className="text-lg font-bold text-foreground">
                NPR {homestay.nightlyPrice.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">per night</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 to-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Explore Destinations
            </h1>
            <p className="text-muted-foreground">
              Discover authentic homestay experiences across Nepal
            </p>
          </div>

          {/* Destination Tabs */}
          <div className="mb-8">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
              {destinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => handleDestinationSelect(dest)}
                  className={`
                    flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${
                      selectedDestination?.id === dest.id
                        ? "bg-primary text-white shadow-md"
                        : "bg-white text-muted-foreground hover:bg-gray-100 border border-border"
                    }
                  `}
                >
                  <span>{dest.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedDestination?.id === dest.id
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {dest._count.homestays}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-border p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search homestays by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-border"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">Sort by:</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 h-11 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>

              {/* Filter Toggle */}
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 h-11"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-border">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Min Price (NPR)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Max Price (NPR)</Label>
                        <Input
                          type="number"
                          placeholder="10000"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button variant="ghost" onClick={handleResetFilters} className="w-full">
                          <X className="h-4 w-4 mr-2" />
                          Reset Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {selectedDestination?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredHomestays.length} of {total} homestays
              </p>
            </div>
          </div>

          {/* Homestays Grid */}
          {loadingHomestays ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Card key={idx} className="overflow-hidden rounded-xl border-none shadow-sm">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-full mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredHomestays.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredHomestays.map((homestay) => (
                  <HomestayCard key={homestay.id} homestay={homestay} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 pt-8 border-t border-border">
                  <Button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="w-full sm:w-auto px-6 gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          className="min-w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    className="w-full sm:w-auto px-6 gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Results Info */}
              <div className="text-center mt-6 text-sm text-muted-foreground">
                Showing {(page - 1) * 12 + 1} - {Math.min(page * 12, total)} of {total} homestays
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-border">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No homestays found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || minPrice || maxPrice
                    ? "Try adjusting your search or filters to find more results."
                    : `No homestays available in ${selectedDestination?.name} at the moment.`}
                </p>
                {(searchQuery || minPrice || maxPrice) && (
                  <Button onClick={handleResetFilters} variant="default">
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
