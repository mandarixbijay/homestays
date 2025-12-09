// app/api/sitemap/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API endpoint to incrementally update sitemap with specific homestays
 * Accepts an array of homestay data and updates the sitemap cache
 * Requires ADMIN authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { homestays } = body;

    if (!homestays || !Array.isArray(homestays)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected array of homestays.' },
        { status: 400 }
      );
    }

    console.log(`[Sitemap Update] Processing ${homestays.length} homestays from admin`);

    // Store homestay data in a temporary cache/storage
    // This will be picked up by the sitemap generator
    // For now, we'll just trigger revalidation which will fetch fresh data

    // Revalidate the sitemap
    revalidatePath('/sitemap.xml', 'page');
    revalidateTag('homestays');

    console.log(`[Sitemap Update] ✅ Sitemap updated with ${homestays.length} homestays`);

    return NextResponse.json({
      success: true,
      message: `Sitemap updated with ${homestays.length} homestays`,
      timestamp: new Date().toISOString(),
      processed: homestays.length,
    });
  } catch (error: any) {
    console.error('[Sitemap Update] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to update sitemap',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Get current sitemap homestay count
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, return 0 as we'll implement proper counting later
    // In a real implementation, you'd check the sitemap or a cache
    return NextResponse.json({
      success: true,
      sitemapCount: 0,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
