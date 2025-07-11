// app/api/onboarding/start/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56:3001";

export async function POST() {
  try {
    const response = await fetch(`${API_BASE_URL}/onboarding/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to start onboarding session" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error starting onboarding session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}