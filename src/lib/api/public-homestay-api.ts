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
  private baseUrl = typeof window !== 'undefined'
    ? '/api/backend'
    : 'http://13.61.8.56:3001'; // Direct URL for server-side

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
   * Fetch approved homestays from backend
   * Uses public /homestays/search endpoint with status=APPROVED filter
   */
  async getApprovedHomestays(): Promise<HomestayListResponse> {
    try {
      const isServer = typeof window === 'undefined';

      if (!isServer) {
        console.log('[HomestayAPI] Client-side access not supported');
        return { data: [], total: 0 };
      }

      console.log('[HomestayAPI] Server-side: Fetching approved homestays from backend...');

      // Fetch all approved homestays from public endpoint
      const allHomestays: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = `${this.baseUrl}/homestays/search?page=${page}&limit=100&status=APPROVED`;
        console.log(`[HomestayAPI] Fetching page ${page}...`);

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 0 }, // Don't cache
        });

        if (!response.ok) {
          console.error(`[HomestayAPI] Failed to fetch page ${page}:`, response.status, response.statusText);
          break;
        }

        const data = await response.json();
        const pageHomestays = data.homestays || data.data || [];

        allHomestays.push(...pageHomestays);
        console.log(`[HomestayAPI] Page ${page}: got ${pageHomestays.length} homestays, total so far: ${allHomestays.length}`);

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
