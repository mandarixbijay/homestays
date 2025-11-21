"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Calendar, Clock, User, Eye, Share2, Bookmark,
  Facebook, Twitter, Linkedin, Link2, Check,
  ChevronLeft, Tag, Heart, MessageCircle,
  Coffee, MapPin, ArrowLeft, ArrowRight,
  Quote, Star, Send, ThumbsUp, Mountain,
  Camera, Compass, TrendingUp, ChevronRight, X,
  Mail, Instagram, Youtube, MessageSquare
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PublicBlog, publicBlogApi } from "@/lib/api/public-blog-api";
import SafeBlogImage from "@/components/blog/SafeBlogImage";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { TrendingBlogSkeleton } from "@/components/blog/BlogSkeletons";
import { TableOfContents } from "@/components/blog/TableOfContents";

interface BlogDetailClientProps {
  blog: PublicBlog;
}

// Simple Avatar Component with Dark Teal Theme
function SimpleAvatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div className={`rounded-full bg-gradient-to-br from-[#214B3F] to-[#2d6654] text-white flex items-center justify-center font-bold ${className}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// Component to render blog content with properly centered and framed images
function BlogContent({ content }: { content: string }) {
  const processedContent = useMemo(() => {
    // Process HTML to wrap images in centered containers
    let processed = content;

    // Match img tags and wrap them in centered divs
    processed = processed.replace(
      /<img([^>]+)>/gi,
      '<div style="display:flex;justify-content:center;margin:2rem auto;max-width:100%;"><img$1 style="max-width:85%;height:auto;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid rgba(209,170,90,0.2);padding:8px;background:white;"/></div>'
    );

    return processed;
  }, [content]);

  return (
    <div
      className="blog-content prose prose-base sm:prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-card-foreground prose-headings:break-words
        prose-h1:text-2xl sm:prose-h1:text-3xl lg:prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-xl sm:prose-h2:text-2xl lg:prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
        prose-h3:text-lg sm:prose-h3:text-xl lg:prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-card-foreground prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base sm:prose-p:text-lg prose-p:break-words
        prose-a:text-[#214B3F] prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:break-words
        prose-strong:text-card-foreground prose-strong:break-words
        prose-ul:my-4 prose-ul:space-y-2 prose-ul:pl-6
        prose-ol:my-4 prose-ol:space-y-2 prose-ol:pl-6
        prose-li:text-card-foreground prose-li:leading-relaxed prose-li:text-base prose-li:break-words
        prose-blockquote:border-l-4 prose-blockquote:border-[#D1AA5A] prose-blockquote:pl-6 prose-blockquote:italic
        prose-blockquote:text-muted-foreground prose-blockquote:my-6 prose-blockquote:bg-[#214B3F]/5 prose-blockquote:py-3 prose-blockquote:rounded-r
        prose-code:text-[#214B3F] prose-code:bg-[#214B3F]/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:my-6 prose-pre:p-4
      "
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

export default function BlogDetailClient({ blog }: BlogDetailClientProps) {
  const [relatedBlogs, setRelatedBlogs] = useState<PublicBlog[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<PublicBlog[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 100);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end end"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const headerScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    loadRelatedBlogs();
    loadTrendingBlogs();
    const bookmarks = JSON.parse(localStorage.getItem("blogBookmarks") || "[]");
    setBookmarked(bookmarks.includes(blog.id));

    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setLiked(likedPosts.includes(blog.id));
  }, [blog.id]);

  const loadRelatedBlogs = async () => {
    try {
      if (blog.categories && blog.categories.length > 0) {
        const response = await publicBlogApi.getRelatedBlogs(blog.slug, 4);
        setRelatedBlogs(response.filter((b) => b.id !== blog.id).slice(0, 4));
      }
    } catch (error) {
      console.error("Error loading related blogs:", error);
    }
  };

  const loadTrendingBlogs = async () => {
    try {
      setTrendingLoading(true);
      const response = await publicBlogApi.getFeaturedBlogs(3);
      setTrendingBlogs(response.filter((b) => b.id !== blog.id).slice(0, 3));
    } catch (error) {
      console.error("Error loading trending blogs:", error);
      setTrendingBlogs([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const images = blog.images?.map((img) => img.url) || [blog.featuredImage || "/images/fallback-image.png"];

  const handleShare = (platform: string) => {
    const title = encodeURIComponent(blog.title);
    const url = encodeURIComponent(shareUrl);
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`,
      email: `mailto:?subject=${title}&body=${url}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank", "width=600,height=400");
    }
  };

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("blogBookmarks") || "[]");
    if (bookmarked) {
      const updated = bookmarks.filter((id: number) => id !== blog.id);
      localStorage.setItem("blogBookmarks", JSON.stringify(updated));
      toast.success("Removed from bookmarks");
    } else {
      bookmarks.push(blog.id);
      localStorage.setItem("blogBookmarks", JSON.stringify(bookmarks));
      toast.success("Added to bookmarks!");
    }
    setBookmarked(!bookmarked);
  };

  const handleLike = () => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    if (liked) {
      const updated = likedPosts.filter((id: number) => id !== blog.id);
      localStorage.setItem("likedPosts", JSON.stringify(updated));
      setLikes(likes - 1);
    } else {
      likedPosts.push(blog.id);
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="min-h-screen bg-card overflow-x-hidden">
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#214B3F] to-[#D1AA5A] z-50"
          style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
        />

      {/* Enhanced Floating Actions Sidebar - Desktop Only */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 z-40"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={handleLike}
          className={`rounded-full shadow-lg bg-card hover:scale-110 transition-all ${
            liked ? "text-red-500 border-red-200" : "hover:text-red-500"
          }`}
        >
          <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
        </Button>
        <span className="text-xs text-center text-muted-foreground">{likes}</span>

        <Separator className="my-1" />

        <Button
          variant="outline"
          size="icon"
          onClick={handleBookmark}
          className={`rounded-full shadow-lg bg-card hover:scale-110 transition-all ${
            bookmarked ? "text-[#D1AA5A] border-[#D1AA5A]" : "hover:text-[#D1AA5A]"
          }`}
        >
          <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
        </Button>

        <Separator className="my-1" />

        {/* Share Buttons */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare("facebook")}
          className="rounded-full shadow-lg bg-card hover:scale-110 transition-all hover:text-blue-600"
        >
          <Facebook className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare("twitter")}
          className="rounded-full shadow-lg bg-card hover:scale-110 transition-all hover:text-blue-400"
        >
          <Twitter className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare("linkedin")}
          className="rounded-full shadow-lg bg-card hover:scale-110 transition-all hover:text-blue-700"
        >
          <Linkedin className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare("whatsapp")}
          className="rounded-full shadow-lg bg-card hover:scale-110 transition-all hover:text-green-600"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handleShare("copy")}
          className="rounded-full shadow-lg bg-card hover:scale-110 transition-all hover:text-card-foreground"
        >
          {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
        </Button>
      </motion.div>

      {/* Hero Section - Modern Magazine Style */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <SafeBlogImage
              src={images[0]}
              alt={blog.title}
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link href="/blogs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20"
                >
                  <ArrowLeft className="h-3 w-3 mr-2" />
                  Back to Stories
                </Button>
              </Link>
            </div>

            {/* Categories */}
            {blog.categories && blog.categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
                {blog.categories.map((cat: any) => (
                  <Badge
                    key={cat.id}
                    className="bg-[#D1AA5A] text-white border-[#D1AA5A] px-3 py-1 text-xs sm:text-sm font-semibold"
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2 break-words">
              {blog.title}
            </h1>

            {/* Excerpt */}
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 break-words leading-relaxed">
              {blog.excerpt}
            </p>

            {/* Meta Info Card */}
            <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 sm:px-6 py-3 sm:py-4">
              {/* Author */}
              <div className="flex items-center gap-2">
                <SimpleAvatar name={blog.author.name} className="h-8 w-8 sm:h-10 sm:w-10 text-xs" />
                <span className="text-white text-xs sm:text-sm font-medium">{blog.author.name}</span>
              </div>

              <Separator orientation="vertical" className="h-8 bg-white/30 hidden sm:block" />

              {/* Date */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-white/80" />
                <span className="text-white/90 text-xs sm:text-sm">{format(parseISO(blog.publishedAt || new Date().toISOString()), "MMM d, yyyy")}</span>
              </div>

              {/* Read Time */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-white/80" />
                <span className="text-white/90 text-xs sm:text-sm">{blog.readTime || 5} min</span>
              </div>

              {/* Views */}
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-white/80" />
                <span className="text-white/90 text-xs sm:text-sm">{blog.viewCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      {images.length > 1 && (
        <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Camera className="h-5 w-5 text-[#214B3F]" />
              <h3 className="text-xl font-bold text-card-foreground">Gallery</h3>
              <Badge className="bg-[#D1AA5A]/20 text-[#214B3F] border-[#D1AA5A]">
                {images.length} photos
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto">
              {images.slice(0, 8).map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setShowImageGallery(true);
                  }}
                >
                  <SafeBlogImage
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index < 4}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-8 sm:py-12 lg:py-16 overflow-x-hidden" ref={contentRef}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            {/* Article Content */}
            <article className="lg:col-span-8 w-full min-w-0">
              {/* Reading Progress Indicator */}
              <div className="mb-8 p-4 bg-gradient-to-r from-[#214B3F]/10 to-[#D1AA5A]/10 rounded-lg border border-[#214B3F]/20">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-[#214B3F]" />
                  <span className="font-medium">{blog.readTime || 5} minute read</span>
                  <Separator orientation="vertical" className="h-4" />
                  <Eye className="h-4 w-4 text-[#214B3F]" />
                  <span>{blog.viewCount.toLocaleString()} views</span>
                </div>
              </div>

              <div className="w-full max-w-4xl mx-auto">
                <BlogContent content={blog.content} />
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200 max-w-4xl mx-auto"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-[#214B3F]" />
                    Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag: any) => (
                      <Link key={tag.id} href={`/blogs?tag=${tag.slug}`}>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-[#214B3F]/10 hover:border-[#214B3F] transition-colors text-xs sm:text-sm"
                        >
                          #{tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Author Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 sm:mt-12 max-w-4xl mx-auto"
              >
                <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#214B3F]/5 to-[#D1AA5A]/5 border-[#214B3F]/20">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <SimpleAvatar name={blog.author.name} className="h-16 w-16 sm:h-20 sm:w-20 text-xl sm:text-2xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2 break-words">{blog.author.name}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 break-words">
                        Travel writer and adventure enthusiast exploring Nepal&apos;s hidden treasures.
                        Sharing authentic stories and insider tips from the heart of the Himalayas.
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-[#214B3F] text-[#214B3F] hover:bg-[#214B3F] hover:text-white text-xs sm:text-sm"
                        >
                          <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Follow
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-[#D1AA5A] text-[#D1AA5A] hover:bg-[#D1AA5A] hover:text-white text-xs sm:text-sm"
                        >
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 w-full min-w-0 space-y-6">
              {/* Table of Contents - Desktop Only */}
              <div className="hidden lg:block">
                <TableOfContents content={blog.content} />
              </div>

              {/* Share Actions - Mobile */}
              <Card className="p-6 lg:hidden">
                <h3 className="font-bold text-card-foreground mb-4">Share & Save</h3>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBookmark}
                    className={bookmarked ? "text-[#D1AA5A] border-[#D1AA5A]" : ""}
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={liked ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("facebook")}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("twitter")}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("whatsapp")}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("linkedin")}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("reddit")}
                  >
                    <Reddit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare("copy")}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-center text-xs text-muted-foreground mt-2">{likes} likes</div>
              </Card>

              {/* Sticky Newsletter - Fixed Position on Desktop */}
              <div className="lg:sticky lg:top-24">
                <Card className="p-6 bg-gradient-to-br from-[#214B3F] to-[#2d6654] text-white">
                  <Mountain className="h-8 w-8 mb-3 text-[#D1AA5A]" />
                  <h3 className="font-bold text-lg mb-2">Never Miss a Story</h3>
                  <p className="text-sm mb-4 opacity-90 text-[#FFFFFF]">
                    Get travel tips and stories delivered to your inbox
                  </p>
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-4 py-2 rounded-lg bg-card/20 backdrop-blur border border-white/30 
                      placeholder:text-white/70 text-white mb-3 focus:outline-none focus:ring-2 focus:ring-[#D1AA5A]/50"
                  />
                  <Button className="w-full bg-[#D1AA5A] text-[#214B3F] hover:bg-[#D1AA5A]/90 font-bold">
                    Subscribe
                  </Button>
                </Card>

                {/* Popular Posts with Real Data */}
                <Card className="p-6 mt-6">
                  <h3 className="font-bold text-card-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#214B3F]" />
                    Trending Now
                  </h3>
                  <div className="space-y-4">
                    {trendingLoading ? (
                      [1, 2, 3].map((i) => (
                        <TrendingBlogSkeleton key={i} />
                      ))
                    ) : trendingBlogs.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center">No trending stories available</p>
                    ) : (
                      trendingBlogs.map((trendingBlog) => (
                        <Link key={trendingBlog.id} href={`/blogs/${trendingBlog.slug}`}>
                          <div className="group cursor-pointer">
                            <div className="relative w-full h-24 mb-3 rounded-lg overflow-hidden">
                              <SafeBlogImage
                                src={trendingBlog.images?.[0]?.url || trendingBlog.featuredImage || "/images/fallback-image.png"}
                                alt={trendingBlog.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <h4 className="font-medium text-card-foreground group-hover:text-[#214B3F] transition-colors line-clamp-2 mb-1">
                              {trendingBlog.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {trendingBlog.readTime || 5} min read
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {trendingBlog.viewCount.toLocaleString()} views
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card-foreground mb-3 sm:mb-4 break-words px-2">Continue Your Journey</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto break-words px-4">
                Discover more stories and adventures from our collection of travel experiences
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {relatedBlogs.map((relatedBlog, index) => (
                <motion.div
                  key={relatedBlog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full min-w-0"
                >
                  <RelatedBlogCard blog={relatedBlog} />
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8 sm:mt-12">
              <Link href="/blogs">
                <Button className="bg-gradient-to-r from-[#214B3F] to-[#2d6654] text-white hover:from-[#214B3F]/90 hover:to-[#2d6654]/90 text-sm sm:text-base">
                  Explore All Stories
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeBlogImage
                src={images[currentImageIndex]}
                alt={`Gallery ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-card/20"
                onClick={() => setShowImageGallery(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-card/20"
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length)}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-card/20"
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % images.length)}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Related Blog Card
function RelatedBlogCard({ blog }: { blog: PublicBlog }) {
  const mainImage = blog.images?.[0]?.url || blog.featuredImage || "/images/fallback-image.png";

  return (
    <Link href={`/blogs/${blog.slug}`} className="block w-full">
      <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-card">
        <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
          <SafeBlogImage
            src={mainImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground mb-2 sm:mb-3">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{blog.readTime || 5} min</span>
            <span className="text-muted-foreground/50">•</span>
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{format(parseISO(blog.publishedAt || new Date().toISOString()), "MMM d")}</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-card-foreground line-clamp-2 group-hover:text-[#214B3F] transition-colors mb-2 break-words">
            {blog.title}
          </h3>

          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 mb-3 sm:mb-4 break-words">{blog.excerpt}</p>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <SimpleAvatar name={blog.author.name} className="h-5 w-5 sm:h-6 sm:w-6 text-xs flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{blog.author.name}</span>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#214B3F] group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Reddit Icon Component
function Reddit({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11.5c0 .28-.22.5-.5.5-.15 0-.29-.06-.39-.17-.55-.55-1.46-.9-2.61-.9s-2.06.35-2.61.9c-.1.11-.24.17-.39.17-.28 0-.5-.22-.5-.5 0-.15.06-.29.17-.39.74-.74 1.93-1.18 3.33-1.18s2.59.44 3.33 1.18c.11.1.17.24.17.39zM9.5 11c-.83 0-1.5-.67-1.5-1.5S8.67 8 9.5 8s1.5.67 1.5 1.5S10.33 11 9.5 11zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 8 14.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

// Pinterest Icon Component
function Pinterest({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.19 2.57 7.77 6.21 9.27-.09-.78-.17-1.97.03-2.82.19-.77 1.21-5.13 1.21-5.13s-.31-.62-.31-1.53c0-1.43.83-2.5 1.86-2.5.88 0 1.3.66 1.3 1.45 0 .88-.56 2.2-.85 3.42-.24 1.02.51 1.86 1.52 1.86 1.82 0 3.22-1.92 3.22-4.69 0-2.45-1.76-4.17-4.28-4.17-2.92 0-4.63 2.19-4.63 4.45 0 .88.34 1.83.76 2.34.08.1.09.19.07.29-.08.33-.25 1.02-.29 1.16-.05.19-.15.23-.34.14-1.28-.6-2.08-2.47-2.08-3.97 0-3.23 2.35-6.19 6.76-6.19 3.55 0 6.31 2.53 6.31 5.91 0 3.53-2.22 6.36-5.31 6.36-1.04 0-2.01-.54-2.34-1.18l-.64 2.42c-.23.88-.85 1.99-1.27 2.66.96.3 1.97.46 3.03.46 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}