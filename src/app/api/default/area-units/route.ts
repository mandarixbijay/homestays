// src/app/api/default/area-units/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for area units
const AreaUnitSchema = z.array(
  z.object({
    id: z.number().int().positive('Area unit ID must be a positive integer'),
    name: z.string().min(1, 'Area unit name cannot be empty'),
    isDefault: z.boolean(),
  }),
);

// Backend base URL from environment variable
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = `${BACKEND_URL}/admin/area-units`;
    console.log(`Proxying GET area-units request to: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10-second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'No error details available' }));
      console.error(`Failed to fetch area units (Status: ${response.status}, StatusText: ${response.statusText})`, errorData);
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch area units' },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log('Proxy fetched area units:', data);

    // Validate response data
    const parsedData = AreaUnitSchema.safeParse(data);
    if (!parsedData.success) {
      console.error('Invalid area units data format:', parsedData.error);
      return NextResponse.json(
        { message: 'Invalid area units data format' },
        { status: 400 },
      );
    }

    return NextResponse.json(parsedData.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/default/area-units:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}