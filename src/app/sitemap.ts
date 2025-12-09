import { MetadataRoute } from 'next';
import { publicBlogApi } from '@/lib/api/public-blog-api';
import { publicHomestayApi } from '@/lib/api/public-homestay-api';

// Force dynamic rendering - don't cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nepalhomestays.com';

  console.log('[Sitemap] Starting sitemap generation...');
  console.log('[Sitemap] Base URL:', baseUrl);

  try {
    // Fetch all published blogs using optimized thumbnails endpoint
    console.log('[Sitemap] Fetching blogs...');
    const blogsResponse = await publicBlogApi.getThumbnails({ limit: 1000 });
    const blogs = blogsResponse.data;
    console.log(`[Sitemap] ✅ Found ${blogs.length} blogs`);

    // Generate blog post URLs
    const blogUrls = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.publishedAt ? new Date(blog.publishedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: blog.featured ? 0.9 : 0.8,
    }));

    // Fetch all approved homestays
    console.log('[Sitemap] Fetching homestays...');
    const homestaysResponse = await publicHomestayApi.getApprovedHomestays();
    const homestays = homestaysResponse.data;
    console.log(`[Sitemap] ✅ Found ${homestays.length} approved homestays`);

    // Generate homestay profile URLs
    const homestayUrls = homestays.map((homestay) => ({
      url: `${baseUrl}/homestays/profile/${homestay.slug}`,
      lastModified: homestay.updatedAt ? new Date(homestay.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    console.log(`[Sitemap] Sample homestay URLs:`, homestayUrls.slice(0, 3));

    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/homestays`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blogs`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/list-your-property`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/help-center`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact-support`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/cancellation-options`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/safety-information`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/legal`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/partnerships`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/faqs`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
    ];

    const totalUrls = staticPages.length + blogUrls.length + homestayUrls.length;
    console.log(`[Sitemap] ✅ COMPLETE - Generated ${totalUrls} total URLs:`);
    console.log(`[Sitemap]   - ${staticPages.length} static pages`);
    console.log(`[Sitemap]   - ${blogUrls.length} blog posts`);
    console.log(`[Sitemap]   - ${homestayUrls.length} homestay profiles`);

    return [...staticPages, ...blogUrls, ...homestayUrls];
  } catch (error) {
    console.error('[Sitemap] ❌ Error generating sitemap:', error);

    // Return static pages only if fetch fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/homestays`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blogs`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ];
  }
}
