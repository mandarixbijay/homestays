// src/app/api/esewa/verify/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { transaction_uuid, bookingId } = await request.json();
    const response = await fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod: "ESEWA", transactionId: transaction_uuid, bookingId }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to verify eSewa payment");
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in eSewa verify route:", error.message);
    return NextResponse.json(
      { error: "Failed to verify eSewa payment", details: error.message },
      { status: 500 }
    );
  }
}