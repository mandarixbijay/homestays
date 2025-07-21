'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterFormData, registerSchema } from '@/app/list-your-property/owner-registration/steps';

interface Step5FormProps {
  handleSubmit: (data: RegisterFormData) => void;
  handlePrevious: () => void;
  loading: boolean;
  error: string | null;
}

export default function Step5Form({ handleSubmit, handlePrevious, loading, error }: Step5FormProps) {
  const {
    register,
    handleSubmit: formSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      mobileNumber: '',
      password: '',
    },
    mode: 'onChange',
  });

  const onSubmit = (data: RegisterFormData) => {
    handleSubmit(data);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Finalize Account</h2>
      <form onSubmit={formSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your Name"
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Email"
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
            Mobile Number (optional)
          </label>
          <input
            id="mobileNumber"
            type="text"
            {...register('mobileNumber')}
            className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="10-digit mobile number"
            aria-invalid={errors.mobileNumber ? 'true' : 'false'}
          />
          {errors.mobileNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.mobileNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Password"
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={loading}
            className="w-full sm:w-1/2 bg-gray-600 text-white py-3 rounded-md hover:bg-gray-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-disabled={loading}
          >
            Previous
          </button>
          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full sm:w-1/2 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            aria-disabled={loading || !isValid}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Finalizing...
              </span>
            ) : (
              'Finalize'
            )}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </form>
    </div>
  );
}