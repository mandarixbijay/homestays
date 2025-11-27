// src/app/api/campaign/review/upload-images/route.ts

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

// POST /api/campaign/review/upload-images - Upload review images (Authenticated)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Get form data from request
    const formData = await request.formData();
    console.log('[campaign/review/upload-images] Files received:', formData.getAll('images').length);

    // Forward the form data to the backend
    const response = await fetch(`${API_BASE_URL}/campaign/review/upload-images`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        // Don't set Content-Type header - let fetch set it with boundary
      },
      body: formData,
    });

    const data = await response.json();
    console.log('[campaign/review/upload-images] Backend response:', {
      status: response.status,
      imageCount: data.imageUrls?.length,
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[campaign/review/upload-images] POST error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload images',
      },
      { status: 500 }
    );
  }
}
