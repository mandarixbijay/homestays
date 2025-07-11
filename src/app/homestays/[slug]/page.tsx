// src/app/homestays/[slug]/page.tsx
import React from "react";
import { hero3Data } from "@/data/homestays";
import { dealCardsData } from "@/data/deals";
import { hotels } from "@/data/hotels";
import HomestayDetailClient from "@/components/homestay/page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Homestay Details",
  description: "View details about this homestay",
};

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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
    rooms: item.rooms || [], // Include rooms
  }),
  hero: (item: any): Hero3Card => ({
    image: item.image || "/images/fallback-image.png",
    images: item.images || [item.image || "/images/fallback-image.png"],
    city: item.city,
    region: item.region,
    price: item.price,
    rating: item.rating,
    slug: item.slug,
    rooms: item.rooms || [], // Assume hero3Data includes rooms or provide default
  }),
  destination: (item: any): Hero3Card => ({
    image: item.images[0] || "/images/fallback-image.png",
    images: item.images || ["/images/fallback-image.png"],
    city: item.location,
    region: item.location,
    price: item.totalPrice,
    rating: parseFloat(item.rating),
    slug: item.name.toLowerCase().replace(/\s+/g, "-"),
    rooms: item.rooms || [], // Assume hotels includes rooms or provide default
  }),
};

const dataSources = [
  { data: dealCardsData, adapter: dataAdapters.deals },
  { data: hero3Data, adapter: dataAdapters.hero },
  { data: hotels, adapter: dataAdapters.destination },
];

export default async function HomestayDetail({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const imageUrl = resolvedSearchParams?.imageUrl as string | undefined;

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

  return (
    <HomestayDetailClient homestay={homestay} imageUrl={imageUrl} slug={slug} />
  );
}