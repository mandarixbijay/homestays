// src/app/blogs/page.tsx
import { Metadata } from 'next';
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { publicBlogApi } from '@/lib/api/public-blog-api';
import { Suspense } from 'react';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Travel Blog | Nepal Homestays - Authentic Travel Stories & Guides',
  description: 'Discover authentic travel experiences in Nepal through our blog. Get insider tips on trekking, culture, homestays, and hidden gems from local experts.',
  keywords: 'Nepal travel blog, homestays, trekking guides, Nepal culture, adventure travel, authentic experiences, travel tips, Himalayas',
  openGraph: {
    title: 'Travel Blog | Nepal Homestays',
    description: 'Authentic travel stories and guides for exploring Nepal',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: '/blogs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Loading component for Suspense boundary
function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section Skeleton */}
      <section className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden mb-12 mt-20">
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
          <div className="text-center px-4">
            <div className="h-8 bg-gray-300 rounded mb-4 w-64 mx-auto animate-pulse" />
            <div className="h-12 bg-gray-300 rounded w-96 mx-auto animate-pulse" />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search and Filter Skeleton */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="w-full md:max-w-md">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded px-4 py-2 animate-pulse w-20" />
              ))}
            </div>
          </div>
        </div>

        {/* Featured Posts Skeleton */}
        <section className="mb-16">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-48 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4 animate-pulse" />
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Blog Grid Skeleton */}
        <section>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-32 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-6">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-2/3 animate-pulse" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Skeleton */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 mt-16">
          <div className="text-center">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-64 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-96 mx-auto animate-pulse" />
            <div className="flex gap-4 max-w-md mx-auto">
              <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; search?: string; tag?: string }>;
}) {
  // Await the searchParams since it's now a Promise in Next.js 15
  const params = await searchParams;
  
  return (
    <div className="bg-background min-h-screen font-manrope">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden mb-12 mt-20">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/blog_header.avif')`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 sm:px-6 md:px-8">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-xl max-w-4xl">
              Discover Nepal Through Authentic Stories
            </h1>
            <p className="text-white/90 text-lg sm:text-xl mt-4 max-w-2xl mx-auto drop-shadow-lg">
              Expert guides, cultural insights, and travel tips from local experts
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<BlogLoading />}>
        <BlogClient searchParams={params} /> {/* ✅ FIXED: Correct component usage */}
      </Suspense>

      <Footer />
    </div>
  );
}