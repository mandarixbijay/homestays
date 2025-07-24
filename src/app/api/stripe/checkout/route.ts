// src/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, description, metadata } = await request.json();

    // Validate input
    if (!amount || !currency || !description || !metadata?.bookingId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, currency, description, or bookingId", details: { amount, currency, description, bookingId: metadata?.bookingId } },
        { status: 400 }
      );
    }

    if (!Number.isInteger(amount) || amount < 50) {
      return NextResponse.json(
        { error: "Amount must be an integer and at least 50 cents in USD" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: description,
              metadata,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/payment-success?bookingId=${metadata.bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/payment-cancel?bookingId=${metadata.bookingId}`,
      metadata,
    });

    if (!session.id) {
      throw new Error("Failed to create Stripe checkout session");
    }

    console.log("Stripe checkout session created:", { sessionId: session.id });
    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error: any) {
    console.error("Stripe checkout error:", {
      message: error.message,
      details: error,
    });
    return NextResponse.json(
      { error: error.message || "Failed to initiate Stripe payment" },
      { status: 500 }
    );
  }
}