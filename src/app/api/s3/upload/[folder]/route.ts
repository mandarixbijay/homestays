// app/api/s3/upload/[folder]/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://13.61.8.56";

export async function POST(request: Request, context: { params: Promise<{ folder: string }> }) {
  const params = await context.params; // Await params
  const { folder } = params;

  if (!folder) {
    return NextResponse.json({ error: "Folder is required" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/s3/upload/${folder}`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend S3 upload error:", errorData); // Add logging
      return NextResponse.json(
        { error: errorData.message || "Failed to upload file" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}