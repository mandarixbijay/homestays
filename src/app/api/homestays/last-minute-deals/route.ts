// API route to proxy last-minute deals requests
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://13.61.8.56:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';

    const backendUrl = `${BACKEND_API_URL}/homestays/last-minute-deals?page=${page}&limit=${limit}`;
    console.log('Fetching from backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for fresh data
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch deals from backend', details: errorText, data: [], total: 0, page: 1, limit: 12, totalPages: 0 },
        { status: 200 } // Return 200 with empty data instead of error
      );
    }

    const data = await response.json();
    console.log('Backend data received:', JSON.stringify(data).substring(0, 200));

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching last-minute deals:', error);
    return NextResponse.json(
      { error: 'Internal server error', data: [], total: 0, page: 1, limit: 12, totalPages: 0 },
      { status: 200 } // Return 200 with empty data instead of error
    );
  }
}
