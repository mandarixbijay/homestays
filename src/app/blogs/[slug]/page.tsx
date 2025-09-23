// src/app/blogs/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { publicBlogApi, PublicBlog } from '@/lib/api/public-blog-api';
import BlogDetailClient from './BlogDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const blog = await publicBlogApi.getBlogBySlug(slug);

    if (!blog) {
      return {
        title: "Post Not Found | Nepal Homestays",
        description: "The requested blog post could not be found.",
      };
    }

    const metaDescription = blog.seoDescription || 
      (blog.excerpt.length > 160 ? blog.excerpt.substring(0, 157) + "..." : blog.excerpt);

    const publishedTime = blog.publishedAt;
    const modifiedTime = blog.publishedAt;

    return {
      title: blog.seoTitle || `${blog.title} | Nepal Homestays`,
      description: metaDescription,
      keywords: [
        blog.title,
        'Nepal',
        'travel',
        'homestays',
        ...blog.categories.map(cat => cat.name),
        ...blog.tags.map(tag => tag.name)
      ].join(', '),
      authors: [{ name: blog.author.name }],
      creator: blog.author.name,
      publisher: 'Nepal Homestays',
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
      openGraph: {
        title: blog.seoTitle || blog.title,
        description: metaDescription,
        type: 'article',
        locale: 'en_US',
        url: `https://nepalhomestays.com/blogs/${blog.slug}`,
        siteName: 'Nepal Homestays',
        publishedTime,
        modifiedTime,
        authors: [blog.author.name],
        section: blog.categories[0]?.name || 'Travel',
        tags: blog.tags.map(tag => tag.name),
        images: [
          {
            url: blog.featuredImage || '/images/default-blog.jpg',
            width: 1200,
            height: 630,
            alt: blog.title,
            type: 'image/jpeg',
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.seoTitle || blog.title,
        description: metaDescription,
        creator: '@nepalhomestays',
        site: '@nepalhomestays',
        images: [blog.featuredImage || '/images/default-blog.jpg'],
      },
      alternates: {
        canonical: `/blogs/${blog.slug}`,
      },
      other: {
        'article:author': blog.author.name,
        'article:published_time': publishedTime,
        'article:modified_time': modifiedTime,
        'article:section': blog.categories[0]?.name || 'Travel',
        'article:tag': blog.tags.map(tag => tag.name).join(','),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Blog Post | Nepal Homestays",
      description: "Discover authentic travel experiences in Nepal.",
    };
  }
}

export async function generateStaticParams() {
  try {
    // Generate static params for the first few pages of blogs
    const response = await publicBlogApi.getPublishedBlogs({ limit: 50 });
    return response.data.map((blog) => ({
      slug: blog.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function BlogDetailPage({ params }: Props) {
  try {
    const { slug } = await params;
    console.log(`[BlogDetailPage] Loading blog with slug: ${slug}`);
    
    const blog = await publicBlogApi.getBlogBySlug(slug);

    if (!blog) {
      console.log(`[BlogDetailPage] Blog not found for slug: ${slug}`);
      notFound();
    }

    console.log(`[BlogDetailPage] Blog loaded successfully:`, blog.title);

    // Generate JSON-LD structured data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.excerpt,
      image: [blog.featuredImage || '/images/default-blog.jpg'],
      datePublished: blog.publishedAt,
      dateModified: blog.publishedAt,
      author: {
        '@type': 'Person',
        name: blog.author.name,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Nepal Homestays',
        logo: {
          '@type': 'ImageObject',
          url: 'https://nepalhomestays.com/logo.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://nepalhomestays.com/blogs/${blog.slug}`,
      },
      articleSection: blog.categories[0]?.name || 'Travel',
      keywords: blog.tags.map(tag => tag.name).join(','),
      wordCount: blog.content.replace(/<[^>]*>/g, '').split(' ').length,
      timeRequired: `PT${blog.readTime || 5}M`,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="bg-background min-h-screen font-manrope">
          <Navbar />
          <BlogDetailClient blog={blog} />
          <Footer />
        </div>
      </>
    );
  } catch (error: any) {
    console.error('[BlogDetailPage] Error loading blog post:', error);
    
    // For development, show more detailed error
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="bg-background min-h-screen font-manrope">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-800 mb-4">Development Error</h1>
              <p className="text-red-700 mb-4">Failed to load blog post with slug: <code>{(await params)?.slug ?? 'unknown'}</code></p>
              <details className="text-sm">
                <summary className="cursor-pointer text-red-600 font-medium">Error Details</summary>
                <pre className="mt-2 bg-red-100 p-3 rounded text-xs overflow-auto">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
              <div className="mt-4">
                <Link href="/blogs" className="text-blue-600 hover:underline">← Back to Blog List</Link>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      );
    }
    
    // For production, show generic error or redirect
    notFound();
  }
}