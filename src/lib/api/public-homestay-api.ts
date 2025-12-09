// lib/api/public-homestay-api.ts - Public API for fetching homestays (used for sitemap and public pages)

export interface PublicHomestay {
  id: number;
  name: string;
  address: string;
  slug: string; // Generated slug for URL
  updatedAt: string;
}

export interface HomestayListResponse {
  data: PublicHomestay[];
  total: number;
}

class PublicHomestayApi {
  /**
   * Generate a URL-friendly slug from homestay name, address, and ID
   * Example: "AAMA HONESTAYS", "Kiwool, Nepal", 527 => "aama-honestays-kiwool-nepal-id-527"
   */
  static generateSlug(name: string, address: string, id: number): string {
    const cleanText = (text: string) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-'); // Replace multiple dashes with single dash
    };

    const namePart = cleanText(name);
    const addressPart = cleanText(address);

    return `${namePart}-${addressPart}-id-${id}`;
  }

  /**
   * Get all approved homestays for sitemap generation
   * Returns only essential data (id, name, address, updatedAt)
   * NO CACHING - always fetch fresh data
   */
  async getApprovedHomestays(): Promise<HomestayListResponse> {
    try {
      // Use Next.js internal API for both server and client-side
      const isServer = typeof window === 'undefined';

      // For server-side, use full URL; for client-side, use relative URL
      const baseUrl = isServer
        ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
        : '';

      const url = `${baseUrl}/api/sitemap/homestays`;
      console.log(`[HomestayAPI] Fetching from: ${url} (${isServer ? 'server' : 'client'}-side)`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // NEVER cache
      });

      let homestays: any[] = [];

      if (response.ok) {
        const result = await response.json();
        console.log(`[HomestayAPI] API response:`, {
          success: result.success,
          hasData: !!result.data,
          dataLength: result.data?.length || 0,
          total: result.total,
        });

        if (result.data && Array.isArray(result.data)) {
          homestays = result.data;
        }
      } else {
        const errorText = await response.text();
        console.error(`[HomestayAPI] HTTP error ${response.status}:`, errorText);
      }

      // Filter only APPROVED homestays and transform to public format with generated slugs
      const publicHomestays: PublicHomestay[] = homestays
        .filter((h: any) => h.status === 'APPROVED')
        .map((homestay: any) => {
          const slug = PublicHomestayApi.generateSlug(
            homestay.name || 'Unnamed Homestay',
            homestay.address || 'Nepal',
            homestay.id
          );

          console.log(`[HomestayAPI] Homestay ${homestay.id}: "${homestay.name}" -> slug: "${slug}"`);

          return {
            id: homestay.id,
            name: homestay.name || 'Unnamed Homestay',
            address: homestay.address || 'Nepal',
            slug: slug,
            updatedAt: homestay.updatedAt || new Date().toISOString(),
          };
        });

      console.log(`[HomestayAPI] ✅ Transformed ${publicHomestays.length} approved homestays for sitemap`);

      // Log first 5 for verification
      if (publicHomestays.length > 0) {
        console.log('[HomestayAPI] Sample homestays:', publicHomestays.slice(0, 5).map(h => ({
          id: h.id,
          name: h.name,
          slug: h.slug
        })));
      }

      return {
        data: publicHomestays,
        total: publicHomestays.length,
      };
    } catch (error) {
      console.error('[HomestayAPI] ❌ Error fetching approved homestays:', error);
      return {
        data: [],
        total: 0,
      };
    }
  }
}

export const publicHomestayApi = new PublicHomestayApi();
