// src/app/api/campaign/qr-codes/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// DELETE /api/campaign/qr-codes/:id - Delete a QR code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Authorization required',
        },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/campaign/qr-codes/${id}`,
      {
        method: 'DELETE',
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
    console.error(`[campaign/qr-codes/${(await params).id}] DELETE error:`, error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete QR code',
      },
      { status: 500 }
    );
  }
}
