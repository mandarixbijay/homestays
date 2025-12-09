import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56:3001';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`[API Route] Fetching community with ID: ${id}`);

    // Fetch all communities since the backend doesn't support /communities/{id}
    const response = await fetch(`${API_BASE_URL}/communities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] Error fetching communities:`, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch communities' },
        { status: response.status }
      );
    }

    const communities = await response.json();

    // Filter to find the specific community
    const community = communities.find((c: any) => c.id === parseInt(id));

    if (!community) {
      console.error(`[API Route] Community not found with ID: ${id}`);
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    console.log(`[API Route] Found community: ${community.name}`);
    return NextResponse.json(community);
  } catch (error) {
    console.error('[API Route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
