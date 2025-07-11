// src/components/landing-page/hero3.tsx
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { hero3Data } from "@/data/homestays";

export default function Hero3() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<boolean[]>(
    hero3Data.map(() => true)
  );

  const scrollLeft = () => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: -260, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: 260, behavior: "smooth" });
  };

  const handleImageLoad = (index: number) => {
    setImageLoadingStates((prev) => {
      const newStates = [...prev];
      newStates[index] = false;
      return newStates;
    });
  };

  return (
    <section className="w-full py-10 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Top Homestays
            </h2>
            <p className="text-sm text-gray-500">Find your perfect stay</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button
              variant="link"
              className="text-sm text-[#D4A017] hover:text-[#b38b12]"
              onClick={() => router.push("/search")}
            >
              View All Homestays
            </Button>
          </motion.div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            onClick={scrollLeft}
            className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 p-2 bg-white shadow-md hover:bg-[#D4A017]/10 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide snap-x snap-mandatory"
          >
            {hero3Data.map((item, idx) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="snap-start flex-shrink-0 w-[260px]"
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <Card
                  className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden cursor-pointer h-[340px]"
                  onClick={() =>
                    router.push(`/homestays/${item.slug}?imageUrl=${encodeURIComponent(item.image)}`)
                  }
                >
                  <div className="relative w-full h-44 flex-shrink-0">
                    <div className={`absolute inset-0 ${imageLoadingStates[idx] ? "bg-gray-100 animate-pulse" : ""}`}>
                      <Image
                        src={item.image}
                        alt={`${item.city} homestay`}
                        fill
                        className={`object-cover ${imageLoadingStates[idx] ? "opacity-0" : "opacity-100"}`}
                        sizes="(max-width: 640px) 260px, 280px"
                        placeholder="blur"
                        blurDataURL="/images/placeholder-homestay.jpg"
                        onLoadingComplete={() => handleImageLoad(idx)}
                        onError={() => {
                          setImageLoadingStates((prev) => {
                            const newStates = [...prev];
                            newStates[idx] = false;
                            return newStates;
                          });
                        }}
                      />
                    </div>
                    {item.breakfast && (
                      <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs bg-[#D4A017]/80 text-white">
                        {item.breakfast}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-semibold text-gray-900">{item.city}</h3>
                    <p className="text-xs text-gray-500">{item.region}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-base font-bold text-gray-900">
                        {item.price}<span className="text-xs text-gray-500">/night</span>
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-[#D4A017] fill-[#D4A017]" />
                        <span className="text-xs text-gray-600">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={scrollRight}
            className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 p-2 bg-white shadow-md hover:bg-[#D4A017]/10 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </section>
  );
}