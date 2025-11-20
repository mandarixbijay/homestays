// API route to fetch single homestay details
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://13.61.8.56:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const backendUrl = `${BACKEND_URL}/homestays/${id}`;
    console.log('Fetching homestay details:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json(
        { error: 'Homestay not found' },
        { status: 404 }
      );
    }

    const data = await response.json();
    console.log('Homestay fetched:', data.name || 'Unknown');

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching homestay details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
