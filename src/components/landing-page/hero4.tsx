"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_IMAGE = "/images/fallback-image.png";

const blogPostsData = [
  {
    id: 1,
    title: "Discovering the Hidden Gems of Bhaktapur",
    excerpt: "Explore the rich culture, ancient temples, and vibrant streets of Bhaktapur.",
    imageSrc: "/images/blog/bhaktapur_blog.avif",
    category: "Travel",
    categoryColor: "bg-yellow-400",
    slug: "hidden-gems-bhaktapur",
    date: "2025-05-15",
    author: "Anita Sharma",
  },
  {
    id: 2,
    title: "A Weekend Getaway in Pokhara",
    excerpt: "Unwind by Phewa Lake and enjoy breathtaking mountain views in Pokhara.",
    imageSrc: "/images/blog/pokhara_blog.avif",
    category: "Adventure",
    categoryColor: "bg-yellow-500",
    slug: "weekend-getaway-pokhara",
    date: "2025-04-20",
    author: "Rajan Thapa",
  },
  {
    id: 3,
    title: "Wildlife Adventures in Chitwan",
    excerpt: "Embark on a thrilling jungle safari in Chitwan National Park.",
    imageSrc: "/images/blog/chitwan_blog.avif",
    category: "Wildlife",
    categoryColor: "bg-green-600",
    slug: "wildlife-adventures-chitwan",
    date: "2025-03-10",
    author: "Sita Gurung",
  },
  {
    id: 4,
    title: "Spiritual Journey to Lumbini",
    excerpt: "Visit the sacred birthplace of Lord Buddha in Lumbini.",
    imageSrc: "/images/blog/lumbini_blog.avif",
    category: "Culture",
    categoryColor: "bg-green-500",
    slug: "spiritual-journey-lumbini",
    date: "2025-02-05",
    author: "Krishna Lama",
  },
];

const BlogCardSkeleton = memo(() => (
  <div className="snap-center w-72 sm:w-80 flex-shrink-0">
    <Card className="bg-gray-50 rounded-xl h-96 animate-pulse border-0 shadow-sm">
      <div className="w-full h-48 bg-gray-200 rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded-md w-3/4" />
        <div className="h-3 bg-gray-200 rounded-md w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded-md w-full" />
          <div className="h-3 bg-gray-200 rounded-md w-5/6" />
        </div>
      </div>
    </Card>
  </div>
));
BlogCardSkeleton.displayName = "BlogCardSkeleton";

const BlogCard = memo(({
  post,
  onImageLoad
}: {
  post: any;
  onImageLoad: (id: number) => void;
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleCardClick = useCallback(() => {
    router.push(`/blogs/${post.slug}`);
  }, [router, post.slug]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    onImageLoad(post.id);
  }, [onImageLoad, post.id]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
    onImageLoad(post.id);
  }, [onImageLoad, post.id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  return (
    <article
      className="snap-center w-72 sm:w-80 flex-shrink-0 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98] "
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Read blog post: ${post.title}`}
    >
      <Card className="bg-white rounded-xl h-96 shadow-sm hover:shadow-lg transition-all duration-200 border-0 overflow-hidden">
        <div className="relative w-full h-48 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <Image
            src={imageError ? FALLBACK_IMAGE : post.imageSrc}
            alt={post.title}
            fill
            className={cn(
              "object-cover transition-all duration-300 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 640px) 288px, 320px"
            quality={85}
            priority={post.id === 1}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <Badge
            className={cn(
              post.categoryColor,
              "absolute top-3 right-3 text-white text-xs px-2.5 py-1 rounded-full uppercase font-medium shadow-lg backdrop-blur-sm"
            )}
          >
            {post.category}
          </Badge>
        </div>
        <div className="p-4 h-48 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-green-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-xs text-gray-500 mb-3 font-medium">
            By {post.author} • {format(new Date(post.date), "MMM d, yyyy")}
          </p>
          <p className="text-sm text-gray-600 line-clamp-3 flex-1 leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </Card>
    </article>
  );
});
BlogCard.displayName = "BlogCard";

export default function Hero4() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const handleImageLoad = useCallback((id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, []);

  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftButton(scrollLeft > 10);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => updateScrollButtons();
    container.addEventListener('scroll', handleScroll);

    // Initial check
    updateScrollButtons();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateScrollButtons]);

  return (
    <section className="w-full px-4 sm:px-6 bg-white mt-10 pb-10" aria-labelledby="blog-section-title">
      <div className="mx-auto max-w-7xl">
        <Card className="rounded-xl bg-cover bg-center min-h-[520px] sm:min-h-[600px] overflow-hidden relative shadow-lg">
          {/* Background with better gradient */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(8, 65, 45, 0.8), rgba(8, 65, 45, 0.3)), url(${blogPostsData[0].imageSrc})`,
            }}
          />

          {/* Header Section */}
          <div className="relative z-10 px-4 py-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
              <div>
                <h2 id="blog-section-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                  Explore Nepal&rsquo;s Stories
                </h2>

                <p className="mt-2 text-sm sm:text-base lg:text-lg text-white/90 drop-shadow-md max-w-md">
                  Uncover travel guides, cultural insights, and adventure tips from local experts
                </p>
              </div>
              <Button
                className="bg-white text-gray-900 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 font-semibold text-sm sm:text-base"
                onClick={() => router.push("/blogs")}
              >
                View All Blogs
              </Button>
            </div>
          </div>

          {/* Carousel Section */}
          <div className="relative z-10">
            {/* Mobile scroll indicator */}
            <div className="flex justify-center mb-2 sm:hidden">
              <div className="flex space-x-1">
                {blogPostsData.map((_, index) => (
                  <div key={index} className="w-2 h-2 rounded-full bg-white/40" />
                ))}
              </div>
            </div>

            {/* Navigation Buttons - Hidden on mobile, visible on tablet+ */}
            {showLeftButton && (
              <Button
                variant="outline"
                size="icon"
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white border-white/20 shadow-lg backdrop-blur-sm"
                onClick={() => scroll('left')}
                aria-label="Scroll to previous blogs"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {showRightButton && (
              <Button
                variant="outline"
                size="icon"
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white border-white/20 shadow-lg backdrop-blur-sm"
                onClick={() => scroll('right')}
                aria-label="Scroll to next blogs"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {/* Blog Cards Carousel */}
            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 sm:px-12 pb-6"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              role="region"
              aria-label="Blog posts carousel"
            >
              {blogPostsData.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onImageLoad={handleImageLoad}
                />
              ))}
            </div>

            {/* Mobile swipe hint */}
            <div className="text-center sm:hidden">
              <p className="text-white/70 text-xs mb-2">← Swipe to explore more →</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}