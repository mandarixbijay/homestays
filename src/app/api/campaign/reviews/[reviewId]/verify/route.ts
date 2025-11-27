// src/app/api/campaign/reviews/[reviewId]/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyReviewSchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// PUT /api/campaign/reviews/:reviewId/verify - Verify/reject review (Admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    const body = await request.json();
    console.log(`[campaign/reviews/${reviewId}/verify] PUT request body:`, body);

    // Validate request body
    const validatedBody = verifyReviewSchema.parse(body);
    console.log(`[campaign/reviews/${reviewId}/verify] Validated payload:`, validatedBody);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/campaign/reviews/${reviewId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(validatedBody),
    });

    const data = await response.json();
    console.log(`[campaign/reviews/${reviewId}/verify] Backend response:`, {
      status: response.status,
      reviewId: data.id,
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`[campaign/reviews/${params.reviewId}/verify] PUT error:`, error);

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
        message: error instanceof Error ? error.message : 'Failed to verify review',
      },
      { status: 500 }
    );
  }
}
