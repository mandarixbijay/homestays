import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('[API Route] Community booking request (guest):', body);

    const response = await fetch(`${API_BASE_URL}/communities/bookings/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] Community booking (guest) error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create community booking' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API Route] Community booking (guest) response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
