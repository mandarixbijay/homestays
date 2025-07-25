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
      return_url,
      website_url,
      metadata,
    } = await request.json();

    // Validate required fields
    if (!return_url || !website_url) {
      return NextResponse.json(
        { error: "Missing return_url or website_url", error_key: "validation_error" },
        { status: 400 }
      );
    }
    if (!amount || !Number.isInteger(amount) || amount < 1000) {
      return NextResponse.json(
        { error: "Amount must be an integer and at least 1000 paisa (10 NPR)", error_key: "validation_error" },
        { status: 400 }
      );
    }
    if (!purchase_order_id || !purchase_order_name) {
      return NextResponse.json(
        { error: "Missing purchase_order_id or purchase_order_name", error_key: "validation_error" },
        { status: 400 }
      );
    }

    // Validate customer_info if provided
    if (customer_info) {
      if (customer_info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_info.email)) {
        return NextResponse.json(
          { error: "Invalid email address", error_key: "validation_error" },
          { status: 400 }
        );
      }
      if (customer_info.phone && !/^\+\d{10,15}$/.test(customer_info.phone)) {
        return NextResponse.json(
          { error: "Invalid phone number. Must include country code (e.g., +9771234567890)", error_key: "validation_error" },
          { status: 400 }
        );
      }
    }

    // Validate amount_breakdown if provided
    if (amount_breakdown) {
      const totalBreakdown = amount_breakdown.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
      if (totalBreakdown !== amount) {
        return NextResponse.json(
          { error: "Amount breakdown mismatch", error_key: "validation_error" },
          { status: 400 }
        );
      }
    }

    // Format metadata with merchant_ prefix
    const formattedMetadata = metadata
      ? Object.keys(metadata).reduce((acc, key) => {
          acc[`merchant_${key}`] = metadata[key];
          return acc;
        }, {} as Record<string, any>)
      : {};

    // Log the payload for debugging
    console.log("Khalti initiate payload:", JSON.stringify({
      return_url,
      website_url,
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info,
      amount_breakdown,
      product_details,
      ...formattedMetadata,
    }, null, 2));

    // Validate environment variables
    const khaltiUrl = "https://dev.khalti.com/api/v2/epayment/initiate/";
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
    if (!khaltiSecretKey) {
      return NextResponse.json(
        { error: "Khalti secret key is not configured", error_key: "server_error" },
        { status: 500 }
      );
    }

    // Retry logic for 500 errors
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const response = await axios.post(
          khaltiUrl,
          {
            return_url,
            website_url,
            amount,
            purchase_order_id,
            purchase_order_name,
            customer_info: customer_info || undefined,
            amount_breakdown,
            product_details,
            ...formattedMetadata,
          },
          {
            headers: {
              Authorization: `Key ${khaltiSecretKey}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        console.log("Khalti API response:", JSON.stringify(response.data, null, 2));
        return NextResponse.json(response.data);
      } catch (error: any) {
        console.error("Khalti API error:", {
          attempt: attempt + 1,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        if (error.response?.status === 500 && attempt < maxRetries - 1) {
          attempt++;
          console.log(`Retrying Khalti request (attempt ${attempt + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        const errorMessage =
          error.response?.status === 500
            ? "Khalti server is currently unavailable. Please try again later or use another payment method."
            : error.response?.status === 401
            ? "Invalid Khalti authorization key. Please contact support."
            : error.response?.data?.error_key === "validation_error"
            ? error.response?.data?.message || JSON.stringify(error.response?.data) || "Invalid payment details"
            : error.message || "Failed to initiate Khalti payment";
        return NextResponse.json(
          { error: errorMessage, details: error.response?.data || error.message },
          { status: error.response?.status || 500 }
        );
      }
    }
  } catch (error: any) {
    console.error("Error initiating Khalti payment:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return NextResponse.json(
      { error: "Failed to initiate Khalti payment", details: error.message },
      { status: 500 }
    );
  }
}