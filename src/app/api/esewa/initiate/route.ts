// /src/app/api/esewa/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received eSewa initiate request:", body);

    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) {
      console.error("API base URL not configured");
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    // Note: eSewa requires a signature and specific payload format.
    // You'll need to implement signing logic with your eSewa merchant key.
    const response = await fetch("https://uat.esewa.com.np/epay/main", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amt: body.amount.toString(),
        psc: "0",
        pdc: "0",
        txAmt: body.tax_amount.toString(),
        tAmt: body.total_amount.toString(),
        pid: body.transaction_uuid,
        scd: process.env.ESEWA_MERCHANT_ID || "EPAYTEST",
        su: body.success_url,
        fu: body.failure_url,
        // Add signature here if required
      }).toString(),
    });

    const responseData = await response.text(); // Adjust based on eSewa API response format
    console.log("eSewa response:", responseData);

    // Parse eSewa response and extract payment_url
    // This is a placeholder; adjust based on actual eSewa API response
    const payment_url = "https://uat.esewa.com.np/epay/transrec"; // Replace with actual URL
    return NextResponse.json({ payment_url, pidx: body.transaction_uuid }, { status: 200 });
  } catch (error: any) {
    console.error("Error initiating eSewa payment:", error.message);
    return NextResponse.json(
      { error: "Failed to initiate eSewa payment", details: error.message },
      { status: 500 }
    );
  }
}