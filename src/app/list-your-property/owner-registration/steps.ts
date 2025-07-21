// /Users/mandarix/Documents/mandarix/home_stay_frontend_new/src/app/list-your-property/owner-registration/steps.ts

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface ImageMetadata {
  file?: File;
  tags?: string[];
  url?: string;
  isNew?: boolean;
  isMain?: boolean;
}

export interface RoomInfo {
  id: string;
  name: string;
  maxOccupancy: { adults: number; children: number };
  minOccupancy: { adults: number; children: number };
  price: { value: number; currency: 'USD' | 'NPR' };
}

export interface CustomFacility {
  name: string;
}

// Step 1 Schema
export const step1Schema = z.object({
  propertyName: z.string().min(1, 'Property name is required').max(100, 'Property name cannot exceed 100 characters'),
  propertyAddress: z.string().min(1, 'Property address is required').max(200, 'Property address cannot exceed 200 characters'),
  contactNumber: z
    .string()
    .regex(/^\+\d{10,15}$/, 'Contact number must include country code (e.g., +9779812345678)'),
  documentType: z.enum(['passport', 'citizenship']).optional(),
  idScanFront: z.string().url('Invalid front ID scan URL').optional(),
  idScanBack: z.string().url('Invalid back ID scan URL').optional(),
  frontFile: z.instanceof(File, { message: 'Front image must be a valid file' }).optional(),
  backFile: z.instanceof(File, { message: 'Back image must be a valid file' }).optional(),
}).superRefine((data, ctx) => {
  if (data.documentType === 'passport') {
    if (!data.idScanFront && !data.frontFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passport requires a front image (URL or file)',
        path: ['frontFile'],
      });
    }
    if (data.frontFile && !['image/png', 'image/jpeg'].includes(data.frontFile.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Front image must be PNG or JPEG',
        path: ['frontFile'],
      });
    }
  }
  if (data.documentType === 'citizenship') {
    if (!data.idScanFront && !data.frontFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Citizenship requires a front image (URL or file)',
        path: ['frontFile'],
      });
    }
    if (!data.idScanBack && !data.backFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Citizenship requires a back image (URL or file)',
        path: ['backFile'],
      });
    }
    if (data.frontFile && !['image/png', 'image/jpeg'].includes(data.frontFile.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Front image must be PNG or JPEG',
        path: ['frontFile'],
      });
    }
    if (data.backFile && !['image/png', 'image/jpeg'].includes(data.backFile.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Back image must be PNG or JPEG',
        path: ['backFile'],
      });
    }
  }
});

// Step 2 Schema
export const step2Schema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  images: z
    .array(
      z.object({
        file: z.instanceof(File).optional(),
        tags: z.array(z.string()).optional(),
        url: z.string().url('Invalid image URL').optional(),
        isNew: z.boolean().optional(),
        isMain: z.boolean().optional(),
      })
    )
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed')
    .refine((images) => images.some((img) => img.isMain), {
      message: 'Exactly one image must be marked as main',
      path: ['images'],
    }),
});

// Step 3 Schema
export const step3Schema = z.object({
  facilityIds: z.array(z.number()).optional(),
  customFacilities: z.array(z.object({ name: z.string().min(1, 'Facility name is required').max(50, 'Facility name too long') })).optional(),
}).refine((data) => (data.facilityIds?.length ?? 0) > 0 || (data.customFacilities?.length ?? 0) > 0, {
  message: 'At least one facility (default or custom) is required',
  path: ['facilityIds'],
});

// Step 4 Schema
export const step4Schema = z.object({
  totalRooms: z.number().min(1, 'At least one room is required').max(50, 'Maximum 50 rooms allowed'),
  rooms: z
    .array(
      z.object({
        id: z.string().min(1, 'Room ID is required'),
        name: z.string().min(1, 'Room name is required').max(50, 'Room name too long'),
        maxOccupancy: z.object({
          adults: z.number().min(1, 'At least one adult required').max(20, 'Maximum 20 adults'),
          children: z.number().min(0, 'Children cannot be negative').max(20, 'Maximum 20 children'),
        }),
        minOccupancy: z.object({
          adults: z.number().min(0, 'Adults cannot be negative').max(20, 'Maximum 20 adults'),
          children: z.number().min(0, 'Children cannot be negative').max(20, 'Maximum 20 children'),
        }),
        price: z.object({
          value: z.number().min(0, 'Price cannot be negative').max(100000, 'Price too high'),
          currency: z.enum(['USD', 'NPR'], { message: 'Invalid currency' }),
        }),
      })
    )
    .min(1, 'At least one room is required')
    .max(50, 'Maximum 50 rooms allowed'),
}).refine((data) => data.totalRooms === data.rooms.length, {
  message: 'Total rooms must match the number of rooms provided',
  path: ['totalRooms'],
});

// Step 5 (Register) Schema
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Invalid email address').optional(),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password cannot exceed 100 characters'),
}).refine((data) => data.email || data.mobileNumber, {
  message: 'Either email or mobile number must be provided',
  path: ['email'],
});

// Export form data types
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type Step4FormData = z.infer<typeof step4Schema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Form hooks for each step
export function useStep1Form() {
  return useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      propertyName: '',
      propertyAddress: '',
      contactNumber: '',
      documentType: undefined,
      idScanFront: undefined,
      idScanBack: undefined,
      frontFile: undefined,
      backFile: undefined,
    },
    mode: 'onChange',
  });
}

export function useStep2Form() {
  return useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      description: '',
      images: [],
    },
    mode: 'onChange',
  });
}

export function useStep3Form() {
  return useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      facilityIds: [],
      customFacilities: [],
    },
    mode: 'onChange',
  });
}

export function useStep4Form() {
  return useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      totalRooms: 1,
      rooms: [
        {
          id: crypto.randomUUID(),
          name: '',
          maxOccupancy: { adults: 1, children: 0 },
          minOccupancy: { adults: 0, children: 0 },
          price: { value: 0, currency: 'NPR' },
        },
      ],
    },
    mode: 'onChange',
  });
}

export function useRegisterForm() {
  return useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      mobileNumber: '',
      password: '',
    },
    mode: 'onChange',
  });
}