import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56";

// Define request body schema
const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { email } = resendVerificationSchema.parse(body);

    // Send request to backend
    const response = await fetch(`${API_BASE_URL}/verification/resend-verification`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", message: result.message || "Failed to resend OTP" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { status: "success", message: result.message || "New OTP sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resending OTP:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { status: "error", message: error.errors[0].message || "Invalid input" },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Failed to resend OTP" },
      { status: 500 }
    );
  }
}