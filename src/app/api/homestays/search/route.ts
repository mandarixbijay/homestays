import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://13.61.8.56:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query parameters
    const queryParams = new URLSearchParams();

    // Add all search parameters
    const params = [
      'page', 'limit', 'search', 'destinationId', 'location',
      'minPrice', 'maxPrice', 'minRating', 'facilityIds', 'guests',
      'sortBy', 'vipAccess', 'hasLastMinuteDeal'
    ];

    params.forEach(param => {
      const value = searchParams.get(param);
      if (value !== null && value !== '') {
        queryParams.append(param, value);
      }
    });

    // Set defaults if not provided
    if (!queryParams.has('page')) queryParams.set('page', '1');
    if (!queryParams.has('limit')) queryParams.set('limit', '12');

    const backendUrl = `${BACKEND_URL}/homestays/search?${queryParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to search homestays');
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error searching homestays:', error);
    return NextResponse.json(
      { error: 'Failed to search homestays' },
      { status: 500 }
    );
  }
}
