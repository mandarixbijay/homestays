// app/api/sitemap/homestays/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://13.61.8.56:3001';

/**
 * Public API endpoint to fetch approved homestays for sitemap generation
 * This endpoint is used internally by the sitemap generator
 * Uses the public search endpoint which doesn't require authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Try the Next.js internal search API first (works without auth)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const searchUrl = `${siteUrl}/api/homestays/search?page=1&limit=1000`;

    console.log('[Sitemap Homestays API] Fetching from Next.js search API:', searchUrl);

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache to ensure fresh data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Sitemap Homestays API] Search API error:', {
        status: response.status,
        error: errorText
      });
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();

    console.log('[Sitemap Homestays API] Search API response:', {
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      total: data.total,
    });

    // Extract homestays array
    let homestays: any[] = [];
    if (Array.isArray(data)) {
      homestays = data;
    } else if (data.data && Array.isArray(data.data)) {
      homestays = data.data;
    } else if (data.homestays && Array.isArray(data.homestays)) {
      homestays = data.homestays;
    }

    // Filter only APPROVED homestays and return essential data
    const approvedHomestays = homestays
      .filter((h: any) => h.status === 'APPROVED')
      .map((h: any) => ({
        id: h.id,
        name: h.name || 'Unnamed Homestay',
        address: h.address || 'Nepal',
        updatedAt: h.updatedAt || new Date().toISOString(),
        status: h.status,
      }));

    console.log('[Sitemap Homestays API] ✅ Returning', approvedHomestays.length, 'approved homestays');

    return NextResponse.json({
      success: true,
      data: approvedHomestays,
      total: approvedHomestays.length,
    }, {
      headers: {
        'Cache-Control': 'no-store', // Don't cache sitemap data
      },
    });
  } catch (error: any) {
    console.error('[Sitemap Homestays API] ❌ Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch homestays',
        details: error.message,
        data: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
