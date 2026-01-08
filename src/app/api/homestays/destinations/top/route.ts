import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56:3001";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/homestays/destinations/top`, {
      method: "GET",
      headers: {
        "Accept": "*/*",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[API] Failed to fetch top destinations:", response.status);
      return NextResponse.json(
        { status: "error", message: "Failed to fetch top destinations" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error fetching top destinations:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
