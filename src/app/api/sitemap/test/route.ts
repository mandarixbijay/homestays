// app/api/sitemap/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { publicHomestayApi } from '@/lib/api/public-homestay-api';

/**
 * Test endpoint to verify homestay sitemap data is being fetched correctly
 * Visit: /api/sitemap/test to see the data
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Sitemap Test] Fetching homestays...');

    const result = await publicHomestayApi.getApprovedHomestays();

    console.log(`[Sitemap Test] Got ${result.total} homestays`);

    // Return sample data
    return NextResponse.json({
      success: true,
      total: result.total,
      sample: result.data.slice(0, 10), // First 10 homestays
      sampleUrls: result.data.slice(0, 10).map(h =>
        `https://www.nepalhomestays.com/homestays/profile/${h.slug}`
      ),
    });
  } catch (error: any) {
    console.error('[Sitemap Test] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
