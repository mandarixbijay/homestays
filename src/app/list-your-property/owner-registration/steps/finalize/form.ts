// src/app/list-your-property/owner-registration/steps/finalize/form.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  mobileNumber: z
    .string()
    .regex(/^\+\d{9,15}$/, 'Enter a valid phone number (e.g., +9779801169431)')
    .optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
}).refine((data) => data.email || data.mobileNumber, {
  message: 'At least one of email or mobile number is required',
  path: ['email', 'mobileNumber'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const useRegisterForm = () => {
  return useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      mobileNumber: '',
      password: '',
      firstName: '',
      lastName: '',
    },
    resolver: zodResolver(registerSchema),
    reValidateMode: 'onChange',
    resetOptions: {
      keepErrors: true,
      keepDirty: true,
      keepTouched: true,
    },
  });
};