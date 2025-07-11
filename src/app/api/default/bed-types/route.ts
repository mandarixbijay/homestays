// src/app/api/default/bed-types/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for bed types
const BedTypeSchema = z.array(
  z.object({
    id: z.number().int().positive('Bed type ID must be a positive integer'),
    name: z.string().min(1, 'Bed type name cannot be empty'),
    size: z.number().positive('Bed size must be positive'),
    sizeUnit: z.string().min(1, 'Size unit cannot be empty'),
  }),
);

// Backend base URL from environment variable
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = `${BACKEND_URL}/admin/bed-types`;
    console.log(`Proxying GET bed-types request to: ${backendUrl}`);

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
      console.error(`Failed to fetch bed types (Status: ${response.status}, StatusText: ${response.statusText})`, errorData);
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch bed types' },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log('Proxy fetched bed types:', data);

    // Validate response data
    const parsedData = BedTypeSchema.safeParse(data);
    if (!parsedData.success) {
      console.error('Invalid bed types data format:', parsedData.error);
      return NextResponse.json(
        { message: 'Invalid bed types data format' },
        { status: 400 },
      );
    }

    return NextResponse.json(parsedData.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/default/bed-types:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}