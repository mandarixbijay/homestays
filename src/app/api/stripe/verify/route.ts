// src/app/api/stripe/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil", // Use the required API version
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId, bookingId } = await request.json();

    // Validate input
    if (!sessionId || !bookingId) {
      return NextResponse.json(
        { error: "Missing sessionId or bookingId", details: { sessionId, bookingId } },
        { status: 400 }
      );
    }

    // Verify Stripe payment
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${session.payment_status}`, details: { payment_status: session.payment_status } },
        { status: 400 }
      );
    }

    // Get Payment Intent ID
    const paymentIntentId = session.payment_intent
      ? typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent.id
      : null;
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "No Payment Intent found for this session", details: { sessionId } },
        { status: 400 }
      );
    }

    // Prepare headers for confirm-payment
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      accept: "application/json",
    };

    // Check if booking was made by an authenticated user
    const authSession = await getServerSession(authOptions);
    const isAuthenticated = !!authSession?.user?.accessToken;

    // For guest bookings, do not include Authorization header
    if (isAuthenticated) {
      headers["Authorization"] = `Bearer ${authSession.user.accessToken}`;
    } else {
      console.log("Guest booking detected; no Authorization header included");
    }

    // Prepare metadata
    const metadata = session.metadata || {};

    // Call confirm-payment endpoint
    const confirmUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/confirm-payment`;
    console.log("Confirming payment at:", confirmUrl, "with payload:", {
      groupBookingId: bookingId,
      transactionId: paymentIntentId,
      metadata,
    });

    const response = await fetch(confirmUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        groupBookingId: bookingId,
        transactionId: paymentIntentId,
        metadata,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Backend confirm-payment error:", {
        status: response.status,
        responseData: data,
      });
      return NextResponse.json(
        { error: data.error || "Failed to confirm payment", details: data },
        { status: response.status }
      );
    }

    console.log("Payment confirmed:", data);
    return NextResponse.json({ status: "CONFIRMED", booking: data }, { status: 200 });
  } catch (error: any) {
    console.error("Error in Stripe verify route:", {
      message: error.message,
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
    return NextResponse.json(
      { error: "Failed to confirm payment", details: error.message },
      { status: error.statusCode || 500 }
    );
  }
}