"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Search, Calendar, Clock, User, ChevronRight, ArrowRight,
  Filter, X, Star, Book, List, Hash,
  Eye,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { publicBlogApi, PublicBlog } from '@/lib/api/public-blog-api';
import SafeBlogImage from "@/components/blog/SafeBlogImage";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface BlogClientProps {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
    tag?: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string;
  _count?: { blogs: number };
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
  _count?: { blogs: number };
}

export default function BlogListClient({ searchParams }: BlogClientProps) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<PublicBlog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<PublicBlog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [localSearch, setLocalSearch] = useState(searchParams.search || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || "");
  const [selectedTag, setSelectedTag] = useState(searchParams.tag || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.page || "1"));

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [selectedCategory, selectedTag, currentPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [blogsResponse, featuredResponse, categoriesResponse, tagsResponse] = await Promise.all([
        publicBlogApi.getPublishedBlogs({
          page: currentPage,
          limit: 12,
          search: localSearch || undefined,
        }),
        publicBlogApi.getFeaturedBlogs(3),
        publicBlogApi.getCategories(),
        publicBlogApi.getTags(),
      ]);

      setBlogs(blogsResponse.data);
      setTotalPages(blogsResponse.totalPages);
      setTotal(blogsResponse.total);
      setFeaturedBlogs(featuredResponse);
      setCategories(categoriesResponse as Category[]);
      setTags(tagsResponse as Tag[]);
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlogs = async () => {
    try {
      setSearchLoading(true);
      const response = await publicBlogApi.getPublishedBlogs({
        page: currentPage,
        limit: 12,
        category: selectedCategory || undefined,
        search: localSearch || undefined,
        tag: selectedTag || undefined,
      });

      setBlogs(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      router.push(
        `/blogs?page=${currentPage}${localSearch ? `&search=${localSearch}` : ''}${selectedCategory ? `&category=${selectedCategory}` : ''}${selectedTag ? `&tag=${selectedTag}` : ''}`
      );
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadBlogs();
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug === selectedCategory ? "" : categorySlug);
    setCurrentPage(1);
    loadBlogs();
  };

  const handleTagSelect = (tagSlug: string) => {
    setSelectedTag(tagSlug === selectedTag ? "" : tagSlug);
    setCurrentPage(1);
    loadBlogs();
  };

  const clearFilters = () => {
    setLocalSearch("");
    setSelectedCategory("");
    setSelectedTag("");
    setCurrentPage(1);
    loadBlogs();
  };

  const hasActiveFilters = localSearch || selectedCategory || selectedTag;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading amazing stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-teal-800">
              Discover Amazing Stories
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore authentic travel experiences, insider tips, and comprehensive guides
              to help you plan your perfect homestay adventure in Nepal
            </p>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-primary" /> {/* Changed from Sparkles */}
                <span><strong className="text-foreground">{total}</strong> inspiring articles</span>
              </div>
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-primary" /> {/* Changed from Folder */}
                <span><strong className="text-foreground">{categories.length}</strong> categories</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" /> {/* Changed from Tag */}
                <span><strong className="text-foreground">{tags.length}</strong> topics</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for travel tips, destinations, experiences..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 h-14 text-base rounded-full border-2 focus:border-primary shadow-lg focus:outline-none focus:ring-0"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary text-white hover:bg-primary/90"
                >
                  {searchLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                onClick={() => handleCategorySelect("")}
                className="whitespace-nowrap"
                size="sm"
              >
                All
              </Button>
              {categories.slice(0, 6).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? "default" : "outline"}
                  onClick={() => handleCategorySelect(category.slug)}
                  className="whitespace-nowrap"
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Star className="h-6 w-6 text-primary" /> {/* Changed from TrendingUp */}
              <h2 className="text-2xl sm:text-3xl font-bold">Featured Stories</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Restored gap to 6 */}
              {featuredBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FeaturedBlogCard blog={blog} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters and Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters {hasActiveFilters && `(${[selectedCategory, selectedTag].filter(Boolean).length})`}
                    </span>
                    {showFilters ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>

                <AnimatePresence>
                  {(showFilters || window.innerWidth >= 1024) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6"
                    >
                      {/* Active Filters */}
                      {hasActiveFilters && (
                        <Card className="p-4 bg-primary/5 border-primary/20">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm">Active Filters</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearFilters}
                              className="h-auto py-1 text-xs"
                            >
                              Clear All
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {selectedCategory && (
                              <Badge variant="secondary" className="mr-2">
                                Category: {categories.find(c => c.slug === selectedCategory)?.name}
                                <X
                                  className="h-3 w-3 ml-1 cursor-pointer"
                                  onClick={() => setSelectedCategory("")}
                                />
                              </Badge>
                            )}
                            {selectedTag && (
                              <Badge variant="secondary" className="mr-2">
                                Tag: {tags.find(t => t.slug === selectedTag)?.name}
                                <X
                                  className="h-3 w-3 ml-1 cursor-pointer"
                                  onClick={() => setSelectedTag("")}
                                />
                              </Badge>
                            )}
                          </div>
                        </Card>
                      )}

                      {/* Popular Tags */}
                      <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Hash className="h-5 w-5 text-primary" />
                          Popular Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {tags.slice(0, 12).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant={selectedTag === tag.slug ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/10 transition-colors"
                              onClick={() => handleTagSelect(tag.slug)}
                              style={
                                tag.color && selectedTag === tag.slug
                                  ? { backgroundColor: tag.color, borderColor: tag.color }
                                  : undefined
                              }
                            >
                              {tag.name}
                              {tag._count?.blogs && (
                                <span className="ml-1 text-xs opacity-60">
                                  ({tag._count.blogs})
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {searchLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Restored gap to 6 */}
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <BlogCardSkeleton key={i} />
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="h-24 w-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Search className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold">No blogs found</h3>
                    <p>Try adjusting your search or filters to find what you&apos;re looking for</p>

                    {hasActiveFilters && (
                      <Button onClick={clearFilters} variant="outline">
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                      {hasActiveFilters ? 'Filtered Results' : 'All Articles'}
                      <span className="ml-2 text-sm text-muted-foreground font-normal">
                        ({total} {total === 1 ? 'article' : 'articles'})
                      </span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Restored gap to 6 */}
                    {blogs.map((blog, index) => (
                      <motion.div
                        key={blog.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <BlogCard blog={blog} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Featured Blog Card Component
function FeaturedBlogCard({ blog }: { blog: PublicBlog }) {
  const mainImage = blog.images?.[0]?.url || blog.featuredImage || "/images/default-blog.jpg";
  const randomImage = blog.images && blog.images.length > 1 ? blog.images[Math.floor(Math.random() * blog.images.length)]?.url : null;

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <Card className="group overflow-hidden h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50">
        <div className="relative h-32 overflow-hidden"> {/* Adjusted to h-32 (8rem) */}
          <SafeBlogImage
            src={randomImage || mainImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{blog.readTime || 5} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{blog.viewCount} views</span>
            </div>
          </div>
          <h3 className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {blog.excerpt}
          </p>
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{blog.author.name}</span>
            </div>
            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Regular Blog Card Component
function BlogCard({ blog }: { blog: PublicBlog }) {
  const mainImage = blog.images?.[0]?.url || blog.featuredImage || "/images/default-blog.jpg";
  const randomImage = blog.images && blog.images.length > 1 ? blog.images[Math.floor(Math.random() * blog.images.length)]?.url : null;

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <Card className="group overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-28 overflow-hidden"> {/* Adjusted to h-28 (7rem) */}
          <SafeBlogImage
            src={randomImage || mainImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{blog.readTime || 5} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{blog.publishedAt ? format(parseISO(blog.publishedAt), 'MMM d, yyyy') : '—'}</span>
            </div>
          </div>
          <h3 className="text-base font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {blog.excerpt}
          </p>
          {blog.categories && blog.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {blog.categories.slice(0, 2).map((cat: any) => (
                <Badge key={cat.id} variant="secondary" className="text-xs">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

// Skeleton Loader
function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-28 bg-muted animate-pulse"></div> {/* Adjusted to match thumbnail height */}
      <div className="p-4 space-y-2">
        <div className="flex gap-2">
          <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
          <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="h-5 bg-muted animate-pulse rounded"></div>
        <div className="h-5 w-2/3 bg-muted animate-pulse rounded"></div>
        <div className="h-10 bg-muted animate-pulse rounded"></div>
      </div>
    </Card>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="text-primary border-primary hover:bg-primary/10"
      >
        Previous
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant={1 === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(1)}
            className="text-primary border-primary hover:bg-primary/10"
          >
            1
          </Button>
          {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className="text-primary border-primary hover:bg-primary/10"
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
          <Button
            variant={totalPages === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="text-primary border-primary hover:bg-primary/10"
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-primary border-primary hover:bg-primary/10"
      >
        Next
      </Button>
    </div>
  );
}