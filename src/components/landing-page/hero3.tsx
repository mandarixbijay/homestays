"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";

interface TopHomestay {
  id: number;
  name: string;
  address: string;
  rating: number | null;
  reviews: number;
  category: string;
  strategy: string;
  imageSrc: string;
  facilities: string[];
  nightlyPrice: number;
  originalPrice: number | null;
  maxOccupancy: number;
}

export default function Hero3() {
  const router = useRouter();
  const [homestays, setHomestays] = useState<TopHomestay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopHomestays = async () => {
      try {
        const response = await fetch('/api/homestays/top-homestays?limit=10');
        if (response.ok) {
          const data = await response.json();
          setHomestays(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching top homestays:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopHomestays();
  }, []);

  // Generate profile slug
  const generateProfileSlug = (name: string, address: string, id: number) => {
    const combined = `${name}-${address}`;
    const slugified = combined
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `${slugified}-id-${id}`;
  };

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-gray-50/50 to-background overflow-x-hidden">
      <div className="container mx-auto max-w-7xl">
        <Card
          className="rounded-xl bg-cover bg-center flex flex-col justify-end min-h-[600px] sm:min-h-[640px] md:min-h-[680px]"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgba(8, 65, 45, 0.66), transparent), url(/images/tophomestay.avif)",
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
                  onClick={() => router.push("/homestays")}
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
            {loading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="snap-start w-[200px] sm:w-[240px] md:w-[280px] flex-shrink-0"
                >
                  <Card className="bg-transparent rounded-xl border-none h-[320px] sm:h-[340px] md:h-[360px]">
                    <Skeleton className="w-full h-44 rounded-2xl" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-full mt-2" />
                    </div>
                  </Card>
                </div>
              ))
            ) : homestays.length > 0 ? (
              homestays.map((homestay) => {
                const slug = generateProfileSlug(homestay.name, homestay.address, homestay.id);
                const displayRating = homestay.rating || 4.5; // Default to 4.5 if no rating

                return (
                  <div
                    key={homestay.id}
                    className="snap-start w-[200px] sm:w-[240px] md:w-[280px] flex-shrink-0 cursor-pointer"
                    onClick={() => router.push(`/homestays/profile/${slug}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        router.push(`/homestays/profile/${slug}`);
                      }
                    }}
                    aria-label={`View ${homestay.name}`}
                  >
                    <Card className="bg-transparent rounded-xl border-none h-[320px] sm:h-[340px] md:h-[360px]">
                      <div className="relative w-full h-44">
                        <Image
                          src={homestay.imageSrc}
                          alt={homestay.name}
                          className="object-cover rounded-2xl"
                          fill
                          sizes="(max-width: 640px) 100vw, 240px"
                          quality={80}
                          onError={(e) => (e.currentTarget.src = "/images/fallback-image.png")}
                        />
                        {homestay.originalPrice && homestay.originalPrice > homestay.nightlyPrice && (
                          <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs bg-red-600 text-white font-semibold">
                            {Math.round(((homestay.originalPrice - homestay.nightlyPrice) / homestay.originalPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-grow rounded-b-xl">
                        <h3 className="text-base font-bold text-white truncate" title={homestay.name}>
                          {homestay.name}
                        </h3>
                        <p className="text-xs text-white truncate" title={homestay.address}>
                          {homestay.address}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div>
                            {homestay.originalPrice && homestay.originalPrice > homestay.nightlyPrice && (
                              <p className="text-xs text-white/70 line-through">
                                NPR {homestay.originalPrice.toLocaleString()}
                              </p>
                            )}
                            <p className="text-base font-bold text-white">
                              NPR {homestay.nightlyPrice.toLocaleString()}
                              <span className="text-xs text-white">/night</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-green-500 rounded-full px-2 py-1">
                            <Star className="h-3 w-3 text-white fill-white" />
                            <span className="text-xs text-white">{displayRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })
            ) : (
              <div className="w-full flex items-center justify-center text-white">
                <p>No homestays available at the moment</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}