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
    ? '/images/default-blog.jpg' 
    : imageSrc || '/images/default-blog.jpg';

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc('/images/default-blog.jpg');
    }
  };

  // Props for the Image component
  const imageProps = {
    src: finalSrc,
    alt: alt || 'Blog image',
    className,
    onError: handleImageError,
    quality,
    priority,
    ...(fill ? { fill: true, sizes } : { width: width || 600, height: height || 400 }),
  };

  return <Image {...imageProps} />;
}

