// lib/api/public-homestay-api.ts - Public API for fetching homestays (used for sitemap and public pages)
import { cache } from 'react';

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
   */
  getApprovedHomestays = cache(async (): Promise<HomestayListResponse> => {
    try {
      // Use internal sitemap API endpoint (works for both server-side and client-side)
      const baseUrl = typeof window !== 'undefined'
        ? '' // Client-side: use relative URL
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // Server-side: use full URL

      const url = `${baseUrl}/api/sitemap/homestays`;
      console.log(`[HomestayAPI] Fetching approved homestays from: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 3600, // Cache for 1 hour
          tags: ['homestays'] // Add tag for on-demand revalidation
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[HomestayAPI] HTTP error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[HomestayAPI] Response:`, {
        hasData: !!result.data,
        dataLength: result.data?.length || 0,
        total: result.total,
      });

      let homestays: any[] = [];

      // Handle different response formats
      if (Array.isArray(result)) {
        homestays = result;
      } else if (result.data && Array.isArray(result.data)) {
        homestays = result.data;
      }

      // Transform to public format with generated slugs (data is already filtered for APPROVED)
      const publicHomestays: PublicHomestay[] = homestays.map((homestay: any) => ({
        id: homestay.id,
        name: homestay.name || 'Unnamed Homestay',
        address: homestay.address || 'Nepal',
        slug: PublicHomestayApi.generateSlug(
          homestay.name || 'Unnamed Homestay',
          homestay.address || 'Nepal',
          homestay.id
        ),
        updatedAt: homestay.updatedAt || new Date().toISOString(),
      }));

      console.log(`[HomestayAPI] Transformed ${publicHomestays.length} approved homestays for sitemap`);

      return {
        data: publicHomestays,
        total: publicHomestays.length,
      };
    } catch (error) {
      console.error('[HomestayAPI] Error fetching approved homestays:', error);
      return {
        data: [],
        total: 0,
      };
    }
  });
}

export const publicHomestayApi = new PublicHomestayApi();
