"use client";

import Image from "next/image";
import React from "react";
import { Card } from "@/components/ui/card";

const FALLBACK_IMAGE = "/images/fallback-image.png";

interface CategoryCardProps {
  imageSrc: string;
  categoryName: string;
  onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ imageSrc, categoryName, onClick }) => {
  return (
    <Card className="w-full h-[300px] sm:h-[360px] md:h-[400px] rounded-xl border border-gray-200" onClick={onClick}>
      <div className="relative w-full h-full">
        <Image
          src={imageSrc}
          alt={`${categoryName} destination`}
          className="object-cover rounded-xl"
          fill
          sizes="(max-width: 640px) 100vw, 300px"
          quality={80}
          onError={(e) => {
            console.error(`Failed to load image: ${imageSrc}`);
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/50 rounded px-3 py-1">
            <h3 className="text-base font-bold text-white text-left">{categoryName}</h3>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;