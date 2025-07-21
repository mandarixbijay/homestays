"use client";

import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { hero3Data } from "@/data/homestays";

export default function Hero3() {
  const router = useRouter();

  return (
    <section className="w-full px-4 sm:px-6 bg-white mt-8 sm:mt-12 md:mt-16 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl">
        <Card
          className="rounded-xl bg-cover bg-center flex flex-col justify-end min-h-[600px] sm:min-h-[640px] md:min-h-[680px]"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(8, 65, 45, 0.66), transparent), url(/images/hero/bg_yellow.avif)",
          }}
        >
          <div className="px-4 py-6 rounded-t-xl pr-10 pl-10">
            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Top Homestays
                </h2>
                <p className="mt-2 text-sm sm:text-base text-white font-medium">
                  Find your perfect stay
                </p>
              </div>
              <div>
                <Button
                  variant="default"
                  className="bg-white text-black px-8 py-3 rounded-lg hover:bg-white"
                  onClick={() => router.push("/search")}
                  aria-label="View all homestays"
                >
                  View All Homestays
                </Button>
              </div>
            </div>
          </div>

          <div
            className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory min-h-[320px] sm:min-h-[340px] md:min-h-[360px] touch-pan-x px-10 sm:px-10 mx-10"
            role="region"
            aria-label="Top homestays carousel"
          >
            {hero3Data.map((item, idx) => (
              <div
                key={item.slug}
                className="snap-start w-[200px] sm:w-[240px] md:w-[280px] flex-shrink-0 cursor-pointer"
                onClick={() =>
                  router.push(`/homestays/${item.slug}?imageUrl=${encodeURIComponent(item.image)}`)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    router.push(`/homestays/${item.slug}?imageUrl=${encodeURIComponent(item.image)}`);
                  }
                }}
                aria-label={`View ${item.city} homestay`}
              >
                <Card className="bg-transparent rounded-xl border-none h-[320px] sm:h-[340px] md:h-[360px]">
                  <div className="relative w-full h-44">
                    <Image
                      src={item.image}
                      alt={`${item.city} homestay`}
                      className="object-cover rounded-2xl"
                      fill
                      sizes="(max-width: 640px) 100vw, 240px"
                      quality={80}
                      onError={(e) => (e.currentTarget.src = "/images/placeholder-homestay.jpg")}
                    />
                    {item.breakfast && (
                      <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs bg-yellow-600 text-white">
                        {item.breakfast}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow rounded-b-xl">
                    <h3 className="text-base font-bold text-white">{item.city}</h3>
                    <p className="text-xs text-white">{item.region}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-base font-bold text-white">
                        {item.price}
                        <span className="text-x text-white">/night</span>
                      </p>
                      <div className="flex items-center gap-1 bg-green-500 rounded-full px-2 py-1">
                        <Star className="h-3 w-3 text-white fill-white" />
                        <span className="text-xs text-white">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}