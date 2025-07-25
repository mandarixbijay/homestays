import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";

export async function POST(request: NextRequest) {
  console.log("Khalti verify request started:", new Date().toISOString());
  try {
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
    const { pidx, bookingId } = body;

    // Validate input
    if (!pidx || !bookingId) {
      console.log("Validation failed: Missing pidx or bookingId", { pidx, bookingId });
      return NextResponse.json(
        { error: "Missing pidx or bookingId", error_key: "validation_error" },
        { status: 400 }
      );
    }
    console.log("Input validated:", { pidx, bookingId });

    // Verify Khalti payment
    const khaltiApiUrl = "https://khalti.com/api/v2/epayment/lookup/";
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
    if (!khaltiSecretKey) {
      console.log("Khalti secret key missing");
      return NextResponse.json(
        { error: "Khalti secret key is not configured", error_key: "server_error" },
        { status: 500 }
      );
    }
    console.log("Khalti API URL and key ready:", { khaltiApiUrl, key: "****" });

    console.log("Sending Khalti lookup request:", { pidx });
    const response = await axios.post(
      khaltiApiUrl,
      { pidx },
      {
        headers: {
          Authorization: `Key ${khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const khaltiData = response.data as {
      status: string;
      purchase_order_id?: string;
      total_amount?: number;
      transaction_ts?: string;
      transaction_id?: string;
      [key: string]: any;
    };
    console.log("Khalti lookup response:", JSON.stringify(khaltiData, null, 2));

    if (khaltiData.status !== "Completed") {
      console.log("Payment not completed:", { status: khaltiData.status });
      return NextResponse.json(
        { error: `Payment not completed. Status: ${khaltiData.status}`, error_key: "payment_error" },
        { status: 400 }
      );
    }
    console.log("Payment status is Completed");

    // Validate purchase_order_id matches bookingId
    if (khaltiData.purchase_order_id && khaltiData.purchase_order_id !== bookingId) {
      console.log("Mismatched purchase_order_id:", {
        khalti: khaltiData.purchase_order_id,
        bookingId,
      });
      return NextResponse.json(
        { error: "Mismatched purchase_order_id and bookingId", error_key: "validation_error" },
        { status: 400 }
      );
    }
    console.log("purchase_order_id validated:", { purchase_order_id: khaltiData.purchase_order_id });

    // Get authentication session
    console.log("Fetching auth session");
    const authSession = await getServerSession(authOptions);
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      accept: "application/json",
    };
    if (authSession?.user?.accessToken) {
      headers["Authorization"] = `Bearer ${authSession.user.accessToken}`;
      console.log("Auth token included in headers");
    } else {
      console.log("No auth token available");
    }

    // Prepare metadata
    const metadata = {
      purchase_order_id: khaltiData.purchase_order_id || bookingId,
      amount: khaltiData.total_amount,
      currency: "NPR",
      transaction_timestamp: khaltiData.transaction_ts || new Date().toISOString(),
      khalti_transaction_id: khaltiData.transaction_id, // Store actual transaction_id for reference
      ...Object.keys(khaltiData).reduce((acc, key) => {
        if (key.startsWith("merchant_")) {
          acc[key.replace("merchant_", "")] = khaltiData[key];
        }
        return acc;
      }, {} as Record<string, any>),
    };
    console.log("Prepared metadata:", JSON.stringify(metadata, null, 2));

    // Call confirm-payment endpoint with pidx as transactionId
    const confirmUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/confirm-payment`;
    const confirmPayload = {
      groupBookingId: bookingId,
      transactionId: `pidx_${pidx}`, // Use pidx with prefix
      metadata,
    };
    console.log("Confirming payment at:", confirmUrl, "with payload:", JSON.stringify(confirmPayload, null, 2));

    const confirmResponse = await fetch(confirmUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(confirmPayload),
      signal: AbortSignal.timeout(15000),
    });

    const data = await confirmResponse.json();
    console.log("Booking confirmation response:", JSON.stringify(data, null, 2));
    if (!confirmResponse.ok) {
      console.error("Booking confirmation failed:", {
        status: confirmResponse.status,
        error: data.error,
        details: data,
      });
      return NextResponse.json(
        { error: data.error || "Failed to confirm payment", error_key: "confirmation_error" },
        { status: confirmResponse.status }
      );
    }

    console.log("Payment confirmed successfully:", JSON.stringify(data, null, 2));
    return NextResponse.json({ status: "CONFIRMED", booking: data }, { status: 200 });
  } catch (error: any) {
    console.error("Error in Khalti verify:", {
      error: "Failed to verify payment",
      message: error.message,
      status: error.response?.status,
      details: error.response?.data || error.message,
      stack: error.stack,
    });
    const errorMessage =
      error.response?.status === 401
        ? "Invalid Khalti authorization key"
        : error.response?.data?.error_key === "validation_error"
          ? error.response?.data?.detail || "Invalid pidx"
          : error.message || "Failed to verify Khalti payment";
    return NextResponse.json(
      { error: errorMessage, details: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  } finally {
    console.log("Khalti verify request completed:", new Date().toISOString());
  }
}