import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://13.61.8.56:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ homestayId: string }> }
) {
  try {
    const { homestayId } = await params;
    const body = await request.json();

    console.log('Check availability request:', {
      homestayId,
      body,
    });

    const backendUrl = `${BACKEND_URL}/bookings/check-availability/${homestayId}`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    console.log('Check availability response:', {
      homestayId,
      availableRoomsCount: data.availableRooms?.length || 0,
      hasLastMinuteDeal: !!data.activeLastMinuteDeal,
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      {
        error: 'Failed to check availability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
