"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Share2 } from "lucide-react";

// Fallback image path
const FALLBACK_IMAGE = "/images/fallback-image.png";

// Blog post data with category colors and author
const blogPostsData = [
  {
    id: 1,
    title: "Discovering the Hidden Gems of Bhaktapur",
    excerpt:
      "Explore the rich culture, ancient temples, and vibrant streets of Bhaktapur with our insider tips for an unforgettable journey.",
    imageSrc: "/images/blog/bhaktapur_blog.avif",
    imageFallback: "/images/fallback-image.png",
    category: "Travel",
    categoryColor: "bg-primary",
    slug: "hidden-gems-bhaktapur",
    date: "2025-05-15",
    author: "Anita Sharma",
  },
  {
    id: 2,
    title: "A Weekend Getaway in Pokhara",
    excerpt:
      "Unwind by the serene Phewa Lake and enjoy breathtaking mountain views in Pokhara, a haven for relaxation and adventure.",
    imageSrc: "/images/blog/pokhara_blog.avif",
    imageFallback: "/images/fallback-image.png",
    category: "Adventure",
    categoryColor: "bg-accent",
    slug: "weekend-getaway-pokhara",
    date: "2025-04-20",
    author: "Rajan Thapa",
  },
  {
    id: 3,
    title: "Wildlife Adventures in Chitwan",
    excerpt:
      "Embark on a thrilling jungle safari in Chitwan National Park, home to rhinos, tigers, and exotic wildlife.",
    imageSrc: "/images/blog/chitwan_blog.avif",
    imageFallback: "/images/fallback-image.png",
    category: "Wildlife",
    categoryColor: "bg-discount",
    slug: "wildlife-adventures-chitwan",
    date: "2025-03-10",
    author: "Sita Gurung",
  },
  {
    id: 4,
    title: "Spiritual Journey to Lumbini",
    excerpt:
      "Visit the sacred birthplace of Lord Buddha in Lumbini and find inner peace amidst historic monasteries.",
    imageSrc: "/images/blog/lumbini_blog.avif",
    imageFallback: "/images/fallback-image.png",
    category: "Culture",
    categoryColor: "bg-warning",
    slug: "spiritual-journey-lumbini",
    date: "2025-02-05",
    author: "Krishna Lama",
  },
];

export default function Hero4() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Current date (July 10, 2025)
  const currentDate = new Date(2025, 6, 10);
  const formattedDate = format(currentDate, "MMMM d, yyyy");

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === blogPostsData.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Memoized dot click handler
  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Animation variants
  const cardVariants: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    hover: {
      scale: 1.02,
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3 },
    },
  };

  const imageVariants: Variants = {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const textVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const currentPost = blogPostsData[currentIndex];

  // Debug image loading
  console.log("Loading image:", currentPost.imageSrc, "Fallback:", currentPost.imageFallback);

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Decorative Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] z-0" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight font-serif">
            Discover Nepal Through Our Blog
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-muted-foreground font-medium max-w-3xl mx-auto">
            Dive into captivating travel guides, cultural stories, and adventure tips to inspire your next journey in Nepal.
          </p>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground/80">
            Latest post updated: <span className="font-semibold text-accent">{formattedDate}</span>
          </p>
          <div className="mt-4 sm:mt-6">
            <Button
              variant="outline"
              className="text-sm sm:text-base text-accent hover:text-accent/80 hover:bg-transparent"
              onClick={() => router.push("/blogs")}
              aria-label="Explore more travel stories"
            >
              Explore More Stories
            </Button>
          </div>
        </motion.div>

        {/* Blog Card */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="mx-auto max-w-[1000px] sm:max-w-[1100px] md:max-w-[1200px] group"
        >
          <Card
            className="relative bg-card/95 backdrop-blur-lg rounded-2xl shadow-xl border border-border/50 overflow-hidden flex flex-col md:flex-row min-h-[320px] sm:min-h-[400px] md:min-h-[480px] h-[480px] md:h-[500px] cursor-pointer transition-all duration-300"
            onClick={() => router.push(`/blogs/${currentPost.slug}`)}
            role="region"
            aria-label={`Featured blog post: ${currentPost.title}`}
          >
            {/* Image Section */}
            <div className="relative w-full md:w-1/2 h-64 sm:h-80 md:h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  variants={imageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative w-full h-full"
                >
                  <picture>
                    <source srcSet={currentPost.imageSrc} type="image/avif" />
                    <Image
                      src={currentPost.imageFallback}
                      alt={`Image for blog post: ${currentPost.title}`}
                      fill
                      className="object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-r-none transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                      priority={currentIndex === 0}
                      placeholder="blur"
                      blurDataURL="/images/fallback-image.png"
                      onError={(e) => {
                        console.error(
                          `Failed to load image: ${currentPost.imageSrc}, Fallback: ${currentPost.imageFallback}`,
                          e
                        );
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      quality={85}
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-2xl md:rounded-l-2xl" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-4 sm:gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        currentPost.categoryColor,
                        "text-primary-foreground text-xs sm:text-sm px-3 py-1 rounded-full shadow-sm uppercase font-medium"
                      )}
                    >
                      {currentPost.category}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:text-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof window !== "undefined") {
                          window.open(
                            `https://twitter.com/intent/tweet
                            ?text=${encodeURIComponent(currentPost.title)}`,
                            "_blank"
                          );
                        }
                      }}
                      aria-label={`Share blog post: ${currentPost.title}`}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-card-foreground line-clamp-2 leading-tight">
                    {currentPost.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    By {currentPost.author} | {format(new Date(currentPost.date), "MMMM d, yyyy")}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground line-clamp-3 sm:line-clamp-4">
                    {currentPost.excerpt}
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="rounded-full px-6 py-2 text-sm sm:text-base font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/blogs/${currentPost.slug}`);
                      }}
                      aria-label={`Read more about ${currentPost.title}`}
                    >
                      Read More
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm text-accent hover:text-accent/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/blogs");
                      }}
                      aria-label="View all blog posts"
                    >
                      View All
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
          {blogPostsData.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleDotClick(index);
                }
              }}
              aria-label={`Go to blog post ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
              className={cn(
                "h-3 w-3 sm:h-4 sm:w-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                index === currentIndex
                  ? "bg-primary scale-125 w-6 sm:w-8"
                  : "bg-muted/50 hover:bg-primary/50"
              )}
            />
          ))}
        </div>

        {/* View All Blogs CTA */}
        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <Button
            variant="default"
            className="button-primary px-8 py-3 rounded-full"
            onClick={() => router.push("/blogs")}
            aria-label="Discover all blog posts"
          >
            Discover All Blogs
          </Button>
        </div>
      </div>
    </section>
  );
}