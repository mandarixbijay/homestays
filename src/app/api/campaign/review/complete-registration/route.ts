// src/app/api/campaign/review/complete-registration/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { completeRegistrationSchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// POST /api/campaign/review/complete-registration - Complete registration (Public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[campaign/review/complete-registration] POST request body:', body);

    // Validate request body
    const validatedBody = completeRegistrationSchema.parse(body);
    console.log('[campaign/review/complete-registration] Validated payload:', validatedBody);

    const response = await fetch(`${API_BASE_URL}/campaign/review/complete-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedBody),
    });

    const data = await response.json();
    console.log('[campaign/review/complete-registration] Backend response:', {
      status: response.status,
      userId: data.userId,
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[campaign/review/complete-registration] POST error:', error);

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
        message: error instanceof Error ? error.message : 'Failed to complete registration',
      },
      { status: 500 }
    );
  }
}
