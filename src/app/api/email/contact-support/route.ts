import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';

const contactSupportSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[contact-support] Request body:', body);
    const validatedBody = contactSupportSchema.parse(body);
    console.log('[contact-support] Validated payload:', validatedBody);

    const response = await fetch(`${API_BASE_URL}/email/contact-support`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedBody),
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error('[contact-support] Failed to parse backend response:', text);
      return NextResponse.json(
        { status: 'error', message: 'Invalid response from server' },
        { status: 500 },
      );
    }
    console.log('[contact-support] Backend response:', {
      status: response.status,
      body: result,
    });

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('[contact-support] Error processing contact support request:', error);
    if (error instanceof z.ZodError) {
      console.log('[contact-support] Validation error:', error.errors);
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid input provided',
          errors: error.errors.map((err) => ({
            property: err.path.join('.'),
            constraints: { [err.code]: err.message },
          })),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to process contact support request',
      },
      { status: 500 },
    );
  }
}