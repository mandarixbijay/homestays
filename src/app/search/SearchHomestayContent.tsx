// src/app/search/SearchHomestayContent.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import FilterCard from "@/components/search-homestays/filters";
import SignInCard from "@/components/homestay/components/sign-in-card";
import DestinationCards from "@/components/search-homestays/destination-cards";
import { DateGuestLocationPicker } from "@/components/homestay/components/details/date-guest-location-picker";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomestayContext } from "@/context/HomestayContext";
import { Hero3Card } from "@/types/homestay";

interface Room {
  adults: number;
  children: number;
}

interface FilterState {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  cities: string[];
  amenities: string[];
  vipOnly: boolean;
  availableRoomsMin: number;
}

interface SearchHomestayContentProps {
  initialHomestays: Hero3Card[];
  error: string | null;
  searchLocation: string;
  searchCheckIn: string;
  searchCheckOut: string;
  searchGuests: string;
  searchRooms: string;
}

export function SearchHomestayContent({
  initialHomestays,
  error,
  searchLocation,
  searchCheckIn,
  searchCheckOut,
  searchGuests,
  searchRooms,
}: SearchHomestayContentProps) {
  const { setHomestays } = useHomestayContext();
  const [homestays, setLocalHomestays] = useState<Hero3Card[]>(initialHomestays);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(error);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 50000,
    minRating: 0,
    cities: [],
    amenities: [],
    vipOnly: false,
    availableRoomsMin: 0,
  });
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse query parameters for DateGuestLocationPicker
  const initialDate: DateRange | undefined = searchCheckIn
    ? {
        from: new Date(searchCheckIn),
        to: searchCheckOut ? new Date(searchCheckOut) : undefined,
      }
    : undefined;

  const initialRooms: Room[] = searchGuests
    ? searchGuests.split(",").map((guest) => {
        const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
        return { adults, children };
      })
    : [{ adults: 2, children: 0 }];

  // Extract available data from homestays for filters
  const availableData = useMemo(() => {
    if (homestays.length === 0) return null;

    // Extract unique cities
    const cities = [...new Set(homestays.map(h => h.city))].filter(Boolean).sort();

    // Extract unique amenities from features and room facilities
    const allAmenities = new Set<string>();
    homestays.forEach(homestay => {
      (homestay.features || []).forEach(feature => allAmenities.add(feature));
      homestay.rooms.forEach(room => {
        (room.facilities || []).forEach(facility => allAmenities.add(facility));
      });
    });
    const amenities = Array.from(allAmenities).filter(Boolean).sort();

    // Calculate price range
    const prices = homestays.map(h => parseFloat(h.price.replace("NPR ", "")));
    const priceRange = {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };

    // Calculate rating range
    const ratings = homestays.map(h => h.rating).filter(r => r > 0);
    const ratingRange = {
      min: Math.min(...ratings),
      max: Math.max(...ratings)
    };

    return {
      cities,
      amenities,
      priceRange,
      ratingRange
    };
  }, [homestays]);

  // Update filters when available data changes
  useEffect(() => {
    if (availableData) {
      setFilters(prev => ({
        ...prev,
        minPrice: availableData.priceRange.min,
        maxPrice: availableData.priceRange.max,
      }));
    }
  }, [availableData]);

  // Filter homestays based on current filters
  const filteredHomestays = useMemo(() => {
    return homestays.filter(homestay => {
      // Price filter
      const price = parseFloat(homestay.price.replace("NPR ", ""));
      if (price < filters.minPrice || price > filters.maxPrice) {
        return false;
      }

      // Rating filter
      if (filters.minRating > 0 && homestay.rating < filters.minRating) {
        return false;
      }

      // City filter
      if (filters.cities.length > 0 && !filters.cities.includes(homestay.city)) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const homestayAmenities = [
          ...(homestay.features || []),
          ...homestay.rooms.flatMap(room => room.facilities || [])
        ];
        const hasAllAmenities = filters.amenities.every(amenity => 
          homestayAmenities.includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      // VIP filter
      if (filters.vipOnly && !homestay.vipAccess) {
        return false;
      }

      // Available rooms filter
      if (filters.availableRoomsMin > 0) {
        const totalAvailableRooms = homestay.rooms.reduce((sum, room) => sum + (room.roomsLeft || 0), 0);
        if (totalAvailableRooms < filters.availableRoomsMin) {
          return false;
        }
      }

      return true;
    });
  }, [homestays, filters]);

  // Update context with initial homestays
  useEffect(() => {
    if (initialHomestays.length > 0) {
      console.log("Storing homestays in context:", initialHomestays);
      setHomestays(initialHomestays);
      setLocalHomestays(initialHomestays);
      setFetchError(null);
    } else if (error) {
      setFetchError(error);
    }
  }, [initialHomestays, error, setHomestays]);

  // Handle search form submission
  const handleSearch = (searchData: {
    location: string | null;
    date: DateRange | undefined;
    rooms: Room[];
  }) => {
    const queryParams = new URLSearchParams();
    if (searchData.location) {
      queryParams.append("location", searchData.location);
    }
    if (searchData.date?.from) {
      queryParams.append("checkIn", format(searchData.date.from, "yyyy-MM-dd"));
    }
    if (searchData.date?.to) {
      queryParams.append("checkOut", format(searchData.date.to, "yyyy-MM-dd"));
    }
    queryParams.append(
      "guests",
      searchData.rooms
        .map((room) => `${room.adults}A${room.children}C`)
        .join(",")
    );
    queryParams.append("rooms", searchData.rooms.length.toString());

    router.push(`/search?${queryParams.toString()}`);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col min-h-screen p-2 sm:p-4 lg:p-6 gap-4 sm:gap-6">
      <Navbar />
      <div className="w-full mt-16 lg:mt-20 flex justify-center px-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full max-w-3xl">
          <DateGuestLocationPicker
            className="w-full sm:w-auto flex-1"
            onSearch={handleSearch}
            initialLocation={searchLocation || undefined}
            initialDate={initialDate}
            initialRooms={initialRooms}
          />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row justify-center gap-4 sm:gap-6 w-full max-w-7xl mx-auto">
        <div className="order-2 lg:order-1 w-full lg:w-1/4 mt-4 lg:mt-8 space-y-4 sm:space-y-6 lg:ml-0">
          <FilterCard 
            onFilterChange={handleFilterChange}
            availableData={availableData ?? undefined}
          />
        </div>
        <div className="order-1 lg:order-2 flex-grow lg:w-3/4 mt-4 lg:mt-8 space-y-4 sm:space-y-6">
          <SignInCard />
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : fetchError ? (
            <div className="text-red-500 text-center">{fetchError}</div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    {filteredHomestays.length} of {homestays.length} homestays
                  </span>
                  {filteredHomestays.length !== homestays.length && (
                    <span className="text-sm text-gray-600 ml-2">
                      (filtered)
                    </span>
                  )}
                </div>
                {Object.values(filters).some(value => 
                  Array.isArray(value) ? value.length > 0 : 
                  typeof value === 'boolean' ? value : 
                  value > (typeof value === 'number' ? (filters.minPrice === value ? availableData?.priceRange.min || 0 : filters.maxPrice === value ? availableData?.priceRange.max || 50000 : 0) : 0)
                ) && (
                  <button
                    onClick={() => setFilters({
                      minPrice: availableData?.priceRange.min || 0,
                      maxPrice: availableData?.priceRange.max || 50000,
                      minRating: 0,
                      cities: [],
                      amenities: [],
                      vipOnly: false,
                      availableRoomsMin: 0,
                    })}
                    className="text-sm text-[#1A403D] hover:text-[#1A403D]/80 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              
              <DestinationCards
                homestays={filteredHomestays}
                searchLocation={searchLocation}
                searchCheckIn={searchCheckIn}
                searchCheckOut={searchCheckOut}
                searchGuests={searchGuests}
                searchRooms={searchRooms}
              />
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}