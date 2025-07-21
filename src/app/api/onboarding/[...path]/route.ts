
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = params;
  const url = `${API_BASE_URL}/onboarding/${path.join('/')}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to process GET request' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = params;
  const url = `${API_BASE_URL}/onboarding/${path.join('/')}`;
  
  try {
    const formData = await req.formData();
    const headers: Record<string, string> = {};
    
    if (formData) {
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axios.post(url, formData || await req.json(), { headers });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to process POST request' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const { path } = params;
  const url = `${API_BASE_URL}/onboarding/${path.join('/')}`;
  
  try {
    const formData = await req.formData();
    const headers: Record<string, string> = {};
    
    if (formData) {
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axios.patch(url, formData || await req.json(), { headers });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to process PATCH request' },
      { status: error.response?.status || 500 }
    );
  }
}
