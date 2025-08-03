// src/app/homestays/[slug]/page.tsx
import HomestayDetailWrapper from "@/components/homestay/HomestayDetailWrapper";
import { Hero3Card, ApiHomestay } from "@/types/homestay";
import { notFound } from "next/navigation";

export default async function HomestayDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const queryParams = await searchParams;
  const checkInDate = queryParams.checkIn as string | undefined;
  const checkOutDate = queryParams.checkOut as string | undefined;
  const guests = queryParams.guests as string | undefined;
  const rooms = queryParams.rooms as string | undefined;

  if (!checkInDate || !checkOutDate || !guests || !rooms) {
    console.error("Server: Missing or invalid query parameters:", { checkInDate, checkOutDate, guests, rooms });
    notFound();
  }

  // REMOVED: Same-day check-in validation - now allows same-day access at any time
  // const now = new Date();
  // const checkIn = new Date(checkInDate);
  // const isSameDay = checkIn.toDateString() === now.toDateString();
  // const currentHour = now.getHours();
  // if (isSameDay && currentHour >= 14) {
  //   console.error("Server: Same-day check-in not allowed after 14:00");
  //   notFound();
  // }

  let homestay: Hero3Card | null = null;

  try {
    const body = {
      checkInDate,
      checkOutDate,
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

    // Enhanced logging to show same-day detail page access
    const now = new Date();
    const checkIn = new Date(checkInDate);
    const isSameDay = checkIn.toDateString() === now.toDateString();
    
    console.log("Server: Fetching homestay with POST:", `/bookings/check-availability`, {
      ...body,
      isSameDay: isSameDay ? "YES - Same day detail page access allowed" : "NO"
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
      console.error("Server: POST /bookings/check-availability failed:", response.status, errorText);
      throw new Error(`Failed to fetch homestay: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    console.log(`Server: API returned ${data.homestays?.length || 0} homestays, looking for slug: ${slug}${isSameDay ? " (SAME-DAY ACCESS)" : ""}`);
    
    const homestayData = data.homestays.find((h: ApiHomestay) => h.slug.toLowerCase() === slug.toLowerCase());
    if (!homestayData) {
      // Debug: Log available slugs to help troubleshoot
      const availableSlugs = data.homestays.map((h: ApiHomestay) => h.slug).slice(0, 10);
      console.error("Server: Homestay not found. Available slugs:", availableSlugs);
      throw new Error("Homestay not found");
    }
    homestay = adaptApiHomestay(homestayData);

    console.log(`Server: Successfully fetched homestay: ${homestay.name}${isSameDay ? " (SAME-DAY)" : ""}`);
  } catch (error) {
    console.error("Server: Error fetching homestay:", error);
    notFound();
  }

  return <HomestayDetailWrapper homestay={homestay} slug={slug} />;
}

function adaptApiHomestay(data: ApiHomestay): Hero3Card {
  return {
    id: data.id,
    image: data.imageSrc || "/images/fallback-image.png",
    images: data.rooms.flatMap((room) => room.imageUrls) || [data.imageSrc || "/images/fallback-image.png"],
    name: data.name || "Unknown Homestay",
    address: data.address || "Unknown Address",
    aboutDescription: data.aboutDescription || "No description available",
    city: data.address?.split(",")[1]?.trim() || "Unknown City",
    region: data.address ? data.address.split(",")[2]?.trim() : "Unknown Region",
    price: `NPR ${data.totalPrice}`,
    rating: data.rating,
    slug: data.slug,
    categoryColor: data.categoryColor || "bg-blue-500",
    features: data.features || [],
    vipAccess: data.vipAccess || false,
    rooms: data.rooms.map((room) => {
      if (!room.id) {
        throw new Error(`Room ID missing for room: ${room.name}`);
      }
      return {
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
        cityView: room.facilities?.includes("City View") || false,
        freeParking: room.facilities?.includes("Free Parking") || false,
        freeWifi: room.facilities?.includes("Free Wifi") || false,
        roomId: room.id,
      };
    }),
  };
}