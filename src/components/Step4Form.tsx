// /Users/mandarix/Documents/mandarix/home_stay_frontend_new/src/components/Step4Form.tsx

'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Step4FormData, step4Schema } from '@/app/list-your-property/owner-registration/steps';
import { Step4Data } from '@/data/types';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Step4FormProps {
  handleSubmit: (data: Step4Data) => void;
  handlePrevious: () => void;
  loading: boolean;
  error: string | null;
  initialData?: Step4Data | null;
}

export default function Step4Form({ handleSubmit, handlePrevious, loading, error, initialData }: Step4FormProps) {
  const {
    control,
    handleSubmit: formSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setValue,
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      totalRooms: initialData?.totalRooms || 1,
      rooms: initialData?.rooms || [
        {
          id: uuidv4(),
          name: '',
          maxOccupancy: { adults: 1, children: 0 },
          minOccupancy: { adults: 0, children: 0 },
          price: { value: 0, currency: 'NPR' },
        },
      ],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rooms',
  });

  const totalRooms = watch('totalRooms');
  const rooms = watch('rooms');

  // Debug form state
  console.log('Step4Form State:', {
    isValid,
    errors,
    values: { totalRooms, rooms },
  });

  useEffect(() => {
    reset({
      totalRooms: initialData?.totalRooms || 1,
      rooms: initialData?.rooms || [
        {
          id: uuidv4(),
          name: '',
          maxOccupancy: { adults: 1, children: 0 },
          minOccupancy: { adults: 0, children: 0 },
          price: { value: 0, currency: 'NPR' },
        },
      ],
    });
  }, [initialData, reset]);

  useEffect(() => {
    setValue('totalRooms', rooms.length);
  }, [rooms.length, setValue]);

  const onSubmit = (data: Step4FormData) => {
    console.log('Submitting Step4 Data:', data);
    const submitData: Step4Data = {
      totalRooms: data.totalRooms,
      rooms: data.rooms,
    };
    handleSubmit(submitData);
  };

  const addRoom = () => {
    append({
      id: uuidv4(),
      name: '',
      maxOccupancy: { adults: 1, children: 0 },
      minOccupancy: { adults: 0, children: 0 },
      price: { value: 0, currency: 'NPR' },
    });
  };

  const removeRoom = (index: number) => {
    if (rooms.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Room Information</h2>
      {errors.totalRooms && <p className="text-red-500 text-sm">{errors.totalRooms.message}</p>}
      {errors.rooms && <p className="text-red-500 text-sm">{errors.rooms.message}</p>}
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      <form onSubmit={formSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Rooms</label>
          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-md mt-2 space-y-4">
              <div>
                <label htmlFor={`rooms.${index}.name`} className="block text-sm font-medium text-gray-700">
                  Room Name
                </label>
                <Controller
                  name={`rooms.${index}.name`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Deluxe Room"
                      className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
                      aria-invalid={errors.rooms?.[index]?.name ? 'true' : 'false'}
                    />
                  )}
                />
                {errors.rooms?.[index]?.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.rooms[index]?.name?.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Adults</label>
                  <Controller
                    name={`rooms.${index}.maxOccupancy.adults`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
                        aria-invalid={errors.rooms?.[index]?.maxOccupancy?.adults ? 'true' : 'false'}
                      />
                    )}
                  />
                  {errors.rooms?.[index]?.maxOccupancy?.adults && (
                    <p className="mt-1 text-sm text-red-500">{errors.rooms[index]?.maxOccupancy?.adults?.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Children</label>
                  <Controller
                    name={`rooms.${index}.maxOccupancy.children`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
                        aria-invalid={errors.rooms?.[index]?.maxOccupancy?.children ? 'true' : 'false'}
                      />
                    )}
                  />
                  {errors.rooms?.[index]?.maxOccupancy?.children && (
                    <p className="mt-1 text-sm text-red-500">{errors.rooms[index]?.maxOccupancy?.children?.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Adults</label>
                  <Controller
                    name={`rooms.${index}.minOccupancy.adults`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
                        aria-invalid={errors.rooms?.[index]?.minOccupancy?.adults ? 'true' : 'false'}
                      />
                    )}
                  />
                  {errors.rooms?.[index]?.minOccupancy?.adults && (
                    <p className="mt-1 text-sm text-red-500">{errors.rooms[index]?.minOccupancy?.adults?.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Children</label>
                  <Controller
                    name={`rooms.${index}.minOccupancy.children`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
                        aria-invalid={errors.rooms?.[index]?.minOccupancy?.children ? 'true' : 'false'}
                      />
                    )}
                  />
                  {errors.rooms?.[index]?.minOccupancy?.children && (
                    <p className="mt-1 text-sm text-red-500">{errors.rooms[index]?.minOccupancy?.children?.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <Controller
                    name={`rooms.${index}.price.value`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
                        aria-invalid={errors.rooms?.[index]?.price?.value ? 'true' : 'false'}
                      />
                    )}
                  />
                  {errors.rooms?.[index]?.price?.value && (
                    <p className="mt-1 text-sm text-red-500">{errors.rooms[index]?.price?.value?.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <Controller
                    name={`rooms.${index}.price.currency`}
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
                        aria-invalid={errors.rooms?.[index]?.price?.currency ? 'true' : 'false'}
                      >
                        <option value="NPR">NPR</option>
                        <option value="USD">USD</option>
                      </select>
                    )}
                  />
                  {errors.rooms?.[index]?.price?.currency && (
                    <p className="mt-1 text-sm text-red-500">{errors.rooms[index]?.price?.currency?.message}</p>
                  )}
                </div>
              </div>

              {rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRoom(index)}
                  className="mt-2 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
                >
                  Remove Room
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addRoom}
            className="mt-2 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Add Room
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handlePrevious}
            className="w-full bg-gray-600 text-white py-3 rounded-md hover:bg-gray-700 transition"
          >
            Previous
          </button>
          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            aria-disabled={loading || !isValid}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}