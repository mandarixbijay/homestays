"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, MapPin, Users, Wifi, Car, Coffee, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import CheckAvailability from "@/components/landing-page/check-availability";
import Hero3 from "@/components/landing-page/hero3";

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

  const [allHomestays, setAllHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortOption, setSortOption] = useState("price-low-high");
  const [showFilters, setShowFilters] = useState(false);

  const homestaysPerPage = 12;

  // Fetch all homestays
  useEffect(() => {
    const fetchAllHomestays = async () => {
      setLoading(true);

      try {
        // Build query params from URL or use defaults
        const location = searchParams.get("location");
        const checkIn = searchParams.get("checkIn");
        const checkOut = searchParams.get("checkOut");

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: homestaysPerPage.toString(),
        });

        if (location) queryParams.append("location", location);
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
  }, [page, searchParams]);

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

  // Sort homestays
  const sortedHomestays = useMemo(() => {
    return [...allHomestays].sort((a, b) => {
      if (sortOption === "price-low-high") {
        return (a.nightlyPrice || 0) - (b.nightlyPrice || 0);
      } else if (sortOption === "price-high-low") {
        return (b.nightlyPrice || 0) - (a.nightlyPrice || 0);
      } else if (sortOption === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortOption === "discount") {
        const getDiscountValue = (homestay: Homestay) => {
          if (homestay.deal) {
            if (homestay.deal.discountType === 'PERCENTAGE') {
              return homestay.deal.discount || 0;
            } else {
              return homestay.originalPrice ? ((homestay.deal.discount / homestay.originalPrice) * 100) : 0;
            }
          }
          return 0;
        };
        return getDiscountValue(b) - getDiscountValue(a);
      }
      return 0;
    });
  }, [sortOption, allHomestays]);

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

      {/* Top Homestays Section */}
      <Hero3 />

      {/* Search/Filter Section */}
      <CheckAvailability />

      {/* Main Homestays Grid Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header with Sort and Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {loading ? "Loading..." : `${total} Homestays Available`}
              </h2>
              <p className="text-muted-foreground">Discover authentic homestay experiences across Nepal</p>
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <label className="text-sm font-medium text-foreground whitespace-nowrap">Sort by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all flex-1 sm:flex-initial"
                >
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                  <option value="discount">Best Discount</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filters Panel (Collapsible) */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-card rounded-xl border border-border shadow-sm"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Filter Homestays</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Price Range</label>
                  <input type="range" min="0" max="10000" className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>NPR 0</span>
                    <span>NPR 10,000+</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Rating</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm">
                    <option>Any Rating</option>
                    <option>4.5+ Stars</option>
                    <option>4.0+ Stars</option>
                    <option>3.5+ Stars</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Amenities</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm">
                    <option>All Amenities</option>
                    <option>WiFi</option>
                    <option>Parking</option>
                    <option>Breakfast</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button variant="secondary" className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </div>
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
          ) : sortedHomestays.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedHomestays.map((homestay) => (
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
                          className="w-10 h-10"
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
                <Button onClick={() => router.push("/homestays")} variant="default">
                  Reset Filters
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
