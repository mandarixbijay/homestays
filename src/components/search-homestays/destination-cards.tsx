// src/components/search-homestays/destination-cards.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Hero3Card } from "@/types/homestay";
import { differenceInDays, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_IMAGE = "https://via.placeholder.com/350x208?text=No+Image+Available";

interface DestinationCardProps {
  imageSrc: string;
  images: string[];
  location: string;
  address: string;
  hotelName: string;
  rating: string;
  reviews: string;
  originalPrice: string;
  nightlyPrice: string;
  totalPrice: string;
  numNights: number;
  categoryColor: string;
  slug: string;
  features: string[];
  vipAccess?: boolean;
  discount?: string;
  roomsLeft?: number;
  aboutDescription?: string;
  onClick?: () => void;
}

interface DestinationCardsProps {
  homestays?: Hero3Card[];
  searchLocation?: string | null;
  searchCheckIn?: string | null;
  searchCheckOut?: string | null;
  searchGuests?: string | null;
  searchRooms?: string | null;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  imageSrc,
  images,
  location,
  address,
  hotelName,
  rating,
  reviews,
  originalPrice,
  nightlyPrice,
  totalPrice,
  numNights,
  categoryColor,
  slug,
  features,
  vipAccess,
  discount,
  roomsLeft,
  aboutDescription,
  onClick,
}) => {
  const [current, setCurrent] = useState(0);
  const imgArr = images.length > 0 ? images : [FALLBACK_IMAGE];

  const handlePrev = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === 0 ? imgArr.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === imgArr.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, direction: "prev" | "next") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (direction === "prev") handlePrev(e);
      else handleNext(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full border border-border rounded-md bg-card cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
      onClick={onClick}
      role="button"
      aria-label={`View details for ${hotelName} in ${location}`}
    >
      <Card className="flex flex-col sm:flex-row w-full rounded-md border-none h-auto">
        <div className="relative w-full sm:w-64 h-64 flex-shrink-0">
          <Image
            src={imgArr[current]}
            alt={`${hotelName} image ${current + 1}`}
            className="object-cover rounded-t-md sm:rounded-l-md sm:rounded-t-none"
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            quality={80}
            priority={current === 0}
            loading={current === 0 ? undefined : "lazy"}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-md sm:rounded-l-md sm:rounded-t-none" />
          {imgArr.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                onKeyDown={(e) => handleKeyDown(e, "prev")}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary-90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                onKeyDown={(e) => handleKeyDown(e, "next")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary-90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
                {imgArr.map((_, index) => (
                  <span
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${index === current ? "bg-accent" : "bg-white/50"
                      }`}
                  />
                ))}
              </div>
            </>
          )}
          {vipAccess && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-semibold px-3 py-1 rounded-full text-xs">
              VIP Access
            </Badge>
          )}
          {discount && (
            <Badge className="absolute top-3 right-3 bg-discount text-discount-foreground font-semibold px-3 py-1 rounded-full text-xs">
              {discount}
            </Badge>
          )}
          {roomsLeft !== undefined && roomsLeft < 5 && (
            <Badge className="absolute top-3 left-3 bg-warning text-warning-foreground font-semibold px-3 py-1 rounded-full text-xs">
              {roomsLeft} {roomsLeft === 1 ? "room" : "rooms"} left
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-col sm:flex-row p-4 sm:p-6 w-full gap-4 sm:gap-6 min-h-64">
          <div className="flex flex-col w-full sm:w-1/2 space-y-3">
            <p className="text-sm text-muted-foreground">{address}</p>
            <CardTitle className="text-lg font-bold text-foreground line-clamp-2 font-manrope">
              {hotelName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${categoryColor} text-white text-xs font-semibold px-2 py-0.5 rounded-sm font-manrope`}>
                {rating}
              </Badge>
              <span className="text-sm text-muted-foreground">{reviews.split(" ")[0]}</span>
              <span className="text-xs text-muted-foreground">
                ({reviews.split(" ")[1].replace("(", "").replace(")", "")})
              </span>
            </div>
            <div className="mt-2 flex-1">
              <h4 className="text-sm font-semibold text-foreground font-manrope">Amenities:</h4>
              <ul className="list-disc pl-4 mt-1 space-y-1 text-xs text-muted-foreground font-manrope">
                {features.slice(0, 3).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
                {features.length > 3 && (
                  <li className="text-primary-70 cursor-pointer" onClick={onClick}>
                    Show more...
                  </li>
                )}
              </ul>
            </div>
            {aboutDescription && aboutDescription !== "No description available" && (
              <div className="mt-2">
                <h4 className="text-sm font-semibold text-foreground font-manrope">About:</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 font-manrope">{aboutDescription}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between w-full sm:w-1/2">
            <div className="flex flex-col items-end">
              <p className="text-sm text-muted-foreground font-manrope">
                {roomsLeft || 0} room{roomsLeft !== 1 ? "s" : ""} available
              </p>
            </div>
            <div className="flex flex-col items-end mt-auto space-y-1">
              <p className="text-sm text-muted-foreground line-through font-manrope">{originalPrice}</p>
              <p className="text-base font-semibold text-foreground font-manrope">
                {nightlyPrice} x {numNights} night{numNights !== 1 ? "s" : ""}
              </p>
              <p className="text-lg font-bold text-foreground font-manrope">
                {totalPrice} total for {numNights} night{numNights !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground font-manrope">Includes taxes & fees</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DestinationCardSkeleton = () => (
  <div className="w-full border border-border rounded-md bg-card mb-6 shadow-sm">
    <Card className="flex flex-col sm:flex-row w-full rounded-md border-none h-auto">
      <Skeleton className="w-full sm:w-64 h-64 rounded-t-md sm:rounded-l-md sm:rounded-t-none" />
      <CardContent className="flex flex-col sm:flex-row p-4 sm:p-6 w-full gap-4 sm:gap-6 min-h-64">
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

const DestinationCards: React.FC<DestinationCardsProps> = ({
  homestays = [],
  searchLocation,
  searchCheckIn,
  searchCheckOut,
  searchGuests,
  searchRooms,
}) => {
  const [sortOption, setSortOption] = useState("price-low-to-high");
  const router = useRouter();

  // Calculate number of nights
  let numNights = 1;
  if (searchCheckIn && searchCheckOut) {
    try {
      const startDate = new Date(searchCheckIn);
      const endDate = new Date(searchCheckOut);
      numNights = differenceInDays(endDate, startDate);
      if (numNights <= 0) {
        console.warn("Invalid date range, defaulting to 1 night");
        numNights = 1;
      }
    } catch (error) {
      console.error("Error calculating stay duration:", error);
      numNights = 1;
    }
  }

  const adaptHomestay = (homestay: Hero3Card): DestinationCardProps => {
    const totalPriceNum = parseFloat(homestay.price.replace("NPR ", ""));
    const nightlyPriceNum = homestay.rooms[0]?.nightlyPrice || totalPriceNum / numNights;
    const mockOriginalPrice = nightlyPriceNum * 1.2; // Mock 20% markup for strikethrough
    const discount = mockOriginalPrice > nightlyPriceNum
      ? `${Math.round(((mockOriginalPrice - nightlyPriceNum) / mockOriginalPrice) * 100)}% off`
      : undefined;
    const totalRoomsLeft = homestay.rooms.reduce((sum, room) => sum + (room.roomsLeft || 0), 0);

    // Combine main homestay image with room images
    const allImages = [];
    if (homestay.image && homestay.image !== FALLBACK_IMAGE) {
      allImages.push(homestay.image);
    }
    if (homestay.rooms && homestay.rooms.length > 0) {
      homestay.rooms.forEach(room => {
        if (room.imageUrls && room.imageUrls.length > 0) {
          allImages.push(...room.imageUrls);
        }
      });
    }
    const uniqueImages = [...new Set(allImages)];
    const combinedImages = uniqueImages.length > 0 ? uniqueImages : [FALLBACK_IMAGE];

    return {
      imageSrc: homestay.image || FALLBACK_IMAGE,
      images: combinedImages,
      location: `${homestay.city}, ${homestay.region}`,
      address: homestay.address || `${homestay.city}, ${homestay.region}`,
      hotelName: homestay.name || homestay.city,
      rating: homestay.rating.toFixed(1),
      reviews: `${homestay.rating.toFixed(1)} (${homestay.rooms[0]?.reviews || 0} reviews)`,
      originalPrice: `NPR ${mockOriginalPrice.toFixed(2)}`,
      nightlyPrice: `NPR ${nightlyPriceNum.toFixed(2)}`,
      totalPrice: `NPR ${totalPriceNum.toFixed(2)}`,
      numNights,
      categoryColor: homestay.categoryColor || "bg-primary",
      slug: homestay.slug,
      features: [...new Set([...(homestay.features || []), ...(homestay.rooms[0]?.facilities || [])])],
      vipAccess: homestay.vipAccess || false,
      discount,
      roomsLeft: totalRoomsLeft,
      aboutDescription: homestay.aboutDescription,
      onClick: () =>
        router.push(
          `/homestays/${homestay.slug}?imageUrl=${encodeURIComponent(homestay.image)}&checkIn=${searchCheckIn || format(new Date(), "yyyy-MM-dd")}&checkOut=${searchCheckOut || format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd")}&guests=${searchGuests || "2A0C"}&rooms=${searchRooms || "1"}`
        ),
    };
  };

  // Sort homestays (filtering is now done in parent component)
  const sortedHotels = [...homestays].sort((a, b) => {
    if (sortOption === "price-low-to-high") {
      return parseFloat(a.price.replace("NPR ", "")) - parseFloat(b.price.replace("NPR ", ""));
    } else if (sortOption === "price-high-to-low") {
      return parseFloat(b.price.replace("NPR ", "")) - parseFloat(a.price.replace("NPR ", ""));
    } else if (sortOption === "rating") {
      return b.rating - a.rating;
    }
    return 0;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-foreground font-manrope">
          {sortedHotels.length} Properties Found
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-base font-medium text-muted-foreground font-manrope">Sort by:</span>
          <Select onValueChange={setSortOption} defaultValue={sortOption}>
            <SelectTrigger
              className="w-full sm:w-48 h-10 rounded-md bg-background border-border text-sm text-foreground focus:ring-2 focus:ring-accent hover:border-primary font-manrope"
              aria-label="Sort homestays"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border font-manrope">
              <SelectItem value="price-low-to-high">Price: low to high</SelectItem>
              <SelectItem value="price-high-to-low">Price: high to low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {sortedHotels.length === 0 ? (
        <p className="text-center text-muted-foreground text-lg font-manrope">No homestays found matching your criteria.</p>
      ) : (
        sortedHotels.map((homestay, idx) => (
          <DestinationCard key={idx} {...adaptHomestay(homestay)} />
        ))
      )}
    </motion.div>
  );
};

export default DestinationCards;