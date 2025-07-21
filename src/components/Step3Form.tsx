// /Users/mandarix/Documents/mandarix/home_stay_frontend_new/src/components/Step3Form.tsx

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Step3FormData, step3Schema } from '@/app/list-your-property/owner-registration/steps';
import { Step3Data } from '@/data/types';
import { useEffect, useState } from 'react';

interface Step3FormProps {
  handleSubmit: (data: Step3Data) => void;
  handlePrevious: () => void;
  loading: boolean;
  error: string | null;
  initialData?: Step3Data | null;
}

export default function Step3Form({ handleSubmit, handlePrevious, loading, error, initialData }: Step3FormProps) {
  const {
    control,
    handleSubmit: formSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      facilityIds: initialData?.facilityIds || [],
      customFacilities: initialData?.customFacilities || [],
    },
    mode: 'onChange',
  });

  const facilityIds = watch('facilityIds');
  const customFacilities = watch('customFacilities');

  // Mock list of default facilities (replace with API call to fetch real facilities)
  const defaultFacilities = [
    { id: 1, name: 'Wi-Fi' },
    { id: 2, name: 'Parking' },
    { id: 3, name: 'Breakfast' },
  ];

  const [newFacility, setNewFacility] = useState('');

  // Debug form state
  console.log('Step3Form State:', {
    isValid,
    errors,
    values: { facilityIds, customFacilities },
  });

  const onSubmit = (data: Step3FormData) => {
    console.log('Submitting Step3 Data:', data);
    const submitData: Step3Data = {
      facilityIds: data.facilityIds ?? [],
      customFacilities: data.customFacilities ?? [],
    };
    handleSubmit(submitData);
  };

  const addCustomFacility = () => {
    if (newFacility.trim()) {
      setValue('customFacilities', [...(customFacilities ?? []), { name: newFacility.trim() }]);
      setNewFacility('');
    }
  };

  const removeCustomFacility = (index: number) => {
    setValue('customFacilities', (customFacilities ?? []).filter((_, i) => i !== index));
  };

  useEffect(() => {
    reset({
      facilityIds: initialData?.facilityIds || [],
      customFacilities: initialData?.customFacilities || [],
    });
  }, [initialData, reset]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Facilities</h2>
      {errors.facilityIds && <p className="text-red-500 text-sm">{errors.facilityIds.message}</p>}
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      <form onSubmit={formSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Default Facilities</label>
          <Controller
            name="facilityIds"
            control={control}
            render={({ field }) => (
              <div className="mt-2 space-y-2">
                {defaultFacilities.map((facility) => (
                  <div key={facility.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`facility-${facility.id}`}
                      checked={(field.value ?? []).includes(facility.id)}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? [...(field.value ?? []), facility.id]
                          : (field.value ?? []).filter((id) => id !== facility.id);
                        field.onChange(newValue);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`facility-${facility.id}`} className="ml-2 text-sm text-gray-700">
                      {facility.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          />
          {errors.facilityIds && (
            <p className="mt-1 text-sm text-red-500">{errors.facilityIds.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Add Custom Facilities</label>
          <div className="mt-1 flex space-x-2">
            <input
              type="text"
              value={newFacility}
              onChange={(e) => setNewFacility(e.target.value)}
              placeholder="e.g., Private Balcony"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addCustomFacility}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {(customFacilities ?? []).map((facility, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                <span>{facility.name}</span>
                <button
                  type="button"
                  onClick={() => removeCustomFacility(index)}
                  className="text-red-600 hover:text-red-800 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {errors.customFacilities && (
            <p className="mt-1 text-sm text-red-500">{errors.customFacilities.message}</p>
          )}
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