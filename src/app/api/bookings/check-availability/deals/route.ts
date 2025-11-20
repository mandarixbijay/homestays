// API route to check deal availability
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://13.61.8.56:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = `${BACKEND_URL}/bookings/check-availability/deals`;
    console.log('Checking deal availability:', backendUrl);
    console.log('Request payload:', JSON.stringify(body));

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json(
        { homestays: [], totalPages: 0, totalCount: 0 },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('Deals found:', data.totalCount || 0);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error checking deal availability:', error);
    return NextResponse.json(
      { homestays: [], totalPages: 0, totalCount: 0 },
      { status: 200 }
    );
  }
}
