// src/app/api/campaign/homestay/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { registerHomestaySchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// POST /api/campaign/homestay/register - Register homestay with QR code (Field Staff)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[campaign/homestay/register] POST request body:', body);

    // Validate request body
    const validatedBody = registerHomestaySchema.parse(body);
    console.log('[campaign/homestay/register] Validated payload:', validatedBody);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/campaign/homestay/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(validatedBody),
    });

    const data = await response.json();
    console.log('[campaign/homestay/register] Backend response:', {
      status: response.status,
      homestayId: data.homestayId,
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[campaign/homestay/register] POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid input provided',
          errors: error.errors.map((err) => ({
            property: err.path.join('.'),
            constraints: { [err.code]: err.message },
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to register homestay',
      },
      { status: 500 }
    );
  }
}
