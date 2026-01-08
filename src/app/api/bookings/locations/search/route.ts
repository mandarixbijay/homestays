import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56:3001";

/**
 * GET /api/bookings/locations/search
 * Search for locations with homestays
 * Query params:
 *   - query: The search text (required, min 2 characters)
 *   - limit: Maximum number of results (optional, default 10)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const limit = searchParams.get("limit") || "10";

    // Validate query
    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          suggestions: [],
          query: query || "",
          message: "Query must be at least 2 characters"
        },
        { status: 200 }
      );
    }

    // Call the backend location search endpoint
    const response = await fetch(
      `${API_BASE_URL}/bookings/locations/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API /bookings/locations/search] Backend error:", errorText);
      return NextResponse.json(
        {
          suggestions: [],
          query: query,
          error: "Failed to fetch locations"
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      suggestions: data.suggestions || [],
      query: data.query || query,
    });
  } catch (error) {
    console.error("[API /bookings/locations/search] Error:", error);
    return NextResponse.json(
      {
        suggestions: [],
        query: "",
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}
