import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

interface Params {
  sessionId: string;
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { sessionId } = await params; // Resolve the Promise
    const formData = await request.formData();
    console.log("POST FormData entries:", [...formData.entries()]);

    const response = await fetch(`${API_BASE_URL}/onboarding/step1/${sessionId}`, {
      method: "POST",
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error("POST Non-JSON response:", text || "[empty]");
      return NextResponse.json(
        { message: "Invalid response from server" },
        { status: 500 },
      );
    }

    const data = await response.json();
    if (!response.ok) {
      console.error("POST error response:", data);
      return NextResponse.json(
        { message: data.message || "Failed to submit Step 1" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("POST Step 1 error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { sessionId } = await params; // Resolve the Promise
    const contentType = request.headers.get("content-type") || "";
    let body: FormData | string;

    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
      console.log("PATCH FormData entries:", [...(body as FormData).entries()]);
    } else {
      body = await request.text();
      console.log("PATCH body:", body);
    }

    const response = await fetch(`${API_BASE_URL}/onboarding/step1/${sessionId}`, {
      method: "PATCH",
      headers: contentType.includes("multipart/form-data")
        ? {} // Let browser set Content-Type with boundary
        : { "Content-Type": contentType || "application/json" },
      body,
    });

    const responseContentType = response.headers.get("content-type");
    if (response.status === 200 && responseContentType === null && response.headers.get("content-length") === "0") {
      console.log("PATCH successful with empty response");
      return NextResponse.json({}, { status: 200 });
    }

    if (!responseContentType?.includes("application/json")) {
      const text = await response.text();
      console.error(`PATCH Non-JSON response (status: ${response.status}):`, text || "[empty]");
      console.error("Response headers:", Object.fromEntries(response.headers.entries()));
      return NextResponse.json(
        { message: `Invalid response from server (status: ${response.status})` },
        { status: 500 },
      );
    }

    const data = await response.json();
    if (!response.ok) {
      console.error(`PATCH error response (status: ${response.status}):`, data);
      return NextResponse.json(
        { message: data.message || "Failed to update Step 1" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PATCH Step 1 error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { sessionId } = await params; // Resolve the Promise
    const response = await fetch(`${API_BASE_URL}/onboarding/step1/${sessionId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error("GET Non-JSON response:", text || "[empty]");
      return NextResponse.json(
        { message: "Invalid response from server" },
        { status: 500 },
      );
    }

    const data = await response.json();
    if (!response.ok) {
      console.error("GET error response:", data);
      return NextResponse.json(
        { message: data.message || "Failed to fetch Step 1 data" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET Step 1 error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}