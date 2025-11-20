import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://13.61.8.56:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const category = searchParams.get('category') || '';
    const strategy = searchParams.get('strategy') || '';

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(category && { category }),
      ...(strategy && { strategy }),
    });

    const backendUrl = `${BACKEND_URL}/homestays/top-homestays?${queryParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch top homestays');
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching top homestays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top homestays' },
      { status: 500 }
    );
  }
}
