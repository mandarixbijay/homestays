import { MetadataRoute } from 'next';
import { publicBlogApi } from '@/lib/api/public-blog-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalhomestays.com';

  try {
    // Fetch all published blogs using optimized thumbnails endpoint
    const blogsResponse = await publicBlogApi.getThumbnails({ limit: 1000 });
    const blogs = blogsResponse.data;

    // Generate blog post URLs
    const blogUrls = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.publishedAt ? new Date(blog.publishedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: blog.featured ? 0.9 : 0.8,
    }));

    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blogs`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
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
    ];

    return [...staticPages, ...blogUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Return static pages only if blog fetch fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
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
