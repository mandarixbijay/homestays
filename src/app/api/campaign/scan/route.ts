// src/app/api/campaign/scan/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { trackQRScanSchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// POST /api/campaign/scan - Track QR code scan (Public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[campaign/scan] POST request body:', body);

    // Validate request body
    const validatedBody = trackQRScanSchema.parse(body);
    console.log('[campaign/scan] Validated payload:', validatedBody);

    const response = await fetch(`${API_BASE_URL}/campaign/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward IP and user-agent for analytics
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body: JSON.stringify(validatedBody),
    });

    const data = await response.json();
    console.log('[campaign/scan] Backend response:', {
      status: response.status,
      qrCode: data.qrCode,
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[campaign/scan] POST error:', error);

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
        message: error instanceof Error ? error.message : 'Failed to track QR scan',
      },
      { status: 500 }
    );
  }
}
