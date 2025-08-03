// src/app/search/page.tsx
import { Metadata } from "next";
import { SearchHomestayContent } from "./SearchHomestayContent";
import { Hero3Card, ApiHomestay } from "@/types/homestay";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Search Homestays | Nepal Homestays",
  description: "Find and book the best homestays in Nepal with Nepal Homestays.",
  keywords: "Nepal, homestays, travel, accommodation, Kathmandu",
  metadataBase: new URL("https://nepalhomestays.com"),
  openGraph: {
    title: "Search Homestays | Nepal Homestays",
    description: "Find and book the best homestays in Nepal.",
    images: [{ url: "/images/fallback-image.png", width: 1200, height: 630, alt: "Nepal Homestays" }],
    url: "https://nepalhomestays.com/search",
    type: "website",
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const checkIn = params.checkIn as string | undefined;
  const checkOut = params.checkOut as string | undefined;
  const guests = params.guests as string | undefined;
  const rooms = params.rooms as string | undefined;
  const location = params.location as string | undefined;

  // Validate required parameters
  if (!checkIn || !checkOut || !guests || !rooms) {
    console.error("Server: Missing query parameters in /search:", { checkIn, checkOut, guests, rooms, location });
    notFound();
  }

  // REMOVED: Same-day check-in validation - now allows same-day searches at any time
  // const now = new Date();
  // const checkInDate = new Date(checkIn);
  // const isSameDay = checkInDate.toDateString() === now.toDateString();
  // const currentHour = now.getHours();
  // if (isSameDay && currentHour >= 14) {
  //   console.error("Server: Same-day check-in not allowed after 14:00 in /search");
  //   notFound();
  // }

  const adaptApiHomestay = (apiHomestay: ApiHomestay): Hero3Card => ({
    id: apiHomestay.id,
    image: apiHomestay.imageSrc || "/images/fallback-image.png",
    images: apiHomestay.rooms.flatMap((room) => room.imageUrls) || [apiHomestay.imageSrc || "/images/fallback-image.png"],
    name: apiHomestay.name || "Unknown Homestay",
    address: apiHomestay.address || "Unknown Address",
    aboutDescription: apiHomestay.aboutDescription || "No description available",
    city: apiHomestay.address ? apiHomestay.address.split(",")[1]?.trim() || "Unknown City" : "Unknown City",
    region: apiHomestay.address ? apiHomestay.address.split(",")[2]?.trim() || "Unknown Region" : "Unknown Region",
    price: `NPR ${apiHomestay.totalPrice}`,
    rating: apiHomestay.rating,
    slug: apiHomestay.slug,
    categoryColor: apiHomestay.categoryColor || "bg-blue-500",
    features: apiHomestay.features || [],
    vipAccess: apiHomestay.vipAccess || false,
    rooms: apiHomestay.rooms.map((room) => ({
      imageUrls: room.imageUrls,
      roomTitle: room.name,
      rating: room.rating,
      reviews: room.reviews,
      facilities: room.facilities || [],
      bedType: room.bedType,
      refundable: room.refundable,
      nightlyPrice: room.nightlyPrice,
      totalPrice: room.totalPrice,
      originalPrice: room.originalPrice,
      extrasOptions: room.extrasOptions,
      roomsLeft: room.roomsLeft,
      sqFt: room.maxOccupancy * 100 || 0,
      sleeps: room.maxOccupancy || 1,
      cityView: (apiHomestay.features ?? []).includes("City View") || false,
      freeParking: (apiHomestay.features ?? []).includes("Free Parking") || false,
      freeWifi: (apiHomestay.features ?? []).includes("Free Wifi") || false,
      roomId: room.id,
    })),
  });

  let homestays: Hero3Card[] = [];
  let error: string | null = null;

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
      limit: 1000, // High limit to ensure we get ALL results regardless of total count
      sort: "PRICE_ASC",
      ...(location && { location }),
    };

    // Enhanced logging to show same-day searches
    const now = new Date();
    const checkInDate = new Date(checkIn);
    const isSameDay = checkInDate.toDateString() === now.toDateString();
    
    console.log("Server: Fetching homestays...", { 
      checkIn, 
      checkOut, 
      guestCount: body.rooms.length, 
      location: location || "All locations",
      isSameDay: isSameDay ? "YES - Same day search allowed" : "NO"
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/check-availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server: Search fetch failed:", response.status, errorText);
      throw new Error(`Failed to fetch homestays: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.homestays || !Array.isArray(data.homestays)) {
      throw new Error("Invalid response format from API");
    }

    homestays = data.homestays.map(adaptApiHomestay);
    console.log(`Server: Successfully loaded ${homestays.length} of ${data.totalCount || homestays.length} homestays${isSameDay ? " (SAME-DAY SEARCH)" : ""}`);
    
  } catch (err) {
    error = "Failed to load homestays. Please try again or select a different date.";
    console.error("Server: Error fetching homestays:", err);
  }

  return (
    <SearchHomestayContent
      initialHomestays={homestays}
      error={error}
      searchLocation={location ?? ""}
      searchCheckIn={checkIn}
      searchCheckOut={checkOut}
      searchGuests={guests}
      searchRooms={rooms}
    />
  );
}