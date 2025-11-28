// src/app/api/campaign/review/submit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { submitReviewSchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// POST /api/campaign/review/submit - Submit review (Authenticated)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[campaign/review/submit] POST request body:', body);

    // Validate request body
    const validatedBody = submitReviewSchema.parse(body);
    console.log('[campaign/review/submit] Validated payload:', validatedBody);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/campaign/review/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        // Forward IP and user-agent for spam prevention
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body: JSON.stringify(validatedBody),
    });

    const data = await response.json();
    console.log('[campaign/review/submit] Backend response:', {
      status: response.status,
      reviewId: data.review?.id,
      discountIssued: data.discountIssued,
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[campaign/review/submit] POST error:', error);

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
        message: error instanceof Error ? error.message : 'Failed to submit review',
      },
      { status: 500 }
    );
  }
}
