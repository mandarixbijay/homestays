// src/lib/api/campaign.ts

import axios from 'axios';
import { getSession } from 'next-auth/react';
import type {
  Campaign,
  CampaignHomestay,
  CampaignReview,
  CampaignDiscount,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  GenerateBulkQRCodesRequest,
  RegisterHomestayRequest,
  BulkRegisterHomestayRequest,
  TrackQRScanRequest,
  VerifyUserRequest,
  VerifyOTPRequest,
  CompleteRegistrationRequest,
  SubmitReviewRequest,
  VerifyReviewRequest,
  RespondToReviewRequest,
  ValidateDiscountRequest,
  GetCampaignsQuery,
  GetCampaignHomestaysQuery,
  GetReviewsQuery,
  GetDiscountsQuery,
  PaginatedResponse,
  GenerateBulkQRCodesResponse,
  RegisterHomestayResponse,
  BulkRegisterResponse,
  TrackQRScanResponse,
  VerifyUserResponse,
  VerifyOTPResponse,
  CompleteRegistrationResponse,
  SubmitReviewResponse,
  ValidateDiscountResponse,
  UploadImagesResponse,
} from '@/types/campaign';

const API_BASE_URL = '/api';

// Create axios instance with interceptors for authentication
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get session from NextAuth
    const session = await getSession();

    // Add auth token if available
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== CAMPAIGN MANAGEMENT (ADMIN) ====================

/**
 * Create a new campaign
 * @requires Admin authentication
 */
export const createCampaign = async (data: CreateCampaignRequest): Promise<Campaign> => {
  const response = await apiClient.post<Campaign>(`/campaign`, data);
  return response.data;
};

/**
 * Get all campaigns with pagination
 * @public
 */
export const getCampaigns = async (params?: GetCampaignsQuery): Promise<PaginatedResponse<Campaign>> => {
  const response = await apiClient.get<PaginatedResponse<Campaign>>(`/campaign`, { params });
  return response.data;
};

/**
 * Get campaign by ID
 * @public
 */
export const getCampaignById = async (id: number): Promise<Campaign> => {
  const response = await apiClient.get<Campaign>(`/campaign/${id}`);
  return response.data;
};

/**
 * Update campaign
 * @requires Admin authentication
 */
export const updateCampaign = async (id: number, data: UpdateCampaignRequest): Promise<Campaign> => {
  const response = await apiClient.put<Campaign>(`/campaign/${id}`, data);
  return response.data;
};

/**
 * Delete campaign
 * @requires Admin authentication
 */
export const deleteCampaign = async (id: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/campaign/${id}`);
  return response.data;
};

// ==================== QR CODE GENERATION (ADMIN) ====================

/**
 * Generate bulk QR codes for printing
 * @requires Admin authentication
 */
export const generateBulkQRCodes = async (data: GenerateBulkQRCodesRequest): Promise<GenerateBulkQRCodesResponse> => {
  const response = await apiClient.post<GenerateBulkQRCodesResponse>(
    `/campaign/qr-codes/generate`,
    data
  );
  return response.data;
};

/**
 * Get all QR codes for a campaign
 * @requires Admin authentication
 */
export const getCampaignQRCodes = async (campaignId: number, page: number = 1, limit: number = 50): Promise<any> => {
  const response = await apiClient.get(
    `/campaign/${campaignId}/qr-codes`,
    { params: { page, limit } }
  );
  return response.data;
};

/**
 * Delete a QR code
 * @requires Admin authentication
 */
export const deleteQRCode = async (qrCodeId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/campaign/qr-codes/${qrCodeId}`
  );
  return response.data;
};

// ==================== HOMESTAY REGISTRATION (FIELD STAFF) ====================

/**
 * Register single homestay with pre-printed QR code
 * @requires Field Staff authentication
 */
export const registerHomestay = async (data: RegisterHomestayRequest): Promise<RegisterHomestayResponse> => {
  const response = await apiClient.post<RegisterHomestayResponse>(
    `/campaign/homestay/register`,
    data
  );
  return response.data;
};

/**
 * Bulk register homestays
 * @requires Field Staff authentication
 */
export const bulkRegisterHomestays = async (data: BulkRegisterHomestayRequest): Promise<BulkRegisterResponse> => {
  const response = await apiClient.post<BulkRegisterResponse>(
    `/campaign/homestay/bulk-register`,
    data
  );
  return response.data;
};

/**
 * Get campaign homestays
 * @public
 */
export const getCampaignHomestays = async (
  campaignId: number,
  params?: GetCampaignHomestaysQuery
): Promise<PaginatedResponse<CampaignHomestay>> => {
  const response = await apiClient.get<PaginatedResponse<CampaignHomestay>>(
    `/campaign/${campaignId}/homestays`,
    { params }
  );
  return response.data;
};

/**
 * Get homestay by QR code
 * @public
 */
export const getHomestayByQRCode = async (qrCode: string): Promise<CampaignHomestay> => {
  const response = await apiClient.get<CampaignHomestay>(`/campaign/qr/${qrCode}`);
  return response.data;
};

