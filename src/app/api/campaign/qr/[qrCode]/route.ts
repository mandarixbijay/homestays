// src/app/api/campaign/qr/[qrCode]/route.ts

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// GET /api/campaign/qr/:qrCode - Get homestay by QR code (Public)
export async function GET(
  request: NextRequest,
  { params }: { params: { qrCode: string } }
) {
  try {
    const { qrCode } = params;

    const response = await fetch(`${API_BASE_URL}/campaign/qr/${qrCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`[campaign/qr/${params.qrCode}] GET error:`, error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch homestay by QR code',
      },
      { status: 500 }
    );
  }
}
