"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = ["All", "Trekking", "Destinations", "Culture", "Wildlife", "Spirituality"];

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  readingTime: number;
  views: number;
  featured: boolean;
  seoTitle: string;
  metaDescription: string;
}

interface BlogClientProps {
  blogPosts: BlogPost[];
}

export default function BlogClient({ blogPosts }: BlogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, blogPosts]);

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {filteredPosts.length > 0 && (
          <p className="text-gray-600 mt-4">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Featured Posts */}
      {selectedCategory === "All" && !searchQuery && featuredPosts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.slice(0, 2).map((post) => (
              <article key={post.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <Link href={`/blogs/${post.slug}`}>
                    <div className="relative h-64">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>By {post.author}</span>
                          <span>{format(parseISO(post.publishedAt), "MMM dd, yyyy")}</span>
                        </div>
                        <span>{post.readingTime} min read</span>
                      </div>
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
        {selectedCategory === "All" && !searchQuery ? (
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Articles</h2>
        ) : (
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {searchQuery ? `Search Results` : selectedCategory}
          </h2>
        )}
        
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(selectedCategory === "All" && !searchQuery ? regularPosts : filteredPosts).map((post) => (
              <article key={post.id}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <Link href={`/blogs/${post.slug}`}>
                    <div className="relative h-48">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                        <div className="flex flex-col space-y-1">
                          <span>By {post.author}</span>
                          <span>{format(parseISO(post.publishedAt), "MMM dd, yyyy")}</span>
                        </div>
                        <span className="text-xs">{post.readingTime} min read</span>
                      </div>
                    </div>
                  </Link>
                </Card>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or browse different categories.
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}>
              Show All Articles
            </Button>
          </div>
        )}
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gray-50 rounded-lg p-8 mt-16 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Stay Updated with Our Latest Stories
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Get travel tips, cultural insights, and adventure guides delivered to your inbox. 
          Join our community of travelers exploring authentic Nepal.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1"
          />
          <Button className="whitespace-nowrap">
            Subscribe
          </Button>
        </div>
      </section>
    </main>
  );
}