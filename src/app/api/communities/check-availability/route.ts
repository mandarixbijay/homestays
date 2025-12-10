import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('[API Route] Check availability request:', body);

    const response = await fetch(`${API_BASE_URL}/communities/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Route] Error checking availability:', errorText);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API Route] Availability response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
