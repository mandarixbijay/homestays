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

  private async request<T>(endpoint: string, cacheTime: number = 3600): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`[HomestayAPI] Fetching: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: cacheTime, // Configurable cache time
          tags: ['homestays'] // Add tag for on-demand revalidation
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[HomestayAPI] Response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`[HomestayAPI] Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get all approved homestays for sitemap generation
   * Returns only essential data (id, name, address, updatedAt)
   */
  getApprovedHomestays = cache(async (): Promise<HomestayListResponse> => {
    try {
      // Fetch approved homestays with minimal data
      const result = await this.request<any>('/homestays?status=APPROVED&limit=10000', 3600);

      let homestays: any[] = [];
      let total = 0;

      // Handle different response formats
      if (Array.isArray(result)) {
        homestays = result;
        total = result.length;
      } else if (result.data && Array.isArray(result.data)) {
        homestays = result.data;
        total = result.total || result.data.length;
      } else if (result.homestays && Array.isArray(result.homestays)) {
        homestays = result.homestays;
        total = result.total || result.homestays.length;
      }

      // Transform to public format with generated slugs
      const publicHomestays: PublicHomestay[] = homestays
        .filter((h: any) => h.status === 'APPROVED') // Extra safety filter
        .map((homestay: any) => ({
          id: homestay.id,
          name: homestay.name,
          address: homestay.address,
          slug: PublicHomestayApi.generateSlug(homestay.name, homestay.address, homestay.id),
          updatedAt: homestay.updatedAt || new Date().toISOString(),
        }));

      return {
        data: publicHomestays,
        total: publicHomestays.length,
      };
    } catch (error) {
      console.error('Error fetching approved homestays:', error);
      return {
        data: [],
        total: 0,
      };
    }
  });
}

export const publicHomestayApi = new PublicHomestayApi();
