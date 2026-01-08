import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://13.61.8.56";

/**
 * GET /api/auth/me
 * Check if user is authenticated and get user data
 * This endpoint calls the backend /auth/me to validate the current session
 */
export async function GET(request: NextRequest) {
  try {
    // First get the NextAuth session
    const session = await getServerSession(authOptions);

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        {
          status: "error",
          message: "Not authenticated"
        },
        { status: 401 }
      );
    }

    // Call the backend /auth/me endpoint to validate the token
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.user.accessToken}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      // Token is invalid or expired
      if (response.status === 401) {
        return NextResponse.json(
          {
            status: "error",
            message: "Token expired or invalid"
          },
          { status: 401 }
        );
      }

      const errorText = await response.text();
      console.error("[API /auth/me] Backend error:", errorText);
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to validate session"
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: "success",
      message: "User retrieved successfully",
      data: data.data || data,
    });
  } catch (error) {
    console.error("[API /auth/me] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error"
      },
      { status: 500 }
    );
  }
}
