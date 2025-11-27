// src/app/api/campaign/qr-codes/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateBulkQRCodesSchema } from '@/lib/validations/campaign';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// POST /api/campaign/qr-codes/generate - Generate bulk QR codes (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[campaign/qr-codes/generate] POST request body:', body);

    // Validate request body
    const validatedBody = generateBulkQRCodesSchema.parse(body);
    console.log('[campaign/qr-codes/generate] Validated payload:', validatedBody);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/campaign/qr-codes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(validatedBody),
    });

    const data = await response.json();
    console.log('[campaign/qr-codes/generate] Backend response:', {
      status: response.status,
      qrCount: data.count,
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[campaign/qr-codes/generate] POST error:', error);

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
        message: error instanceof Error ? error.message : 'Failed to generate QR codes',
      },
      { status: 500 }
    );
  }
}
