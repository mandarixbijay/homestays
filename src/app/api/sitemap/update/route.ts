// app/api/sitemap/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sitemapCache } from '@/lib/sitemap-cache';

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

    // Store homestays in cache
    sitemapCache.upsertHomestays(homestays);

    // Get updated stats
    const stats = sitemapCache.getStats();

    // Revalidate the sitemap
    revalidatePath('/sitemap.xml', 'page');
    revalidateTag('homestays');

    console.log(`[Sitemap Update] ✅ Cache updated. Total: ${stats.total}, Approved: ${stats.approved}`);

    return NextResponse.json({
      success: true,
      message: `Sitemap cache updated with ${homestays.length} homestays`,
      timestamp: new Date().toISOString(),
      processed: homestays.length,
      stats: {
        total: stats.total,
        approved: stats.approved,
        lastUpdate: stats.lastUpdate,
      },
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

    // Get stats from cache
    const stats = sitemapCache.getStats();

    return NextResponse.json({
      success: true,
      stats: {
        total: stats.total,
        approved: stats.approved,
        lastUpdate: stats.lastUpdate,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
