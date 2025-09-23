"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Search, Calendar, Clock, User, ChevronRight, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { publicBlogApi, PublicBlog } from '@/lib/api/public-blog-api';
import SafeBlogImage from "@/components/blog/SafeBlogImage";

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
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

export default function BlogClient({ searchParams }: BlogClientProps) {
  const [blogs, setBlogs] = useState<PublicBlog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<PublicBlog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Local search state
  const [localSearch, setLocalSearch] = useState(searchParams.search || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.page || "1"));

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load blogs when filters change
  useEffect(() => {
    loadBlogs();
  }, [selectedCategory, currentPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [blogsResponse, featuredResponse, categoriesResponse, tagsResponse] = await Promise.all([
        publicBlogApi.getPublishedBlogs({ 
          page: currentPage, 
          limit: 12,
          category: selectedCategory || undefined,
          search: searchParams.search || undefined,
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
      // Set empty data as fallback
      setBlogs([]);
      setFeaturedBlogs([]);
      setCategories([]);
      setTags([]);
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
      });

      setBlogs(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading blogs:', error);
      setBlogs([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = async (searchTerm: string) => {
    setLocalSearch(searchTerm);
    setCurrentPage(1);
    
    try {
      setSearchLoading(true);
      const response = await publicBlogApi.getPublishedBlogs({
        page: 1,
        limit: 12,
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
      });

      setBlogs(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Error searching blogs:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setLocalSearch("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get unique categories for filter
  const allCategories = ["All", ...categories.map(cat => cat.name)];

  // Filter featured blogs to avoid duplicates with regular blogs
  const displayFeaturedBlogs = featuredBlogs.filter(featured => 
    !blogs.some(blog => blog.id === featured.id)
  );

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          {/* Search and Filter Skeleton */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="w-full md:max-w-md h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
          </div>

          {/* Featured Posts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="h-64 bg-gray-200 dark:bg-gray-700" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Regular Posts Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Search and Filter */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(localSearch)}
              className="pl-10 h-12"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category || (category === "All" && !selectedCategory) ? "default" : "outline"}
                onClick={() => handleCategoryChange(category === "All" ? "" : category)}
                className="whitespace-nowrap"
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {localSearch && (
          <div className="mt-4 flex gap-4 items-center">
            <Button 
              onClick={() => handleSearch(localSearch)} 
              disabled={searchLoading}
              size="sm"
            >
              {searchLoading ? "Searching..." : "Search"}
            </Button>
            {(localSearch || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setLocalSearch("");
                  setSelectedCategory("");
                  setCurrentPage(1);
                  loadBlogs();
                }}
                size="sm"
              >
                Clear All
              </Button>
            )}
          </div>
        )}
        
        {total > 0 && (
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            {total} article{total !== 1 ? 's' : ''} found
            {selectedCategory && ` in ${selectedCategory}`}
            {localSearch && ` for "${localSearch}"`}
          </p>
        )}
      </div>

      {/* Featured Posts */}
      {!localSearch && !selectedCategory && displayFeaturedBlogs.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Articles</h2>
            <div className="flex items-center text-primary hover:text-primary/80 transition-colors">
              <span className="text-sm font-medium">View all featured</span>
              <ArrowRight className="ml-1 w-4 h-4" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {displayFeaturedBlogs.map((post) => (
              <article key={post.id}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <Link href={`/blogs/${post.slug}`}>
                    <div className="relative h-64">
                      <SafeBlogImage
                        src={post.featuredImage || '/images/default-blog.jpg'}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute top-4 left-4">
                        {post.categories[0] && (
                          <Badge 
                            className="bg-primary text-white"
                            style={{ backgroundColor: post.categories[0].color }}
                          >
                            {post.categories[0].name}
                          </Badge>
                        )}
                      </div>
                      {post.featured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-yellow-500 text-white">
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{format(parseISO(post.publishedAt), "MMM dd, yyyy")}</span>
                          </div>
                        </div>
                        {post.readTime && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{post.readTime} min read</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.slice(0, 3).map(tag => (
                            <Badge 
                              key={tag.id} 
                              variant="secondary" 
                              className="text-xs"
                              style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </Card>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* All Posts Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {localSearch ? `Search Results` : selectedCategory ? selectedCategory : 'Latest Articles'}
          </h2>
          {totalPages > 1 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>
        
        {searchLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <article key={post.id}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <Link href={`/blogs/${post.slug}`}>
                      <div className="relative h-48">
                        <SafeBlogImage
                          src={post.featuredImage || '/images/default-blog.jpg'}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute top-4 left-4">
                          {post.categories[0] && (
                            <Badge 
                              className="bg-primary text-white"
                              style={{ backgroundColor: post.categories[0].color }}
                            >
                              {post.categories[0].name}
                            </Badge>
                          )}
                        </div>
                        {post.featured && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-yellow-500 text-white text-xs">
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
                          {post.excerpt}
                        </p>
                        
                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.slice(0, 2).map(tag => (
                              <Badge 
                                key={tag.id} 
                                variant="secondary" 
                                className="text-xs"
                                style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              <span className="text-xs">{post.author.name}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span className="text-xs">{format(parseISO(post.publishedAt), "MMM dd, yyyy")}</span>
                            </div>
                          </div>
                          {post.readTime && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span className="text-xs">{post.readTime} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Card>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  size="sm"
                >
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        size="sm"
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {localSearch || selectedCategory
                  ? "Try adjusting your search or browse different categories."
                  : "No articles have been published yet. Check back soon!"}
              </p>
              {(localSearch || selectedCategory) && (
                <Button onClick={() => {
                  setLocalSearch("");
                  setSelectedCategory("");
                  setCurrentPage(1);
                  loadBlogs();
                }}>
                  Show All Articles
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-8 mt-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Updated with Our Latest Stories
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Get travel tips, cultural insights, and adventure guides delivered to your inbox. 
            Join our community of travelers exploring authentic Nepal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 h-12"
            />
            <Button className="whitespace-nowrap h-12 px-8">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            No spam, unsubscribe at any time
          </p>
        </div>
      </section>

      {/* Related Tags */}
      {tags.length > 0 && (
        <section className="mt-16">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Explore by Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 10).map(tag => (
              <Button
                key={tag.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  // Could implement tag filtering here
                  console.log('Filter by tag:', tag.slug);
                }}
                className="text-sm"
              >
                #{tag.name}
              </Button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}