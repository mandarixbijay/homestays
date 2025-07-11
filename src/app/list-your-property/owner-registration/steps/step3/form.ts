// src/app/list-your-property/owner-registration/steps/step3/form.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Step3FormData } from '../../types';

export const step3Schema = z.object({
  selectedFacilities: z.array(z.union([z.number(), z.string()])).min(1, 'At least one facility is required'),
  customFacilities: z.array(z.object({ name: z.string().min(1, 'Custom facility name is required') })),
});

export const useStep3Form = () => {
  return useForm<Step3FormData>({
    mode: 'onChange',
    defaultValues: {
      selectedFacilities: [],
      customFacilities: [],
    },
    resolver: zodResolver(step3Schema),
    reValidateMode: 'onChange',
    resetOptions: {
      keepErrors: true,
      keepDirty: true,
      keepTouched: true,
    },
  });
};