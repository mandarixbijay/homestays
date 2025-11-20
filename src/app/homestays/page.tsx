"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Star, MapPin, Search as SearchIcon, Wifi, Car, Coffee,
  ChevronLeft, ChevronRight, SlidersHorizontal, X, DollarSign, Users as UsersIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import CheckAvailability from "@/components/landing-page/check-availability";

interface Homestay {
  id: number;
  name: string;
  address: string;
  description?: string;
  rating: number | null;
  reviews: number;
  vipAccess?: boolean;
  imageSrc: string;
  facilities: string[];
  nightlyPrice: number;
  originalPrice: number | null;
  maxOccupancy: number;
  deal?: {
    discount: number;
    discountType: string;
    description: string;
    endDate: string;
  } | null;
}

const amenityIcons: Record<string, React.ReactNode> = {
  "Wifi": <Wifi className="h-4 w-4" />,
  "Parking": <Car className="h-4 w-4" />,
  "Geyser": <Coffee className="h-4 w-4" />,
  "Breakfast": <Coffee className="h-4 w-4" />,
};

const getRatingColor = (rating: number | null) => {
  if (!rating) return "bg-gray-500";
  if (rating >= 4.5) return "bg-green-600";
  if (rating >= 4.0) return "bg-green-500";
  if (rating >= 3.5) return "bg-yellow-500";
  return "bg-gray-500";
};

const getRatingText = (rating: number | null) => {
  if (!rating) return "No rating";
  if (rating >= 4.5) return "Exceptional";
  if (rating >= 4.0) return "Wonderful";
  if (rating >= 3.5) return "Very Good";
  return "Good";
};

