// src/components/homestay/components/checkout/RoomDetailsCard.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Crect width='400' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

interface RoomDetailsCardProps {
  roomTitle: string;
  imageUrl?: string | string[];
  homestayName: string;
  checkInDate: string;
  checkOutDate: string;
  nightStay: string;
  totalPrice: number | string;
}

const RoomDetailsCard: React.FC<RoomDetailsCardProps> = ({
  roomTitle,
  imageUrl,
  homestayName,
  checkInDate,
  checkOutDate,
  nightStay,
  totalPrice,
}) => {
  // Normalize imageUrl to an array and validate
  const images = (() => {
    if (!imageUrl) return [FALLBACK_IMAGE];
    if (Array.isArray(imageUrl)) {
      const validImages = imageUrl.filter((url) => url && typeof url === "string");
      return validImages.length > 0 ? validImages : [FALLBACK_IMAGE];
    }
    return [imageUrl || FALLBACK_IMAGE];
  })();

  const [currentImage, setCurrentImage] = useState(0);
  const [imageError, setImageError] = useState(new Array(images.length).fill(false));

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (index: number) => {
    setImageError((prev) => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  // Parse totalPrice to number
  const totalPriceNum = typeof totalPrice === "string" ? parseFloat(totalPrice) : totalPrice;

  // Calculate number of nights dynamically
  let numNights = parseInt(nightStay) || 1;
  try {
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const calculatedNights = differenceInDays(endDate, startDate);
    if (calculatedNights > 0) numNights = calculatedNights;
  } catch (error) {
    console.error("Error calculating nights:", error);
  }

  // Calculate average nightly price and taxes
  const avgNightlyPrice = (totalPriceNum * 0.8) / numNights; // Assume 80% is room cost, 20% is taxes
  const taxesAndFees = totalPriceNum * 0.2;

  return (
    <div className="w-full max-w-full lg:max-w-[400px] bg-white rounded-lg shadow-sm p-4 sm:p-6 h-fit">
      {/* Image Section */}
      <div className="relative h-24 w-full mb-4 group">
        <Image
          src={imageError[currentImage] ? FALLBACK_IMAGE : images[currentImage]}
          alt={imageError[currentImage] ? `${roomTitle} placeholder image` : `${roomTitle} image ${currentImage + 1}`}
          fill
          className="object-cover rounded-md"
          sizes="(max-width: 1024px) 100vw, 400px"
          priority={currentImage === 0}
          onError={() => handleImageError(currentImage)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-md" />
        {images.length > 1 && (
          <>
            <button
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary transition-opacity duration-200"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-3 w-3 text-gray-700" />
            </button>
            <button
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary transition-opacity duration-200"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-3 w-3 text-gray-700" />
            </button>
            <div className="absolute inset-x-0 bottom-1 flex justify-center gap-1">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`h-1 w-1 rounded-full ${index === currentImage ? "bg-primary" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Room Info */}
      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">{homestayName}</h3>
      <p className="text-xs text-gray-700 mb-3 line-clamp-1">1 Room: {roomTitle}</p>

      {/* Check-in/out Details */}
      <div className="border-t border-gray-200 pt-3 mb-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-700">
            <span className="font-semibold text-gray-900">In:</span>{" "}
            {format(new Date(checkInDate), "EEE, MMM d")}
          </p>
          <p className="text-xs text-gray-700">
            <span className="font-semibold text-gray-900">Out:</span>{" "}
            {format(new Date(checkOutDate), "EEE, MMM d")}
          </p>
          <p className="text-xs text-gray-600">{numNights}-night stay</p>
        </div>
      </div>

      {/* Special Requests */}
      <div className="border-t border-gray-200 pt-3 mb-3">
        <button
          className="flex items-center justify-between w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
          aria-label="Add special or accessibility requests"
        >
          <span className="text-xs font-semibold text-primary hover:underline line-clamp-1">
            Special Requests
          </span>
          <ChevronRight className="h-4 w-4 text-primary" />
        </button>
      </div>

      {/* Urgency Banner */}
      <div className="bg-green-50 text-green-800 p-2 rounded-md flex items-start gap-1 text-xs">
        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span className="font-medium line-clamp-2">Book now before it’s gone!</span>
      </div>

      {/* Price Details Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mt-4 border border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Price Details</h3>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-start text-xs">
            <p className="text-gray-700">
              1 Room × {numNights} Nights
              <br />
              <span className="text-[10px] text-gray-500">${avgNightlyPrice.toFixed(2)} avg/night</span>
            </p>
            <p className="font-semibold text-gray-900">${(avgNightlyPrice * numNights).toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center text-xs">
            <p className="text-gray-700">Taxes & Fees</p>
            <p className="font-semibold text-gray-900">${taxesAndFees.toFixed(2)}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <p className="text-sm font-bold text-gray-900">Total</p>
          <p className="text-sm font-bold text-gray-900">${totalPriceNum.toFixed(2)}</p>
        </div>
        <button
          className="text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-sm mt-3 block w-full text-left line-clamp-1"
          aria-label="Apply coupon or promotion code"
        >
          Use coupon or code
        </button>
        <p className="text-[10px] text-gray-500 mt-2">USD rates.</p>
      </div>
    </div>
  );
};

export default RoomDetailsCard;