import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nepalhomestays.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/homestays/',
          '/api/backend/homestays/',
          '/api/backend/blog/',
        ],
        disallow: [
          '/admin/',
          '/api/auth/',
          '/api/admin/',
          '/api/sitemap/',
          '/_next/static/',
          '/private/',
        ],
      },
      // Special rules for Google
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/api/homestays/',
          '/api/backend/homestays/',
          '/api/backend/blog/',
        ],
        disallow: [
          '/admin/',
          '/api/auth/',
          '/api/admin/',
          '/api/sitemap/',
        ],
      },
      // Special rules for Bing
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/api/homestays/',
          '/api/backend/homestays/',
          '/api/backend/blog/',
        ],
        disallow: [
          '/admin/',
          '/api/auth/',
          '/api/admin/',
          '/api/sitemap/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
