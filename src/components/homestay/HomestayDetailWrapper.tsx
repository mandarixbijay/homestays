// src/components/homestay/HomestayDetailWrapper.tsx
"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import HomestayDetailClient from "@/components/homestay/page";
import { Hero3Card, ApiHomestay } from "@/types/homestay";
import { useSearchParams } from "next/navigation";
import { useHomestayContext } from "@/context/HomestayContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface HomestayDetailWrapperProps {
  homestay: Hero3Card | null;
  slug: string;
}

export default function HomestayDetailWrapper({ homestay, slug }: HomestayDetailWrapperProps) {
  const searchParams = useSearchParams();
  const { homestays, setHomestays } = useHomestayContext();
  const [localHomestay, setLocalHomestay] = useState<Hero3Card | null>(homestay);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!homestay);

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");
  const rooms = searchParams.get("rooms");

  const adaptApiHomestay = useMemo(
    () =>
      (data: ApiHomestay): Hero3Card => {
        // Validate rooms for pricing data
        const rooms = data.rooms.map((room) => {
          if (!room.id) {
            throw new Error(`Room ID missing for room: ${room.name}`);
          }
          const nightlyPrice = room.nightlyPrice && room.nightlyPrice > 0 ? room.nightlyPrice : 1000; // Fallback to NPR 1000
          const totalPrice = room.totalPrice && room.totalPrice > 0 ? room.totalPrice : nightlyPrice; // Fallback to nightlyPrice
          return {
            imageUrls: room.imageUrls || ["/images/fallback-room.png"],
            roomTitle: room.name || "Standard Room",
            rating: room.rating || 0,
            reviews: room.reviews || 0,
            facilities: room.facilities || [],
            bedType: room.bedType || "Unknown",
            refundable: room.refundable || false,
            nightlyPrice,
            totalPrice,
            originalPrice: room.originalPrice || nightlyPrice * 1.2,
            extrasOptions: room.extrasOptions || [],
            roomsLeft: room.roomsLeft || 10, // Default to 10 if undefined
            sqFt: room.maxOccupancy ? room.maxOccupancy * 100 : 100,
            sleeps: room.maxOccupancy || 1,
            cityView: room.facilities?.includes("City View") || false,
            freeParking: room.facilities?.includes("Free Parking") || false,
            freeWifi: room.facilities?.includes("Free Wifi") || false,
            roomId: room.id,
          };
        });

        // Log mapped rooms for debugging
        console.log("Adapted Rooms:", rooms);

        return {
          id: data.id,
          image: data.imageSrc || "/images/fallback-image.png",
          images: data.rooms.flatMap((room) => room.imageUrls) || [data.imageSrc || "/images/fallback-image.png"],
          name: data.name || "Unknown Homestay",
          address: data.address || "Unknown Address",
          aboutDescription: data.aboutDescription || "No description available",
          city: data.address ? data.address.split(",")[1]?.trim() || "Unknown City" : "Unknown City",
          region: data.address ? data.address.split(",")[2]?.trim() || "Unknown Region" : "Unknown Region",
          price: `NPR ${data.totalPrice || 1000}`, // Fallback for homestay price
          rating: data.rating || 0,
          slug: data.slug,
          categoryColor: data.categoryColor || "bg-primary",
          features: data.features || [],
          vipAccess: data.vipAccess || false,
          rooms,
        };
      },
    []
  );

  useEffect(() => {
    const fetchHomestay = async () => {
      if (!checkIn || !checkOut || !guests || !rooms) {
        setError("Please provide check-in date, check-out date, guests, and rooms to view homestay details.");
        setLoading(false);
        return;
      }

      const now = new Date();
      const checkInDate = new Date(checkIn);
      const isSameDay = checkInDate.toDateString() === now.toDateString();
      const currentHour = now.getHours();
      if (isSameDay && currentHour >= 14) {
        setError("Same-day check-in is not available after 14:00. Please select a future check-in date.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const foundHomestay = homestays.find((h) => h.slug.toLowerCase() === slug.toLowerCase());
      if (foundHomestay) {
        // Validate rooms' pricing
        const hasValidPricing = foundHomestay.rooms.every(
          (room) => room.nightlyPrice > 0 && room.totalPrice > 0
        );
        if (!hasValidPricing) {
          setError("Invalid pricing data for some rooms. Please try again.");
          setLoading(false);
          return;
        }
        setLocalHomestay(foundHomestay);
        setLoading(false);
        return;
      }

      try {
        const body = {
          checkInDate: checkIn,
          checkOutDate: checkOut,
          rooms: guests
            .split(",")
            .map((guest) => {
              const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
              return { adults, children };
            }),
          page: 1,
          limit: 1000, // Fixed to use consistent high limit
          sort: "PRICE_ASC",
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/check-availability`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch homestay: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data); // Log API response for debugging
        
        const homestayData = data.homestays.find((h: ApiHomestay) => h.slug.toLowerCase() === slug.toLowerCase());
        if (!homestayData) {
          // Debug: Log available slugs to help troubleshoot
          const availableSlugs = data.homestays.map((h: ApiHomestay) => h.slug).slice(0, 10);
          console.error("Client: Homestay not found. Available slugs:", availableSlugs);
          throw new Error("Homestay not found in response");
        }

        const adaptedHomestay = adaptApiHomestay(homestayData);
        // Validate pricing data
        const hasValidPricing = adaptedHomestay.rooms.every(
          (room) => room.nightlyPrice > 0 && room.totalPrice > 0
        );
        if (!hasValidPricing) {
          throw new Error("Invalid pricing data for some rooms");
        }
        setLocalHomestay(adaptedHomestay);
        setHomestays([...homestays.filter((h) => h.slug !== slug), adaptedHomestay]);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load homestay details. Please try again or select a different date.");
        setLoading(false);
      }
    };

    if (!homestay && !localHomestay) {
      fetchHomestay();
    }
  }, [homestay, slug, checkIn, checkOut, guests, rooms, homestays, setHomestays, adaptApiHomestay]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="w-full h-64 rounded-lg mb-6 bg-card" />
        <Skeleton className="w-3/4 h-8 mb-3 bg-card" />
        <Skeleton className="w-1/2 h-4 mb-3 bg-card" />
        <Skeleton className="w-full h-96 rounded-lg bg-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-lg text-warning font-manrope mb-4">{error}</p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-2 rounded-lg font-manrope"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="px-6 py-2 rounded-lg font-manrope"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!localHomestay) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-lg text-text-secondary font-manrope mb-4">Homestay not found</p>
        <Button
          onClick={() => window.location.href = "/"}
          className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-2 rounded-lg font-manrope"
        >
          Back to Search
        </Button>
      </div>
    );
  }

  return (
    <Suspense fallback={<Skeleton className="w-full h-96 rounded-lg bg-card" />}>
      <HomestayDetailClient homestay={localHomestay} slug={slug} />
    </Suspense>
  );
}