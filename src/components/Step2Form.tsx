// /Users/mandarix/Documents/mandarix/home_stay_frontend_new/src/components/Step2Form.tsx

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Step2FormData, step2Schema } from '@/app/list-your-property/owner-registration/steps';
import { Step2Data } from '@/data/types';
import Image from 'next/image';

interface Step2FormProps {
  handleSubmit: (data: Step2Data) => void;
  handlePrevious: () => void;
  loading: boolean;
  error: string | null;
  initialData?: Step2Data | null;
}

export default function Step2Form({ handleSubmit, handlePrevious, loading, error, initialData }: Step2FormProps) {
  const {
    control,
    handleSubmit: formSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      description: initialData?.description || '',
      images: initialData?.imageMetadata.map((img) => ({
        url: img.url,
        tags: img.tags,
        isNew: false,
        isMain: img.isMain,
        file: undefined,
      })) || [],
    },
    mode: 'onChange',
  });

  const images = watch('images');

  // Debug form state
  console.log('Step2Form State:', {
    isValid,
    errors,
    values: {
      description: watch('description'),
      images: images.map((img) => ({
        url: img.url,
        tags: img.tags,
        isNew: img.isNew,
        isMain: img.isMain,
        file: img.file ? { name: img.file.name, type: img.file.type } : undefined,
      })),
    },
  });

  const onSubmit = (data: Step2FormData) => {
    console.log('Submitting Step2 Data:', data);
    const submitData: Step2Data = {
      description: data.description,
      imageMetadata: data.images.map((img) => ({
        url: img.url,
        tags: img.tags || [],
        isMain: img.isMain || false,
      })),
      images: data.images.filter((img) => img.file && img.isNew).map((img) => img.file!),
    };
    handleSubmit(submitData);
  };

  const handleImageChange = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      const newImages = fileArray.map((file, index) => ({
        file,
        tags: [],
        isNew: true,
        isMain: images.length === 0 && index === 0, // Set first new image as main if none exist
        url: undefined,
      }));
      setValue('images', [...images.filter((img) => img.url), ...newImages]);
    }
  };

  const setMainImage = (index: number) => {
    setValue(
      'images',
      images.map((img, i) => ({ ...img, isMain: i === index }))
    );
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    if (updatedImages.length > 0 && !updatedImages.some((img) => img.isMain)) {
      updatedImages[0].isMain = true;
    }
    setValue('images', updatedImages);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Property Description and Images</h2>
      {errors.images && <p className="text-red-500 text-sm">{errors.images.message}</p>}
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      <form onSubmit={formSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Property Description (10-1000 characters)
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="description"
                placeholder="Describe your property"
                className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 aria-invalid:border-red-500 h-32 resize-y"
                aria-invalid={errors.description ? 'true' : 'false'}
              />
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">
            Upload Images (PNG/JPEG, max 10)
          </label>
          <input
            id="images"
            type="file"
            accept="image/png,image/jpeg"
            multiple
            onChange={(e) => handleImageChange(e.target.files)}
            className="mt-1 w-full p-3"
            aria-invalid={errors.images ? 'true' : 'false'}
          />
          {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative border p-4 rounded-md">
              {img.url ? (
                <Image
                  src={img.url}
                  alt="Image Preview"
                  width={100}
                  height={100}
                  className="object-cover rounded-md w-full h-24"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-24 bg-gray-200 flex items-center justify-center rounded-md">
                  <span className="text-gray-500 text-sm">{img.file?.name || 'New Image'}</span>
                </div>
              )}
              <div className="mt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setMainImage(index)}
                  className={`w-full p-2 rounded-md text-white ${
                    img.isMain ? 'bg-green-500' : 'bg-gray-500 hover:bg-gray-600'
                  } transition`}
                >
                  {img.isMain ? 'Main Image' : 'Set as Main'}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="w-full p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Remove
                </button>
                <Controller
                  name={`images.${index}.tags`}
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="Tags (e.g., exterior, view)"
                      value={field.value?.join(',') || ''}
                      onChange={(e) => field.onChange(e.target.value.split(',').map((tag) => tag.trim()))}
                      className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                />
              </div>
            </div>
          ))}
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