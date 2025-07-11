// src/app/api/default/currencies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for currencies
const CurrencySchema = z.array(
  z.object({
    id: z.number().int().positive('Currency ID must be a positive integer'),
    code: z.string().min(1, 'Currency code cannot be empty'),
    name: z.string().min(1, 'Currency name cannot be empty'),
    isDefault: z.boolean(),
  }),
);

// Backend base URL from environment variable
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = `${BACKEND_URL}/admin/currencies`;
    console.log(`Proxying GET currencies request to: ${backendUrl}`);

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
      console.error(`Failed to fetch currencies (Status: ${response.status}, StatusText: ${response.statusText})`, errorData);
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch currencies' },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log('Proxy fetched currencies:', data);

    // Validate response data
    const parsedData = CurrencySchema.safeParse(data);
    if (!parsedData.success) {
      console.error('Invalid currencies data format:', parsedData.error);
      return NextResponse.json(
        { message: 'Invalid currencies data format' },
        { status: 400 },
      );
    }

    return NextResponse.json(parsedData.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/default/currencies:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}