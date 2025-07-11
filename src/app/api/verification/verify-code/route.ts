import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56";

// Define request body schema
const verifyCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { email, code } = verifyCodeSchema.parse(body);

    // Send request to backend
    const response = await fetch(`${API_BASE_URL}/verification/verify-code`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", message: result.message || "Invalid OTP" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { status: "success", message: result.message || "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { status: "error", message: error.errors[0].message || "Invalid input" },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Failed to verify OTP" },
      { status: 500 }
    );
  }
}