import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const paymentMethodEnum = z.enum(["KHALTI", "ESEWA", "STRIPE", "CARD", "PAY_AT_PROPERTY"]);

const bookingSchema = z.object({
  homestayId: z.number().int().positive(),
  checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid check-in date format",
  }),
  checkOutDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid check-out date format",
  }),
  rooms: z.array(
    z.object({
      roomId: z.number().int().positive(),
      adults: z.number().int().min(1),
      children: z.number().int().min(0),
    })
  ).min(1, "At least one room is required"),
  paymentMethod: paymentMethodEnum,
  transactionId: z.string().optional(),
  guestName: z.string().min(1, "Guest name is required"),
  guestEmail: z.string().email("Invalid email address"),
  guestPhone: z.string().min(1, "Guest phone is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received booking request (guest):", body);

    const parsedBody = bookingSchema.safeParse(body);
    if (!parsedBody.success) {
      console.error("Validation error:", parsedBody.error.format());
      return NextResponse.json(
        { error: "Invalid input data", details: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) {
      console.error("API base URL not configured");
      return NextResponse.json(
        { error: "API base URL not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiBaseUrl}/bookings/guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(parsedBody.data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error("Backend API error:", responseData);
      return NextResponse.json(
        { error: responseData.message || "Failed to create booking", details: responseData.error || "Unknown error" },
        { status: response.status }
      );
    }

    console.log("Booking created successfully:", responseData);
    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Error creating booking:", error.message);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}