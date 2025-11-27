// src/app/api/campaign/discounts/my/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDiscountsQuerySchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// GET /api/campaign/discounts/my - Get user's discount codes (Authenticated)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const queryParams = {
      isUsed: searchParams.get('isUsed') || undefined,
      includeExpired: searchParams.get('includeExpired') || 'false',
    };

    // Validate query params
    const validatedQuery = getDiscountsQuerySchema.parse(queryParams);

    // Build query string
    const query = new URLSearchParams();
    if (validatedQuery.isUsed !== undefined) {
      query.set('isUsed', validatedQuery.isUsed.toString());
    }
    query.set('includeExpired', validatedQuery.includeExpired.toString());

    const response = await fetch(
      `${API_BASE_URL}/campaign/discounts/my?${query.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[campaign/discounts/my] GET error:', error);

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
        message: error instanceof Error ? error.message : 'Failed to fetch discount codes',
      },
      { status: 500 }
    );
  }
}
