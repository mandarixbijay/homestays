"use client";
import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Head from "next/head";

const blogPosts = [
  {
    slug: "hidden-gems-annapurna-circuit",
    image: "/images/blog_home/annapurna-circuit.avif",
    title: "Discovering the Hidden Gems of the Annapurna Circuit",
    author: "Anya Sharma",
    date: "January 15, 2024",
    excerpt:
      "The Annapurna Circuit, a trek through the Himalayas in Nepal, is renowned for its breathtaking scenery and cultural richness...",
    category: "Trekking",
  },

  {
    slug: "weekend-getaway-pokhara",
    image: "/images/blog_home/getaway-pokhara.avif",
    title: "A Weekend Getaway in Pokhara",
    author: "Ravi Gurung",
    date: "April 20, 2025",
    excerpt:
      "Pokhara is the perfect escape for those seeking tranquility and adventure...",
    category: "Travel",
  },

  {
    slug: "hidden-gems-bhaktapur",
    image: "/images/blog_home/gems-bhaktapur.avif",
    title: "Discovering the Hidden Gems of Bhaktapur",
    author: "Anya Sharma",
    date: "May 15, 2025",
    excerpt:
      "Bhaktapur, a UNESCO World Heritage Site, is a city that transports you back in time...",
    category: "Culture",
  },
  {
    slug: "wildlife-adventures-chitwan",
    image: "/images/blog_home/adventure-chitwan.avif",
    title: "Wildlife Adventures in Chitwan",
    author: "Maya Tamang",
    date: "March 10, 2023",
    excerpt:
      "Chitwan National Park is a hawk for wildlife enthusiasts...",
    category: "Wildlife",
  },
  {
    slug: "spiritual-journey-lumbini",
    image: "/images/blog_home/journey-lumbini.avif",
    title: "Spiritual Journey to Lumbini",
    author: "Suman Shrestha",
    date: "February 5, 2023",
    excerpt:
      "Lumbini, the birthplace of Lord Buddha, is a place of serenity and reflection...",
    category: "Spirituality",
  },
];

export default function BlogPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demo purposes
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter posts based on search query and category
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Unique categories for filter
  const categories = [
    "All",
    ...new Set(blogPosts.map((post) => post.category)),
  ];

  return (
    <div className="bg-background min-h-screen font-manrope">
      <Head>
        <title>Blog | Nepal Homestays</title>
        <meta
          name="description"
          content="Explore authentic travel experiences in Nepal through our blog. Discover trekking adventures, cultural insights, and more with Nepal Homestays."
        />
        <meta name="keywords" content="Nepal, travel, homestays, trekking, culture, blog" />
        <meta name="robots" content="index, follow" />
      </Head>
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden mb-12 mt-20">
        <Image
          src="/images/blog_header.avif"
          alt="Discover Nepal with authentic homestay experiences"
          fill
          className="object-cover w-full h-full"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold px-4 sm:px-6 md:px-8 text-center max-w-4xl leading-tight drop-shadow-xl">
            Discover the Heart of Nepal: Authentic Homestay Experiences
          </h1>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-3xl font-bold text-text-primary mb-6">Latest Blog Posts</h2>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded-md border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-secondary"
            aria-label="Search blog posts"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-card text-text-secondary hover:bg-primary-30"
                  }`}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array(6)
              .fill(0)
              .map((_, idx) => (
                <div
                  key={idx}
                  className="bg-card rounded-lg shadow-sm animate-pulse flex flex-col overflow-hidden"
                >
                  <div className="w-full h-48 bg-muted" />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="h-6 bg-muted mb-2 rounded" />
                    <div className="h-4 bg-muted mb-3 rounded w-3/4" />
                    <div className="h-4 bg-muted mb-1 rounded" />
                    <div className="h-4 bg-muted mb-1 rounded" />
                    <div className="h-4 bg-muted mb-1 rounded w-1/2" />
                    <div className="h-4 bg-muted mt-auto rounded w-1/4" />
                  </div>
                </div>
              ))
            : filteredPosts.length > 0
              ? filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col overflow-hidden animate-fade-in"
                  onClick={() => router.push(`/blogs/${post.slug}`)}
                  role="article"
                  aria-label={`Blog post: ${post.title}`}
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={80}
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-text-primary mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="text-text-secondary text-sm mb-3">
                      By <span className="font-semibold">{post.author}</span> • {post.date}
                    </div>
                    <p className="text-text-primary text-base mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <span className="mt-auto text-accent font-semibold text-sm hover:underline transition-colors">
                      Read More
                    </span>
                  </div>
                </article>
              ))
              : <p className="text-text-secondary text-center col-span-full text-base">
                No posts found matching your criteria.
              </p>}
        </div>
      </section>

      <Footer />
    </div>
  );
}