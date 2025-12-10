import { MetadataRoute } from 'next';

// Force dynamic rendering - don't cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56:3001';

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

  console.log('[Sitemap] Starting sitemap generation...');
  console.log('[Sitemap] Base URL:', baseUrl);
  console.log('[Sitemap] API Base URL:', API_BASE_URL);

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

  try {
    let blogUrls: MetadataRoute.Sitemap = [];
    let homestayUrls: MetadataRoute.Sitemap = [];
    let communityUrls: MetadataRoute.Sitemap = [];

    // Fetch blogs
    try {
      console.log('[Sitemap] Fetching blogs from:', `${API_BASE_URL}/blog/blogs/thumbnails`);
      const blogsResponse = await fetch(`${API_BASE_URL}/blog/blogs/thumbnails?limit=1000`, {
        method: 'GET',
        headers: { accept: 'application/json' },
        next: { revalidate: 0 },
      });

      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        const blogs = blogsData.data || [];
        console.log(`[Sitemap] ✅ Found ${blogs.length} blogs`);

        blogUrls = blogs.map((blog: any) => ({
          url: `${baseUrl}/blogs/${blog.slug}`,
          lastModified: blog.publishedAt ? new Date(blog.publishedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: blog.featured ? 0.9 : 0.8,
        }));
      } else {
        console.error('[Sitemap] ⚠️  Failed to fetch blogs:', blogsResponse.statusText);
      }
    } catch (error) {
      console.error('[Sitemap] ⚠️  Error fetching blogs:', error);
    }

    // Fetch homestays
    try {
      console.log('[Sitemap] Fetching homestays from:', `${API_BASE_URL}/homestays/search?status=APPROVED`);

      // Fetch first page to get total count
      const firstPageResponse = await fetch(`${API_BASE_URL}/homestays/search?page=1&limit=100&status=APPROVED`, {
        method: 'GET',
        headers: { accept: 'application/json' },
        next: { revalidate: 0 },
      });

      if (firstPageResponse.ok) {
        const firstPageData = await firstPageResponse.json();
        const allHomestays = firstPageData.data || [];
        const totalPages = firstPageData.totalPages || 1;

        console.log(`[Sitemap] Found ${firstPageData.total || allHomestays.length} total homestays across ${totalPages} pages`);

        // Fetch remaining pages if there are more
        if (totalPages > 1) {
          const pagePromises = [];
          for (let page = 2; page <= totalPages; page++) {
            pagePromises.push(
              fetch(`${API_BASE_URL}/homestays/search?page=${page}&limit=100&status=APPROVED`, {
                method: 'GET',
                headers: { accept: 'application/json' },
                next: { revalidate: 0 },
              }).then(res => res.json())
            );
          }

          const additionalPages = await Promise.all(pagePromises);
          additionalPages.forEach(pageData => {
            if (pageData.data) {
              allHomestays.push(...pageData.data);
            }
          });
        }

        console.log(`[Sitemap] ✅ Found ${allHomestays.length} approved homestays`);

        homestayUrls = allHomestays.map((homestay: any) => ({
          url: `${baseUrl}/homestays/profile/${homestay.slug}`,
          lastModified: homestay.updatedAt ? new Date(homestay.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      } else {
        console.error('[Sitemap] ⚠️  Failed to fetch homestays:', firstPageResponse.statusText);
      }
    } catch (error) {
      console.error('[Sitemap] ⚠️  Error fetching homestays:', error);
    }

    // Fetch communities
    try {
      console.log('[Sitemap] Fetching communities from:', `${API_BASE_URL}/communities`);
      const communitiesResponse = await fetch(`${API_BASE_URL}/communities`, {
        method: 'GET',
        headers: { accept: 'application/json' },
        next: { revalidate: 0 },
      });

      if (communitiesResponse.ok) {
        const communities = await communitiesResponse.json();
        console.log(`[Sitemap] ✅ Found ${communities.length} community homestays`);

        communityUrls = communities.map((community: any) => {
          // Extract location from first homestay's address (if available)
          // Address format is typically "City, District" or just "City"
          let location = 'nepal';
          if (community.homestays && community.homestays.length > 0 && community.homestays[0].address) {
            // Take the first part before comma, or the whole address if no comma
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
      } else {
        console.error('[Sitemap] ⚠️  Failed to fetch communities:', communitiesResponse.statusText);
      }
    } catch (error) {
      console.error('[Sitemap] ⚠️  Error fetching communities:', error);
    }

    const totalUrls = staticPages.length + blogUrls.length + homestayUrls.length + communityUrls.length;
    console.log(`[Sitemap] ✅ COMPLETE - Generated ${totalUrls} total URLs:`);
    console.log(`[Sitemap]   - ${staticPages.length} static pages`);
    console.log(`[Sitemap]   - ${blogUrls.length} blog posts`);
    console.log(`[Sitemap]   - ${homestayUrls.length} homestay profiles`);
    console.log(`[Sitemap]   - ${communityUrls.length} community homestays`);

    return [...staticPages, ...blogUrls, ...homestayUrls, ...communityUrls];
  } catch (error) {
    console.error('[Sitemap] ❌ Error generating sitemap:', error);
    // Return static pages only if all fetches fail
    console.log(`[Sitemap] Returning ${staticPages.length} static pages as fallback`);
    return staticPages;
  }
}
