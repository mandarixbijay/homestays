// src/app/api/homestays/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const body = await request.json();
    const apiBaseUrl = process.env.API_BASE_URL;

    if (!apiBaseUrl) {
      console.error("API_BASE_URL is not configured");
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    console.log("Fetching homestay for slug:", slug, "with body:", body);

    const response = await fetch(`${apiBaseUrl}/bookings/check-availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        ...body,
        page: 1,
        limit: 10,
        sort: "PRICE_ASC",
      }),
    });

    if (!response.ok) {
      console.error("Backend API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch homestay details: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("API response:", data);

    const homestay = data.homestays.find((h: any) => h.slug === slug);

    if (!homestay) {
      console.error("Homestay not found for slug:", slug);
      return NextResponse.json(
        { error: "Homestay not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(homestay);
  } catch (error) {
    console.error("Error fetching homestay details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}