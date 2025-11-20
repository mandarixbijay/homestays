// API route to check deal availability
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://13.61.8.56:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Transform field names to match backend API expectations
    const payload: any = {
      page: body.page || 1,
      limit: body.limit || 12,
    };

    // Add location if provided
    if (body.location) {
      payload.location = body.location;
    }

    // Transform checkIn/checkOut to checkInDate/checkOutDate
    if (body.checkIn) {
      payload.checkInDate = body.checkIn;
    }
    if (body.checkOut) {
      payload.checkOutDate = body.checkOut;
    }

    // Add rooms if provided
    if (body.rooms && body.rooms.length > 0) {
      payload.rooms = body.rooms;
    }

    const backendUrl = `${BACKEND_URL}/bookings/check-availability/deals`;
    console.log('Checking deal availability:', backendUrl);
    console.log('Request payload:', JSON.stringify(payload));

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
    console.log('Sample deal structure:', JSON.stringify(data.homestays?.[0], null, 2));

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
