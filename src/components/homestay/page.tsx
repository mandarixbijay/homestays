// src/components/homestay/page.tsx
"use client";

import React from "react";
import HomestayImageGallery from "@/components/homestay/components/details/image-gallery";
import DetailNav from "@/components/navbar/detail-page-navbar/page";
import RoomsView from "@/components/homestay/components/details/room-details/rooms-view";
import Policies from "@/components/homestay/components/details/policies";
import AboutProperty from "@/components/homestay/components/details/about-property";
import OverviewSection from "@/components/homestay/components/details/overview-section";
import SignInCard from "@/components/homestay/components/sign-in-card";
import { motion } from "framer-motion";
import Navbar from "../navbar/navbar";
import Footer from "../footer/footer";

export interface IndividualHomestay {
  homestay: {
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
  };
  imageUrl?: string;
  slug: string;
}

export default function HomestayDetailClient({
  homestay,
  imageUrl,
  slug,
}: IndividualHomestay) {
  const images = homestay.images.length > 0 ? homestay.images : imageUrl ? [imageUrl] : [];
  const totalPhotos = images.length;

  return (
    <>
      <section className="w-full min-h-screen flex flex-col items-center py-16 px-4 bg-gray-50 pt-24">
        <Navbar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-6xl relative mt-24 px-4"
        >
          <HomestayImageGallery
            images={images}
            totalPhotos={totalPhotos}
            slug={slug}
          />

          <SignInCard />

          <div className="sticky top-16 bg-gray-50 z-30 py-4 border-b border-gray-200 mt-8 px-4 md:px-0">
            <DetailNav />
          </div>

          <div id="overview" className="pt-10 pb-20">
            <OverviewSection homestay={homestay} slug={slug} />
          </div>

          <div id="about" className="pt-10 pb-20">
            <AboutProperty />
          </div>

          <div id="rooms" className="pt-5 pb-20">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
              Available Rooms
            </h2>
            <RoomsView rooms={homestay.rooms} />
          </div>

          <SignInCard />

          <div id="policies" className="pt-10 pb-20">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
              Policies
            </h2>
            <Policies />
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}