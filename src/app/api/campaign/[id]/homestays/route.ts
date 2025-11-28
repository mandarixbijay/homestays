// src/app/api/campaign/[id]/homestays/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getCampaignHomestaysQuerySchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// GET /api/campaign/:id/homestays - Get campaign homestays
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = '';
  try {
    id = (await params).id;
    const { searchParams } = new URL(request.url);

    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      isActive: searchParams.get('isActive') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Validate query params
    const validatedQuery = getCampaignHomestaysQuerySchema.parse(queryParams);

    // Build query string
    const query = new URLSearchParams();
    query.set('page', validatedQuery.page.toString());
    query.set('limit', validatedQuery.limit.toString());
    if (validatedQuery.isActive !== undefined) {
      query.set('isActive', validatedQuery.isActive.toString());
    }
    if (validatedQuery.search) {
      query.set('search', validatedQuery.search);
    }

    const response = await fetch(
      `${API_BASE_URL}/campaign/${id}/homestays?${query.toString()}`,
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
    console.error(`[campaign/${id || 'unknown'}/homestays] GET error:`, error);

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
        message: error instanceof Error ? error.message : 'Failed to fetch campaign homestays',
      },
      { status: 500 }
    );
  }
}
