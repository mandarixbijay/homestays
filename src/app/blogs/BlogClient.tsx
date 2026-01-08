"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Search, Calendar, Clock, User, ChevronRight, ArrowRight,
  Filter, X, Star, Book, List, Hash, TrendingUp,
  Eye, Heart, MessageCircle, Sparkles, MapPin,
  Coffee, Mountain, Tent, Camera, Compass, Tag,
  Landmark, Utensils, Leaf, Globe, Map, ChevronDown, ChevronUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { publicBlogApi, PublicBlog } from '@/lib/api/public-blog-api';
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
  color?: string;
  icon?: string;
  _count?: { blogs: number };
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
  _count?: { blogs: number };
}

const categoryIcons: { [key: string]: any } = {
  adventure: Mountain,
  culture: Landmark,
  food: Utensils,
  nature: Leaf,
  photography: Camera,
  travel: Globe,
  default: Map
};

export default function BlogListClient({ searchParams: initialSearchParams }: BlogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current values from URL search params (syncs with browser history)
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
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Local state for form inputs (controlled components)
  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedTag, setSelectedTag] = useState(urlTag);
  const [currentPage, setCurrentPage] = useState(parseInt(urlPage));

  // Sync local state with URL params when they change (browser back/forward)
  useEffect(() => {
    setCurrentPage(parseInt(urlPage));
    setSelectedCategory(urlCategory);
    setSelectedTag(urlTag);
    setLocalSearch(urlSearch);
  }, [urlPage, urlCategory, urlTag, urlSearch]);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load blogs when URL params change
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

  // Build URL with current filters
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
    // Scroll to top when changing pages
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section Skeleton */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#214B3F]/5 to-[#D1AA5A]/5">
            <div className="absolute inset-0 bg-[url('/images/topography.svg')] opacity-5"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28 pb-20">
            <div className="text-center max-w-5xl mx-auto space-y-8">
              <div className="space-y-6">
                <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-full mx-auto" />
                <div className="space-y-4">
                  <div className="h-16 w-3/4 bg-gray-200 animate-pulse rounded mx-auto" />
                  <div className="h-16 w-2/3 bg-gray-200 animate-pulse rounded mx-auto" />
                </div>
                <div className="h-6 w-1/2 bg-gray-100 animate-pulse rounded mx-auto" />
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="h-14 bg-gray-200 animate-pulse rounded-2xl" />
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 w-24 bg-gray-200 animate-pulse rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Blogs Skeleton */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-2">
                <div className="h-10 w-64 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-48 bg-gray-100 animate-pulse rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <FeaturedBlogSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Skeleton */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12">
              <aside className="lg:w-80 flex-shrink-0 space-y-6">
                <div className="h-48 bg-gray-200 animate-pulse rounded-xl" />
                <div className="h-64 bg-gray-200 animate-pulse rounded-xl" />
              </aside>
              <div className="flex-1">
                <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <BlogCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#214B3F]/5 to-[#D1AA5A]/5">
          <div className="absolute inset-0 bg-[url('/images/topography.svg')] opacity-5"></div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-[#214B3F]/10 to-[#D1AA5A]/10 rounded-full blur-3xl"
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-[#D1AA5A]/10 to-[#214B3F]/10 rounded-full blur-3xl"
            animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#214B3F]/10 to-[#D1AA5A]/10 border border-[#D1AA5A]/30 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="h-4 w-4 text-[#D1AA5A]" />
              <span className="text-sm font-medium text-[#214B3F]">Explore Nepal&apos;s Hidden Gems</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#214B3F] to-[#2d6654] bg-clip-text text-transparent">
                Travel Stories
              </span>
              <br />
              <span className="text-card-foreground">That Inspire Adventure</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Immerse yourself in authentic experiences, local wisdom, and breathtaking journeys
              through the heart of Nepal&apos;s homestay culture
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl p-4 shadow-lg shadow-[#214B3F]/10 border border-[#214B3F]/10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#214B3F]/10 to-[#D1AA5A]/10 rounded-xl flex items-center justify-center mb-2">
                    <Book className="h-6 w-6 text-[#214B3F]" />
                  </div>
                  <div className="text-2xl font-bold text-card-foreground">{total}+</div>
                  <div className="text-sm text-muted-foreground">Stories</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl p-4 shadow-lg shadow-[#D1AA5A]/10 border border-[#D1AA5A]/10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D1AA5A]/10 to-[#214B3F]/10 rounded-xl flex items-center justify-center mb-2">
                    <MapPin className="h-6 w-6 text-[#214B3F]" />
                  </div>
                  <div className="text-2xl font-bold text-card-foreground">50+</div>
                  <div className="text-sm text-muted-foreground">Destinations</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl p-4 shadow-lg shadow-[#214B3F]/10 border border-[#214B3F]/10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#214B3F]/10 to-[#D1AA5A]/10 rounded-xl flex items-center justify-center mb-2">
                    <User className="h-6 w-6 text-[#214B3F]" />
                  </div>
                  <div className="text-2xl font-bold text-card-foreground">100+</div>
                  <div className="text-sm text-muted-foreground">Writers</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card rounded-2xl p-4 shadow-lg shadow-[#D1AA5A]/10 border border-[#D1AA5A]/10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D1AA5A]/10 to-[#214B3F]/10 rounded-xl flex items-center justify-center mb-2">
                    <Heart className="h-6 w-6 text-[#214B3F]" />
                  </div>
                  <div className="text-2xl font-bold text-card-foreground">1M+</div>
                  <div className="text-sm text-muted-foreground">Readers</div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-3xl mx-auto mb-10"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#214B3F] to-[#D1AA5A] rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-card rounded-2xl shadow-xl border border-gray-100 p-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search destinations, tips, stories..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-12 pr-4 h-14 text-base rounded-xl border-0 focus:ring-2 focus:ring-[#214B3F]/20 bg-gray-50/50"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={searchLoading}
                      className="h-14 px-8 rounded-xl bg-gradient-to-r from-[#214B3F] to-[#2d6654] text-white hover:from-[#214B3F]/90 hover:to-[#2d6654]/90 shadow-lg hover:shadow-xl transition-all"
                    >
                      {searchLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Search
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-center gap-3"
            >
              <div className={`flex flex-wrap justify-center gap-3 transition-all duration-300 ${showAllCategories ? 'max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#214B3F]/50 scrollbar-track-gray-100' : ''}`}>
                <Button
                  variant={!selectedCategory ? "default" : "outline"}
                  onClick={() => handleCategorySelect("")}
                  className={`rounded-full px-6 py-2 transition-all ${!selectedCategory
                      ? 'bg-gradient-to-r from-[#214B3F] to-[#2d6654] text-white shadow-lg'
                      : 'bg-card hover:bg-gray-50 border-gray-200'
                    }`}
                >
                  All Stories
                </Button>
                {(showAllCategories ? categories : categories.slice(0, 6)).map((category) => {
                  const IconComponent = categoryIcons[category.slug] || categoryIcons.default;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.slug ? "default" : "outline"}
                      onClick={() => handleCategorySelect(category.slug)}
                      className={`rounded-full px-6 py-2 transition-all ${selectedCategory === category.slug
                          ? 'bg-gradient-to-r from-[#214B3F] to-[#2d6654] text-white shadow-lg'
                          : 'bg-card hover:bg-gray-50 border-gray-200'
                        }`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {category.name}{' '}
                      {category._count?.blogs && (
                        <span className="ml-2 text-xs opacity-80">
                          {category._count.blogs}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
              {categories.length > 6 && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="text-[#214B3F] hover:text-[#214B3F]/80 flex items-center gap-2"
                >
                  {showAllCategories ? 'Show Less' : 'Show More'}
                  {showAllCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-[#D1AA5A]/20 to-[#214B3F]/20 rounded-xl">
                    <Star className="h-6 w-6 text-[#D1AA5A]" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground">Featured Stories</h2>
                </div>
                <p className="text-muted-foreground ml-14">Hand-picked adventures and experiences</p>
              </div>
              <Link href="/blogs?featured=true">
                <Button variant="ghost" className="group">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBlogs.map((blog) => (
                <div key={blog.id}>
                  <FeaturedBlogCard blog={blog} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full justify-between rounded-xl border-2 hover:border-[#214B3F] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters {hasActiveFilters && `(Active)`}
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
                      {hasActiveFilters && (
                        <Card className="p-6 bg-gradient-to-br from-[#214B3F]/10 to-[#D1AA5A]/10 border-[#214B3F]/20">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-card-foreground">Active Filters</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearFilters}
                              className="text-[#214B3F] hover:text-[#214B3F]/80"
                            >
                              Clear All
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {selectedCategory && (
                              <Badge className="mr-2 bg-card text-[#214B3F] border-[#214B3F]/30">
                                {categories.find(c => c.slug === selectedCategory)?.name}
                                <X
                                  className="h-3 w-3 ml-2 cursor-pointer"
                                  onClick={() => setSelectedCategory("")}
                                />
                              </Badge>
                            )}
                            {selectedTag && (
                              <Badge className="mr-2 bg-card text-[#D1AA5A] border-[#D1AA5A]/30">
                                {tags.find(t => t.slug === selectedTag)?.name}
                                <X
                                  className="h-3 w-3 ml-2 cursor-pointer"
                                  onClick={() => setSelectedTag("")}
                                />
                              </Badge>
                            )}
                          </div>
                        </Card>
                      )}

                      <Card className="p-6 bg-gradient-to-br from-[#214B3F] to-[#2d6654] text-white">
                        <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
                        <p className="text-sm mb-4 opacity-90 text-[#FFFFFF]">
                          Get weekly travel tips and stories</p>
                        <Input
                          type="email"
                          placeholder="Your email"
                          className="bg-card/20 border-white/30 placeholder:text-white/60 mb-3"
                        />
                        <Button className="w-full bg-[#D1AA5A] text-[#214B3F] hover:bg-[#D1AA5A]/90">
                          Subscribe
                        </Button>
                      </Card>

                      <Card className="p-6 bg-card shadow-lg">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Tag className="h-5 w-5 text-[#214B3F]" />
                          Popular Topics
                        </h3>
                        <div className={`flex flex-wrap gap-2 transition-all duration-300 ${showAllTags ? 'max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#214B3F]/50 scrollbar-track-gray-100' : ''}`}>
                          {(showAllTags ? tags : tags.slice(0, 8)).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant={selectedTag === tag.slug ? "default" : "outline"}
                              className={`cursor-pointer transition-all hover:scale-105 ${selectedTag === tag.slug
                                  ? 'bg-gradient-to-r from-[#214B3F] to-[#2d6654] border-0 text-white'
                                  : 'hover:border-[#214B3F] hover:bg-[#214B3F]/10'
                                }`}
                              onClick={() => handleTagSelect(tag.slug)}
                            >
                              {'#' + tag.name}{' '}
                              {tag._count?.blogs && tag._count.blogs > 0 && (
                                <span className="ml-1 text-xs opacity-70">
                                  {tag._count.blogs}
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                        {tags.length > 8 && (
                          <Button
                            variant="ghost"
                            onClick={() => setShowAllTags(!showAllTags)}
                            className="w-full mt-4 text-[#214B3F] hover:text-[#214B3F]/80 flex items-center justify-center gap-2"
                          >
                            {showAllTags ? 'Show Less' : 'Show More'}
                            {showAllTags ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        )}
                      </Card>

                      <Card className="p-6 bg-card shadow-lg">
                        <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                        <div className="space-y-3">
                          <Link href="/about" className="flex items-center gap-2 text-muted-foreground hover:text-[#214B3F] transition-colors">
                            <ChevronRight className="h-4 w-4" />
                            About Us
                          </Link>
                          <Link href="/contact" className="flex items-center gap-2 text-muted-foreground hover:text-[#214B3F] transition-colors">
                            <ChevronRight className="h-4 w-4" />
                            Contact
                          </Link>
                          <Link href="/homestays" className="flex items-center gap-2 text-muted-foreground hover:text-[#214B3F] transition-colors">
                            <ChevronRight className="h-4 w-4" />
                            Browse Homestays
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </aside>

            <div className="flex-1">
              {searchLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <BlogCardSkeleton key={i} />
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                <Card className="p-16 text-center bg-gradient-to-br from-gray-50 to-white">
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#214B3F]/10 to-[#D1AA5A]/10 rounded-full flex items-center justify-center">
                      <Search className="h-16 w-16 text-[#214B3F]" />
                    </div>
                    <h3 className="text-3xl font-bold text-card-foreground">No stories found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or explore different categories</p>
                    {hasActiveFilters && (
                      <Button
                        onClick={clearFilters}
                        className="bg-gradient-to-r from-[#214B3F] to-[#2d6654] text-white hover:from-[#214B3F]/90 hover:to-[#2d6654]/90"
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-card-foreground">
                        {hasActiveFilters ? 'Filtered Results' : 'Latest Stories'}
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        {total} {total === 1 ? 'article' : 'articles'} found
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Popular
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Calendar className="h-4 w-4 mr-2" />
                        Recent
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog, index) => (
                      <div key={blog.id}>
                        <BlogCard blog={blog} index={index} />
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-16 flex justify-center">
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

function FeaturedBlogCard({ blog }: { blog: BlogThumbnail }) {
  // For thumbnails, use featuredImage directly (no images array)
  const mainImage = blog.featuredImage || "/images/fallback-image.png";

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <Card className="group relative h-[500px] overflow-hidden hover:shadow-2xl transition-all duration-500 border-0">
        <div className="absolute inset-0">
          <SafeBlogImage
            src={mainImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-70 transition-opacity"></div>
        </div>

        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <Badge className="self-start mb-4 bg-[#D1AA5A] text-[#214B3F] border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime || 5} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{blog.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(blog.publishedAt || new Date().toISOString()), 'MMM d')}</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white line-clamp-2 group-hover:text-[#D1AA5A] transition-colors">
              {blog.title}
            </h3>

            <p className="text-white/80 line-clamp-2">
              {blog.excerpt}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-card/20 backdrop-blur rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-medium">{blog.author.name}</span>
              </div>
              <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function BlogCard({ blog, index }: { blog: BlogThumbnail; index: number }) {
  // For thumbnails, use featuredImage directly (no images array)
  const mainImage = blog.featuredImage || "/images/fallback-image.png";

  return (
    <Link href={`/blogs/${blog.slug}`}>
      <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-card">
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <SafeBlogImage
            src={mainImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          {blog.categories && blog.categories.length > 0 && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-[#D1AA5A]/20 backdrop-blur text-[#214B3F] border-[#D1AA5A]/50">
                {blog.categories[0].name}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{blog.readTime || 5} min</span>
            </div>
            <span className="text-muted-foreground/50">•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(parseISO(blog.publishedAt || new Date().toISOString()), 'MMM d, yyyy')}</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-card-foreground line-clamp-2 group-hover:text-[#214B3F] transition-colors">
            {blog.title}
          </h3>

          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {blog.excerpt}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#214B3F]/10 to-[#D1AA5A]/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-[#214B3F]" />
              </div>
              <span className="text-sm font-medium text-card-foreground">{blog.author.name}</span>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{blog.viewCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}


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
    <div className="flex items-center gap-2 bg-card rounded-full shadow-lg p-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full hover:bg-gray-100"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="ml-2 hidden sm:inline">Previous</span>
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant={1 === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(1)}
            className={`rounded-full min-w-[40px] ${1 === currentPage
                ? 'bg-gradient-to-r from-[#214B3F] to-[#2d6654] text-white'
                : 'hover:bg-gray-100'
              }`}
          >
            1
          </Button>
          {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "ghost"}
          size="sm"
          onClick={() => onPageChange(page)}
          className={`rounded-full min-w-[40px] ${page === currentPage
              ? 'bg-gradient-to-r from-[#214B3F] to-[#2d6654] text-white'
              : 'hover:bg-gray-100'
            }`}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
          <Button
            variant={totalPages === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className={`rounded-full min-w-[40px] ${totalPages === currentPage
                ? 'bg-gradient-to-r from-[#214B3F] to-[#2d6654] text-white'
                : 'hover:bg-gray-100'
              }`}
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
        className="rounded-full hover:bg-gray-100"
      >
        <span className="mr-2 hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}