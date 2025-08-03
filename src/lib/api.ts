import axios from 'axios';
import { Step1Data, Step2Data, Step3Data, Step4Data, RegisterData } from '@/data/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to create API instance with token
const createAuthenticatedApi = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56',
    headers,
  });
};

// Helper function to get API instance with session token
const getApiWithAuth = async () => {
  try {
    // Try to get session on client side
    if (typeof window !== 'undefined') {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      const token = session?.user?.accessToken;
      return createAuthenticatedApi(token || undefined);
    }
  } catch (error) {
    console.warn('[API] Failed to get session token:', error);
  }
  
  return api;
};

// Alternative: Use this in React components where you already have the session
export const createApiWithToken = (token?: string) => createAuthenticatedApi(token);

// Existing onboarding APIs
export async function startSession(): Promise<{ sessionId: string }> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Calling startSession, baseURL:', apiClient.defaults.baseURL);
  try {
    const response = await apiClient.post('/onboarding/start');
    console.log('[API] startSession response:', {
      status: response.status,
      data: response.data,
    });
    const data = response.data as { sessionId?: string };
    if (!data.sessionId) {
      throw new Error('No sessionId in response');
    }
    return { sessionId: data.sessionId as string };
  } catch (error: any) {
    console.error('[API] startSession failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });
    throw new Error(error.response?.data?.message || error.message || 'Failed to start session');
  }
}

export async function getStep1(sessionId: string): Promise<Step1Data & { step: number }> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Fetching Step 1, sessionId:', sessionId);
  try {
    const response = await apiClient.get(`/onboarding/step1/${sessionId}`);
    console.log('[API] getStep1 response:', response.data);
    return response.data as Step1Data & { step: number };
  } catch (error: any) {
    console.error('[API] getStep1 failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function getStep2(sessionId: string): Promise<Step2Data & { step: number }> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Fetching Step 2, sessionId:', sessionId);
  try {
    const response = await apiClient.get(`/onboarding/step2/${sessionId}`);
    console.log('[API] getStep2 response:', response.data);
    const data = response.data as Step2Data & { step: number };
    return {
      description: data.description,
      imageMetadata: data.imageMetadata,
      images: data.images,
      step: data.step,
    };
  } catch (error: any) {
    console.error('[API] getStep2 failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function getStep3(sessionId: string): Promise<Step3Data & { step: number }> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Fetching Step 3, sessionId:', sessionId);
  try {
    const response = await apiClient.get(`/onboarding/step3/${sessionId}`);
    console.log('[API] getStep3 response:', response.data);
    return response.data as Step3Data & { step: number };
  } catch (error: any) {
    console.error('[API] getStep3 failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function getStep4(sessionId: string): Promise<Step4Data & { step: number }> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Fetching Step 4, sessionId:', sessionId);
  try {
    const response = await apiClient.get(`/onboarding/step4/${sessionId}`);
    console.log('[API] getStep4 response:', response.data);
    return response.data as Step4Data & { step: number };
  } catch (error: any) {
    console.error('[API] getStep4 failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function submitStep1(sessionId: string, data: Step1Data, isUpdate: boolean): Promise<void> {
  const apiClient = await getApiWithAuth();
  const formData = new FormData();
  formData.append('propertyName', data.propertyName);
  formData.append('propertyAddress', data.propertyAddress);
  formData.append('contactNumber', data.contactNumber);
  if (data.documentType) formData.append('documentType', data.documentType);
  if (data.idScanFront) formData.append('idScanFront', data.idScanFront);
  if (data.idScanBack) formData.append('idScanBack', data.idScanBack);
  if (data.frontFile) formData.append('files', data.frontFile);
  if (data.backFile) formData.append('files', data.backFile);

  console.log('[API] Submitting Step 1, sessionId:', sessionId, 'isUpdate:', isUpdate);
  try {
    const response = await apiClient({
      method: isUpdate ? 'PATCH' : 'POST',
      url: `/onboarding/step1/${sessionId}`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('[API] submitStep1 response:', response.data);
  } catch (error: any) {
    console.error('[API] submitStep1 failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function submitStep2(sessionId: string, data: Step2Data, isUpdate: boolean): Promise<void> {
  const apiClient = await getApiWithAuth();
  const formData = new FormData();
  formData.append('description', data.description);
  formData.append('imageMetadata', JSON.stringify(data.imageMetadata));
  data.images.forEach((file) => formData.append('images', file));

  console.log('[API] Submitting Step 2, sessionId:', sessionId, 'isUpdate:', isUpdate, 'imageMetadata:', data.imageMetadata);
  try {
    const response = await apiClient({
      method: isUpdate ? 'PATCH' : 'POST',
      url: `/onboarding/step2/${sessionId}`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('[API] submitStep2 response:', response.data);
  } catch (error: any) {
    console.error('[API] submitStep2 failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function submitStep3(sessionId: string, data: Step3Data, isUpdate: boolean): Promise<void> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Submitting Step 3, sessionId:', sessionId, 'isUpdate:', isUpdate, 'data:', data);
  try {
    const response = await apiClient({
      method: isUpdate ? 'PATCH' : 'POST',
      url: `/onboarding/step3/${sessionId}`,
      data,
    });
    console.log('[API] submitStep3 response:', response.data);
  } catch (error: any) {
    console.error('[API] submitStep3 failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function submitStep4(sessionId: string, data: Step4Data, isUpdate: boolean): Promise<void> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Submitting Step 4, sessionId:', sessionId, 'isUpdate:', isUpdate, 'data:', data);
  try {
    const response = await apiClient({
      method: isUpdate ? 'PATCH' : 'POST',
      url: `/onboarding/step4/${sessionId}`,
      data,
    });
    console.log('[API] submitStep4 response:', response.data);
  } catch (error: any) {
    console.error('[API] submitStep4 failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function finalizeRegistration(sessionId: string, data: RegisterData): Promise<void> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Finalizing registration, sessionId:', sessionId, 'data:', data);
  try {
    const response = await apiClient.post(`/onboarding/finalize/${sessionId}`, data);
    console.log('[API] finalizeRegistration response:', response.data);
  } catch (error: any) {
    console.error('[API] finalizeRegistration failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

// Admin-specific APIs
interface Homestay {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  ownerId: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rating: number | null;
  reviews: number;
  discount: number;
  vipAccess: boolean;
  images: { url: string; isMain: boolean; tags: string[] }[];
}

export async function getHomestays(): Promise<Homestay[]> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Fetching homestays');
  try {
    const response = await apiClient.get('/admin/homestays');
    console.log('[API] getHomestays response:', response.data);
    return response.data as Homestay[];
  } catch (error: any) {
    console.error('[API] getHomestays failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function getHomestay(id: number): Promise<Homestay> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Fetching homestay:', id);
  try {
    const response = await apiClient.get(`/admin/homestays/${id}`);
    console.log('[API] getHomestay response:', response.data);
    return response.data as Homestay;
  } catch (error: any) {
    console.error('[API] getHomestay failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function deleteHomestay(id: number): Promise<void> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Deleting homestay:', id);
  try {
    const response = await apiClient.delete(`/admin/homestays/${id}`);
    console.log('[API] deleteHomestay response:', response.data);
  } catch (error: any) {
    console.error('[API] deleteHomestay failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export async function approveHomestay(id: number): Promise<void> {
  const apiClient = await getApiWithAuth();
  console.log('[API] Approving homestay:', id);
  try {
    const response = await apiClient.patch(`/admin/homestays/${id}/approve`);
    console.log('[API] approveHomestay response:', response.data);
  } catch (error: any) {
    console.error('[API] approveHomestay failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}