// src/components/homestay/components/details/room-details/room-card.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BedSingle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  Plus, 
  Minus, 
  ChevronDown,
  Star,
  Shield,
  AlertCircle
} from "lucide-react";
import { Hero3Card } from "@/types/homestay";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSearchParams } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { useHomestayStore } from "@/store/homestayStore";

const FALLBACK_IMAGE = "https://via.placeholder.com/350x208?text=No+Image+Available";

type RoomCardProps = Hero3Card["rooms"][number] & {
  homestayName: string;
  homestayId: number;
  roomId: number;
  originalPrice?: number;
  isSuitable: boolean;
  assignedGuests?: { adults: number; children: number };
};

export default function RoomCard({
  imageUrls = [],
  roomTitle,
  rating,
  reviews,
  sleeps,
  bedType,
  refundable,
  nightlyPrice,
  totalPrice = nightlyPrice,
  roomsLeft,
  extrasOptions = [],
  facilities = [],
  homestayName,
  homestayId,
  roomId,
  originalPrice,
  isSuitable,
  assignedGuests,
}: RoomCardProps) {
  const searchParams = useSearchParams();
  const { selectedRooms, addRoom, updateRoom, removeRoom } = useHomestayStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [selectedExtra, setSelectedExtra] = useState(extrasOptions[0]?.label || "");
  const [adjustedTotalPrice, setAdjustedTotalPrice] = useState(totalPrice);
  const [numNights, setNumNights] = useState(1);
  const [adults, setAdults] = useState(assignedGuests?.adults || 1);
  const [children, setChildren] = useState(assignedGuests?.children || 0);
  const [numRooms, setNumRooms] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isExtrasOpen, setIsExtrasOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  const checkIn = searchParams.get("checkIn") || format(new Date(), "yyyy-MM-dd");
  const checkOut = searchParams.get("checkOut") || format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd");
  const roomsRequired = parseInt(searchParams.get("rooms") || "1");

  // Validate pricing
  const validatedNightlyPrice = nightlyPrice && nightlyPrice > 0 ? nightlyPrice : 1000;
  const validatedTotalPrice = totalPrice && totalPrice > 0 ? totalPrice : validatedNightlyPrice;

  // Calculate total price and nights
  useEffect(() => {
    let baseTotalPrice = validatedTotalPrice * (numRooms || 1);
    let nights = 1;
    if (checkIn && checkOut) {
      try {
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);
        nights = differenceInDays(endDate, startDate);
        if (nights < 1) {
          console.warn("Invalid date range, defaulting to 1 night");
          nights = 1;
        }
      } catch (error) {
        console.error("Error calculating stay duration:", error);
        nights = 1;
      }
    }
    setNumNights(nights);
    const extraPrice = extrasOptions.find((opt) => opt.label === selectedExtra)?.price || 0;
    const calculatedPrice = baseTotalPrice + extraPrice * (numRooms || 1) * nights;
    setAdjustedTotalPrice(calculatedPrice);
  }, [checkIn, checkOut, validatedNightlyPrice, validatedTotalPrice, selectedExtra, extrasOptions, numRooms]);

  // Initialize guest counts and room selection
  useEffect(() => {
    if (!roomId) {
      console.error("Room ID is missing for room:", roomTitle);
      setError("Invalid room configuration. Please try again.");
      return;
    }
    const existingRoom = selectedRooms.find((room) => room.roomId === roomId);
    if (existingRoom) {
      setAdults(existingRoom.adults);
      setChildren(existingRoom.children);
      setNumRooms(existingRoom.numRooms || 1);
    } else if (assignedGuests) {
      setAdults(assignedGuests.adults);
      setChildren(assignedGuests.children);
      setNumRooms(0);
    }
  }, [assignedGuests, roomId, roomTitle, selectedRooms]);

  const handlePrevImage = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (imageUrls.length <= 1) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  }, [imageUrls]);

  const handleNextImage = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (imageUrls.length <= 1) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  }, [imageUrls]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, direction: "prev" | "next") => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (direction === "prev") handlePrevImage(e);
        else handleNextImage(e);
      }
    },
    [handlePrevImage, handleNextImage]
  );

  const handleExtraChange = useCallback((value: string) => {
    setSelectedExtra(value);
  }, []);

  const handleRoomsChange = useCallback(
    (delta: number) => {
      const totalSelectedRooms = selectedRooms.reduce((sum, room) => sum + (room.numRooms || 1), 0);
      const newNumRooms = Math.max(0, Math.min(numRooms + delta, roomsLeft || Infinity));
      const newTotalRooms = totalSelectedRooms - numRooms + newNumRooms;

      if (!isSuitable) {
        setError("This room is not suitable for the selected guests.");
        return;
      }
      if (newTotalRooms > roomsRequired) {
        setError(`You can select up to ${roomsRequired} room${roomsRequired !== 1 ? "s" : ""}.`);
        return;
      }
      if (newNumRooms > 0) {
        const totalGuestsInRoom = adults + children;
        if (totalGuestsInRoom > sleeps) {
          setError(`This room accommodates up to ${sleeps} guests.`);
          return;
        }
        if (totalGuestsInRoom < 1) {
          setError("At least one guest is required per room.");
          return;
        }
      }

      setError(null);
      setNumRooms(newNumRooms);

      if (newNumRooms === 0) {
        removeRoom(roomId);
      } else {
        const existingRoom = selectedRooms.find((room) => room.roomId === roomId);
        if (existingRoom) {
          updateRoom(roomId, { adults, children, numRooms: newNumRooms });
        } else {
          addRoom({
            roomId,
            roomTitle,
            adults,
            children,
            nightlyPrice: validatedNightlyPrice,
            totalPrice: adjustedTotalPrice / (newNumRooms || 1),
            sleeps,
            numRooms: newNumRooms,
          });
        }
      }
    },
    [isSuitable, adults, children, sleeps, roomsLeft, roomsRequired, selectedRooms, roomId, roomTitle, validatedNightlyPrice, adjustedTotalPrice, addRoom, updateRoom, removeRoom]
  );

  const handleAdultsChange = useCallback(
    (delta: number) => {
      const newAdults = Math.max(1, adults + delta);
      if (newAdults + children > sleeps) {
        setError(`This room accommodates up to ${sleeps} guests.`);
        return;
      }
      setError(null);
      setAdults(newAdults);
      const existingRoom = selectedRooms.find((room) => room.roomId === roomId);
      if (existingRoom && numRooms > 0) {
        updateRoom(roomId, { adults: newAdults, children, numRooms });
      }
    },
    [adults, children, sleeps, selectedRooms, updateRoom, roomId, numRooms]
  );

  const handleChildrenChange = useCallback(
    (delta: number) => {
      const newChildren = Math.max(0, children + delta);
      if (adults + newChildren > sleeps) {
        setError(`This room accommodates up to ${sleeps} guests.`);
        return;
      }
      setError(null);
      setChildren(newChildren);
      const existingRoom = selectedRooms.find((room) => room.roomId === roomId);
      if (existingRoom && numRooms > 0) {
        updateRoom(roomId, { adults, children: newChildren, numRooms });
      }
    },
    [adults, children, sleeps, selectedRooms, updateRoom, roomId, numRooms]
  );

  const mockOriginalPrice = validatedNightlyPrice * 1.2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        w-full max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100
        ${numRooms > 0 ? "ring-2 ring-blue-500 ring-opacity-20" : ""}
        hover:shadow-lg transition-all duration-300
      `}
      aria-label={`Room card for ${roomTitle}`}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/10] group">
        {imageUrls.length > 0 && !imageError ? (
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={imageUrls[currentImageIndex]}
              alt={`${roomTitle} image ${currentImageIndex + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 768px"
              quality={85}
              priority={currentImageIndex === 0}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-300 mb-2" />
            <span className="text-sm text-gray-400 font-medium">No Image Available</span>
          </div>
        )}

        {/* Image Navigation */}
        {imageUrls.length > 1 && !imageError && (
          <>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5">
              {imageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`
                    h-2 w-2 rounded-full transition-all duration-200
                    ${index === currentImageIndex ? "bg-white scale-125" : "bg-white/60 hover:bg-white/80"}
                  `}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isSuitable && (
            <Badge className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
              ✓ Suitable
            </Badge>
          )}
          {refundable && (
            <Badge className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Refundable
            </Badge>
          )}
        </div>

        {roomsLeft && roomsLeft <= 3 && (
          <Badge className="absolute top-4 right-4 bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium shadow-sm flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Only {roomsLeft} left!
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1 font-medium">{homestayName}</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{roomTitle}</h2>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
              <Star className="h-4 w-4 text-blue-600 fill-current" />
              <span className="text-sm font-semibold text-blue-700">{rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">({reviews} reviews)</span>
          </div>

          {/* Room Features */}
          <div className="space-y-3 p-5 bg-gray-50/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Sleeps {sleeps}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <BedSingle className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">{bedType}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Reserve now, pay later</span>
            </div>
          </div>

          {facilities.length > 0 && (
            <div className="mt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-gray-600 line-clamp-2 cursor-help">
                      <span className="font-medium">Amenities:</span> {facilities.join(", ")}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{facilities.join(", ")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Interactive Sections */}
        <div className="space-y-4">
          {/* Guests Section */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setIsGuestsOpen(!isGuestsOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="font-semibold text-gray-900">Guests</span>
                <span className="text-sm text-gray-500">
                  {adults} adult{adults !== 1 ? "s" : ""}{children > 0 && `, ${children} child${children !== 1 ? "ren" : ""}`}
                </span>
              </div>
              <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${isGuestsOpen ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence>
              {isGuestsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Adults</p>
                        <p className="text-sm text-gray-500">Ages 18+</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdultsChange(-1)}
                          disabled={adults <= 1}
                          className="h-8 w-8 p-0 rounded-full disabled:opacity-30"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-gray-900">{adults}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdultsChange(1)}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Children</p>
                        <p className="text-sm text-gray-500">Ages 0–17</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChildrenChange(-1)}
                          disabled={children <= 0}
                          className="h-8 w-8 p-0 rounded-full disabled:opacity-30"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-gray-900">{children}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChildrenChange(1)}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Extras Section */}
          {extrasOptions.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setIsExtrasOpen(!isExtrasOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5 text-gray-400" />
                  <span className="font-semibold text-gray-900">Extras</span>
                  {selectedExtra && (
                    <span className="text-sm text-gray-500">{selectedExtra}</span>
                  )}
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${isExtrasOpen ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {isExtrasOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <RadioGroup
                        value={selectedExtra}
                        onValueChange={handleExtraChange}
                        className="space-y-3"
                      >
                        {extrasOptions.map((option) => (
                          <div key={option.label} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem
                                value={option.label}
                                id={option.label.replace(/\s/g, "")}
                              />
                              <Label
                                htmlFor={option.label.replace(/\s/g, "")}
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                {option.label}
                              </Label>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {option.price > 0 ? `+NPR ${option.price}` : "Included"}
                            </span>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Room Selection */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-gray-900">Number of Rooms</p>
                <p className="text-sm text-gray-500">
                  {roomsLeft ? `${roomsLeft} available` : "Unlimited availability"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoomsChange(-1)}
                  disabled={numRooms <= 0}
                  className="h-10 w-10 p-0 rounded-full disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-xl font-bold text-gray-900">{numRooms}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoomsChange(1)}
                  disabled={numRooms >= (roomsLeft || Infinity) || !isSuitable}
                  className="h-10 w-10 p-0 rounded-full disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pricing */}
            <div className="bg-gray-50/50 rounded-xl p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    NPR {validatedNightlyPrice.toLocaleString()} per night
                    {numRooms > 0 && ` × ${numRooms} room${numRooms > 1 ? "s" : ""}`}
                    {numNights > 1 && ` × ${numNights} nights`}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      NPR {adjustedTotalPrice.toLocaleString()}
                    </span>
                    {mockOriginalPrice > validatedNightlyPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        NPR {(mockOriginalPrice * (numRooms || 1) * numNights).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {mockOriginalPrice > validatedNightlyPrice && (
                  <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-semibold">
                    {Math.round(((mockOriginalPrice - validatedNightlyPrice) / mockOriginalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}