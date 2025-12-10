import { MetadataRoute } from 'next';
import { publicBlogApi } from '@/lib/api/public-blog-api';
import { publicHomestayApi } from '@/lib/api/public-homestay-api';

// Force dynamic rendering - don't cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to generate community slug
function generateCommunitySlug(name: string, location: string, id: number): string {
  const slugName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const slugLocation = location
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slugName}-${slugLocation}-${id}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nepalhomestays.com';

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

    // Fetch all approved homestays
    const homestaysResponse = await publicHomestayApi.getApprovedHomestays();
    const homestays = homestaysResponse.data;

    // Generate homestay profile URLs
    const homestayUrls = homestays.map((homestay) => ({
      url: `${baseUrl}/homestays/profile/${homestay.slug}`,
      lastModified: homestay.updatedAt ? new Date(homestay.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Fetch communities via direct API call (since no wrapper exists yet)
    let communityUrls: MetadataRoute.Sitemap = [];
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56:3001';
      const communitiesResponse = await fetch(`${API_BASE_URL}/communities`, {
        method: 'GET',
        headers: { accept: 'application/json' },
        next: { revalidate: 0 },
      });

      if (communitiesResponse.ok) {
        const communities = await communitiesResponse.json();
        communityUrls = communities.map((community: any) => {
          // Extract location from first homestay's address
          let location = 'nepal';
          if (community.homestays && community.homestays.length > 0 && community.homestays[0].address) {
            const addressParts = community.homestays[0].address.split(',');
            location = addressParts[0].trim();
          }
          const slug = generateCommunitySlug(community.name, location, community.id);
          return {
            url: `${baseUrl}/community-homestays/${slug}`,
            lastModified: community.updatedAt ? new Date(community.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.85,
          };
        });
      }
    } catch (error) {
      console.error('[Sitemap] Error fetching communities:', error);
    }

    // Static pages (including new community-homestays landing page)
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
        url: `${baseUrl}/community-homestays`,
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

    return [...staticPages, ...blogUrls, ...homestayUrls, ...communityUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
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
      {
        url: `${baseUrl}/community-homestays`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ];
  }
}