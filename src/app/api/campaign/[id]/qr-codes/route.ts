// src/app/api/campaign/[id]/qr-codes/route.ts

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// GET /api/campaign/:id/qr-codes - Get all QR codes for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';

    const authHeader = request.headers.get('Authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(
      `${API_BASE_URL}/campaign/${id}/qr-codes?page=${page}&limit=${limit}`,
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
    console.error(`[campaign/${(await params).id}/qr-codes] GET error:`, error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch QR codes',
      },
      { status: 500 }
    );
  }
}
