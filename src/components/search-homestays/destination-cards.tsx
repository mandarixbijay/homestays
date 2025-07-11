// src/components/search-homestays/destination-cards.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dealCardsData } from "@/data/deals";

const FALLBACK_IMAGE = "https://via.placeholder.com/350x208?text=No+Image+Available";

interface DestinationCardProps {
  imageSrc: string;
  location: string;
  hotelName: string;
  rating: string;
  reviews: string;
  originalPrice: string;
  nightlyPrice: string;
  totalPrice: string;
  categoryColor: string;
  slug: string;
  features: string[];
  vipAccess?: boolean;
  discount?: string;
  onClick?: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  imageSrc,
  location,
  hotelName,
  rating,
  reviews,
  originalPrice,
  nightlyPrice,
  totalPrice,
  categoryColor,
  slug,
  features,
  vipAccess,
  discount,
  onClick,
}) => {
  const [current, setCurrent] = useState(0);
  const images = [imageSrc]; // Single image for simplicity, as dealCardsData has one image per homestay

  const handlePrev = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, direction: "prev" | "next") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (direction === "prev") handlePrev(e);
      else handleNext(e);
    }
  };

  const imgArr = images.length > 0 ? images : [FALLBACK_IMAGE];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full border border-border rounded-xl bg-card cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
      onClick={onClick}
      role="button"
      aria-label={`View details for ${hotelName} in ${location}`}
    >
      <Card className="flex flex-col sm:flex-row w-full rounded-xl border-none h-auto sm:h-64">
        <div className="relative w-full sm:w-64 h-64 sm:h-full flex-shrink-0">
          <Image
            src={imgArr[current]}
            alt={`${hotelName} image ${current + 1}`}
            className="object-cover rounded-t-xl sm:rounded-l-xl sm:rounded-t-none"
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            quality={80}
            priority={current === 0}
            loading={current === 0 ? undefined : "lazy"}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl sm:rounded-l-xl sm:rounded-t-none" />
          {vipAccess && (
            <Badge className="absolute top-3 left-3 bg-yellow-400 text-primary font-semibold px-3 py-1 rounded-full text-xs">
              VIP Access
            </Badge>
          )}
          {discount && (
            <Badge className="absolute top-3 right-3 bg-green-600 text-white font-semibold px-3 py-1 rounded-full text-xs">
              {discount}
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-col sm:flex-row p-4 sm:p-6 w-full gap-4 sm:gap-6">
          <div className="flex flex-col w-full sm:w-1/2 space-y-2">
            <p className="text-sm text-text-secondary">{location}</p>
            <CardTitle className="text-lg sm:text-xl font-bold text-text-primary line-clamp-2">
              {hotelName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${categoryColor} text-white text-xs font-semibold px-2 py-0.5 rounded-sm`}>
                {rating}
              </Badge>
              <span className="text-sm text-text-secondary">{reviews.split(" ")[0]}</span>
              <span className="text-xs text-text-secondary">({reviews.split(" ")[1].replace("(", "").replace(")", "")})</span>
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-text-primary">Amenities:</h4>
              <ul className="list-disc pl-4 mt-1 space-y-1 text-xs text-text-secondary">
                {features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col justify-between w-full sm:w-1/2">
            <div className="flex flex-col items-end">
              {/* Placeholder for left rooms if needed */}
            </div>
            <div className="flex flex-col items-end mt-auto space-y-1">
              <p className="text-lg font-bold text-text-primary">
                {totalPrice}
                {originalPrice && (
                  <span className="text-sm text-text-secondary line-through ml-2">{originalPrice}</span>
                )}
              </p>
              <p className="text-sm text-text-secondary">{nightlyPrice} / night</p>
              <p className="text-xs text-text-secondary">Includes taxes & fees</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DestinationCardSkeleton = () => (
  <div className="w-full border border-border rounded-xl bg-card mb-6 shadow-sm">
    <Card className="flex flex-col sm:flex-row w-full rounded-xl border-none h-auto sm:h-64">
      <Skeleton className="w-full sm:w-64 h-64 sm:h-full rounded-t-xl sm:rounded-l-xl sm:rounded-t-none" />
      <CardContent className="flex flex-col sm:flex-row p-4 sm:p-6 w-full gap-4 sm:gap-6">
        <div className="flex flex-col w-full sm:w-1/2 space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-12 rounded-sm" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex flex-col w-full sm:w-1/2 space-y-3">
          <div className="flex justify-end">
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
          <div className="mt-auto flex flex-col items-end space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface DestinationCardsProps {
  searchLocation?: string | null;
  searchCheckIn?: string | null;
  searchCheckOut?: string | null;
  searchGuests?: string | null;
  searchRooms?: string | null;
}

const DestinationCards = ({
  searchLocation,
  searchCheckIn,
  searchCheckOut,
  searchGuests,
  searchRooms,
}: DestinationCardsProps) => {
  const [sortOption, setSortOption] = useState("price-low-to-high");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    popularFilters: {},
    minPrice: 0,
    maxPrice: 1000,
    amenities: {},
  });
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Update filters from FilterCard
  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Filter homestays based on query parameters and FilterCard state
  const filteredHotels = dealCardsData.filter((hotel) => {
    // Location filter
    if (searchLocation && hotel.location.toLowerCase() !== searchLocation.toLowerCase()) {
      return false;
    }

    // Price filter
    const price = parseFloat(hotel.totalPrice.replace("$", ""));
    if (price < filters.minPrice || price > filters.maxPrice) {
      return false;
    }

    // Amenities filter (check if selected amenities are included in hotel features)
    const selectedAmenities = Object.keys(filters.amenities).filter(
      (key) => filters.amenities[key as keyof typeof filters.amenities]
    );
    if (selectedAmenities.length > 0) {
      return selectedAmenities.every((amenity) => hotel.features.includes(amenity));
    }

    return true;
  });

  // Sort filtered homestays
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortOption === "price-low-to-high") {
      return parseFloat(a.totalPrice.replace("$", "")) - parseFloat(b.totalPrice.replace("$", ""));
    } else if (sortOption === "price-high-to-low") {
      return parseFloat(b.totalPrice.replace("$", "")) - parseFloat(a.totalPrice.replace("$", ""));
    } else if (sortOption === "rating") {
      return parseFloat(b.rating) - parseFloat(a.rating);
    }
    return 0;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary">
          {sortedHotels.length} Properties Found
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm sm:text-base font-medium text-text-secondary">Sort by:</span>
          <Select onValueChange={setSortOption} defaultValue={sortOption}>
            <SelectTrigger
              className="w-full sm:w-48 h-10 rounded-md bg-background border-border text-sm text-text-primary focus:ring-2 focus:ring-primary hover:border-primary"
              aria-label="Sort homestays"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              <SelectItem value="price-low-to-high">Price: low to high</SelectItem>
              <SelectItem value="price-high-to-low">Price: high to low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        Array(6)
          .fill(0)
          .map((_, idx) => <DestinationCardSkeleton key={idx} />)
      ) : sortedHotels.length === 0 ? (
        <p className="text-center text-text-secondary text-lg">No homestays found matching your criteria.</p>
      ) : (
        sortedHotels.map((hotel, idx) => (
          <DestinationCard
            key={idx}
            {...hotel}
            onClick={() => {
              const slug = hotel.slug;
              router.push(`/homestays/${slug}?imageUrl=${encodeURIComponent(hotel.imageSrc)}`);
            }}
          />
        ))
      )}
    </motion.div>
  );
};

export default DestinationCards;