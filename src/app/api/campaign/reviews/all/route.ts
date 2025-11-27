// src/app/api/campaign/reviews/all/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getReviewsQuerySchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// GET /api/campaign/reviews/all - Get all reviews (Admin/Public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      isVerified: searchParams.get('isVerified') || undefined,
      isPublished: searchParams.get('isPublished') || undefined,
      campaignId: searchParams.get('campaignId') || undefined,
      homestayId: searchParams.get('homestayId') || undefined,
    };

    // Validate query params
    const validatedQuery = getReviewsQuerySchema.parse(queryParams);

    // Build query string
    const query = new URLSearchParams();
    query.set('page', validatedQuery.page.toString());
    query.set('limit', validatedQuery.limit.toString());
    if (validatedQuery.isVerified !== undefined) {
      query.set('isVerified', validatedQuery.isVerified.toString());
    }
    if (validatedQuery.isPublished !== undefined) {
      query.set('isPublished', validatedQuery.isPublished.toString());
    }
    if (validatedQuery.campaignId) {
      query.set('campaignId', validatedQuery.campaignId.toString());
    }
    if (validatedQuery.homestayId) {
      query.set('homestayId', validatedQuery.homestayId.toString());
    }

    const authHeader = request.headers.get('Authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(
      `${API_BASE_URL}/campaign/reviews/all?${query.toString()}`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[campaign/reviews/all] GET error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid query parameters',
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
        message: error instanceof Error ? error.message : 'Failed to fetch reviews',
      },
      { status: 500 }
    );
  }
}
