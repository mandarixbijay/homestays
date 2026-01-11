"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Calendar, Clock, Eye, Share2, Bookmark,
  Facebook, Twitter, Linkedin, Link2, Check,
  Tag, Heart, ArrowLeft, ArrowRight,
  MessageSquare, Copy, TrendingUp, Mountain
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicBlog } from "@/lib/api/public-blog-api";
import SafeBlogImage from "@/components/blog/SafeBlogImage";
import OptimizedBlogContent from "@/components/blog/OptimizedBlogContent";
import { motion, useScroll } from "framer-motion";
import { toast } from "react-hot-toast";
import { TableOfContents } from "@/components/blog/TableOfContents";

interface BlogDetailClientProps {
  blog: PublicBlog;
  initialRelatedBlogs?: PublicBlog[];
  initialTrendingBlogs?: PublicBlog[];
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
  const [showShareMenu, setShowShareMenu] = useState(false);
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
  const mainImage = blog.images?.[0]?.url || blog.featuredImage || "/images/fallback-image.png";

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
    setShowShareMenu(false);
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
    <div className="min-h-screen bg-white" ref={contentRef}>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#214B3F] origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section */}
      <div className="relative w-full pt-16 sm:pt-20">
        <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh]">
        <SafeBlogImage
          src={mainImage}
          alt={blog.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back Button */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-8 z-10">
          <Link href="/blogs">
            <Button
              variant="ghost"
              size="sm"
              className="text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Categories */}
            {blog.categories && blog.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {blog.categories.map((cat: any) => (
                  <Badge
                    key={cat.id}
                    className="bg-[#D1AA5A] text-white border-0 text-xs"
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              {blog.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#214B3F] flex items-center justify-center text-white text-sm font-bold">
                  {blog.author.name.charAt(0)}
                </div>
                <span>{blog.author.name}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(blog.publishedAt || new Date().toISOString()), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime || 5} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{blog.viewCount.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Main Content Area - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Main Content Column */}
          <main className="lg:col-span-8">
            {/* Action Bar */}
            <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b py-3 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`rounded-full ${liked ? "text-red-500" : ""}`}
                >
                  <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
                  <span className="text-sm">{likes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={`rounded-full ${bookmarked ? "text-[#D1AA5A]" : ""}`}
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                </Button>
              </div>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="rounded-full"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Share</span>
                </Button>

                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border p-2 min-w-[160px] z-50">
                    <button
                      onClick={() => handleShare("facebook")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      <Twitter className="h-4 w-4 text-sky-500" />
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      <Linkedin className="h-4 w-4 text-blue-700" />
                      LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare("whatsapp")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 font-medium border-l-4 border-[#D1AA5A] pl-4">
                {blog.excerpt}
              </p>
            )}

            {/* Blog Content - Optimized with lazy-loaded images */}
            <OptimizedBlogContent
              content={blog.content}
              className="prose prose-lg max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-[#214B3F] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-ul:my-6 prose-ol:my-6
                prose-li:text-gray-700 prose-li:my-1
                prose-blockquote:border-l-4 prose-blockquote:border-[#D1AA5A] prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-gray-700 prose-blockquote:rounded-r-lg
                prose-img:rounded-lg prose-img:shadow-md prose-img:my-4 prose-img:mx-auto prose-img:max-w-full
                [&_img]:!mt-4 [&_img]:!mb-4 [&_img]:block [&_img]:mx-auto
                [&_figure]:my-6 [&_figure]:text-center
                [&_figcaption]:text-sm [&_figcaption]:text-gray-500 [&_figcaption]:mt-2
              "
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-gray-400" />
                  {blog.tags.map((tag: any) => (
                    <Link key={tag.id} href={`/blogs?tag=${tag.slug}`}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author Card */}
            <div className="mt-12 p-6 bg-gradient-to-r from-[#214B3F]/5 to-[#D1AA5A]/5 rounded-xl border">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#214B3F] to-[#2d6654] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {blog.author.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{blog.author.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Travel writer sharing authentic stories and experiences from Nepal&apos;s beautiful homestays.
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Table of Contents */}
              <div className="hidden lg:block bg-white rounded-xl border shadow-sm overflow-hidden">
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
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#214B3F]" />
                    Trending
                  </h3>
                  <div className="space-y-4">
                    {trendingBlogs.slice(0, 4).map((post) => (
                      <Link key={post.id} href={`/blogs/${post.slug}`} className="group block">
                        <div className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
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
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
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

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <div className="bg-gray-50 mt-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Stories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBlogs.slice(0, 4).map((relatedBlog) => (
                <Link key={relatedBlog.id} href={`/blogs/${relatedBlog.slug}`}>
                  <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow border-0 bg-white">
                    <div className="relative h-48 overflow-hidden">
                      <SafeBlogImage
                        src={relatedBlog.images?.[0]?.url || relatedBlog.featuredImage || "/images/fallback-image.png"}
                        alt={relatedBlog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Clock className="h-3 w-3" />
                        <span>{relatedBlog.readTime || 5} min</span>
                        <span>•</span>
                        <span>{format(parseISO(relatedBlog.publishedAt || new Date().toISOString()), "MMM d")}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#214B3F] transition-colors">
                        {relatedBlog.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/blogs">
                <Button variant="outline" className="rounded-full">
                  View All Stories
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
