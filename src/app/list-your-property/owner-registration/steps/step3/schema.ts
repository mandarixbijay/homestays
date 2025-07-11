// src/app/list-your-property/owner-registration/steps/step3/schema.ts
import { z } from 'zod';

export const step3Schema = z.object({
  selectedFacilities: z.array(z.number()).min(1, 'At least one facility is required'),
  customFacilities: z
    .array(z.object({ name: z.string().min(1, 'Custom facility name cannot be empty') }))
    .max(10, 'Maximum 10 custom facilities allowed')
    .refine(
      (facilities) => {
        const lowerCaseFacilities = facilities.map((f) => f.name.toLowerCase());
        return new Set(lowerCaseFacilities).size === facilities.length;
      },
      { message: 'Duplicate custom facilities are not allowed' },
    )
    .optional(),
}).refine(
  (data) => data.selectedFacilities.length > 0 || (data.customFacilities && data.customFacilities.length > 0),
  { message: 'At least one facility (default or custom) is required' },
);

export type Step3FormData = z.infer<typeof step3Schema>;