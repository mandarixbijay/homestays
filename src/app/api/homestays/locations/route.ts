// API route to fetch all locations
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://13.61.8.56:3001';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${BACKEND_URL}/homestays/locations/all`;
    console.log('Fetching locations from backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      cache: 'force-cache', // Cache locations as they don't change frequently
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json(
        { locations: [], total: 0 },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('Locations received:', data.total);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { locations: [], total: 0 },
      { status: 200 }
    );
  }
}
