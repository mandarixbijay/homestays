// src/components/homestay/components/details/room-details/room-card.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Building,
  Car,
  Wifi,
  Square,
  Users,
  BedSingle,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import AmenitiesDialog from "@/components/homestay/components/dialogs/about-dialog";
import PaymentOptionsDialog from "@/components/homestay/components/dialogs/payment-options-dialog";
import { RoomCards } from "@/models";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { format, differenceInDays } from "date-fns";

const FALLBACK_IMAGE = "https://via.placeholder.com/350x208?text=No+Image+Available";

export default function RoomCard({
  imageUrls = [],
  roomTitle,
  rating,
  reviews,
  cityView = false,
  freeParking = false,
  freeWifi = false,
  sqFt,
  sleeps,
  bedType,
  refundable,
  nightlyPrice,
  totalPrice,
  roomsLeft,
  extrasOptions = [],
}: RoomCards) {
  const searchParams = useSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [selectedExtra, setSelectedExtra] = useState(extrasOptions[0]?.label || "");
  const [adjustedTotalPrice, setAdjustedTotalPrice] = useState(totalPrice);

  // Parse query parameters
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");
  const rooms = searchParams.get("rooms");
  const homestayName = searchParams.get("homestayName") || "Homestay"; // Add homestayName from query or fallback

  // Calculate stay duration and adjust total price
  useEffect(() => {
    let baseTotalPrice = totalPrice;
    if (checkIn && checkOut) {
      try {
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);
        const numNights = differenceInDays(endDate, startDate);
        if (numNights > 0) {
          baseTotalPrice = nightlyPrice * numNights;
        }
      } catch (error) {
        console.error("Error calculating stay duration:", error);
      }
    }
    const extraPrice = extrasOptions.find((opt) => opt.label === selectedExtra)?.price || 0;
    setAdjustedTotalPrice(baseTotalPrice + extraPrice);
  }, [checkIn, checkOut, nightlyPrice, selectedExtra, extrasOptions, totalPrice]);

  const handlePrevImage = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!imageUrls.length) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!imageUrls.length) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    direction: "prev" | "next"
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (direction === "prev") handlePrevImage(e);
      else handleNextImage(e);
    }
  };

  const handleExtraChange = (value: string) => {
    setSelectedExtra(value);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)" }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col w-[350px] rounded-xl overflow-hidden border border-gray-100 bg-white"
    >
      <div className="relative w-full h-52">
        {imageUrls.length > 0 && !imageError ? (
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={imageUrls[currentImageIndex]}
              alt={`${roomTitle} image ${currentImageIndex + 1}`}
              width={350}
              height={208}
              className="object-cover rounded-t-xl"
              sizes="350px"
              priority={currentImageIndex === 0}
              loading={currentImageIndex === 0 ? undefined : "lazy"}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl" />
          </motion.div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-xl">
            <ImageIcon className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600 ml-2">Image Unavailable</span>
          </div>
        )}
        {imageUrls.length > 1 && !imageError && (
          <>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {imageUrls.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "bg-primary" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handlePrevImage}
              onKeyDown={(e) => handleKeyDown(e, "prev")}
              className="absolute left-4 bottom-8 bg-white hover:bg-gray-100 text-primary hover:text-primary-hover rounded-full p-2 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextImage}
              onKeyDown={(e) => handleKeyDown(e, "next")}
              className="absolute right-4 bottom-8 bg-white hover:bg-gray-100 text-primary hover:text-primary-hover rounded-full p-2 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
              <ImageIcon className="h-4 w-4" /> {currentImageIndex + 1} / {imageUrls.length}
            </div>
          </>
        )}
        {refundable && (
          <Badge className="absolute top-3 left-3 bg-[#FFECB3] text-primary text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            Fully Refundable
          </Badge>
        )}
        {roomsLeft && roomsLeft <= 3 && (
          <Badge className="absolute top-3 right-3 bg-[#34C759] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            Only {roomsLeft} left!
          </Badge>
        )}
      </div>

      <div className="p-5 pb-6 flex flex-col flex-grow justify-between">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-primary line-clamp-1">{roomTitle}</h2>
            <Badge className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded-md">
              {rating.toFixed(1)}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary mb-4">{reviews} review{reviews !== 1 ? "s" : ""}</p>

          <ul className="text-sm text-text-secondary space-y-2 mb-4">
            <li className="flex items-center gap-2">
              <Building className="h-4 w-4 text-text-secondary" />
              <span>{cityView ? "City view" : "No city view"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Car className="h-4 w-4 text-text-secondary" />
              <span>{freeParking ? "Free self parking" : "Parking available"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-text-secondary" />
              <span>{freeWifi ? "Free WiFi" : "WiFi available"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Square className="h-4 w-4 text-text-secondary" />
              <span>{sqFt} sq ft</span>
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-text-secondary" />
              <span>Sleeps {sleeps}</span>
            </li>
            <li className="flex items-center gap-2">
              <BedSingle className="h-4 w-4 text-text-secondary" />
              <span>{bedType}</span>
            </li>
            <li className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-4 w-4" />
              <span>Reserve now, pay later</span>
              <Info className="h-4 w-4 text-text-secondary cursor-pointer" aria-label="Payment details" />
            </li>
          </ul>

          <AmenitiesDialog>
            <Button
              variant="outline"
              className="text-primary hover:text-primary-hover text-sm font-semibold flex items-center gap-1 mt-1"
              aria-label="Show more details"
            >
              More details
            </Button>
          </AmenitiesDialog>

          {extrasOptions.length > 0 && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <h3 className="font-semibold text-base text-primary mb-2">Extras</h3>
              <RadioGroup
                value={selectedExtra}
                onValueChange={handleExtraChange}
                className="space-y-2 text-sm"
              >
                {extrasOptions.map((option) => (
                  <div key={option.label} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <RadioGroupItem
                        value={option.label}
                        id={option.label.replace(/\s/g, "")}
                        className="text-primary"
                      />
                      <Label
                        htmlFor={option.label.replace(/\s/g, "")}
                        className="ml-2 text-text-secondary"
                      >
                        {option.label}
                      </Label>
                    </div>
                    <span className="text-text-secondary">
                      {option.price > 0 ? `+ $${option.price}` : "Included"}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="mt-4 text-right">
          <p className="text-lg text-gray-500 line-through">
            ${nightlyPrice} nightly
          </p>
          <p className="text-2xl font-bold text-primary">${adjustedTotalPrice.toFixed(2)} total</p>
          <p className="text-primary text-sm mt-1">
            <CheckCircle className="inline h-4 w-4 mr-1" /> Total includes taxes and fees
          </p>
        </div>

        <div className="mt-4">
          <PaymentOptionsDialog
            nightlyPrice={nightlyPrice}
            totalPrice={adjustedTotalPrice}
            roomTitle={roomTitle}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            rooms={rooms}
            extra={selectedExtra}
            homestayName={homestayName}
            bedType={bedType}
            imageUrl={imageUrls[0] || FALLBACK_IMAGE}
          >
            <Button
              className="w-full bg-primary hover:bg-primary-800 text-white py-3 rounded-md font-semibold text-lg"
            >
              Reserve
            </Button>
          </PaymentOptionsDialog>
          <p className="text-xs text-gray-500 mt-2 text-center">
            You will not be charged yet
          </p>
        </div>
      </div>
    </motion.div>
  );
}