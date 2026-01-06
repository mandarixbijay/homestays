import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.61.8.56:3001';
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const contactSupportSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  captchaToken: z.string().optional(),
});

async function verifyCaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('[contact-support] RECAPTCHA_SECRET_KEY not configured, skipping verification');
    return true;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    console.log('[contact-support] reCAPTCHA verification result:', data);
    return data.success === true;
  } catch (error) {
    console.error('[contact-support] reCAPTCHA verification failed:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[contact-support] Request body:', body);
    const validatedBody = contactSupportSchema.parse(body);
    console.log('[contact-support] Validated payload:', validatedBody);

    // Verify CAPTCHA if configured
    if (RECAPTCHA_SECRET_KEY) {
      if (!validatedBody.captchaToken) {
        return NextResponse.json(
          { status: 'error', message: 'CAPTCHA verification is required' },
          { status: 400 },
        );
      }

      const isCaptchaValid = await verifyCaptcha(validatedBody.captchaToken);
      if (!isCaptchaValid) {
        return NextResponse.json(
          { status: 'error', message: 'CAPTCHA verification failed. Please try again.' },
          { status: 400 },
        );
      }
    }

    // Extract only the form data (exclude captchaToken) for backend
    const { captchaToken, ...formData } = validatedBody;

    const response = await fetch(`${API_BASE_URL}/email/contact-support`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
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