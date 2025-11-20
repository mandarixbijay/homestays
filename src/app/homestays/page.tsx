"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, MapPin, Users, Wifi, Car, Coffee, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

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

export default function AllHomestaysPage() {
  const router = useRouter();
  const [topHomestays, setTopHomestays] = useState<Homestay[]>([]);
  const [allHomestays, setAllHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch top homestays
  useEffect(() => {
    const fetchTopHomestays = async () => {
      try {
        const response = await fetch('/api/homestays/top-homestays?limit=6');
        if (response.ok) {
          const data = await response.json();
          setTopHomestays(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching top homestays:', error);
      }
    };

    fetchTopHomestays();
  }, []);

  // Fetch all homestays
  useEffect(() => {
    const fetchAllHomestays = async () => {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await fetch(`/api/homestays/search?page=${page}&limit=12`);
        if (response.ok) {
          const data = await response.json();

          if (page === 1) {
            setAllHomestays(data.data || []);
          } else {
            setAllHomestays(prev => [...prev, ...(data.data || [])]);
          }

          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching homestays:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
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
          className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
          onClick={() => router.push(`/homestays/profile/${slug}`)}
        >
          {/* Image */}
          <div className="relative h-56 overflow-hidden">
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

            {/* Rating */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold">{displayRating.toFixed(1)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
              {homestay.name}
            </h3>

            <div className="flex items-center gap-1 text-gray-600 mb-3">
              <MapPin className="h-4 w-4" />
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

            {/* Pricing */}
            <div className="flex items-end justify-between pt-4 border-t">
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
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Homestays
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Find your perfect home away from home across Nepal
            </p>
          </motion.div>
        </div>
      </section>

      {/* Top Homestays Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Homestays</h2>
              <p className="text-gray-600">Handpicked favorites for an unforgettable stay</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topHomestays.length > 0 ? (
              topHomestays.map((homestay) => (
                <HomestayCard key={homestay.id} homestay={homestay} />
              ))
            ) : (
              Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* All Homestays Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">All Homestays</h2>
            <p className="text-gray-600">Explore our complete collection of homestays</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allHomestays.map((homestay) => (
                  <HomestayCard key={homestay.id} homestay={homestay} />
                ))}
              </div>

              {/* Load More Button */}
              {page < totalPages && (
                <div className="flex justify-center mt-12">
                  <Button
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={loadingMore}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    {loadingMore ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Homestays
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              <div className="text-center mt-8 text-gray-600">
                Showing {allHomestays.length} of {totalPages * 12} homestays
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
