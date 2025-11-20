"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, MapPin, Users, Wifi, Car, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import Hero from "@/components/landing-page/hero";
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
  "Breakfast": <Coffee className="h-4 w-4" />,
};

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

export default function AllHomestaysPage() {
  const router = useRouter();
  const [allHomestays, setAllHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortOption, setSortOption] = useState("price-low-high");

  // Fetch all homestays
  useEffect(() => {
    const fetchAllHomestays = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/homestays/search?page=${page}&limit=12`);
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
  }, [page]);

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

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
      >
        <Card
          className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col"
          onClick={() => router.push(`/homestays/profile/${slug}`)}
        >
          {/* Image */}
          <div className="relative h-56 overflow-hidden flex-shrink-0">
            <Image
              src={homestay.imageSrc}
              alt={homestay.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "/images/fallback-image.png";
              }}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {homestay.vipAccess && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold">
                  VIP
                </Badge>
              )}
              {homestay.deal && (
                <Badge className="bg-red-600 text-white font-semibold">
                  {homestay.deal.discount}% OFF
                </Badge>
              )}
            </div>

            {/* Rating Badge */}
            <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-white text-sm font-semibold ${getRatingColor(homestay.rating)}`}>
              <div className="flex items-center gap-1">
                <span>{displayRating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
              {homestay.name}
            </h3>

            <div className="flex items-center gap-1 text-gray-600 mb-3">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{homestay.address}</span>
            </div>

            {homestay.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {homestay.description}
              </p>
            )}

            {/* Facilities */}
            <div className="flex flex-wrap gap-2 mb-4">
              {homestay.facilities.slice(0, 3).map((facility, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-700"
                >
                  {amenityIcons[facility] || <span className="h-4 w-4">•</span>}
                  <span>{facility}</span>
                </div>
              ))}
              {homestay.facilities.length > 3 && (
                <div className="flex items-center bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-700">
                  +{homestay.facilities.length - 3} more
                </div>
              )}
            </div>

            {/* Pricing - pushed to bottom */}
            <div className="mt-auto pt-4 border-t">
              <div className="flex items-end justify-between">
                <div>
                  {homestay.originalPrice && homestay.originalPrice > homestay.nightlyPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      NPR {homestay.originalPrice.toLocaleString()}
                    </p>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      NPR {homestay.nightlyPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">/night</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Max {homestay.maxOccupancy}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Component from Landing Page */}
      <CheckAvailability />

      {/* All Homestays Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header with Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? "Loading..." : `${total} Homestays Available`}
              </h2>
              <p className="text-gray-600">Find your perfect home away from home</p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
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
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="px-6"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                  </div>

                  <Button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    className="px-6"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No homestays found. Please try again later.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
