// API route to proxy last-minute deals requests
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://13.61.8.56:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';

    const backendUrl = `${BACKEND_URL}/homestays/last-minute-deals?page=${page}&limit=${limit}`;
    console.log('Fetching from backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for fresh data
      signal: AbortSignal.timeout(10000), // 10-second timeout
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      // Return empty data structure instead of throwing error
      return NextResponse.json(
        {
          data: [],
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('Backend data received:', JSON.stringify(data).substring(0, 500));
    console.log('Number of deals:', data.data?.length || 0);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching last-minute deals:', error);
    // Return empty data structure
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0
      },
      { status: 200 }
    );
  }
}
