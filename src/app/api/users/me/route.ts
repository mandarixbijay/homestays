// app/api/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('http://13.61.8.56:3001/users/me', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error for /users/me:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}