// src/app/api/backend/[...path]/route.ts

import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://13.61.8.56:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  pathParts: string[],
  method: string
) {
  try {
    // Get session and extract access token
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized - No access token found' },
        { status: 401 }
      );
    }

    // Construct the backend URL
    const path = pathParts.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    const backendUrl = `${BACKEND_URL}/${path}${queryString}`;

    // Prepare headers
    const headers: HeadersInit = {
      Authorization: `Bearer ${session.user.accessToken}`,
      'Content-Type': 'application/json',
    };

    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
    };

    // Add body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const body = await request.json();
        options.body = JSON.stringify(body);
      } catch (error) {
        // No body or invalid JSON - continue without body
      }
    }

    // Forward request to backend
    const response = await fetch(backendUrl, options);

    // Get response data
    const data = await response.json().catch(() => ({}));

    // Return response with same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Backend proxy error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error while proxying request',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
