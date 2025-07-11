"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ImageGalleryProps } from "@/models";

const FALLBACK_IMAGE = "/images/fallback-image.png"; // Provided fallback image path

export default function ImageGallery({
  images = [],
  totalPhotos = 0,
}: ImageGalleryProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validImages, setValidImages] = useState<string[]>([]);

  // Simulate image loading and validation
  useEffect(() => {
    const loadImages = async () => {
      // Simulate async image loading (replace with actual fetch if needed)
      setTimeout(() => {
        const validatedImages =
          images.length > 0 && images.every((img) => img)
            ? images
            : [FALLBACK_IMAGE];
        setValidImages(validatedImages);
        setIsLoading(false);
      }, 1000); // Simulated delay
    };
    loadImages();
  }, [images]);

  const openLightbox = (index: number) => setCurrentImageIndex(index);
  const closeLightbox = () => setCurrentImageIndex(null);

  const showNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === null ? 0 : (prev + 1) % validImages.length
    );
  };

  const showPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === null ? 0 : (prev - 1 + validImages.length) % validImages.length
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (currentImageIndex === null) return;
    if (e.key === "ArrowRight") showNextImage(e as any);
    if (e.key === "ArrowLeft") showPrevImage(e as any);
    if (e.key === "Escape") closeLightbox();
  };

  // Fallback UI for no images (no card or background)
  if (!isLoading && validImages.length === 1 && validImages[0] === FALLBACK_IMAGE) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4 py-8">
        <p className="text-lg font-semibold text-gray-800 text-center">
          No Images Available
        </p>
        <p className="text-gray-600 text-center">
          Sorry, we couldn’t find any images for this homestay. Explore other
          homestays to find your perfect stay!
        </p>
        <Button
          className="bg-primary text-white rounded-full px-6 py-2 hover:bg-primary/90"
          onClick={() => router.push("/deals")}
          aria-label="Explore other homestays"
        >
          Explore Homestays
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Grid Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 rounded-2xl">
          <Skeleton className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 aspect-[4/3] rounded-2xl" />
          <div className="hidden md:grid col-span-2 grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 rounded-2xl overflow-hidden">
          {/* Main Image */}
          <motion.div
            className="relative col-span-1 md:col-span-2 row-span-1 md:row-span-2 aspect-[4/3] cursor-pointer"
            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.2 }}
            onClick={() => openLightbox(0)}
            role="button"
            aria-label="View main homestay image"
          >
            <Image
              src={validImages[0]}
              alt="Homestay Main Image"
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 768px) 100vw, (min-width: 769px) 50vw"
              priority
              onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            />
          </motion.div>

          {/* Smaller Images (Desktop Only) */}
          <div className="hidden md:grid col-span-2 grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={index}
                className="relative aspect-[4/3] cursor-pointer"
                whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
                onClick={() => openLightbox(index + 1)}
                role="button"
                aria-label={`View homestay image ${index + 2}`}
              >
                <Image
                  src={validImages[index + 1] || FALLBACK_IMAGE}
                  alt={`Homestay Photo ${index + 2}`}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(min-width: 769px) 25vw"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                />
                {index === 3 && totalPhotos > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-lg">
                    <span className="flex items-center text-base font-semibold">
                      <Camera className="w-5 h-5 mr-2" />
                      +{totalPhotos - 5}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {currentImageIndex !== null && validImages[currentImageIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
            role="dialog"
            aria-label="Image Lightbox"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white p-3 rounded-full bg-white/20 hover:bg-white/30 transition"
              onClick={closeLightbox}
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Lightbox Image */}
            <div className="relative w-full max-w-4xl h-[60vh] sm:h-[70vh] flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-lg" />
              ) : (
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={validImages[currentImageIndex]}
                    alt={`Homestay Photo ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                  />
                </motion.div>
              )}
            </div>

            {/* Navigation Buttons */}
            {validImages.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/20 hover:bg-white/30 transition"
                  onClick={showPrevImage}
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/20 hover:bg-white/30 transition"
                  onClick={showNextImage}
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}