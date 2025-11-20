// src/app/api/homestays/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://13.61.8.56:3001';

// GET handler - Fetch homestay by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if slug is numeric (ID) or text (slug)
    const isNumericId = /^\d+$/.test(slug);

    if (isNumericId) {
      // Fetch by ID
      const backendUrl = `${BACKEND_URL}/homestays/${slug}`;
      console.log('Fetching homestay by ID:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        return NextResponse.json(
          { error: 'Homestay not found' },
          { status: 404 }
        );
      }

      const data = await response.json();
      console.log('Homestay fetched by ID:', data.name || 'Unknown');

      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    } else {
      // If it's a slug string, return error for GET (use POST for availability check)
      return NextResponse.json(
        { error: 'Use POST method for slug-based availability check' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching homestay details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler - Check availability by slug
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
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