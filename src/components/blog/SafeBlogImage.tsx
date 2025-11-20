// Create this component and use it in your BlogClient
// components/blog/SafeBlogImage.tsx

"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface SafeBlogImageProps {
  src: string | undefined;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  quality?: number;
}

export default function SafeBlogImage({
  src,
  alt,
  fill = false,
  className = "",
  sizes,
  priority = false,
  width,
  height,
  quality = 75
}: SafeBlogImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // Helper function to validate image URL
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;

    // Allow local images
    if (url.startsWith('/')) return true;

    // Block invalid example URLs
    if (url.includes('example.com') && !url.startsWith('https://example.com')) {
      return false;
    }

    return true;
  };

  // Determine the final image source
  const finalSrc = imageError || !isValidImageUrl(imageSrc)
    ? '/images/fallback-image.png'
    : imageSrc || '/images/fallback-image.png';

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc('/images/fallback-image.png');
    }
  };

  // SEO-friendly alt text (never empty)
  const seoAlt = alt && alt.trim().length > 0 ? alt : 'Nepal Homestays - Travel Blog Image';

  // Responsive sizes for better performance
  const responsiveSizes = sizes || (fill
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : undefined);

  return (
    <Image
      src={finalSrc}
      alt={seoAlt}
      className={className}
      onError={handleImageError}
      quality={quality}
      priority={priority}
      loading={priority ? undefined : ('lazy' as const)}
      {...(fill ? { fill: true, sizes: responsiveSizes } : { width: width || 600, height: height || 400 })}
    />
  );
}

