// src/app/search/page.tsx
"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
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

interface Room {
  adults: number;
  children: number;
}

function SearchHomestayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse query parameters
  const location = searchParams.get("location");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");
  const rooms = searchParams.get("rooms");

  // Convert query parameters to initial state for DateGuestLocationPicker
  const initialDate: DateRange | undefined = checkIn
    ? {
        from: new Date(checkIn),
        to: checkOut ? new Date(checkOut) : undefined,
      }
    : undefined;

  const initialRooms: Room[] = guests
    ? guests.split(",").map((guest) => {
        const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
        return { adults, children };
      })
    : [{ adults: 2, children: 0 }];

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
            initialLocation={location || undefined}
            initialDate={initialDate}
            initialRooms={initialRooms}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row justify-center gap-4 sm:gap-6 w-full max-w-7xl mx-auto">
        <div className="order-2 lg:order-1 w-full lg:w-1/4 mt-4 lg:mt-8 space-y-4 sm:space-y-6 lg:ml-0">
          <MapInterface />
          <FilterCard />
        </div>

        <div className="order-1 lg:order-2 flex-grow lg:w-3/4 mt-4 lg:mt-8 space-y-4 sm:space-y-6">
          <SignInCard />
          <DestinationCards
            searchLocation={location}
            searchCheckIn={checkIn}
            searchCheckOut={checkOut}
            searchGuests={guests}
            searchRooms={rooms}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function SearchHomestay() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen p-2 sm:p-4 lg:p-6 gap-4 sm:gap-6 bg-gray-50">
          <Navbar />
          <div className="w-full mt-16 lg:mt-20 flex justify-center px-2">
            <Skeleton className="w-full max-w-3xl h-12" />
          </div>
          <div className="flex flex-col lg:flex-row justify-center gap-4 sm:gap-6 w-full max-w-7xl mx-auto">
            <div className="order-2 lg:order-1 w-full lg:w-1/4 mt-4 lg:mt-8 space-y-4 sm:space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="order-1 lg:order-2 flex-grow lg:w-3/4 mt-4 lg:mt-8 space-y-4 sm:space-y-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
          <Footer />
        </div>
      }
    >
      <SearchHomestayContent />
    </Suspense>
  );
}