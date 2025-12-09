// app/api/sitemap/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API endpoint to manually trigger sitemap revalidation
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

    // Revalidate the sitemap
    revalidatePath('/sitemap.xml');

    // Revalidate specific cache tags
    revalidateTag('default', 'homestays');
    revalidateTag('default', 'blogs');

    console.log('[Sitemap] Manual revalidation triggered by:', session.user?.email);

    return NextResponse.json({
      success: true,
      message: 'Sitemap revalidated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Sitemap] Revalidation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to revalidate sitemap',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check last revalidation status (optional)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sitemap API is operational',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
