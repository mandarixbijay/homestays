// src/components/landing-page-components/cards/category-card.tsx
"use client";

import Image from "next/image";
import React from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface CategoryCardProps {
  imageSrc: string;
  categoryName: string;
}

const FALLBACK_IMAGE = "/images/fallback-image.png";

const CategoryCard: React.FC<CategoryCardProps> = ({ imageSrc, categoryName }) => {
  const router = useRouter();

  return (
    <Card
      className="card w-full h-[360px] sm:h-[400px] overflow-hidden cursor-pointer group animate-fade-in border-none rounded-xl"
      onClick={() => router.push(`/search?destination=${categoryName.toLowerCase()}`)}
      role="button"
      aria-label={`Explore ${categoryName} homestays`}
    >
      <div className="relative w-full h-full">
        <Image
          src={imageSrc}
          alt={`${categoryName} destination`}
          fill
          className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 90vw, 360px"
          placeholder="blur"
          blurDataURL="/images/fallback-image.png"
          onError={(e) => {
            console.error(`Failed to load image: ${imageSrc}`);
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl group-hover:from-black/60 transition-all duration-300" />
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <h3 className="text-sm sm:text-base font-bold text-white text-center drop-shadow-md">
            {categoryName}
          </h3>
        </div>
        <div className="absolute inset-0 border-2 border-transparent rounded-xl group-hover:border-primary/30 transition-all duration-300" />
      </div>
    </Card>
  );
};

export default CategoryCard;