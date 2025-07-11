// src/app/api/onboarding/step3/[sessionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface Step3Response {
  facilityIds: number[];
  customFacilities: { name: string }[];
}

const Step3Dto = z.object({
  facilityIds: z.array(z.number()).optional(),
  customFacilities: z
    .array(z.object({ name: z.string().min(1, 'Custom facility name cannot be empty') }))
    .max(10, 'Maximum 10 custom facilities allowed')
    .optional(),
});

export async function GET(request: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId || !/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
      console.error(`Invalid session ID: ${sessionId}`);
      return NextResponse.json({ error: 'Invalid session ID format' }, { status: 400 });
    }

    const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/onboarding/step3/${sessionId}`;
    console.log(`Proxying Step 3 request to: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'No error details available' }));
      console.error(`Failed to fetch Step 3 data (Status: ${response.status}, StatusText: ${response.statusText})`, errorData);
      if (response.status === 404) {
        return NextResponse.json({ facilityIds: [], customFacilities: [] }, { status: 200 });
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('Proxy fetched Step 3 data:', data);
    const parsedData = Step3Dto.safeParse(data);
    if (!parsedData.success) {
      console.error('Invalid Step 3 data format:', parsedData.error);
      return NextResponse.json({ error: 'Invalid Step 3 data format', details: parsedData.error }, { status: 400 });
    }

    return NextResponse.json(parsedData.data, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/onboarding/step3/[sessionId]:`, error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId || !/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
      console.error(`Invalid session ID: ${sessionId}`);
      return NextResponse.json({ error: 'Invalid session ID format' }, { status: 400 });
    }

    const body = await request.json();
    console.log('POST payload:', body); // Add this log
    const parsedBody = Step3Dto.safeParse(body);
    if (!parsedBody.success) {
      console.error('Invalid POST data format:', parsedBody.error);
      return NextResponse.json({ error: 'Invalid data format', details: parsedBody.error }, { status: 400 });
    }

    if (!parsedBody.data.facilityIds?.length && !parsedBody.data.customFacilities?.length) {
      console.error('Validation failed: At least one facility is required');
      return NextResponse.json({ error: 'At least one facility (default or custom) is required' }, { status: 400 });
    }

    const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/onboarding/step3/${sessionId}`;
    console.log(`Proxying POST Step 3 request to: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedBody.data),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'No error details available' }));
      console.error(`Failed to submit Step 3 data (Status: ${response.status}, StatusText: ${response.statusText})`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    console.log('Step 3 submitted successfully');
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error(`Error in POST /api/onboarding/step3/[sessionId]:`, error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId || !/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
      console.error(`Invalid session ID: ${sessionId}`);
      return NextResponse.json({ error: 'Invalid session ID format' }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = Step3Dto.safeParse(body);
    if (!parsedBody.success) {
      console.error('Invalid PATCH data format:', parsedBody.error);
      return NextResponse.json({ error: 'Invalid data format', details: parsedBody.error }, { status: 400 });
    }

    if (!parsedBody.data.facilityIds?.length && !parsedBody.data.customFacilities?.length) {
      console.error('Validation failed: At least one facility is required');
      return NextResponse.json({ error: 'At least one facility (default or custom) is required' }, { status: 400 });
    }

    const backendUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/onboarding/step3/${sessionId}`;
    console.log(`Proxying PATCH Step 3 request to: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedBody.data),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'No error details available' }));
      console.error(`Failed to update Step 3 data (Status: ${response.status}, StatusText: ${response.statusText})`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    console.log('Step 3 updated successfully');
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error(`Error in PATCH /api/onboarding/step3/[sessionId]:`, error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}