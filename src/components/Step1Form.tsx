// /Users/mandarix/Documents/mandarix/home_stay_frontend_new/src/components/Step1Form.tsx

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Step1FormData, step1Schema } from '@/app/list-your-property/owner-registration/steps';
import { Step1Data } from '@/data/types';
import Image from 'next/image';

interface Step1FormProps {
  handleSubmit: (data: Step1Data) => void;
  loading: boolean;
  error: string | null;
  initialData?: Step1Data | null;
}

export default function Step1Form({ handleSubmit, loading, error, initialData }: Step1FormProps) {
  const {
    register,
    handleSubmit: formSubmit,
    control,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      propertyName: initialData?.propertyName || '',
      propertyAddress: initialData?.propertyAddress || '',
      contactNumber: initialData?.contactNumber || '',
      documentType: initialData?.documentType,
      idScanFront: initialData?.idScanFront,
      idScanBack: initialData?.idScanBack,
      frontFile: undefined,
      backFile: undefined,
    },
    mode: 'onChange',
  });

  const documentType = watch('documentType');
  const idScanFront = watch('idScanFront');
  const idScanBack = watch('idScanBack');
  const frontFile = watch('frontFile');
  const backFile = watch('backFile');

  // Debug form state
  console.log('Step1Form State:', {
    isValid,
    errors,
    values: {
      propertyName: watch('propertyName'),
      propertyAddress: watch('propertyAddress'),
      contactNumber: watch('contactNumber'),
      documentType,
      idScanFront,
      idScanBack,
      frontFile: frontFile ? { name: frontFile.name, type: frontFile.type } : undefined,
      backFile: backFile ? { name: backFile.name, type: backFile.type } : undefined,
    },
  });

  const onSubmit = (data: Step1FormData) => {
    console.log('Submitting Step1 Data:', data);
    const submitData: Step1Data = {
      propertyName: data.propertyName,
      propertyAddress: data.propertyAddress,
      contactNumber: data.contactNumber,
      documentType: data.documentType,
      idScanFront: data.idScanFront,
      idScanBack: data.idScanBack,
      frontFile: data.frontFile,
      backFile: data.backFile,
    };
    handleSubmit(submitData);
  };

  const allErrors = Object.entries(errors)
    .map(([key, error]) => (error?.message ? `${key}: ${error.message}` : null))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Basic Information</h2>
      {allErrors.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p>Please fix the following errors:</p>
          <ul className="list-disc ml-5">
            {allErrors.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={formSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700">
            Property Name
          </label>
          <input
            id="propertyName"
            type="text"
            {...register('propertyName')}
            className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
            placeholder="Enter property name"
            aria-invalid={errors.propertyName ? 'true' : 'false'}
          />
          {errors.propertyName && (
            <p className="mt-1 text-sm text-red-500">{errors.propertyName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">
            Property Address
          </label>
          <input
            id="propertyAddress"
            type="text"
            {...register('propertyAddress')}
            className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
            placeholder="Enter property address"
            aria-invalid={errors.propertyAddress ? 'true' : 'false'}
          />
          {errors.propertyAddress && (
            <p className="mt-1 text-sm text-red-500">{errors.propertyAddress.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
            Contact Number
          </label>
          <input
            id="contactNumber"
            type="text"
            {...register('contactNumber')}
            className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
            placeholder="+9779812345678"
            aria-invalid={errors.contactNumber ? 'true' : 'false'}
          />
          {errors.contactNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.contactNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
            Document Type
          </label>
          <select
            id="documentType"
            {...register('documentType')}
            className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500"
            aria-invalid={errors.documentType ? 'true' : 'false'}
            onChange={(e) => {
              setValue('documentType', e.target.value as 'passport' | 'citizenship' | undefined);
              setValue('idScanFront', undefined);
              setValue('idScanBack', undefined);
              setValue('frontFile', undefined);
              setValue('backFile', undefined);
            }}
          >
            <option value="">Select Document Type</option>
            <option value="passport">Passport</option>
            <option value="citizenship">Citizenship</option>
          </select>
          {errors.documentType && (
            <p className="mt-1 text-sm text-red-500">{errors.documentType.message}</p>
          )}
        </div>

        {documentType === 'passport' && (
          <div>
            <label htmlFor="idScanFront" className="block text-sm font-medium text-gray-700">
              Passport Image
            </label>
            {idScanFront && !frontFile && (
              <div className="mt-2 flex items-center gap-2">
                <Image
                  src={idScanFront}
                  alt="Passport Preview"
                  width={100}
                  height={100}
                  className="object-cover rounded-md"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => {
                    setValue('idScanFront', undefined);
                    setValue('frontFile', undefined);
                  }}
                  className="text-red-600 hover:text-red-800 transition"
                >
                  Remove
                </button>
              </div>
            )}
            <Controller
              name="frontFile"
              control={control}
              render={({ field }) => (
                <input
                  id="idScanFront"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(file);
                    setValue('idScanFront', undefined);
                  }}
                  className="mt-1 w-full p-3"
                  aria-invalid={errors.frontFile ? 'true' : 'false'}
                />
              )}
            />
            {errors.frontFile && (
              <p className="mt-1 text-sm text-red-500">{errors.frontFile.message}</p>
            )}
          </div>
        )}

        {documentType === 'citizenship' && (
          <>
            <div>
              <label htmlFor="idScanFront" className="block text-sm font-medium text-gray-700">
                Citizenship Front Image
              </label>
              {idScanFront && !frontFile && (
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={idScanFront}
                    alt="Citizenship Front Preview"
                    width={100}
                    height={100}
                    className="object-cover rounded-md"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setValue('idScanFront', undefined);
                      setValue('frontFile', undefined);
                    }}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    Remove
                  </button>
                </div>
              )}
              <Controller
                name="frontFile"
                control={control}
                render={({ field }) => (
                  <input
                    id="idScanFront"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      field.onChange(file);
                      setValue('idScanFront', undefined);
                    }}
                    className="mt-1 w-full p-3"
                    aria-invalid={errors.frontFile ? 'true' : 'false'}
                  />
                )}
              />
              {errors.frontFile && (
                <p className="mt-1 text-sm text-red-500">{errors.frontFile.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="idScanBack" className="block text-sm font-medium text-gray-700">
                Citizenship Back Image
              </label>
              {idScanBack && !backFile && (
                <div className="mt-2 flex items-center gap-2">
                  <Image
                    src={idScanBack}
                    alt="Citizenship Back Preview"
                    width={100}
                    height={100}
                    className="object-cover rounded-md"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setValue('idScanBack', undefined);
                      setValue('backFile', undefined);
                    }}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    Remove
                  </button>
                </div>
              )}
              <Controller
                name="backFile"
                control={control}
                render={({ field }) => (
                  <input
                    id="idScanBack"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      field.onChange(file);
                      setValue('idScanBack', undefined);
                    }}
                    className="mt-1 w-full p-3"
                    aria-invalid={errors.backFile ? 'true' : 'false'}
                  />
                )}
              />
              {errors.backFile && (
                <p className="mt-1 text-sm text-red-500">{errors.backFile.message}</p>
              )}
            </div>
          </>
        )}

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
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </form>
    </div>
  );
}