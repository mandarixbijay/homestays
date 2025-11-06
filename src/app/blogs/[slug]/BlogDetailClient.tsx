// src/app/blogs/[slug]/BlogDetailClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Calendar, Clock, User, Eye, Share2, Bookmark, 
  Facebook, Twitter, Linkedin, Link2, Check,
  ChevronLeft, ArrowRight, Tag, Folder
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PublicBlog, publicBlogApi } from '@/lib/api/public-blog-api';
import SafeBlogImage from "@/components/blog/SafeBlogImage";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface BlogDetailClientProps {
  blog: PublicBlog;
}

export default function BlogDetailClient({ blog }: BlogDetailClientProps) {
  const [relatedBlogs, setRelatedBlogs] = useState<PublicBlog[]>([]);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    loadRelatedBlogs();
    
    // Check if bookmarked
    const bookmarks = JSON.parse(localStorage.getItem('blogBookmarks') || '[]');
    setBookmarked(bookmarks.includes(blog.id));
  }, [blog.id]);

  const loadRelatedBlogs = async () => {
    try {
      // Get blogs with similar categories or tags
      if (blog.categories && blog.categories.length > 0) {
        const response = await publicBlogApi.getPublishedBlogs({
          limit: 3,
        });
        const filtered = response.data.filter(b => b.id !== blog.id).slice(0, 3);
        setRelatedBlogs(filtered);
      }
    } catch (error) {
      console.error('Error loading related blogs:', error);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

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
      toast.success('Link copied to clipboard!');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative pt-24 pb-8 sm:pt-32 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href="/blogs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to all articles
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Categories */}
            {blog.categories && blog.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.categories.map((cat: any) => (
                  <Badge 
                    key={cat.id} 
                    variant="secondary"
                    className="text-xs"
                    style={cat.color ? { backgroundColor: cat.color + '20', color: cat.color } : undefined}
                  >
                    <Folder className="h-3 w-3 mr-1" />
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
            >
              {blog.title}
            </motion.h1>

            {/* Excerpt */}
            {blog.excerpt && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg sm:text-xl text-muted-foreground mb-8"
              >
                {blog.excerpt}
              </motion.p>
            )}

            {/* Meta Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-8"
            >
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{blog.author.name}</p>
                  <p className="text-xs">Author</p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-10" />
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {blog.publishedAt ? (
                  <span>{format(parseISO(blog.publishedAt), 'MMMM d, yyyy')}</span>
                ) : (
                  <span>Unpublished</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime || 5} min read</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{blog.viewCount.toLocaleString()} views</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className={bookmarked ? 'bg-primary/10 border-primary' : ''}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${bookmarked ? 'fill-current' : ''}`} />
                {bookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                  title="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                  title="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                  title="Share on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('copy')}
                  title="Copy link"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {blog.featuredImage && (
        <section className="mb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-5xl mx-auto"
            >
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
                <SafeBlogImage
                  src={blog.featuredImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sticky Sidebar */}
              <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Share */}
                  <Card className="p-4">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('facebook')}
                        className="w-full justify-start"
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('twitter')}
                        className="w-full justify-start"
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('linkedin')}
                        className="w-full justify-start"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('copy')}
                        className="w-full justify-start"
                      >
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </Button>
                    </div>
                  </Card>

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <Card className="p-4">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.map((tag: any) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                            style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color } : undefined}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </aside>

              {/* Article Content */}
              <article className="lg:col-span-3">
                <Card className="p-6 sm:p-8 lg:p-10">
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none
                      prose-headings:font-bold prose-headings:tracking-tight
                      prose-h1:text-3xl prose-h1:mb-4
                      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-ul:my-4 prose-ol:my-4
                      prose-li:text-foreground prose-li:my-2
                      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
                      prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
                      prose-img:rounded-lg prose-img:shadow-lg"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />

                  {/* Tags for mobile */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="lg:hidden mt-8 pt-8 border-t">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.map((tag: any) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color } : undefined}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Author Card */}
                <Card className="p-6 mt-8">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{blog.author.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        Content writer and travel enthusiast sharing authentic experiences and insider tips.
                      </p>
                    </div>
                  </div>
                </Card>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <RelatedBlogCard key={relatedBlog.id} blog={relatedBlog} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Related Blog Card Component
function RelatedBlogCard({ blog }: { blog: PublicBlog }) {
  return (
    <Link href={`/blogs/${blog.slug}`}>
      <Card className="group overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-40 overflow-hidden">
          <SafeBlogImage
            src={blog.featuredImage || '/images/default-blog.jpg'}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-base font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {blog.excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <Clock className="h-3 w-3" />
            <span>{blog.readTime || 5} min read</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}