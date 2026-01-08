import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56:3001";

/**
 * POST /api/auth/refresh
 * Refresh the access token
 * Accepts refresh token in two ways:
 * 1. Cookie (automatic with credentials: 'include')
 * 2. Request body { token: refreshToken }
 */
export async function POST(request: NextRequest) {
  try {
    let refreshToken: string | null = null;

    // Try to get refresh token from request body
    try {
      const body = await request.json();
      if (body?.token) {
        refreshToken = body.token;
      }
    } catch {
      // No body or invalid JSON, will use cookies
    }

    // If no token in body, try to get from NextAuth session
    if (!refreshToken) {
      const session = await getServerSession(authOptions);
      refreshToken = session?.user?.refreshToken || null;
    }

    // Forward cookies from the original request
    const cookieHeader = request.headers.get("cookie") || "";

    // Call the backend /auth/refresh endpoint
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { "Cookie": cookieHeader } : {}),
      },
      credentials: "include",
    };

    // If we have a refresh token, include it in the body
    if (refreshToken) {
      fetchOptions.body = JSON.stringify({ token: refreshToken });
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API /auth/refresh] Backend error:", errorText);
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to refresh token"
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Forward any Set-Cookie headers from the backend
    const apiResponse = NextResponse.json({
      status: "success",
      message: "Token refreshed successfully",
      data: data.data || data,
    });

    // Forward cookies from the backend response
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      apiResponse.headers.set("Set-Cookie", setCookieHeader);
    }

    return apiResponse;
  } catch (error) {
    console.error("[API /auth/refresh] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error"
      },
      { status: 500 }
    );
  }
}
