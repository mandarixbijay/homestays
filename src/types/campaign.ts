// src/types/campaign.ts

export interface Campaign {
  id: number;
  name: string;
  description: string | null;
  qrCodeTemplate: string | null;
  isActive: boolean;
  startDate: Date | string;
  endDate: Date | string | null;
  discountPercentage: number | null;
  discountValidDays: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    campaignHomestays: number;
    reviews: number;
    discounts: number;
  };
}

export interface CampaignHomestay {
  id: number;
  campaignId: number;
  homestayId: number | null;
  qrCode: string;
  qrCodeUrl: string;
  isActive: boolean;
  assignedBy: string | null;
  fieldNotes: string | null;
  scannedCount: number;
  reviewCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  homestay?: {
    id: number;
    name: string;
    address: string;
    contactNumber: string;
    hostEmail: string | null;
    hostPhone: string | null;
    rating: number;
    reviews: number;
    status: string;
    images?: Array<{
      id: number;
      url: string;
      isMain: boolean;
    }>;
  };
  campaign?: {
    id: number;
    name: string;
    description: string | null;
    discountPercentage: number | null;
    discountValidDays: number | null;
    isActive: boolean;
  };
}

export interface CampaignReview {
  id: number;
  campaignId: number;
  campaignHomestayId: number;
  homestayId: number;
  userId: number;
  rating: number;
  description: string | null;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  isVerified: boolean;
  isPublished: boolean;
  verifiedAt: Date | string | null;
  verifiedBy: number | null;
  adminNotes: string | null;
  hostResponse: string | null;
  hostResponseAt: Date | string | null;
  ipAddress: string;
  deviceFingerprint: string;
  deviceInfo: any;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
  campaign?: {
    id: number;
    name: string;
  };
  homestay?: {
    id: number;
    name: string;
    address: string;
  };
  images?: Array<{
    id: number;
    url: string;
  }>;
}

export interface CampaignDiscount {
  id: number;
  userId: number;
  campaignId: number;
  discountCode: string;
  discountPercent: number;
  isUsed: boolean;
  usedAt: Date | string | null;
  bookingId: number | null;
  expiresAt: Date | string;
  createdAt: Date | string;
  campaign?: {
    id: number;
    name: string;
  };
}

export interface QRCodeData {
  id: number;
  qrCode: string;
  qrCodeUrl: string;
  reviewUrl: string;
}

// ==================== REQUEST TYPES ====================

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  qrCodeTemplate?: string;
  startDate: string;
  endDate?: string;
  discountPercentage?: number;
  discountValidDays?: number;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  qrCodeTemplate?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  discountPercentage?: number;
  discountValidDays?: number;
}

export interface GenerateBulkQRCodesRequest {
  campaignId: number;
  count: number;
}

export interface RegisterHomestayRequest {
  qrCode: string;
  campaignId: number;
  name: string;
  address: string;
  contactNumber: string;
  hostEmail?: string;
  hostPhone?: string;
  assignedBy?: string;
  fieldNotes?: string;
}

export interface BulkRegisterHomestayRequest {
  campaignId: number;
  assignedBy: string;
  homestays: Array<{
    qrCode: string;
    name: string;
    address: string;
    contactNumber: string;
    hostEmail?: string;
    hostPhone?: string;
  }>;
}

export interface TrackQRScanRequest {
  qrCode: string;
  deviceInfo?: any;
}

export interface VerifyUserRequest {
  qrCode: string;
  contact: string;
  contactType: 'email' | 'phone';
}

export interface VerifyOTPRequest {
  qrCode: string;
  contact: string;
  code: string;
}

export interface CompleteRegistrationRequest {
  qrCode: string;
  contact: string;
  contactType: 'email' | 'phone';
  code: string;
  name: string;
  password: string;
}

export interface SubmitReviewRequest {
  qrCode: string;
  rating: number;
  description?: string;
  checkInDate: string;
  checkOutDate: string;
  images?: string[];
  deviceInfo?: any;
}

export interface VerifyReviewRequest {
  isVerified: boolean;
  isPublished: boolean;
  adminNotes?: string;
}

export interface RespondToReviewRequest {
  response: string;
}

export interface ValidateDiscountRequest {
  discountCode: string;
}

// ==================== RESPONSE TYPES ====================

export interface PaginatedResponse<T> {
  data?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Handle different response formats
  campaigns?: T[];
  campaignHomestays?: T[];
  reviews?: T[];
}

export interface GenerateBulkQRCodesResponse {
  campaignId: number;
  campaignName: string;
  count: number;
  message: string;
  qrCodes: QRCodeData[];
}

export interface RegisterHomestayResponse extends CampaignHomestay {
  message: string;
}

export interface BulkRegisterResponse {
  success: number;
  failed: number;
  message: string;
  results: CampaignHomestay[];
  errors: Array<{
    homestay: string;
    error: string;
  }>;
}

export interface TrackQRScanResponse {
  qrCode: string;
  homestay: {
    id: number;
    name: string;
    address: string;
    rating: number;
    reviews: number;
    images?: Array<{
      url: string;
    }>;
  };
  campaign: {
    id: number;
    name: string;
    description: string | null;
    discountPercentage: number | null;
    discountValidDays: number | null;
  };
  message: string;
}

export interface VerifyUserResponse {
  userExists: boolean;
  message: string;
  contact: string;
  contactType: 'email' | 'phone';
}

export interface VerifyOTPResponse {
  userId: number;
  userName: string;
  message: string;
}

export interface CompleteRegistrationResponse {
  userId: number;
  userName: string;
  message: string;
  needsJWT: boolean;
}

export interface SubmitReviewResponse {
  review: CampaignReview;
  message: string;
  discountIssued: boolean;
  discountCode?: {
    discountCode: string;
    discountPercent: number;
    expiresAt: Date | string;
  };
}

export interface ValidateDiscountResponse {
  valid: boolean;
  discount: CampaignDiscount;
}

export interface UploadImagesResponse {
  message: string;
  imageUrls: string[];
}

// ==================== QUERY PARAMS ====================

export interface GetCampaignsQuery {
  page?: number;
  limit?: number;
}

export interface GetCampaignHomestaysQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export interface GetReviewsQuery {
  page?: number;
  limit?: number;
  isVerified?: boolean;
  isPublished?: boolean;
  campaignId?: number;
  homestayId?: number;
}

export interface GetDiscountsQuery {
  isUsed?: boolean;
  includeExpired?: boolean;
}

// ==================== ERROR TYPES ====================

export interface CampaignError {
  status: 'error';
  message: string;
  errors?: Array<{
    property: string;
    constraints: Record<string, string>;
  }>;
  statusCode?: number;
}
