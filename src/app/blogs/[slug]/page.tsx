// src/app/blogs/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { publicBlogApi, PublicBlog } from '@/lib/api/public-blog-api';
import BlogDetailClient from './BlogDetailClient';

// Use ISR (Incremental Static Regeneration) for better performance
// This ensures:
// - Pages are cached and served instantly
// - Background revalidation keeps content fresh
// - Much faster page loads (no SSR on every request)
// - Great SEO with fast Time to First Byte (TTFB)
export const revalidate = 3600; // Revalidate every hour

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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalhomestays.com';
    const metaDescription = blog.seoDescription ||
      (blog.excerpt.length > 160 ? blog.excerpt.substring(0, 157) + "..." : blog.excerpt);

    const publishedTime = blog.publishedAt;
    const modifiedTime = blog.publishedAt;

    // Get the main image or fallback
    const mainImage = blog.images?.find(img => img.isMain) || blog.images?.[0];
    const imageUrl = mainImage?.url || blog.featuredImage || `${baseUrl}/images/fallback-image.png`;
    const imageAlt = mainImage?.alt || blog.title;

    return {
      title: blog.seoTitle || `${blog.title} | Nepal Homestays`,
      description: metaDescription,
      keywords: [
        blog.title,
        'Nepal',
        'travel',
        'homestays',
        'Nepal travel guide',
        ...blog.categories.map(cat => cat.name),
        ...blog.tags.map(tag => tag.name)
      ].join(', '),
      authors: [{ name: blog.author.name, url: `${baseUrl}/authors/${blog.author.id}` }],
      creator: blog.author.name,
      publisher: 'Nepal Homestays',
      applicationName: 'Nepal Homestays',
      robots: {
        index: true,
        follow: true,
        nocache: false,
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
        url: `${baseUrl}/blogs/${blog.slug}`,
        siteName: 'Nepal Homestays',
        publishedTime,
        modifiedTime,
        authors: [blog.author.name],
        section: blog.categories[0]?.name || 'Travel',
        tags: blog.tags.map(tag => tag.name),
        images: [
          {
            url: imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`,
            width: 1200,
            height: 630,
            alt: imageAlt,
            type: 'image/jpeg',
          },
          // Additional images from gallery
          ...(blog.images?.slice(1, 4).map(img => ({
            url: img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`,
            width: 1200,
            height: 630,
            alt: img.alt || blog.title,
            type: 'image/jpeg',
          })) || [])
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.seoTitle || blog.title,
        description: metaDescription,
        creator: '@nepalhomestays',
        site: '@nepalhomestays',
        images: [imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`],
      },
      alternates: {
        canonical: `${baseUrl}/blogs/${blog.slug}`,
      },
      other: {
        'article:author': blog.author.name,
        'article:published_time': publishedTime,
        'article:modified_time': modifiedTime,
        'article:section': blog.categories[0]?.name || 'Travel',
        'article:tag': blog.tags.map(tag => tag.name).join(','),
        'og:locale': 'en_US',
        'og:site_name': 'Nepal Homestays',
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

// Note: generateStaticParams is not used with dynamic = 'force-dynamic'
// All pages are server-rendered on demand

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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalhomestays.com';

    // Enhanced Article Schema with all SEO best practices
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${baseUrl}/blogs/${blog.slug}#article`,
      headline: blog.title,
      description: blog.excerpt,
      image: {
        '@type': 'ImageObject',
        url: blog.images?.find(img => img.isMain)?.url || blog.featuredImage || `${baseUrl}/images/fallback-image.png`,
        width: 1200,
        height: 630,
        caption: blog.images?.find(img => img.isMain)?.caption || blog.title,
      },
      datePublished: blog.publishedAt,
      dateModified: blog.publishedAt,
      author: {
        '@type': 'Person',
        '@id': `${baseUrl}/authors/${blog.author.id}#person`,
        name: blog.author.name,
        url: `${baseUrl}/authors/${blog.author.id}`,
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        name: 'Nepal Homestays',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
          width: 600,
          height: 60,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/blogs/${blog.slug}`,
      },
      articleSection: blog.categories.map(cat => cat.name),
      keywords: blog.tags.map(tag => tag.name).join(', '),
      wordCount: blog.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length,
      timeRequired: `PT${blog.readTime || 5}M`,
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      about: {
        '@type': 'Thing',
        name: blog.categories[0]?.name || 'Travel in Nepal',
      },
    };

    // Breadcrumb Schema for better navigation
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${baseUrl}/blogs`,
        },
        ...(blog.categories[0] ? [{
          '@type': 'ListItem',
          position: 3,
          name: blog.categories[0].name,
          item: `${baseUrl}/blogs?category=${blog.categories[0].slug}`,
        }] : []),
        {
          '@type': 'ListItem',
          position: blog.categories[0] ? 4 : 3,
          name: blog.title,
          item: `${baseUrl}/blogs/${blog.slug}`,
        },
      ],
    };

    // Organization Schema for brand authority
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: 'Nepal Homestays',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: 'Authentic homestay experiences in Nepal',
      sameAs: [
        'https://facebook.com/nepalhomestays',
        'https://instagram.com/nepalhomestays',
        'https://twitter.com/nepalhomestays',
      ],
    };

    // WebPage Schema for better entity clarity
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${baseUrl}/blogs/${blog.slug}#webpage`,
      url: `${baseUrl}/blogs/${blog.slug}`,
      name: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt,
      isPartOf: {
        '@id': `${baseUrl}#website`,
      },
      primaryImageOfPage: {
        '@id': `${baseUrl}/blogs/${blog.slug}#primaryimage`,
      },
      datePublished: blog.publishedAt,
      dateModified: blog.publishedAt,
      breadcrumb: {
        '@id': `${baseUrl}/blogs/${blog.slug}#breadcrumb`,
      },
      inLanguage: 'en-US',
      potentialAction: [
        {
          '@type': 'ReadAction',
          target: [`${baseUrl}/blogs/${blog.slug}`],
        },
      ],
    };

    // FAQ Schema - Generate contextual FAQs based on blog content
    const generateFAQs = () => {
      const faqs = [];
      const categoryName = blog.categories[0]?.name || 'Travel';
      const location = blog.tags.find(tag =>
        ['kathmandu', 'pokhara', 'chitwan', 'everest', 'annapurna', 'mustang', 'langtang'].some(
          loc => tag.name.toLowerCase().includes(loc)
        )
      )?.name || 'Nepal';

      // FAQ 1: About the destination/topic
      faqs.push({
        '@type': 'Question',
        name: `What is the best time to explore ${location}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The best time to visit ${location} depends on your planned activities. For trekking and outdoor adventures, October to November (autumn) and March to May (spring) offer clear skies and comfortable temperatures. Winter (December to February) is ideal for cultural exploration with fewer tourists.`,
        },
      });

      // FAQ 2: About homestays
      faqs.push({
        '@type': 'Question',
        name: `Why should I choose a homestay in ${location}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Staying at a homestay in ${location} offers an authentic cultural experience. You'll enjoy home-cooked traditional meals, learn about local customs directly from families, and contribute to sustainable tourism that benefits local communities. Homestays provide a more intimate and meaningful travel experience compared to hotels.`,
        },
      });

      // FAQ 3: About the blog category
      faqs.push({
        '@type': 'Question',
        name: `What can I learn from ${categoryName.toLowerCase()} guides on Nepal Homestays?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Our ${categoryName.toLowerCase()} guides provide insider tips, hidden gems, and practical advice from experienced travelers and local experts. You'll discover off-the-beaten-path destinations, authentic cultural experiences, and helpful planning tips to make your Nepal journey memorable and hassle-free.`,
        },
      });

      // FAQ 4: Practical travel question
      faqs.push({
        '@type': 'Question',
        name: 'How do I book a homestay experience in Nepal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can browse and book homestays directly through Nepal Homestays website. Simply search for your preferred destination, view available homestays with photos and reviews, and book online. Our platform connects you directly with verified host families across Nepal for safe and authentic stays.',
        },
      });

      return faqs;
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${baseUrl}/blogs/${blog.slug}#faq`,
      mainEntity: generateFAQs(),
    };

    return (
      <>
        {/* Enhanced Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
    
    notFound();
  }
}