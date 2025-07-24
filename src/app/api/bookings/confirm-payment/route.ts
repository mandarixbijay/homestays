// src/app/api/bookings/confirm-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const { groupBookingId, transactionId, metadata } = await request.json();

    // Validate input
    if (!groupBookingId || !transactionId) {
      return NextResponse.json(
        { error: "Missing groupBookingId or transactionId" },
        { status: 400 }
      );
    }

    // Get authentication session
    const authSession = await getServerSession(authOptions);
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      accept: "application/json",
    };
    if (authSession?.user?.accessToken) {
      headers["Authorization"] = `Bearer ${authSession.user.accessToken}`;
    }

    // Call backend confirm-payment endpoint
    const confirmUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/confirm-payment`;
    console.log("Forwarding to backend confirm-payment:", confirmUrl);

    const response = await fetch(confirmUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        groupBookingId,
        transactionId,
        metadata: metadata || {},
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to confirm payment" },
        { status: response.status }
      );
    }

    console.log("Backend payment confirmation response:", data);
    return NextResponse.json({ status: "CONFIRMED", booking: data }, { status: 200 });
  } catch (error: any) {
    console.error("Error in confirm-payment route:", {
      message: error.message,
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
    return NextResponse.json(
      { error: "Failed to confirm payment", details: error.message },
      { status: 500 }
    );
  }
}