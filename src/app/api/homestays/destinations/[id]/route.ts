import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56:3001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "12";

    const response = await fetch(
      `${API_BASE_URL}/homestays/destinations/${id}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Accept": "*/*",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("[API] Failed to fetch destination homestays:", response.status);
      return NextResponse.json(
        { status: "error", message: "Failed to fetch destination homestays" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error fetching destination homestays:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
