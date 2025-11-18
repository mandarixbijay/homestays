// src/app/blogs/page.tsx
import { Metadata } from "next";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import BlogListClient from './BlogClient';

// Use on-demand revalidation via server actions
// Cache is updated when blogs are created/updated

export const metadata: Metadata = {
  title: "Travel Blog | Nepal Homestays - Stories, Tips & Guides",
  description: "Discover authentic travel stories, insider tips, and comprehensive guides about homestays and travel experiences in Nepal.",
  openGraph: {
    title: "Travel Blog | Nepal Homestays",
    description: "Explore authentic travel stories and expert guides for your Nepal adventure",
    images: ["/images/blog-og.jpg"],
  },
};

export default function BlogsPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string; search?: string; tag?: string };
}) {
  return (
    <div className="bg-background min-h-screen font-manrope">
      <Navbar />
      <BlogListClient searchParams={searchParams} />
      <Footer />
    </div>
  );
}