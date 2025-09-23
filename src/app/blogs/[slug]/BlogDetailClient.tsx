// src/app/blogs/[slug]/BlogDetailClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon,
  ArrowLeft,
  Eye,
  BookOpen,
  Tag,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { publicBlogApi, PublicBlog } from '@/lib/api/public-blog-api';
import SafeBlogImage from '@/components/blog/SafeBlogImage';

interface BlogDetailClientProps {
  blog: PublicBlog;
}

export default function BlogDetailClient({ blog }: BlogDetailClientProps) {
  const [relatedBlogs, setRelatedBlogs] = useState<PublicBlog[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Load related blogs
  useEffect(() => {
    loadRelatedBlogs();
  }, [blog.slug]);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const article = document.getElementById('article-content');
      if (!article) return;

      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      const articleStart = articleTop - windowHeight * 0.1;
      const articleEnd = articleTop + articleHeight - windowHeight * 0.9;
      
      if (scrollTop < articleStart) {
        setReadingProgress(0);
      } else if (scrollTop > articleEnd) {
        setReadingProgress(100);
      } else {
        const progress = ((scrollTop - articleStart) / (articleEnd - articleStart)) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadRelatedBlogs = async () => {
    try {
      const related = await publicBlogApi.getRelatedBlogs(blog.slug, 3);
      setRelatedBlogs(related);
    } catch (error) {
      console.error('Error loading related blogs:', error);
      setRelatedBlogs([]);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blog.title;

  const handleShare = (platform: string) => {
    setIsSharing(true);
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setTimeout(() => setIsSharing(false), 1000);
        return;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setTimeout(() => setIsSharing(false), 1000);
  };

  const mainImage = blog.images?.find(img => img.isMain) || blog.images?.[0];
  const additionalImages = blog.images?.filter(img => !img.isMain) || [];

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden">
        {mainImage ? (
          <SafeBlogImage
            src={mainImage.url}
            alt={mainImage.alt || blog.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={90}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <Link href="/blogs" className="hover:text-white transition-colors">
                  Blog
                </Link>
                <ChevronRight className="w-4 h-4" />
                {blog.categories[0] && (
                  <>
                    <span>{blog.categories[0].name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
                <span className="text-white truncate">{blog.title}</span>
              </div>
            </nav>

            {/* Category Badge */}
            {blog.categories[0] && (
              <Badge 
                className="mb-4 text-white"
                style={{ backgroundColor: blog.categories[0].color || '#3B82F6' }}
              >
                {blog.categories[0].name}
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-6 max-w-4xl">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">{blog.author.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{format(parseISO(blog.publishedAt), "MMMM dd, yyyy")}</span>
              </div>
              {blog.readTime && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{blog.readTime} min read</span>
                </div>
              )}
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                <span>{blog.viewCount.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
          <Link href="/blogs">
            <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Article Content */}
          <article className="lg:col-span-3">
            {/* Excerpt */}
            {blog.excerpt && (
              <div className="mb-8">
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {blog.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div 
              id="article-content"
              className="prose prose-lg dark:prose-invert max-w-none
                         prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                         prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                         prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                         prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                         prose-a:text-primary prose-a:font-medium hover:prose-a:text-primary/80
                         prose-strong:text-gray-900 dark:prose-strong:text-white
                         prose-ul:my-6 prose-ol:my-6
                         prose-li:my-2 prose-li:text-gray-700 dark:prose-li:text-gray-300
                         prose-blockquote:border-l-4 prose-blockquote:border-primary 
                         prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6
                         prose-img:rounded-lg prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags.length > 0 && (
              <section className="mt-12">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="secondary"
                      className="hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      style={{ 
                        backgroundColor: tag.color ? `${tag.color}20` : undefined,
                        borderColor: tag.color 
                      }}
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Share Section */}
            <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Share this article
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                  disabled={isSharing}
                  className="flex items-center"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                  disabled={isSharing}
                  className="flex items-center"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                  disabled={isSharing}
                  className="flex items-center"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('copy')}
                  disabled={isSharing}
                  className="flex items-center"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {isSharing ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Table of Contents */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  In this article
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">
                    {blog.content.replace(/<[^>]*>/g, '').split(' ').length} words
                  </div>
                </div>
              </Card>

              {/* Author Info */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  About the Author
                </h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {blog.author.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {blog.author.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Travel Writer
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Passionate about authentic travel experiences and cultural immersion in Nepal.
                </p>
              </Card>

              {/* Newsletter Signup */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Stay Updated
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Get the latest travel guides and tips delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Button size="sm" className="w-full">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  No spam, unsubscribe anytime
                </p>
              </Card>
            </div>
          </aside>
        </div>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <article key={relatedBlog.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full">
                    <Link href={`/blogs/${relatedBlog.slug}`}>
                      <div className="relative h-48">
                        <SafeBlogImage
                          src={relatedBlog.featuredImage || '/images/default-blog.jpg'}
                          alt={relatedBlog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {relatedBlog.categories[0] && (
                          <div className="absolute top-4 left-4">
                            <Badge 
                              className="text-white"
                              style={{ backgroundColor: relatedBlog.categories[0].color }}
                            >
                              {relatedBlog.categories[0].name}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {relatedBlog.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                          {relatedBlog.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{format(parseISO(relatedBlog.publishedAt), "MMM dd, yyyy")}</span>
                          </div>
                          {relatedBlog.readTime && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{relatedBlog.readTime} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Card>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Experience Nepal?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Discover authentic homestays and create unforgettable memories in the heart of the Himalayas. 
              Browse our curated collection of verified accommodations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/homestays">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Homestays
                </Button>
              </Link>
              <Link href="/blogs">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  More Travel Guides
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        {/* Navigation to Next/Previous Posts */}
        <section className="mt-12">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link href="/blogs" className="flex-1">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center text-primary mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Back to</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  All Articles
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Explore more travel guides
                </p>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
                  