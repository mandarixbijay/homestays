// lib/api/public-homestay-api.ts - Public API for fetching homestays (used for sitemap and public pages)
import { sitemapCache } from '@/lib/sitemap-cache';

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
   * First tries to read from cache, then falls back to API
   */
  async getApprovedHomestays(): Promise<HomestayListResponse> {
    try {
      const isServer = typeof window === 'undefined';

      // Server-side: Try cache first
      if (isServer) {
        console.log('[HomestayAPI] Server-side: Reading from cache...');
        const cached = sitemapCache.getApprovedHomestays();

        if (cached.length > 0) {
          console.log(`[HomestayAPI] ✅ Found ${cached.length} approved homestays in cache`);

          // Transform cached data to public format
          const publicHomestays: PublicHomestay[] = cached.map((homestay) => {
            const slug = PublicHomestayApi.generateSlug(
              homestay.name || 'Unnamed Homestay',
              homestay.address || 'Nepal',
              homestay.id
            );

            return {
              id: homestay.id,
              name: homestay.name || 'Unnamed Homestay',
              address: homestay.address || 'Nepal',
              slug: slug,
              updatedAt: homestay.updatedAt || new Date().toISOString(),
            };
          });

          // Log sample for verification
          if (publicHomestays.length > 0) {
            console.log('[HomestayAPI] Sample cached homestays:', publicHomestays.slice(0, 3).map(h => ({
              id: h.id,
              name: h.name,
              slug: h.slug
            })));
          }

          return {
            data: publicHomestays,
            total: publicHomestays.length,
          };
        } else {
          console.log('[HomestayAPI] ⚠️  Cache is empty. Admin needs to browse /admin/homestays to populate sitemap.');
        }
      }

      // Client-side or if cache is empty: return empty
      // (Don't try to fetch from backend as it requires auth)
      console.log('[HomestayAPI] Returning empty list (cache empty or client-side)');

      return {
        data: [],
        total: 0,
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
