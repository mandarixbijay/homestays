import { NextRequest, NextResponse } from "next/server";

// Backend base URL from environment variable
const BACKEND_URL = process.env.API_BASE_URL || "http://localhost:3001";

// Helper function to forward JSON requests to the backend
async function forwardJsonRequest(
  req: NextRequest,
  sessionId: string,
  method: "POST" | "PATCH"
): Promise<NextResponse> {
  try {
    // Validate sessionId format (UUID)
    if (!sessionId || !/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
      console.error(`Invalid session ID: ${sessionId}`);
      return NextResponse.json({ message: "Invalid session ID format" }, { status: 400 });
    }

    // Parse the JSON body from the incoming request
    const body = await req.json();

    // Validate required fields
    const { totalRooms, rooms } = body;
    if (totalRooms === undefined || !rooms) {
      console.error("Missing required fields in JSON data:", { totalRooms, rooms });
      return NextResponse.json(
        { message: "Missing required fields: totalRooms and rooms are required" },
        { status: 400 }
      );
    }

    // Validate totalRooms is a positive integer
    if (!Number.isInteger(totalRooms) || totalRooms < 1 || totalRooms > 50) {
      console.error("Invalid totalRooms value:", totalRooms);
      return NextResponse.json(
        { message: "totalRooms must be a positive integer between 1 and 50" },
        { status: 400 }
      );
    }

    // Validate rooms is an array and matches totalRooms
    if (!Array.isArray(rooms) || rooms.length !== totalRooms) {
      console.error("Rooms length does not match totalRooms:", {
        roomsLength: rooms.length,
        totalRooms,
      });
      return NextResponse.json({ message: "Number of rooms must match totalRooms" }, { status: 400 });
    }

    // Basic validation for room structure (more detailed validation should be handled by backend)
    for (const room of rooms) {
      if (
        !room.id ||
        typeof room.name !== "string" ||
        !room.maxOccupancy ||
        !room.minOccupancy ||
        !room.price ||
        typeof room.maxOccupancy.adults !== "number" ||
        typeof room.maxOccupancy.children !== "number" ||
        typeof room.minOccupancy.adults !== "number" ||
        typeof room.minOccupancy.children !== "number" ||
        typeof room.price.value !== "number" ||
        !["USD", "NPR"].includes(room.price.currency)
      ) {
        console.error("Invalid room data structure:", room);
        return NextResponse.json({ message: "Invalid room data structure" }, { status: 400 });
      }
    }

    // Forward the request to the backend
    const backendUrl = `${BACKEND_URL}/onboarding/step4/${sessionId}`;
    console.log(`Proxying ${method} Step 4 request to: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10-second timeout
    });

    // Handle backend response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "No error details available" }));
      console.error(`Failed to ${method} Step 4 data (Status: ${response.status})`, errorData);
      return NextResponse.json(
        { message: errorData.message || `Failed to ${method === "PATCH" ? "update" : "submit"} room information` },
        { status: response.status }
      );
    }

    console.log(`Step 4 ${method === "PATCH" ? "updated" : "submitted"} successfully`);
    return NextResponse.json(
      { message: `Step 4 ${method === "PATCH" ? "updated" : "submitted"} successfully` },
      { status: method === "PATCH" ? 200 : 201 }
    );
  } catch (error) {
    console.error(`Error in ${method} /api/onboarding/step4/${sessionId}:`, error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle POST request (submit new Step 4 data)
export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return forwardJsonRequest(req, sessionId, "POST");
}

// Handle PATCH request (update existing Step 4 data)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return forwardJsonRequest(req, sessionId, "PATCH");
}

// Handle GET request (fetch Step 4 data)
export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  try {
    // Validate sessionId format (UUID)
    if (!sessionId || !/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
      console.error(`Invalid session ID: ${sessionId}`);
      return NextResponse.json({ message: "Invalid session ID format" }, { status: 400 });
    }

    const backendUrl = `${BACKEND_URL}/onboarding/step4/${sessionId}`;
    console.log(`Proxying GET Step 4 request to: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000), // 10-second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "No error details available" }));
      console.error(`Failed to fetch Step 4 data (Status: ${response.status})`, errorData);
      if (response.status === 404) {
        // Return default empty data for non-existent sessions, consistent with frontend expectations
        return NextResponse.json({ totalRooms: 1, rooms: [] }, { status: 200 });
      }
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch room information" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Proxy fetched Step 4 data:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/onboarding/step4/${sessionId}:`, error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}