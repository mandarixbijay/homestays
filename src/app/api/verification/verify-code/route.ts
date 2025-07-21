import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56";

// Define request body schema
const verifyCodeSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    mobileNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number")
      .optional(),
    code: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
  })
  .refine((data) => data.email || data.mobileNumber, {
    message: "Either email or mobile number is required",
    path: ["email"],
  })
  .refine((data) => !(data.email && data.mobileNumber), {
    message: "Provide either email or mobile number, not both",
    path: ["mobileNumber"],
  });

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    console.log("[verify-code] Request body:", body);
    const { email, mobileNumber, code } = verifyCodeSchema.parse(body);

    // Prepare payload with only the relevant field
    const payload = {
      ...(email ? { email } : { mobileNumber }),
      code,
    };
    console.log("[verify-code] Backend payload:", payload);

    // Send request to backend
    const response = await fetch(`${API_BASE_URL}/verification/verify-code`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("[verify-code] Failed to parse backend response:", text);
      return NextResponse.json(
        { status: "error", message: "Invalid response from server" },
        { status: 500 }
      );
    }
    console.log("[verify-code] Backend response:", {
      status: response.status,
      body: result,
    });

    // Pass through the backend's status code and response body
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("[verify-code] Error verifying OTP:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.log("[verify-code] Validation error:", error.errors);
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