// /Users/mandarix/Documents/mandarix/home_stay_frontend_new/src/lib/api.ts

import axios from 'axios';
import { Step1Data, Step2Data, Step3Data, Step4Data, RegisterData } from '@/data/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://13.61.8.56',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function startSession(): Promise<{ sessionId: string }> {
  console.log('[API] Calling startSession, baseURL:', api.defaults.baseURL);
  try {
    const response = await api.post('/onboarding/start');
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
  console.log('[API] Fetching Step 1, sessionId:', sessionId);
  try {
    const response = await api.get(`/onboarding/step1/${sessionId}`);
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
  console.log('[API] Fetching Step 2, sessionId:', sessionId);
  try {
    const response = await api.get(`/onboarding/step2/${sessionId}`);
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
  console.log('[API] Fetching Step 3, sessionId:', sessionId);
  try {
    const response = await api.get(`/onboarding/step3/${sessionId}`);
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
  console.log('[API] Fetching Step 4, sessionId:', sessionId);
  try {
    const response = await api.get(`/onboarding/step4/${sessionId}`);
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
    const response = await api({
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
  const formData = new FormData();
  formData.append('description', data.description);
  formData.append('imageMetadata', JSON.stringify(data.imageMetadata));
  data.images.forEach((file) => formData.append('images', file));

  console.log('[API] Submitting Step 2, sessionId:', sessionId, 'isUpdate:', isUpdate, 'imageMetadata:', data.imageMetadata);
  try {
    const response = await api({
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
  console.log('[API] Submitting Step 3, sessionId:', sessionId, 'isUpdate:', isUpdate, 'data:', data);
  try {
    const response = await api({
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
  console.log('[API] Submitting Step 4, sessionId:', sessionId, 'isUpdate:', isUpdate, 'data:', data);
  try {
    const response = await api({
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
  console.log('[API] Finalizing registration, sessionId:', sessionId, 'data:', data);
  try {
    const response = await api.post(`/onboarding/finalize/${sessionId}`, data);
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