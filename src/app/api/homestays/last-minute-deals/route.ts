// API route to proxy last-minute deals requests
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://13.61.8.56:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';

    const response = await fetch(
      `${BACKEND_API_URL}/homestays/last-minute-deals?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Disable caching for fresh data
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch deals from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching last-minute deals:', error);
    return NextResponse.json(
      { error: 'Internal server error', data: [], total: 0, page: 1, limit: 12, totalPages: 0 },
      { status: 500 }
    );
  }
}
