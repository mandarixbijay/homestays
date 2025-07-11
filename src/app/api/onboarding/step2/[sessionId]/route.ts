// src/app/api/onboarding/step2/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId || !/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID format" },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const description = formData.get("description")?.toString();
    const imageMetadata = formData.get("imageMetadata")?.toString();
    const images = formData.getAll("images") as File[];

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 },
      );
    }
    if (!imageMetadata) {
      return NextResponse.json(
        { error: "imageMetadata is required" },
        { status: 400 },
      );
    }

    let parsedMetadata: { tags: string[]; isMain: boolean; url?: string }[];
    try {
      parsedMetadata = JSON.parse(imageMetadata);
      if (!Array.isArray(parsedMetadata) || parsedMetadata.length === 0) {
        throw new Error("imageMetadata must be a non-empty array");
      }
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid imageMetadata format: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 400 },
      );
    }

    const newImageCount = parsedMetadata.filter((img) => !img.url).length;
    if (newImageCount !== images.length) {
      return NextResponse.json(
        { error: `Expected ${newImageCount} new image file(s), received ${images.length}` },
        { status: 400 },
      );
    }

    if (parsedMetadata.filter((img) => img.isMain).length !== 1) {
      return NextResponse.json(
        { error: "Exactly one image must be marked as main" },
        { status: 400 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("description", description);
    backendFormData.append("imageMetadata", imageMetadata);
    images.forEach((image) => {
      backendFormData.append("images", image);
    });

    const response = await fetch(`${API_BASE_URL}/onboarding/step2/${sessionId}`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to submit Step 2 to backend" },
        { status: response.status },
      );
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/onboarding/step2/[sessionId]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId || !/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID format" },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const description = formData.get("description")?.toString();
    const imageMetadata = formData.get("imageMetadata")?.toString();
    const images = formData.getAll("images") as File[];

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 },
      );
    }
    if (!imageMetadata) {
      return NextResponse.json(
        { error: "imageMetadata is required" },
        { status: 400 },
      );
    }

    let parsedMetadata: { tags: string[]; isMain: boolean; url?: string }[];
    try {
      parsedMetadata = JSON.parse(imageMetadata);
      if (!Array.isArray(parsedMetadata) || parsedMetadata.length === 0) {
        throw new Error("imageMetadata must be a non-empty array");
      }
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid imageMetadata format: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 400 },
      );
    }

    const newImageCount = parsedMetadata.filter((img) => !img.url).length;
    if (newImageCount !== images.length) {
      return NextResponse.json(
        { error: `Expected ${newImageCount} new image file(s), received ${images.length}` },
        { status: 400 },
      );
    }

    if (parsedMetadata.filter((img) => img.isMain).length !== 1) {
      return NextResponse.json(
        { error: "Exactly one image must be marked as main" },
        { status: 400 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("description", description);
    backendFormData.append("imageMetadata", imageMetadata);
    images.forEach((image) => {
      backendFormData.append("images", image);
    });

    const response = await fetch(`${API_BASE_URL}/onboarding/step2/${sessionId}`, {
      method: "PATCH",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to update Step 2 to backend" },
        { status: response.status },
      );
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/onboarding/step2/[sessionId]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    if (!sessionId || !/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID format" },
        { status: 400 },
      );
    }

    const response = await fetch(`${API_BASE_URL}/onboarding/step2/${sessionId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch Step 2 data" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/onboarding/step2/[sessionId]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';