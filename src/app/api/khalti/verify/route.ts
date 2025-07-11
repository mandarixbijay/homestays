// src/app/api/khalti/verify/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { pidx } = await request.json();

    const response = await axios.post(
      process.env.KHALTI_SANDBOX_URL?.replace("initiate", "lookup") || "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_TEST_SECRET_KEY || "05bf95cc57244045b8df5fad06748dab"}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error verifying Khalti payment:", error);
    return NextResponse.json(
      { error: "Failed to verify Khalti payment" },
      { status: error.response?.status || 500 }
    );
  }
}