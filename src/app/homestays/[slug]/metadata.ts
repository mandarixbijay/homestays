// src/app/homestays/[slug]/metadata.ts
import { Metadata } from "next";
import { ApiHomestay } from "@/types/homestay";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const { slug } = params;
  const checkInDate = searchParams.checkIn as string || "2025-07-23";
  const checkOutDate = searchParams.checkOut as string || "2025-07-25";
  const guests = searchParams.guests as string || "2A0C";

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

    // Use the same endpoint as your main components
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
      console.error("Metadata fetch failed:", response.status, await response.text());
      return {
        title: "Homestay Not Found | Nepal Homestays",
        description: "The requested homestay could not be found.",
        metadataBase: new URL("https://nepalhomestays.com"),
      };
    }

    const data = await response.json();
    const homestay = data.homestays.find((h: ApiHomestay) => h.slug.toLowerCase() === slug.toLowerCase());
    
    if (!homestay) {
      return {
        title: "Homestay Not Found | Nepal Homestays",
        description: "The requested homestay could not be found.",
        metadataBase: new URL("https://nepalhomestays.com"),
      };
    }

    const city = homestay.address ? homestay.address.split(",")[1]?.trim() || "Unknown City" : "Unknown City";
    const region = homestay.address ? homestay.address.split(",")[2]?.trim() || "Unknown Region" : "Unknown Region";

    return {
      title: `${homestay.name} | Nepal Homestays`,
      description: `Book your stay at ${homestay.name} in ${city}, ${region}. ${homestay.aboutDescription !== "No description available" ? homestay.aboutDescription : ""}`,
      keywords: `${homestay.name}, ${city}, ${region}, homestay, Nepal, travel, ${(homestay.features ?? []).join(", ")}`,
      metadataBase: new URL("https://nepalhomestays.com"),
      openGraph: {
        title: `${homestay.name}`,
        description: `Book your stay at ${homestay.name} in ${city}, ${region}.`,
        images: [{ url: homestay.imageSrc || "/images/fallback-image.png", width: 1200, height: 630, alt: `${homestay.name}` }],
        url: `https://nepalhomestays.com/homestays/${homestay.slug}`,
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Homestay Not Found | Nepal Homestays",
      description: "The requested homestay could not be found.",
      metadataBase: new URL("https://nepalhomestays.com"),
    };
  }
}

export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/check-availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        checkInDate: "2025-07-23",
        checkOutDate: "2025-07-25",
        rooms: [{ adults: 2, children: 0 }],
        page: 1,
        limit: 1000, // Fixed to use consistent high limit
        sort: "PRICE_ASC",
      }),
    });

    if (!response.ok) {
      console.error("Failed to fetch homestays for static params:", response.status, await response.text());
      return [];
    }

    const data = await response.json();
    return data.homestays.map((homestay: ApiHomestay) => ({
      slug: homestay.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}