// ==================== GUEST REVIEW FLOW (PUBLIC/AUTHENTICATED) ====================

/**
 * Track QR code scan
 * @public
 */
export const trackQRScan = async (data: TrackQRScanRequest): Promise<TrackQRScanResponse> => {
  const response = await apiClient.post<TrackQRScanResponse>(`/campaign/scan`, data);
  return response.data;
};

/**
 * Verify user contact and send OTP
 * @public
 */
export const verifyUserForReview = async (data: VerifyUserRequest): Promise<VerifyUserResponse> => {
  const response = await apiClient.post<VerifyUserResponse>(
    `/campaign/review/verify-user`,
    data
  );
  return response.data;
};

/**
 * Verify OTP code
 * @public
 */
export const verifyOTPForReview = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  const response = await apiClient.post<VerifyOTPResponse>(
    `/campaign/review/verify-otp`,
    data
  );
  return response.data;
};

/**
 * Complete registration during review flow
 * @public
 */
export const completeRegistration = async (data: CompleteRegistrationRequest): Promise<CompleteRegistrationResponse> => {
  const response = await apiClient.post<CompleteRegistrationResponse>(
    `/campaign/review/complete-registration`,
    data
  );
  return response.data;
};

/**
 * Upload review images
 * @requires Authentication
 */
export const uploadReviewImages = async (files: File[]): Promise<UploadImagesResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await apiClient.post<UploadImagesResponse>(
    `/campaign/review/upload-images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Submit campaign review
 * @requires Authentication
 */
export const submitReview = async (data: SubmitReviewRequest): Promise<SubmitReviewResponse> => {
  const response = await apiClient.post<SubmitReviewResponse>(
    `/campaign/review/submit`,
    data
  );
  return response.data;
};

// ==================== ADMIN REVIEW VERIFICATION ====================

/**
 * Get all campaign reviews
 * @public (filtered by query params)
 * @requires Admin authentication for moderation
 */
export const getCampaignReviews = async (params?: GetReviewsQuery): Promise<PaginatedResponse<CampaignReview>> => {
  const response = await apiClient.get<PaginatedResponse<CampaignReview>>(
    `/campaign/reviews/all`,
    { params }
  );
  return response.data;
};

/**
 * Verify or reject review
 * @requires Admin authentication
 */
export const verifyReview = async (reviewId: number, data: VerifyReviewRequest): Promise<CampaignReview> => {
  const response = await apiClient.put<CampaignReview>(
    `/campaign/reviews/${reviewId}/verify`,
    data
  );
  return response.data;
};

// ==================== HOST REVIEW RESPONSES ====================

/**
 * Respond to review
 * @requires Host authentication
 */
export const respondToReview = async (reviewId: number, data: RespondToReviewRequest): Promise<CampaignReview> => {
  const response = await apiClient.put<CampaignReview>(
    `/campaign/reviews/${reviewId}/respond`,
    data
  );
  return response.data;
};

// ==================== DISCOUNT MANAGEMENT (USER) ====================

/**
 * Get user's discount codes
 * @requires Authentication
 */
export const getMyDiscounts = async (params?: GetDiscountsQuery): Promise<CampaignDiscount[]> => {
  const response = await apiClient.get<CampaignDiscount[]>(
    `/campaign/discounts/my`,
    { params }
  );
  return response.data;
};

/**
 * Validate discount code
 * @requires Authentication
 */
export const validateDiscountCode = async (data: ValidateDiscountRequest): Promise<ValidateDiscountResponse> => {
  const response = await apiClient.post<ValidateDiscountResponse>(
    `/campaign/discounts/validate`,
    data
  );
  return response.data;
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Download QR code image
 * Helper function to download QR code images from S3 URLs
 */
export const downloadQRCodeImage = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    // Check if blob is valid
    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Clean up after a short delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    }, 100);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Failed to download ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Download all QR codes from bulk generation
 */
export const downloadAllQRCodes = async (qrCodes: GenerateBulkQRCodesResponse['qrCodes']): Promise<void> => {
  for (let i = 0; i < qrCodes.length; i++) {
    const qr = qrCodes[i];
    await downloadQRCodeImage(qr.qrCodeUrl, `qr-code-${i + 1}.png`);
    // Add small delay to avoid overwhelming the browser
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

/**
 * Format discount code for display
 */
export const formatDiscountCode = (discount: CampaignDiscount): string => {
  const expiresAt = new Date(discount.expiresAt);
  const isExpired = expiresAt < new Date();
  const daysLeft = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  if (isExpired) {
    return `${discount.discountCode} (Expired)`;
  }
  if (discount.isUsed) {
    return `${discount.discountCode} (Used)`;
  }
  return `${discount.discountCode} (${daysLeft} days left)`;
};

/**
 * Check if discount code is valid
 */
export const isDiscountValid = (discount: CampaignDiscount): boolean => {
  const expiresAt = new Date(discount.expiresAt);
  return !discount.isUsed && expiresAt > new Date();
};
