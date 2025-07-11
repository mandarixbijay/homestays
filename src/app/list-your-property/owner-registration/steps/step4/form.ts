// src/app/list-your-property/owner-registration/steps/step4/form.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Step4FormData } from '../../types';

export const step4Schema = z.object({
  totalRooms: z.number().min(1, 'At least one room is required'),
  rooms: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, 'Room name is required'),
      maxOccupancy: z.object({
        adults: z.number().min(1, 'At least one adult is required'),
        children: z.number().min(0, 'Children count cannot be negative'),
      }),
      minOccupancy: z.object({
        adults: z.number().min(0, 'Adult count cannot be negative'),
        children: z.number().min(0, 'Children count cannot be negative'),
      }),
      price: z.object({
        value: z.number().min(0, 'Price cannot be negative'),
        currency: z.enum(['USD', 'NPR']),
      }),
    }),
  ).min(1, 'At least one room is required'),
}).refine((data) => data.rooms.length === data.totalRooms, {
  message: 'Number of rooms must match totalRooms',
  path: ['rooms'],
});

export const useStep4Form = () => {
  return useForm<Step4FormData>({
    mode: 'onChange',
    defaultValues: {
      totalRooms: 1,
      rooms: [
        {
          id: typeof window !== 'undefined' ? crypto.randomUUID() : 'default-room-id',
          name: '',
          maxOccupancy: { adults: 1, children: 0 },
          minOccupancy: { adults: 0, children: 0 },
          price: { value: 0, currency: 'USD' },
        },
      ],
    },
    resolver: zodResolver(step4Schema),
    reValidateMode: 'onChange',
    resetOptions: {
      keepErrors: true,
      keepDirty: true,
      keepTouched: true,
    },
  });
};