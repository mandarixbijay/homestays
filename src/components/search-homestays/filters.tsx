// src/components/search-homestays/filters.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Waves,
  BusFront,
  Wifi,
  Fan,
  WashingMachine,
  Dumbbell,
  Bath,
  Flower,
  Soup,
  Coffee,
  Utensils,
  Flag,
  Bone,
  Trees,
  BatteryCharging,
  Baby,
  Dices,
  RollerCoaster,
  ParkingCircle,
} from "lucide-react";

const popularFilterOptions = [
  { key: "view", label: "City View" },
  { key: "busstation", label: "Bus Station" },
  { key: "airportShuttle", label: "Airport shuttle included" },
  { key: "breakfastIncluded", label: "Breakfast included" },
  { key: "homestay", label: "Homestay" },
];

const amenityOptions = [
  { key: "wifiIncluded", label: "Wifi Included", icon: Wifi },
  { key: "airConditioned", label: "Air conditioned", icon: Fan },
  { key: "kitchen", label: "Kitchen", icon: Soup },
  { key: "petFriendly", label: "Pet friendly", icon: Bone },
  { key: "outdoorSpace", label: "Outdoor space", icon: Trees },
  { key: "parking", label: "Parking", icon: ParkingCircle },
  // Add more as needed, but limited to match dealCardsData features
];

interface FilterCardProps {
  onFilterChange?: (filters: {
    popularFilters: Record<string, boolean>;
    minPrice: number;
    maxPrice: number;
    amenities: Record<string, boolean>;
  }) => void;
}

const FilterCard = ({ onFilterChange }: FilterCardProps) => {
  const [popularFilters, setPopularFilters] = useState(
    popularFilterOptions.reduce((acc, option) => ({ ...acc, [option.key]: false }), {})
  );
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [amenities, setAmenities] = useState(
    amenityOptions.reduce((acc, option) => ({ ...acc, [option.key]: false }), {})
  );

  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialMinPriceOnDragStart, setInitialMinPriceOnDragStart] = useState(0);
  const [initialMaxPriceOnDragStart, setInitialMaxPriceOnDragStart] = useState(0);

  useEffect(() => {
    onFilterChange?.({ popularFilters, minPrice, maxPrice, amenities });
  }, [popularFilters, minPrice, maxPrice, amenities, onFilterChange]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent, handleType: "min" | "max") => {
      if (!sliderTrackRef.current) return;
      event.preventDefault();
      setIsDragging(handleType);
      setInitialMouseX(event.clientX);
      setInitialMinPriceOnDragStart(minPrice);
      setInitialMaxPriceOnDragStart(maxPrice);
    },
    [minPrice, maxPrice]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !sliderTrackRef.current) return;
      const trackRect = sliderTrackRef.current.getBoundingClientRect();
      const trackWidth = trackRect.width;
      const deltaX = event.clientX - initialMouseX;
      const priceChangePerPixel = 1000 / trackWidth;

      if (isDragging === "min") {
        let newMinPrice = initialMinPriceOnDragStart + deltaX * priceChangePerPixel;
        newMinPrice = Math.max(0, Math.min(newMinPrice, maxPrice));
        setMinPrice(Math.round(newMinPrice));
      } else if (isDragging === "max") {
        let newMaxPrice = initialMaxPriceOnDragStart + deltaX * priceChangePerPixel;
        newMaxPrice = Math.min(1000, Math.max(newMaxPrice, minPrice));
        setMaxPrice(Math.round(newMaxPrice));
      }
    },
    [isDragging, initialMouseX, initialMinPriceOnDragStart, initialMaxPriceOnDragStart, minPrice, maxPrice]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handlePopularFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPopularFilters({
      ...popularFilters,
      [event.target.name]: event.target.checked,
    });
  };

  const handleAmenityChange = (amenityName: string) => {
    setAmenities({
      ...amenities,
      [amenityName]: !amenities[amenityName as keyof typeof amenities],
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-sm">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Filter by</h2>

      {/* Popular Filters Section */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-gray-800 mb-4">Popular filters</h3>
        <div className="space-y-3">
          {popularFilterOptions.map((option) => (
            <div key={option.key} className="flex items-center">
              <input
                type="checkbox"
                id={option.key}
                name={option.key}
                checked={popularFilters[option.key as keyof typeof popularFilters]}
                onChange={handlePopularFilterChange}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <label
                htmlFor={option.key}
                className="ml-3 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Total Price Section */}
      <div className="mb-8">
        <h3 className="text-base font-medium text-gray-800 mb-4">Total price</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Min"
            />
          </div>
          <span className="text-gray-500">–</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              value={maxPrice === 1000 ? "1,000+" : maxPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "1,000+") {
                  setMaxPrice(1000);
                } else if (!isNaN(Number(value))) {
                  setMaxPrice(Math.min(1000, Math.max(Number(value), minPrice)));
                }
              }}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Max"
            />
          </div>
        </div>
        <div ref={sliderTrackRef} className="relative h-1.5 bg-gray-200 rounded-full">
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{
              left: `${(minPrice / 1000) * 100}%`,
              width: `${((maxPrice - minPrice) / 1000) * 100}%`,
            }}
          />
          <div
            className="absolute w-4 h-4 bg-primary rounded-full -mt-1.5 -ml-2 border border-white cursor-pointer"
            style={{ left: `${(minPrice / 1000) * 100}%` }}
            onMouseDown={(e) => handleMouseDown(e, "min")}
          />
          <div
            className="absolute w-4 h-4 bg-primary rounded-full -mt-1.5 -ml-2 border border-white cursor-pointer"
            style={{ left: `${(maxPrice / 1000) * 100}%` }}
            onMouseDown={(e) => handleMouseDown(e, "max")}
          />
        </div>
      </div>

      {/* Amenities Section */}
      <div>
        <h3 className="text-base font-medium text-gray-800 mb-4">Amenities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {amenityOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handleAmenityChange(option.key)}
              className={`flex flex-col items-center justify-center p-3 border rounded-md text-sm transition-colors h-24 ${
                amenities[option.key as keyof typeof amenities]
                  ? "bg-primary/10 border-primary text-primary font-medium"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-primary/5 hover:border-gray-300"
              }`}
            >
              <option.icon size={24} className="mb-2 text-current" />
              <span className="text-sm text-center">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterCard;