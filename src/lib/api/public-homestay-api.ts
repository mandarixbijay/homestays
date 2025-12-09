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
   * Fetches directly from backend using admin token from environment variable
   */
  async getApprovedHomestays(): Promise<HomestayListResponse> {
    try {
      const isServer = typeof window === 'undefined';

      if (!isServer) {
        console.log('[HomestayAPI] Client-side access not supported');
        return { data: [], total: 0 };
      }

      console.log('[HomestayAPI] Server-side: Fetching approved homestays from backend...');

      // Fetch directly from backend API for sitemap generation
      // Use environment variable for admin token
      const BACKEND_URL = process.env.BACKEND_API_URL || 'http://13.61.8.56:3001';
      const ADMIN_TOKEN = process.env.SITEMAP_ADMIN_TOKEN;

      if (!ADMIN_TOKEN) {
        console.warn('[HomestayAPI] ⚠️  SITEMAP_ADMIN_TOKEN not set in environment variables');
        console.warn('[HomestayAPI] Set SITEMAP_ADMIN_TOKEN in Vercel env vars to enable sitemap generation');
        return { data: [], total: 0 };
      }

      // Fetch all approved homestays from backend
      const allHomestays: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = `${BACKEND_URL}/admin/homestays?page=${page}&limit=100&status=APPROVED`;
        console.log(`[HomestayAPI] Fetching page ${page} from backend...`);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`[HomestayAPI] Failed to fetch page ${page}:`, response.status, response.statusText);
          break;
        }

        const data = await response.json();
        const pageHomestays = data.homestays || data.data || [];

        allHomestays.push(...pageHomestays);
        console.log(`[HomestayAPI] Page ${page}: got ${pageHomestays.length} homestays`);

        const totalPages = data.totalPages || Math.ceil((data.total || 0) / 100);
        hasMore = page < totalPages && pageHomestays.length > 0;
        page++;
      }

      console.log(`[HomestayAPI] ✅ Fetched ${allHomestays.length} approved homestays from backend`);

      // Transform to public format
      const publicHomestays: PublicHomestay[] = allHomestays.map((homestay) => {
        const slug = PublicHomestayApi.generateSlug(
          homestay.name || homestay.propertyName || 'Unnamed Homestay',
          homestay.address || homestay.propertyAddress || 'Nepal',
          homestay.id
        );

        return {
          id: homestay.id,
          name: homestay.name || homestay.propertyName || 'Unnamed Homestay',
          address: homestay.address || homestay.propertyAddress || 'Nepal',
          slug: slug,
          updatedAt: homestay.updatedAt || new Date().toISOString(),
        };
      });

      // Log sample for verification
      if (publicHomestays.length > 0) {
        console.log('[HomestayAPI] Sample homestays:', publicHomestays.slice(0, 2).map(h => ({
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
