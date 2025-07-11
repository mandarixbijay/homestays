// src/app/api/onboarding/step3/facilities/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/admin/facilities`;
    console.log(`Proxying facilities request to: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'No error details available' }));
      console.error(`Failed to fetch facilities (Status: ${response.status}, StatusText: ${response.statusText})`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const facilities = await response.json();
    console.log('Proxy fetched facilities:', facilities);
    return NextResponse.json(facilities, { status: 200 });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : String(error);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}