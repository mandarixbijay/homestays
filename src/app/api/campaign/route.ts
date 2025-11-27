// src/app/api/campaign/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createCampaignSchema, getCampaignsQuerySchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// GET /api/campaign - Get all campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    // Validate query params
    const validatedQuery = getCampaignsQuerySchema.parse({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const response = await fetch(
      `${API_BASE_URL}/campaign?page=${validatedQuery.page}&limit=${validatedQuery.limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[campaign] GET error:', error);

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
        message: error instanceof Error ? error.message : 'Failed to fetch campaigns',
      },
      { status: 500 }
    );
  }
}

// POST /api/campaign - Create new campaign (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[campaign] POST request body:', body);

    // Validate request body
    const validatedBody = createCampaignSchema.parse(body);
    console.log('[campaign] Validated payload:', validatedBody);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(validatedBody),
    });

    const data = await response.json();
    console.log('[campaign] Backend response:', { status: response.status, body: data });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[campaign] POST error:', error);

    if (error instanceof z.ZodError) {
      console.log('[campaign] Validation error:', error.errors);
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
        message: error instanceof Error ? error.message : 'Failed to create campaign',
      },
      { status: 500 }
    );
  }
}
