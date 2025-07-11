// src/app/api/khalti/initiate/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const {
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info,
      amount_breakdown,
      product_details,
    } = await request.json();

    // Log the payload for debugging
    console.log("Khalti initiate payload:", {
      return_url: `${request.headers.get("origin")}/payment-callback`,
      website_url: request.headers.get("origin"),
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info,
      amount_breakdown,
      product_details,
    });

    const response = await axios.post(
      process.env.KHALTI_SANDBOX_URL || "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: `${request.headers.get("origin")}/payment-callback`,
        website_url: request.headers.get("origin"),
        amount,
        purchase_order_id,
        purchase_order_name,
        customer_info,
        amount_breakdown,
        product_details,
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_TEST_SECRET_KEY || "05bf95cc57244045b8df5fad06748dab"}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log the Khalti response
    console.log("Khalti API response:", response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error initiating Khalti payment:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error:
          error.response?.data?.error_key === "validation_error"
            ? "Invalid payment details"
            : error.response?.data?.message || "Failed to initiate Khalti payment",
      },
      { status: error.response?.status || 500 }
    );
  }
}