export default function AllHomestaysPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [topHomestays, setTopHomestays] = useState<Homestay[]>([]);
  const [allHomestays, setAllHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("price_low_to_high");
  const [vipOnly, setVipOnly] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const homestaysPerPage = 12;

  // Fetch top homestays
  useEffect(() => {
    const fetchTopHomestays = async () => {
      setLoadingTop(true);
      try {
        const response = await fetch('/api/homestays/top-homestays?limit=6');
        if (response.ok) {
          const data = await response.json();
          setTopHomestays(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching top homestays:', error);
      } finally {
        setLoadingTop(false);
      }
    };

    fetchTopHomestays();
  }, []);

  // Fetch all homestays with filters
  useEffect(() => {
    const fetchAllHomestays = async () => {
      setLoading(true);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: homestaysPerPage.toString(),
        });

        // Add filters
        if (searchQuery) queryParams.append("search", searchQuery);
        if (location) queryParams.append("location", location);
        if (minPrice) queryParams.append("minPrice", minPrice);
        if (maxPrice) queryParams.append("maxPrice", maxPrice);
        if (minRating) queryParams.append("minRating", minRating);
        if (sortBy) queryParams.append("sortBy", sortBy);
        if (vipOnly) queryParams.append("vipAccess", "true");
        if (dealsOnly) queryParams.append("hasLastMinuteDeal", "true");

        // Get params from URL (from CheckAvailability search)
        const urlLocation = searchParams.get("location");
        const checkIn = searchParams.get("checkIn");
        const checkOut = searchParams.get("checkOut");

        if (urlLocation && !location) queryParams.append("location", urlLocation);
        if (checkIn) queryParams.append("checkIn", checkIn);
        if (checkOut) queryParams.append("checkOut", checkOut);

        const response = await fetch(`/api/homestays/search?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setAllHomestays(data.data || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching homestays:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllHomestays();
  }, [page, searchQuery, location, minPrice, maxPrice, minRating, sortBy, vipOnly, dealsOnly, searchParams]);

  // Generate profile slug
  const generateProfileSlug = (name: string, address: string, id: number) => {
    const combined = `${name}-${address}`;
    const slugified = combined
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `${slugified}-id-${id}`;
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setSortBy("price_low_to_high");
    setVipOnly(false);
    setDealsOnly(false);
    setPage(1);
  };

  const HomestayCard = ({ homestay }: { homestay: Homestay }) => {
    const slug = generateProfileSlug(homestay.name, homestay.address, homestay.id);
    const displayRating = homestay.rating || 4.5;
    const discount = homestay.originalPrice && homestay.originalPrice > homestay.nightlyPrice
      ? Math.round(((homestay.originalPrice - homestay.nightlyPrice) / homestay.originalPrice) * 100)
      : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
      >
        <Card
          className="w-full rounded-xl border-none shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col overflow-hidden"
          onClick={() => router.push(`/homestays/profile/${slug}`)}
        >
          {/* Image Section */}
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={homestay.imageSrc}
              alt={homestay.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 350px"
              quality={80}
              onError={(e) => {
                e.currentTarget.src = "/images/fallback-image.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Badges */}
            {homestay.vipAccess && (
              <Badge className="absolute top-3 left-3 bg-yellow-400 text-primary font-semibold px-3 py-1 rounded-full text-xs">
                VIP Access
              </Badge>
            )}
            {discount && (
              <Badge className="absolute top-3 right-3 bg-green-600 text-white font-semibold px-3 py-1 rounded-full text-xs">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4 flex flex-col flex-grow">
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <MapPin className="h-3 w-3" />
              {homestay.address}
            </p>

            <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-2">
              {homestay.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${getRatingColor(homestay.rating)} text-white text-xs font-semibold px-2 py-0.5 rounded-sm`}>
                {displayRating.toFixed(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">{getRatingText(homestay.rating)}</span>
              <span className="text-xs text-muted-foreground">({homestay.reviews} reviews)</span>
            </div>

            {/* Amenities */}
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-foreground mb-1">Amenities:</h4>
              <ul className="flex flex-wrap gap-1">
                {homestay.facilities.slice(0, 3).map((facility, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md flex items-center gap-1">
                    {amenityIcons[facility]}
                    {facility}
                  </li>
                ))}
                {homestay.facilities.length > 3 && (
                  <li className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    +{homestay.facilities.length - 3} more
                  </li>
                )}
              </ul>
            </div>

            {/* Pricing */}
            <div className="mt-auto flex flex-col items-end border-t pt-3">
              <p className="text-lg font-bold text-foreground">
                NPR {homestay.nightlyPrice.toLocaleString()}
                {homestay.originalPrice && homestay.originalPrice > homestay.nightlyPrice && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    NPR {homestay.originalPrice.toLocaleString()}
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 to-background">
      <Navbar />

      {/* Search/Filter Section */}
      <CheckAvailability />

      {/* Top Homestays Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Top Homestays</h2>
              <p className="text-muted-foreground">Handpicked favorites for an unforgettable stay</p>
            </div>
          </div>

          {loadingTop ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx} className="overflow-hidden rounded-xl border-none shadow-sm">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topHomestays.map((homestay) => (
                <HomestayCard key={homestay.id} homestay={homestay} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* All Homestays Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by name, location, or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-12 pr-12 py-6 text-base rounded-xl border-2 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Header with Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {loading ? "Loading..." : `${total} Homestays Available`}
              </h2>
              <p className="text-muted-foreground">Discover authentic homestay experiences across Nepal</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">Sort:</Label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="price_low_to_high">Price: Low to High</option>
                  <option value="price_high_to_low">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                  <option value="discount">Best Discount</option>
                </select>
              </div>

              {/* Quick Filters */}
              <Button
                variant={vipOnly ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setVipOnly(!vipOnly);
                  setPage(1);
                }}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                VIP Only
              </Button>

              <Button
                variant={dealsOnly ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDealsOnly(!dealsOnly);
                  setPage(1);
                }}
                className="gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Deals Only
              </Button>

              {/* Advanced Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? "Hide" : "More"} Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-card rounded-xl border border-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Advanced Filters</h3>
                <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="e.g., Kathmandu"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Min Price */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Min Price (NPR)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Max Price */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Max Price (NPR)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="10000"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Min Rating */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Min Rating</Label>
                  <select
                    value={minRating}
                    onChange={(e) => {
                      setMinRating(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3.0">3.0+ Stars</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(searchQuery || location || minPrice || maxPrice || minRating || vipOnly || dealsOnly) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Active filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {searchQuery}
                        <button onClick={() => setSearchQuery("")} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {location && (
                      <Badge variant="secondary" className="gap-1">
                        Location: {location}
                        <button onClick={() => setLocation("")} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {minPrice && (
                      <Badge variant="secondary" className="gap-1">
                        Min: NPR {minPrice}
                        <button onClick={() => setMinPrice("")} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {maxPrice && (
                      <Badge variant="secondary" className="gap-1">
                        Max: NPR {maxPrice}
                        <button onClick={() => setMaxPrice("")} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {minRating && (
                      <Badge variant="secondary" className="gap-1">
                        Rating: {minRating}+ stars
                        <button onClick={() => setMinRating("")} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {vipOnly && (
                      <Badge variant="secondary" className="gap-1">
                        VIP Only
                        <button onClick={() => setVipOnly(false)} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {dealsOnly && (
                      <Badge variant="secondary" className="gap-1">
                        Deals Only
                        <button onClick={() => setDealsOnly(false)} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Homestays Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, idx) => (
                <Card key={idx} className="overflow-hidden rounded-xl border-none shadow-sm">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allHomestays.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allHomestays.map((homestay) => (
                  <HomestayCard key={homestay.id} homestay={homestay} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 pt-8 border-t border-border">
                  <Button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="w-full sm:w-auto px-6 gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2 overflow-x-auto">
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
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
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
                Showing {((page - 1) * homestaysPerPage) + 1} - {Math.min(page * homestaysPerPage, total)} of {total} homestays
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No homestays found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria or filters to find more results.
                </p>
                <Button onClick={handleResetFilters} variant="default">
                  Reset All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
