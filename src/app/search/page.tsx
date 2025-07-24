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
  // Await searchParams
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

  // Validate check-in date (must be future date or today before 14:00)
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const isSameDay = checkInDate.toDateString() === now.toDateString();
  const currentHour = now.getHours();
  if (isSameDay && currentHour >= 14) {
    console.error("Server: Same-day check-in not allowed after 14:00 in /search");
    notFound();
  }

  const adaptApiHomestay = (apiHomestay: ApiHomestay): Hero3Card => ({
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
      extrasOptions: room.extrasOptions,
      roomsLeft: room.roomsLeft,
      sqFt: room.maxOccupancy * 100 || 0,
      sleeps: room.maxOccupancy || 1,
      cityView: (apiHomestay.features ?? []).includes("City View") || false,
      freeParking: (apiHomestay.features ?? []).includes("Free Parking") || false,
      freeWifi: (apiHomestay.features ?? []).includes("Free Wifi") || false,
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
      limit: 10,
      sort: "PRICE_ASC",
      ...(location && { location }),
    };

    console.log("Server: Fetching homestays with POST:", `/bookings/check-availability`, body);

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
    homestays = data.homestays.map(adaptApiHomestay);
    console.log("Server: Fetched homestays for search:", homestays);
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