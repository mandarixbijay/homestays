// src/app/api/khalti/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const { pidx, bookingId } = await request.json();

    // Validate input
    if (!pidx || !bookingId) {
      return NextResponse.json(
        { error: "Missing pidx or bookingId", error_key: "validation_error" },
        { status: 400 }
      );
    }

    // Verify Khalti payment
    const khaltiApiUrl = process.env.KHALTI_SANDBOX_URL?.replace("initiate", "lookup") || "https://dev.khalti.com/api/v2/epayment/lookup/";
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
    if (!khaltiSecretKey) {
      return NextResponse.json(
        { error: "Khalti secret key is not configured", error_key: "server_error" },
        { status: 500 }
      );
    }

    const response = await axios.post(
      khaltiApiUrl,
      { pidx },
      {
        headers: {
          Authorization: `Key ${khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
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
      return NextResponse.json(
        { error: `Payment not completed. Status: ${khaltiData.status}`, error_key: "payment_error" },
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

    // Prepare metadata
    const metadata = {
      purchase_order_id: khaltiData.purchase_order_id,
      amount: khaltiData.total_amount,
      currency: "NPR",
      transaction_timestamp: khaltiData.transaction_ts || new Date().toISOString(),
      ...Object.keys(khaltiData).reduce((acc, key) => {
        if (key.startsWith("merchant_")) {
          acc[key.replace("merchant_", "")] = khaltiData[key];
        }
        return acc;
      }, {} as Record<string, any>),
    };

    // Call confirm-payment endpoint
    const confirmUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/confirm-payment`;
    console.log("Confirming payment at:", confirmUrl);

    const confirmResponse = await fetch(confirmUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        groupBookingId: bookingId,
        transactionId: khaltiData.transaction_id || pidx,
        metadata,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await confirmResponse.json();
    if (!confirmResponse.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to confirm payment", error_key: "confirmation_error" },
        { status: confirmResponse.status }
      );
    }

    console.log("Payment confirmed:", JSON.stringify(data, null, 2));
    return NextResponse.json({ status: "CONFIRMED", booking: data }, { status: 200 });
  } catch (error: any) {
    console.error("Error in Khalti verify route:", {
      message: error.message,
      status: error.response?.status,
      details: error.response?.data || error.message,
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
  }
}