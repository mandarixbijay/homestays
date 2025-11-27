// src/app/api/campaign/discounts/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateDiscountSchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// POST /api/campaign/discounts/validate - Validate discount code (Authenticated)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[campaign/discounts/validate] POST request body:', body);

    // Validate request body
    const validatedBody = validateDiscountSchema.parse(body);
    console.log('[campaign/discounts/validate] Validated payload:', validatedBody);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/campaign/discounts/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(validatedBody),
    });

    const data = await response.json();
    console.log('[campaign/discounts/validate] Backend response:', {
      status: response.status,
      valid: data.valid,
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[campaign/discounts/validate] POST error:', error);

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
        message: error instanceof Error ? error.message : 'Failed to validate discount code',
      },
      { status: 500 }
    );
  }
}
