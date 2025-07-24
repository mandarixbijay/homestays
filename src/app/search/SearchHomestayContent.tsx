// src/app/search/SearchHomestayContent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import FilterCard from "@/components/search-homestays/filters";
import SignInCard from "@/components/homestay/components/sign-in-card";
import MapInterface from "@/components/search-homestays/map-interface";
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
          <MapInterface />
          <FilterCard />
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
            <DestinationCards
              homestays={homestays}
              searchLocation={searchLocation}
              searchCheckIn={searchCheckIn}
              searchCheckOut={searchCheckOut}
              searchGuests={searchGuests}
              searchRooms={searchRooms}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}