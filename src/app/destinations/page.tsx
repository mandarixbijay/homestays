"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Star, MapPin, Wifi, Car, Coffee, ChevronLeft, ChevronRight,
  Home, Users, Search as SearchIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

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
    isTopDestination: boolean;
    priority: number | null;
    createdAt: string;
    updatedAt: string;
  };
  data: Homestay[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  const [destinationData, setDestinationData] = useState<DestinationResponse | null>(null);
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHomestays, setLoadingHomestays] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch all destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch("/api/homestays/destinations/top");
        if (response.ok) {
          const data = await response.json();
          setDestinations(data);

          // Select destination from URL param or first one
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
          setDestinationData(data);
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

  // Handle destination selection
  const handleDestinationSelect = (dest: Destination) => {
    setSelectedDestination(dest);
    setPage(1);
    router.push(`/destinations?destination=${dest.name.toLowerCase()}`, { scroll: false });
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

  const HomestayCard = ({ homestay }: { homestay: Homestay }) => {
    const slug = generateProfileSlug(homestay.name, homestay.address, homestay.id);
    const displayRating = homestay.rating || 0;
    const discount =
      homestay.originalPrice && homestay.originalPrice > homestay.nightlyPrice
        ? Math.round(
            ((homestay.originalPrice - homestay.nightlyPrice) / homestay.originalPrice) * 100
          )
        : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          className="w-full rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col overflow-hidden bg-card"
          onClick={() => router.push(`/homestays/profile/${slug}`)}
        >
          {/* Image Section */}
          <div className="relative w-full h-52 overflow-hidden">
            <Image
              src={homestay.imageSrc}
              alt={homestay.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 350px"
              quality={80}
              onError={(e) => {
                e.currentTarget.src = "/images/fallback-image.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Badges */}
            {discount && (
              <Badge className="absolute top-3 right-3 bg-red-500 text-white font-semibold px-3 py-1 rounded-full text-xs shadow-lg">
                {discount}% OFF
              </Badge>
            )}

            {/* Rating Badge */}
            <div className="absolute bottom-3 left-3">
              <Badge className={`${getRatingColor(homestay.rating)} text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg`}>
                <Star className="h-3 w-3 fill-current" />
                {displayRating > 0 ? displayRating.toFixed(1) : "New"}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-5 flex flex-col flex-grow">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {homestay.name}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              {homestay.address}
            </p>

            {/* Capacity */}
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Up to {homestay.maxOccupancy} guests
              </span>
            </div>

            {/* Amenities */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {homestay.facilities.slice(0, 3).map((facility, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full flex items-center gap-1"
                  >
                    {amenityIcons[facility]}
                    {facility}
                  </span>
                ))}
                {homestay.facilities.length > 3 && (
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    +{homestay.facilities.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="mt-auto pt-4 border-t border-border/50">
              <div className="flex items-end justify-between">
                <div>
                  {homestay.originalPrice && homestay.originalPrice > homestay.nightlyPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      NPR {homestay.originalPrice.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xl font-bold text-foreground">
                    NPR {homestay.nightlyPrice.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">per night</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section with Destination Info */}
      <section className="relative pt-20">
        {selectedDestination && destinationData?.destination && (
          <div className="relative h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden">
            <Image
              src={destinationData.destination.imageUrl}
              alt={destinationData.destination.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12">
              <div className="container mx-auto max-w-7xl">
                <motion.div
                  key={selectedDestination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className="bg-primary text-white mb-4 text-sm px-4 py-1.5 rounded-full">
                    <Home className="h-4 w-4 mr-2" />
                    {total} Homestays Available
                  </Badge>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
                    {destinationData.destination.name}
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base max-w-3xl line-clamp-2 sm:line-clamp-3">
                    {destinationData.destination.description}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Destination Tabs */}
      <section className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 sm:gap-3 min-w-max">
              {destinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => handleDestinationSelect(dest)}
                  className={`
                    flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      selectedDestination?.id === dest.id
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }
                  `}
                >
                  <span>{dest.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedDestination?.id === dest.id
                      ? "bg-white/20 text-white"
                      : "bg-background text-muted-foreground"
                  }`}>
                    {dest._count.homestays}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Homestays Grid */}
      <section className="py-8 sm:py-12 flex-1">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Homestays in {selectedDestination?.name}
              </h2>
              <p className="text-muted-foreground mt-1">
                {total} properties found
              </p>
            </div>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {loadingHomestays ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {Array.from({ length: 8 }).map((_, idx) => (
                  <Card key={idx} className="overflow-hidden rounded-2xl border-none shadow-sm">
                    <Skeleton className="h-52 w-full" />
                    <CardContent className="p-5 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-8 w-full mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            ) : homestays.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {homestays.map((homestay) => (
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
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No homestays found</h3>
                  <p className="text-muted-foreground mb-6">
                    There are no homestays available in {selectedDestination?.name} at the moment.
                  </p>
                  <Button
                    onClick={() => {
                      if (destinations.length > 0) {
                        handleDestinationSelect(destinations[0]);
                      }
                    }}
                    variant="default"
                  >
                    Explore Other Destinations
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
