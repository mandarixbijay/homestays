// src/app/api/onboarding/finalize/[sessionId]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56:3001";

const RegisterDataSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email().optional(),
  mobileNumber: z.string().regex(/^\d{10}$/).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
}).refine((data) => data.email || data.mobileNumber, {
  message: "Either email or mobile number must be provided",
  path: ["email"],
});

async function fetchWithTimeout(url: string, options: RequestInit, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    if (!sessionId || !/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = RegisterDataSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const backendUrl = `${API_BASE_URL}/onboarding/finalize/${sessionId}`;
    const response = await fetchWithTimeout(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedBody.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to finalize session" }));
      return NextResponse.json(
        { error: errorData.message || "Failed to finalize session" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(
      { message: "Session finalized successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in POST /api/onboarding/finalize:`, error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}