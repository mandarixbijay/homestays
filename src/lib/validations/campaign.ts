// src/lib/validations/campaign.ts

import { z } from 'zod';

// ==================== CAMPAIGN MANAGEMENT ====================

export const createCampaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters').max(100),
  description: z.string().optional(),
  qrCodeTemplate: z.string().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date format',
  }).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountValidDays: z.number().int().min(1).optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  qrCodeTemplate: z.string().optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date format',
  }).optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date format',
  }).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountValidDays: z.number().int().min(1).optional(),
});

// ==================== QR CODE GENERATION ====================

export const generateBulkQRCodesSchema = z.object({
  campaignId: z.number().int().positive('Campaign ID must be a positive number'),
  count: z.number().int().min(1, 'Must generate at least 1 QR code').max(1000, 'Cannot generate more than 1000 QR codes at once'),
});

// ==================== HOMESTAY REGISTRATION ====================

export const registerHomestaySchema = z.object({
  qrCode: z.string().uuid('Invalid QR code format'),
  campaignId: z.number().int().positive(),
  name: z.string().min(2, 'Homestay name must be at least 2 characters').max(200),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 characters'),
  hostEmail: z.string().email('Invalid email format').optional(),
  hostPhone: z.string().optional(),
  assignedBy: z.string().optional(),
  fieldNotes: z.string().max(1000).optional(),
}).refine(
  (data) => data.hostEmail || data.hostPhone,
  {
    message: 'Either host email or host phone must be provided',
    path: ['hostEmail'],
  }
);

export const bulkRegisterHomestaysSchema = z.object({
  campaignId: z.number().int().positive(),
  assignedBy: z.string().min(2, 'Assigned by must be at least 2 characters'),
  homestays: z.array(
    z.object({
      qrCode: z.string().uuid('Invalid QR code format'),
      name: z.string().min(2).max(200),
      address: z.string().min(5).max(500),
      contactNumber: z.string().min(10),
      hostEmail: z.string().email().optional(),
      hostPhone: z.string().optional(),
    }).refine(
      (data) => data.hostEmail || data.hostPhone,
      {
        message: 'Either host email or host phone must be provided',
        path: ['hostEmail'],
      }
    )
  ).min(1, 'At least one homestay is required').max(100, 'Cannot register more than 100 homestays at once'),
});

// ==================== QR CODE SCAN & REVIEW FLOW ====================

export const trackQRScanSchema = z.object({
  qrCode: z.string().uuid('Invalid QR code format'),
  deviceInfo: z.any().optional(),
});

export const verifyUserSchema = z.object({
  qrCode: z.string().uuid('Invalid QR code format'),
  contact: z.string().min(3, 'Contact must be at least 3 characters'),
  contactType: z.enum(['email', 'phone'], {
    errorMap: () => ({ message: 'Contact type must be either email or phone' }),
  }),
});

export const verifyOTPSchema = z.object({
  qrCode: z.string().uuid('Invalid QR code format'),
  contact: z.string().min(3),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const completeRegistrationSchema = z.object({
  qrCode: z.string().uuid('Invalid QR code format'),
  contact: z.string().min(3),
  contactType: z.enum(['email', 'phone']),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export const submitReviewSchema = z.object({
  qrCode: z.string().uuid('Invalid QR code format'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid check-in date format',
  }),
  checkOutDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid check-out date format',
  }),
  images: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 images allowed').optional(),
  deviceInfo: z.any().optional(),
}).refine(
  (data) => new Date(data.checkOutDate) > new Date(data.checkInDate),
  {
    message: 'Check-out date must be after check-in date',
    path: ['checkOutDate'],
  }
);

// ==================== ADMIN VERIFICATION ====================

export const verifyReviewSchema = z.object({
  isVerified: z.boolean(),
  isPublished: z.boolean(),
  adminNotes: z.string().max(1000).optional(),
});

export const respondToReviewSchema = z.object({
  response: z.string().min(10, 'Response must be at least 10 characters').max(1000, 'Response must be at most 1000 characters'),
});

// ==================== DISCOUNT MANAGEMENT ====================

export const validateDiscountSchema = z.object({
  discountCode: z.string().min(1, 'Discount code is required'),
});

// ==================== QUERY PARAMS ====================

export const getCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getCampaignHomestaysQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export const getReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isVerified: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
  campaignId: z.coerce.number().int().positive().optional(),
  homestayId: z.coerce.number().int().positive().optional(),
});

export const getDiscountsQuerySchema = z.object({
  isUsed: z.coerce.boolean().optional(),
  includeExpired: z.coerce.boolean().default(false),
});
