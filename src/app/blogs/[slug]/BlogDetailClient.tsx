"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Calendar, Clock, User, Eye, Share2, Bookmark,
  Facebook, Twitter, Linkedin, Link2, Check,
  Tag, Heart, MessageCircle, ArrowLeft, ArrowRight,
  Mountain, TrendingUp, ChevronLeft, ChevronRight, X,
  MessageSquare
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PublicBlog } from "@/lib/api/public-blog-api";
import SafeBlogImage from "@/components/blog/SafeBlogImage";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { TableOfContents } from "@/components/blog/TableOfContents";

interface BlogDetailClientProps {
  blog: PublicBlog;
  initialRelatedBlogs?: PublicBlog[];
  initialTrendingBlogs?: PublicBlog[];
}

// Simple Avatar Component
function AuthorAvatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div className={`rounded-full bg-[#214B3F] text-white flex items-center justify-center font-semibold ${className}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// Clean Blog Content - Simple prose rendering
function BlogContent({ content }: { content: string }) {
  return (
    <article
      className="prose prose-lg max-w-none
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:scroll-mt-24
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:scroll-mt-24
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5
        prose-a:text-[#214B3F] prose-a:font-medium prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900
        prose-ul:my-5 prose-ol:my-5
        prose-li:text-gray-700 prose-li:marker:text-[#214B3F]
        prose-blockquote:border-l-4 prose-blockquote:border-[#D1AA5A] prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-amber-50/50 prose-blockquote:py-3 prose-blockquote:rounded-r-lg
        prose-img:rounded-lg prose-img:shadow-sm prose-img:my-6 prose-img:mx-auto
        prose-code:text-[#214B3F] prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 prose-pre:rounded-lg prose-pre:overflow-x-auto
      "
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default function BlogDetailClient({
  blog,
  initialRelatedBlogs = [],
  initialTrendingBlogs = [],
}: BlogDetailClientProps) {
  const relatedBlogs = initialRelatedBlogs;
  const trendingBlogs = initialTrendingBlogs;

  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 100);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem("blogBookmarks") || "[]");
    setBookmarked(bookmarks.includes(blog.id));
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setLiked(likedPosts.includes(blog.id));
  }, [blog.id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const images = blog.images?.map((img) => img.url) || [blog.featuredImage || "/images/fallback-image.png"];

  const handleShare = (platform: string) => {
    const title = encodeURIComponent(blog.title);
    const url = encodeURIComponent(shareUrl);
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
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
      toast.success("Bookmarked!");
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
    <div className="min-h-screen bg-gray-50" ref={contentRef}>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#214B3F] origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Header Section */}
      <header className="bg-white border-b pt-28 pb-8 sm:pt-32 sm:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <Link href="/blogs" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#214B3F] mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">All Articles</span>
          </Link>

          {/* Categories */}
          {blog.categories && blog.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.categories.map((cat: any) => (
                <Badge key={cat.id} className="bg-[#D1AA5A] hover:bg-[#c49d4f] text-white text-xs">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            {blog.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <AuthorAvatar name={blog.author.name} className="h-9 w-9 text-sm" />
              <div>
                <p className="font-medium text-gray-900">{blog.author.name}</p>
              </div>
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{format(parseISO(blog.publishedAt || new Date().toISOString()), "MMM d, yyyy")}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{blog.readTime || 5} min read</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{blog.viewCount.toLocaleString()} views</span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-0 sm:-mt-0">
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-lg mt-8">
          <SafeBlogImage
            src={images[0]}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

          {/* Article Column */}
          <main className="lg:col-span-8">
            {/* Content */}
            <div className="bg-white rounded-xl p-6 sm:p-10 shadow-sm">
              <BlogContent content={blog.content} />
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#214B3F]" />
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag: any) => (
                    <Link key={tag.id} href={`/blogs?tag=${tag.slug}`}>
                      <Badge variant="outline" className="hover:bg-gray-100 transition-colors cursor-pointer">
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share & Actions - Mobile */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm lg:hidden">
              <h3 className="font-semibold text-gray-900 mb-4">Share this article</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={handleLike} className={liked ? "text-red-500 border-red-200" : ""}>
                  <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
                  {likes}
                </Button>
                <Button variant="outline" size="sm" onClick={handleBookmark} className={bookmarked ? "text-[#D1AA5A] border-[#D1AA5A]" : ""}>
                  <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare("facebook")}>
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare("twitter")}>
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")}>
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare("whatsapp")}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShare("copy")}>
                  {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Author Card */}
            <div className="mt-8 bg-white rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-start gap-5">
                <AuthorAvatar name={blog.author.name} className="h-16 w-16 text-2xl flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Written by</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{blog.author.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Travel writer and adventure enthusiast exploring Nepal&apos;s hidden treasures. Sharing authentic stories and insider tips from the heart of the Himalayas.
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-gray-300 lg:scrollbar-track-transparent lg:pr-1">
              {/* Floating Actions - Desktop */}
              <div className="hidden lg:flex items-center gap-2 bg-white rounded-xl p-4 shadow-sm">
                <Button variant="ghost" size="sm" onClick={handleLike} className={liked ? "text-red-500" : "text-gray-600"}>
                  <Heart className={`h-4 w-4 mr-1.5 ${liked ? "fill-current" : ""}`} />
                  {likes}
                </Button>
                <Separator orientation="vertical" className="h-5" />
                <Button variant="ghost" size="icon" onClick={handleBookmark} className={bookmarked ? "text-[#D1AA5A]" : "text-gray-600"}>
                  <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleShare("facebook")} className="text-gray-600 hover:text-blue-600">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleShare("twitter")} className="text-gray-600 hover:text-sky-500">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleShare("copy")} className="text-gray-600">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                </Button>
              </div>

              {/* Table of Contents */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
                <TableOfContents content={blog.content} />
              </div>

              {/* Newsletter */}
              <div className="bg-[#214B3F] rounded-xl p-6 text-white">
                <Mountain className="h-8 w-8 text-[#D1AA5A] mb-3" />
                <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
                <p className="text-sm text-white/80 mb-4">
                  Get travel tips and stories delivered weekly.
                </p>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder:text-white/50 text-white text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#D1AA5A]/50"
                />
                <Button className="w-full bg-[#D1AA5A] hover:bg-[#c49d4f] text-[#214B3F] font-semibold">
                  Subscribe
                </Button>
              </div>

              {/* Trending Posts */}
              {trendingBlogs.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#214B3F]" />
                    Trending
                  </h3>
                  <div className="space-y-4">
                    {trendingBlogs.slice(0, 3).map((post) => (
                      <Link key={post.id} href={`/blogs/${post.slug}`} className="group block">
                        <div className="flex gap-4">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <SafeBlogImage
                              src={post.images?.[0]?.url || post.featuredImage || "/images/fallback-image.png"}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-[#214B3F] transition-colors">
                              {post.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.viewCount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="bg-white border-t py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Continue Reading</h2>
              <p className="text-gray-600">More stories you might enjoy</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBlogs.map((post) => (
                <Link key={post.id} href={`/blogs/${post.slug}`} className="group">
                  <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <SafeBlogImage
                        src={post.images?.[0]?.url || post.featuredImage || "/images/fallback-image.png"}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime || 5} min</span>
                        <span className="text-gray-300">•</span>
                        <span>{format(parseISO(post.publishedAt || new Date().toISOString()), "MMM d")}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#214B3F] transition-colors">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/blogs">
                <Button variant="outline" className="border-[#214B3F] text-[#214B3F] hover:bg-[#214B3F] hover:text-white">
                  View All Articles
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-5xl w-full aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeBlogImage
                src={images[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => setShowImageModal(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length)}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
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
