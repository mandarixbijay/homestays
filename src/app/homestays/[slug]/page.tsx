// src/app/homestays/[slug]/page.tsx
import React from "react";
import { hero3Data } from "@/data/homestays";
import { dealCardsData } from "@/data/deals";
import { hotels } from "@/data/hotels";
import HomestayDetailClient from "@/components/homestay/page";
import { Metadata } from "next";

export interface Hero3Card {
  image: string;
  images: string[];
  city: string;
  region: string;
  price: string;
  rating: number;
  slug: string;
  rooms: {
    imageUrls: string[];
    roomTitle: string;
    rating: number;
    reviews: number;
    cityView?: boolean;
    freeParking?: boolean;
    freeWifi?: boolean;
    sqFt: number;
    sleeps: number;
    bedType: string;
    refundable: boolean;
    nightlyPrice: number;
    totalPrice: number;
    extrasOptions: { label: string; price: number }[];
    roomsLeft: number;
  }[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const dataAdapters = {
  deals: (item: any): Hero3Card => ({
    image: item.imageSrc || "/images/fallback-image.png",
    images: item.imageSrc ? [item.imageSrc] : ["/images/fallback-image.png"],
    city: item.location,
    region: item.location,
    price: item.totalPrice,
    rating: parseFloat(item.rating),
    slug: item.slug,
    rooms: item.rooms || [],
  }),
  hero: (item: any): Hero3Card => ({
    image: item.image || "/images/fallback-image.png",
    images: item.images || [item.image || "/images/fallback-image.png"],
    city: item.city,
    region: item.region,
    price: item.price,
    rating: item.rating,
    slug: item.slug,
    rooms: item.rooms || [],
  }),
  destination: (item: any): Hero3Card => ({
    image: item.images[0] || "/images/fallback-image.png",
    images: item.images || ["/images/fallback-image.png"],
    city: item.location,
    region: item.location,
    price: item.totalPrice,
    rating: parseFloat(item.rating),
    slug: item.name.toLowerCase().replace(/\s+/g, "-"),
    rooms: item.rooms || [],
  }),
};

const dataSources = [
  { data: dealCardsData, adapter: dataAdapters.deals },
  { data: hero3Data, adapter: dataAdapters.hero },
  { data: hotels, adapter: dataAdapters.destination },
];

// Generate static paths for all homestays
export async function generateStaticParams() {
  const slugs: { slug: string }[] = [];

  dataSources.forEach((source) => {
    source.data.forEach((item: any) => {
      const slug =
        source.adapter === dataAdapters.destination
          ? item.name.toLowerCase().replace(/\s+/g, "-")
          : item.slug;
      slugs.push({ slug });
    });
  });

  return slugs;
}

// Dynamic metadata for each homestay
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let homestay: Hero3Card | null = null;

  for (const source of dataSources) {
    const found = source.data.find((item: any) => {
      if (source.adapter === dataAdapters.destination) {
        return item.name.toLowerCase().replace(/\s+/g, "-") === slug;
      }
      return item.slug === slug;
    });
    if (found) {
      homestay = source.adapter(found);
      break;
    }
  }

  if (!homestay) {
    return {
      title: "Homestay Not Found | Nepal Homestays",
      description: "The requested homestay could not be found.",
    };
  }

  return {
    title: `${homestay.city} Homestay | Nepal Homestays`,
    description: `Book your stay in ${homestay.city}, ${homestay.region} with Nepal Homestays.`,
    keywords: `${homestay.city}, ${homestay.region}, homestay, Nepal, travel`,
    openGraph: {
      title: `${homestay.city} Homestay`,
      description: `Book your stay in ${homestay.city}, ${homestay.region}.`,
      images: [{ url: homestay.image, width: 1200, height: 630, alt: `${homestay.city} Homestay` }],
      url: `https://nepalhomestays.com/homestays/${homestay.slug}`,
      type: "website",
    },
  };
}

export default async function HomestayDetail({ params }: PageProps) {
  const { slug } = await params;
  let homestay: Hero3Card | null = null;

  for (const source of dataSources) {
    const found = source.data.find((item: any) => {
      if (source.adapter === dataAdapters.destination) {
        return item.name.toLowerCase().replace(/\s+/g, "-") === slug;
      }
      return item.slug === slug;
    });
    if (found) {
      homestay = source.adapter(found);
      break;
    }
  }

  if (!homestay) {
    return <div>Homestay not found</div>;
  }

  return <HomestayDetailClient homestay={homestay} imageUrl={undefined} slug={homestay.slug} />;
}