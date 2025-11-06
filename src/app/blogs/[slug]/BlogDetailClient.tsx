"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Calendar, Clock, User, Eye, Share2, Bookmark,
  Facebook, Twitter, Linkedin, Link2, Check,
  ChevronLeft, Tag
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PublicBlog, publicBlogApi } from '@/lib/api/public-blog-api';
import SafeBlogImage from "@/components/blog/SafeBlogImage";
import { motion, useScroll, useTransform } from "framer-motion";
import { toast } from "react-hot-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"; // Assuming carousel component

interface BlogDetailClientProps {
  blog: PublicBlog;
}

export default function BlogDetailClient({ blog }: BlogDetailClientProps) {
  const [relatedBlogs, setRelatedBlogs] = useState<PublicBlog[]>([]);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    loadRelatedBlogs();
    const bookmarks = JSON.parse(localStorage.getItem('blogBookmarks') || '[]');
    setBookmarked(bookmarks.includes(blog.id));
  }, [blog.id]);

  const loadRelatedBlogs = async () => {
    try {
      if (blog.categories && blog.categories.length > 0) {
        const response = await publicBlogApi.getPublishedBlogs({ limit: 3 });
        const filtered = response.data.filter(b => b.id !== blog.id).slice(0, 3);
        setRelatedBlogs(filtered);
      }
    } catch (error) {
      console.error('Error loading related blogs:', error);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const images = blog.images?.map(img => img.url) || [blog.featuredImage || '/images/default-blog.jpg'];

  const handleShare = (platform: string) => {
    const title = encodeURIComponent(blog.title);
    const url = encodeURIComponent(shareUrl);
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } else if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('blogBookmarks') || '[]');
    if (bookmarked) {
      const updated = bookmarks.filter((id: number) => id !== blog.id);
      localStorage.setItem('blogBookmarks', JSON.stringify(updated));
      toast.success('Removed from bookmarks');
    } else {
      bookmarks.push(blog.id);
      localStorage.setItem('blogBookmarks', JSON.stringify(bookmarks));
      toast.success('Added to bookmarks');
    }
    setBookmarked(!bookmarked);
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 font-sans">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-teal-500"
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-10 sm:pt-28 sm:pb-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blogs" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors mb-6">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Blogs</span>
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Categories */}
            {blog.categories && blog.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.categories.map((cat: any) => (
                  <Badge
                    key={cat.id}
                    variant="secondary"
                    className="text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    style={cat.color ? { backgroundColor: cat.color + '20', color: cat.color } : undefined}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight"
            >
              {blog.title}
            </motion.h1>

            {/* Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-700">{blog.author.name}</span>
              </div>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>{format(parseISO(blog.publishedAt || new Date().toISOString()), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>{blog.readTime || 5} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-400" />
                <span>{blog.viewCount.toLocaleString()} views</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className={`border-gray-300 hover:border-gray-400 ${bookmarked ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${bookmarked ? 'fill-current' : ''}`} />
                {bookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('copy')}
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width Hero (Most Dramatic) */}
      {(blog.featuredImage || blog.images?.length) && (
        <section className="relative overflow-hidden">
          <div className="aspect-[16/9] relative">
            <div className="absolute inset-0">
              <SafeBlogImage
                src={images[currentImageIndex]}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/60'
                    }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Main Content */}
      <section className="py-16" ref={contentRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <article className="prose prose-lg max-w-none text-gray-800">
              <div
                className="prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-normal prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:mb-6 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-blockquote:border-l-2 prose-blockquote:border-blue-200 prose-blockquote:pl-4 prose-blockquote:text-gray-600 prose-blockquote:italic prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </article>

            {/* Author Info */}
            <Card className="mt-12 p-6 bg-white shadow-md">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{blog.author.name}</h3>
                  <p className="text-gray-600 text-sm">Travel writer sharing authentic Nepal experiences.</p>
                </div>
              </div>
            </Card>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-blue-600" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-100"
                      style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-10">More Stories to Explore</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <RelatedBlogCard key={relatedBlog.id} blog={relatedBlog} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Related Blog Card Component
function RelatedBlogCard({ blog }: { blog: PublicBlog }) {
  const mainImage = blog.images?.[0]?.url || blog.featuredImage || "/images/default-blog.jpg";
  const randomImage = blog.images && blog.images.length > 1 ? blog.images[Math.floor(Math.random() * blog.images.length)]?.url : null;

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
        <div className="relative h-48 overflow-hidden">
          <SafeBlogImage
            src={randomImage || mainImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {blog.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mt-2">{blog.excerpt}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
            <Clock className="h-4 w-4" />
            <span>{blog.readTime || 5} min read</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}