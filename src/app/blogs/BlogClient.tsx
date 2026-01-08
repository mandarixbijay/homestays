"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Search, Calendar, Clock, User, ChevronRight, ArrowRight,
  Filter, X, Star, Book, TrendingUp,
  Eye, Heart, Sparkles, MapPin, Tag, ChevronDown, ChevronUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { publicBlogApi } from '@/lib/api/public-blog-api';
import { BlogThumbnail } from '@/types/blogs';
import SafeBlogImage from "@/components/blog/SafeBlogImage";
import { BlogCardSkeleton, FeaturedBlogSkeleton } from "@/components/blog/BlogSkeletons";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

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
  _count?: { blogs: number };
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  _count?: { blogs: number };
}

export default function BlogListClient({ searchParams: initialSearchParams }: BlogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlPage = searchParams.get('page') || '1';
  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlTag = searchParams.get('tag') || '';

  const [blogs, setBlogs] = useState<BlogThumbnail[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogThumbnail[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedTag, setSelectedTag] = useState(urlTag);
  const [currentPage, setCurrentPage] = useState(parseInt(urlPage));

  useEffect(() => {
    setCurrentPage(parseInt(urlPage));
    setSelectedCategory(urlCategory);
    setSelectedTag(urlTag);
    setLocalSearch(urlSearch);
  }, [urlPage, urlCategory, urlTag, urlSearch]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadBlogs();
    }
  }, [urlPage, urlCategory, urlTag]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [blogsResponse, featuredResponse, categoriesResponse, tagsResponse] = await Promise.all([
        publicBlogApi.getThumbnails({
          page: parseInt(urlPage),
          limit: 12,
          search: urlSearch || undefined,
          category: urlCategory || undefined,
          tag: urlTag || undefined,
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
      const response = await publicBlogApi.getThumbnails({
        page: parseInt(urlPage),
        limit: 12,
        category: urlCategory || undefined,
        search: urlSearch || undefined,
        tag: urlTag || undefined,
      });

      setBlogs(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const buildUrl = (overrides: { page?: number; search?: string; category?: string; tag?: string } = {}) => {
    const params = new URLSearchParams();
    const page = overrides.page ?? currentPage;
    const search = overrides.search ?? localSearch;
    const category = overrides.category ?? selectedCategory;
    const tag = overrides.tag ?? selectedTag;

    if (page > 1) params.set('page', page.toString());
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);

    const queryString = params.toString();
    return `/blogs${queryString ? `?${queryString}` : ''}`;
  };

  const handleSearch = () => {
    const newPage = 1;
    setCurrentPage(newPage);
    router.push(buildUrl({ page: newPage, search: localSearch }));
  };

  const handleCategorySelect = (categorySlug: string) => {
    const newCategory = categorySlug === selectedCategory ? "" : categorySlug;
    setSelectedCategory(newCategory);
    setCurrentPage(1);
    router.push(buildUrl({ page: 1, category: newCategory }));
  };

  const handleTagSelect = (tagSlug: string) => {
    const newTag = tagSlug === selectedTag ? "" : tagSlug;
    setSelectedTag(newTag);
    setCurrentPage(1);
    router.push(buildUrl({ page: 1, tag: newTag }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push(buildUrl({ page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setLocalSearch("");
    setSelectedCategory("");
    setSelectedTag("");
    setCurrentPage(1);
    router.push('/blogs');
  };

  const hasActiveFilters = localSearch || selectedCategory || selectedTag;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Skeleton */}
        <section className="bg-gradient-to-b from-[#214B3F] to-[#2d6654] pt-32 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <div className="h-12 w-96 bg-white/20 animate-pulse rounded-lg mx-auto" />
              <div className="h-6 w-64 bg-white/10 animate-pulse rounded mx-auto" />
              <div className="h-14 max-w-2xl bg-white/20 animate-pulse rounded-xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Content Skeleton */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Glassmorphic Design */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-[#214B3F] via-[#2d6654] to-[#214B3F]">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D1AA5A]/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D1AA5A]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Travel Stories & Guides
            </h1>
            <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto drop-shadow">
              Discover authentic experiences, local wisdom, and breathtaking journeys through Nepal
            </p>

            {/* Glassmorphic Search Bar */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="relative bg-white/20 backdrop-blur-xl rounded-2xl p-2 border border-white/30 shadow-2xl">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                    <Input
                      type="text"
                      placeholder="Search articles..."
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-12 h-12 border-0 focus-visible:ring-0 bg-white/10 text-white placeholder:text-white/60 text-base rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="h-12 px-6 bg-white text-[#214B3F] hover:bg-white/90 rounded-xl font-semibold shadow-lg"
                  >
                    {searchLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#214B3F] border-t-transparent" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Glassmorphic Category Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleCategorySelect("")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border ${
                  !selectedCategory
                    ? 'bg-white text-[#214B3F] border-white shadow-lg'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40'
                }`}
              >
                All
              </button>
              {categories.slice(0, 6).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.slug)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md border ${
                    selectedCategory === category.slug
                      ? 'bg-white text-[#214B3F] border-white shadow-lg'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40'
                  }`}
                >
                  {category.name}
                  {category._count?.blogs && (
                    <span className="ml-1.5 opacity-70">({category._count.blogs})</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-center gap-8 sm:gap-12 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="p-2 bg-[#214B3F]/10 rounded-lg">
                <Book className="h-4 w-4 text-[#214B3F]" />
              </div>
              <span><strong className="text-gray-900">{total}</strong> Articles</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="p-2 bg-[#214B3F]/10 rounded-lg">
                <MapPin className="h-4 w-4 text-[#214B3F]" />
              </div>
              <span><strong className="text-gray-900">50+</strong> Destinations</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="p-2 bg-[#214B3F]/10 rounded-lg">
                <Heart className="h-4 w-4 text-[#214B3F]" />
              </div>
              <span><strong className="text-gray-900">10K+</strong> Readers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      {featuredBlogs.length > 0 && !hasActiveFilters && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#D1AA5A]/10 rounded-lg">
                  <Star className="h-5 w-5 text-[#D1AA5A]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Stories</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Large Featured Card */}
              <div className="lg:col-span-2">
                <FeaturedCardLarge blog={featuredBlogs[0]} />
              </div>

              {/* Small Featured Cards */}
              <div className="space-y-6">
                {featuredBlogs.slice(1, 3).map((blog) => (
                  <FeaturedCardSmall key={blog.id} blog={blog} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Sidebar */}
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
                      Filters {hasActiveFilters && "(Active)"}
                    </span>
                    {showFilters ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>

                <AnimatePresence>
                  {(showFilters || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6"
                    >
                      {/* Active Filters */}
                      {hasActiveFilters && (
                        <Card className="p-4 bg-[#214B3F]/5 border-[#214B3F]/10">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-900">Active Filters</span>
                            <button
                              onClick={clearFilters}
                              className="text-sm text-[#214B3F] hover:underline"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedCategory && (
                              <Badge className="bg-white text-[#214B3F] border border-[#214B3F]/20">
                                {categories.find(c => c.slug === selectedCategory)?.name}
                                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleCategorySelect("")} />
                              </Badge>
                            )}
                            {selectedTag && (
                              <Badge className="bg-white text-[#D1AA5A] border border-[#D1AA5A]/20">
                                {tags.find(t => t.slug === selectedTag)?.name}
                                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleTagSelect("")} />
                              </Badge>
                            )}
                          </div>
                        </Card>
                      )}

                      {/* Popular Topics */}
                      <Card className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Tag className="h-4 w-4 text-[#214B3F]" />
                          Popular Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(showAllTags ? tags : tags.slice(0, 10)).map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => handleTagSelect(tag.slug)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                selectedTag === tag.slug
                                  ? 'bg-[#214B3F] text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              #{tag.name}
                            </button>
                          ))}
                        </div>
                        {tags.length > 10 && (
                          <button
                            onClick={() => setShowAllTags(!showAllTags)}
                            className="mt-3 text-sm text-[#214B3F] hover:underline flex items-center gap-1"
                          >
                            {showAllTags ? 'Show less' : `Show all (${tags.length})`}
                            {showAllTags ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        )}
                      </Card>

                      {/* Newsletter */}
                      <Card className="p-5 bg-gradient-to-br from-[#214B3F] to-[#2d6654] text-white">
                        <h3 className="font-semibold mb-2">Stay Updated</h3>
                        <p className="text-sm text-white/80 mb-4">
                          Get travel tips and stories delivered weekly.
                        </p>
                        <Input
                          type="email"
                          placeholder="Your email"
                          className="mb-3 bg-white/10 border-white/20 placeholder:text-white/50 text-white"
                        />
                        <Button className="w-full bg-[#D1AA5A] hover:bg-[#c49d4f] text-[#214B3F] font-medium">
                          Subscribe
                        </Button>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </aside>

            {/* Blog Grid */}
            <div className="flex-1">
              {searchLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <BlogCardSkeleton key={i} />
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  )}
                </Card>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {hasActiveFilters ? 'Search Results' : 'Latest Articles'}
                      </h2>
                      <p className="text-sm text-gray-500">{total} articles</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Popular
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Recent
                      </Button>
                    </div>
                  </div>

                  {/* Blog Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
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

// Featured Card - Large
function FeaturedCardLarge({ blog }: { blog: BlogThumbnail }) {
  const mainImage = blog.featuredImage || "/images/fallback-image.png";

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <Card className="group relative h-[400px] lg:h-full overflow-hidden border-0">
        <SafeBlogImage
          src={mainImage}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Badge className="mb-3 bg-[#D1AA5A] text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
          <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#D1AA5A] transition-colors">
            {blog.title}
          </h3>
          <p className="text-white/80 line-clamp-2 mb-4">{blog.excerpt}</p>
          <div className="flex items-center gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {blog.readTime || 5} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {blog.viewCount.toLocaleString()}
            </span>
            <span>{blog.author.name}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Featured Card - Small
function FeaturedCardSmall({ blog }: { blog: BlogThumbnail }) {
  const mainImage = blog.featuredImage || "/images/fallback-image.png";

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <Card className="group flex h-[180px] overflow-hidden border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="relative w-40 flex-shrink-0">
          <SafeBlogImage
            src={mainImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center p-4 flex-1">
          <Badge className="self-start mb-2 bg-[#D1AA5A]/10 text-[#D1AA5A] border-0 text-xs">
            Featured
          </Badge>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#214B3F] transition-colors mb-2">
            {blog.title}
          </h3>
          <div className="flex items-center gap-3 text-gray-500 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {blog.readTime || 5} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {blog.viewCount.toLocaleString()}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Blog Card
function BlogCard({ blog }: { blog: BlogThumbnail }) {
  const mainImage = blog.featuredImage || "/images/fallback-image.png";

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <Card className="group h-full overflow-hidden border-0 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="relative h-48 overflow-hidden">
          <SafeBlogImage
            src={mainImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {blog.categories && blog.categories.length > 0 && (
            <Badge className="absolute top-3 left-3 bg-white/90 text-gray-700 border-0 text-xs">
              {blog.categories[0].name}
            </Badge>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(parseISO(blog.publishedAt || new Date().toISOString()), 'MMM d, yyyy')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {blog.readTime || 5} min
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#214B3F] transition-colors">
            {blog.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {blog.excerpt}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#214B3F] flex items-center justify-center text-white text-xs font-medium">
                {blog.author.name.charAt(0)}
              </div>
              <span className="text-sm text-gray-700">{blog.author.name}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Eye className="h-4 w-4" />
              {blog.viewCount.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Pagination
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
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-2"
      >
        Previous
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant={1 === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(1)}
            className={1 === currentPage ? "bg-[#214B3F]" : ""}
          >
            1
          </Button>
          {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "ghost"}
          size="sm"
          onClick={() => onPageChange(page)}
          className={page === currentPage ? "bg-[#214B3F]" : ""}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
          <Button
            variant={totalPages === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className={totalPages === currentPage ? "bg-[#214B3F]" : ""}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-2"
      >
        Next
      </Button>
    </div>
  );
}
