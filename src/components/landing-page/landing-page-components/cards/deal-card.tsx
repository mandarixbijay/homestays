// src/components/landing-page/landing-page-components/cards/deal-card.tsx
"use client";

import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const FALLBACK_IMAGE = "https://via.placeholder.com/350x208?text=No+Image+Available";

interface DealCardProps {
  imageSrc: string;
  location: string;
  hotelName: string;
  rating: string;
  reviews: string;
  originalPrice: string;
  nightlyPrice: string;
  totalPrice: string;
  categoryColor: string;
  slug: string;
  features: string[];
  vipAccess?: boolean;
  discount?: string;
  onClick?: () => void;
}

const DealCard: React.FC<DealCardProps> = ({
  imageSrc,
  location,
  hotelName,
  rating,
  reviews,
  originalPrice,
  nightlyPrice,
  totalPrice,
  categoryColor,
  slug,
  features = [], // <-- Add this default value
  vipAccess,
  discount,
  onClick,
}) => {
  return (
    <Card
      className="w-full rounded-xl border-none shadow-sm hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="relative w-full h-48">
        <Image
          src={imageSrc}
          alt={`${hotelName} image`}
          className="object-cover rounded-t-xl"
          fill
          sizes="(max-width: 640px) 100vw, 260px"
          quality={80}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl" />
        {vipAccess && (
          <Badge className="absolute top-3 left-3 bg-yellow-400 text-primary font-semibold px-3 py-1 rounded-full text-xs">
            VIP Access
          </Badge>
        )}
        {discount && (
          <Badge className="absolute top-3 right-3 bg-green-600 text-white font-semibold px-3 py-1 rounded-full text-xs">
            {discount}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{location}</p>
        <CardTitle className="text-lg font-bold text-foreground line-clamp-2">
          {hotelName}
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge className={`${categoryColor} text-white text-xs font-semibold px-2 py-0.5 rounded-sm`}>
            {rating}
          </Badge>
          <span className="text-sm text-muted-foreground">{reviews.split(" ")[0]}</span>
          <span className="text-xs text-muted-foreground">
            ({reviews.split(" ")[1].replace("(", "").replace(")", "")})
          </span>
        </div>
        <div className="mt-2">
          <h4 className="text-sm font-semibold text-foreground">Amenities:</h4>
          <ul className="list-disc pl-4 mt-1 space-y-1 text-xs text-muted-foreground">
            {features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-end mt-4">
          <p className="text-lg font-bold text-foreground">
            {totalPrice}
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {originalPrice}
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">{nightlyPrice} / night</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCard;