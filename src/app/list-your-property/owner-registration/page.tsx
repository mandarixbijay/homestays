// src/app/list-your-property/owner-registration/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { Step1BasicInformation } from '@/components/onboarding/steps/Step1BasicInformation';
import { Step2PropertyDetails } from '@/components/onboarding/steps/Step2PropertyDetails';
import { Facility, Step3Facilities } from '@/components/onboarding/steps/Step3Facilities';
import { Step4RoomInformation } from '@/components/onboarding/steps/Step4RoomInformation/Step4RoomInformation';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle } from 'lucide-react';
import { toast, ToastOptions } from 'react-hot-toast';
import { Step1FormData, Step2FormData, Step3FormData, Step4FormData, RoomInfo, RegisterFormData } from './types';
import { useStep1Form } from './steps/step1/form';
import { handleBasicInfoSubmit } from './steps/step1/submit';
import { useStep2Form } from './steps/step2/form';
import { handlePropertyDetailsSubmit } from './steps/step2/submit';
import { useStep3Form } from './steps/step3/form';
import { handleFacilitiesSubmit } from './steps/step3/submit';
import { useStep4Form } from './steps/step4/form';
import { handleRoomInfoSubmit } from './steps/step4/submit';
import { useRegisterForm } from './steps/finalize/form';
import { handleRegisterSubmit } from './steps/finalize/submit';
import { sanitizeFileName } from './steps/sanitizeFileName';
import { Step } from '@/components/onboarding/Step';
import { Onboarding } from '@/components/onboarding/Step1';
import { debounce } from '@/lib/debounce';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const useAuth = () => {
  return null;
};

// Step5Register component
function Step5Register({ methods }: { methods: UseFormReturn<RegisterFormData> }) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = methods;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Create Your Account</h3>
      <p className="text-sm text-gray-600">
        Complete your registration by providing your account details.
      </p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Enter your first name"
            {...register('firstName')}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Enter your last name"
            {...register('lastName')}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="mobileNumber">Mobile Number (Optional)</Label>
          <Input
            id="mobileNumber"
            type="tel"
            placeholder="e.g., +9779801169431"
            {...register('mobileNumber')}
            className={errors.mobileNumber ? 'border-red-500' : ''}
          />
          {errors.mobileNumber && <p className="mt-1 text-sm text-red-500">{errors.mobileNumber.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="mt-2 text-sm text-red-500">{errors.root.message}</p>}
      </div>
    </div>
  );
}

function ListYourProperty() {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [deleteRoom, setDeleteRoom] = useState<{ index: number; name: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [step1Data, setStep1Data] = useState<Partial<Step1FormData> | null>(null);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [hasStep3Data, setHasStep3Data] = useState(false);
  const isFetchingRef = useRef(false);

  // Memoize form methods
  const step1Methods = useStep1Form();
  const step2Methods = useStep2Form();
  const step3Methods = useStep3Form();
  const step4Methods = useStep4Form();
  const registerMethods = useRegisterForm();

  const setSessionIdMemo = useCallback((id: string | null) => {
    setSessionId(id);
  }, []);

  const defaultRoom: RoomInfo = {
    id: typeof window !== 'undefined' ? crypto.randomUUID() : 'default-room-id',
    name: '',
    maxOccupancy: { adults: 1, children: 0 },
    minOccupancy: { adults: 0, children: 0 },
    price: { value: 0, currency: 'USD' },
  };

  const validateSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/onboarding/step1/${sessionId}?t=${Date.now()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok || response.status === 404;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }, []);

  const initializeSession = useCallback(
    async (retries = 2): Promise<string> => {
      try {
        const storedSessionId = typeof window !== 'undefined' ? localStorage.getItem('onboardingSessionId') : null;
        if (storedSessionId) {
          const isValid = await validateSession(storedSessionId);
          if (isValid) {
            setSessionIdMemo(storedSessionId);
            return storedSessionId;
          } else {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('onboardingSessionId');
            }
          }
        }

        const response = await fetch('/api/onboarding/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to start session');
        }
        const { sessionId: newSessionId } = await response.json();

        const isValid = await validateSession(newSessionId);
        if (!isValid) {
          throw new Error('Newly created session ID is invalid');
        }

        setSessionIdMemo(newSessionId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('onboardingSessionId', newSessionId);
        }
        toast.success('Session Started', { id: 'session-start', style: { background: '#DCFCE7', color: '#15803D' } });
        return newSessionId;
      } catch (error) {
        console.error(`Error initializing session (retries left: ${retries}):`, error);
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return initializeSession(retries - 1);
        }
        toast.error('Failed to start onboarding session. Please try again.', {
          id: 'session-error',
          style: { background: '#FEE2E2', color: '#B91C1C' },
        });
        throw error;
      }
    },
    [setSessionIdMemo, validateSession],
  );

  useEffect(() => {
    const startSession = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoadingSession(true);
      try {
        await initializeSession();
      } catch {
        // Error handled in initializeSession
      } finally {
        setIsLoadingSession(false);
        isFetchingRef.current = false;
      }
    };
    startSession();
  }, [initializeSession]);

  const fetchStepData = useCallback(async () => {
    if (!sessionId || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      let response: Response;
      switch (currentStep) {
        case 0:
          response = await fetch(`/api/onboarding/step1/${sessionId}?t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            signal: AbortSignal.timeout(5000),
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched Step 1 data:', JSON.stringify(data, null, 2));
            setStep1Data(data);
          } else if (response.status === 404) {
            setStep1Data(null);
          } else {
            throw new Error(`Failed to fetch Step 1 data (Status: ${response.status})`);
          }
          break;
        case 1:
          response = await fetch(`/api/onboarding/step2/${sessionId}?t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            signal: AbortSignal.timeout(5000),
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched Step 2 data:', JSON.stringify(data, null, 2));
            step2Methods.reset({
              description: data.description || '',
              images: (data.imageMetadata || []).map((img: any) => ({
                file: null,
                tags: img.tags || [],
                url: img.url || '',
                base64: undefined,
                isNew: false,
                isMain: img.isMain || false,
              })),
            });
            setPendingImages([]);
            toast.success('Step 2 data loaded successfully.', { id: 'step2-load', style: { background: '#DCFCE7', color: '#15803D' } });
          } else if (response.status === 404) {
            step2Methods.reset({ description: '', images: [] });
            setPendingImages([]);
          } else {
            throw new Error(`Failed to fetch Step 2 data (Status: ${response.status})`);
          }
          break;
        case 2:
          response = await fetch(`/api/onboarding/step3/${sessionId}?t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            signal: AbortSignal.timeout(5000),
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched Step 3 data:', JSON.stringify(data, null, 2));
            step3Methods.reset({
              selectedFacilities: data.facilityIds || [],
              customFacilities: data.customFacilities?.map((f: { name: string }) => ({ name: f.name })) || [],
            });
            setHasStep3Data(true);
            toast.success('Step 3 data loaded successfully.', { id: 'step3-load', style: { background: '#DCFCE7', color: '#15803D' } });
          } else if (response.status === 404) {
            step3Methods.reset({
              selectedFacilities: [],
              customFacilities: [],
            });
            setHasStep3Data(false);
          } else {
            throw new Error(`Failed to fetch Step 3 data (Status: ${response.status})`);
          }
          break;
        case 3:
          response = await fetch(`/api/onboarding/step4/${sessionId}?t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            signal: AbortSignal.timeout(5000),
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Fetched Step 4 data:', JSON.stringify(data, null, 2));
            step4Methods.reset({
              totalRooms: Number.isFinite(data.totalRooms) ? Math.max(1, Math.floor(data.totalRooms)) : 1,
              rooms: (data.rooms || []).map((room: RoomInfo) => ({
                id: room.id || (typeof window !== 'undefined' ? crypto.randomUUID() : 'room-id'),
                name: room.name || '',
                maxOccupancy: {
                  adults: Number.isFinite(room.maxOccupancy?.adults) ? Math.max(1, Math.floor(room.maxOccupancy.adults)) : 1,
                  children: Number.isFinite(room.maxOccupancy?.children) ? Math.max(0, Math.floor(room.maxOccupancy.children)) : 0,
                },
                minOccupancy: {
                  adults: Number.isFinite(room.minOccupancy?.adults) ? Math.max(0, Math.floor(room.minOccupancy.adults)) : 0,
                  children: Number.isFinite(room.minOccupancy?.children) ? Math.max(0, Math.floor(room.minOccupancy.children)) : 0,
                },
                price: {
                  value: Number.isFinite(room.price?.value) ? Math.max(0, room.price.value) : 0,
                  currency: (room.price?.currency as 'USD' | 'NPR') || 'USD',
                },
              })),
            });
            toast.success('Step 4 data loaded successfully.', { id: 'step4-load', style: { background: '#DCFCE7', color: '#15803D' } });
          } else if (response.status === 404) {
            step4Methods.reset({ totalRooms: 1, rooms: [defaultRoom] });
          } else {
            throw new Error(`Failed to fetch Step 4 data (Status: ${response.status})`);
          }
          break;
      }
    } catch (error) {
      console.error(`Error fetching Step ${currentStep + 1} data:`, error);
      toast.error(`Failed to load Step ${currentStep + 1} data.`, { id: `step${currentStep + 1}-error`, style: { background: '#FEE2E2', color: '#B91C1C' } });
      if (currentStep === 0) {
        setStep1Data(null);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [currentStep, sessionId, step2Methods, step3Methods, step4Methods, defaultRoom]);

  const debouncedFetchStepData = useCallback(debounce(fetchStepData, 300), [fetchStepData]);

  useEffect(() => {
    console.log('fetchStepData useEffect triggered', { sessionId, currentStep });
    if (sessionId) {
      debouncedFetchStepData();
    }
  }, [debouncedFetchStepData, sessionId, currentStep]);

  useEffect(() => {
    if (currentStep >= steps.length) {
      toast.success('Listing Complete! Your property listing has been successfully completed.', {
        id: 'listing-complete',
        style: { background: '#DCFCE7', color: '#15803D' },
      });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboardingSessionId');
      }
      setSessionIdMemo(null);
    }
  }, [currentStep, setSessionIdMemo]);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof window === 'undefined' || !e.target.files) return;
      const newFiles = Array.from(e.target.files).filter(
        (file) => file.size <= 5 * 1024 * 1024 && ['image/png', 'image/jpeg'].includes(file.type),
      );
      const currentImages = step2Methods.getValues('images') || [];

      const uniqueFiles = newFiles.filter((file) => {
        const isDuplicate =
          currentImages.some(
            (img) => img.file && img.file.name === file.name && img.file.size === file.size,
          ) ||
          pendingImages.some((pending) => pending.name === file.name && pending.size === file.size);
        if (isDuplicate) {
          toast.error(`Image "${file.name}" is already selected.`, { id: `duplicate-image-${file.name}`, style: { background: '#FEE2E2', color: '#B91C1C' } });
          return false;
        }
        return true;
      });

      const imagesToAdd = uniqueFiles.slice(0, 10 - currentImages.length);
      if (uniqueFiles.length > imagesToAdd.length) {
        toast.error(`Maximum 10 images allowed. Only ${imagesToAdd.length} image(s) added.`, {
          id: 'image-limit',
          style: { background: '#FEE2E2', color: '#B91C1C' },
        });
      }

      if (imagesToAdd.length > 0) {
        const newImages = await Promise.all(
          imagesToAdd.map(async (file, idx) => {
            const base64 =
              typeof FileReader !== 'undefined'
                ? await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.readAsDataURL(file);
                })
                : '';

            const sanitizedName = sanitizeFileName(file.name);
            const sanitizedFile =
              typeof File !== 'undefined'
                ? new File([file], sanitizedName, { type: file.type })
                : file;
            return {
              file: sanitizedFile,
              tags: [],
              url: '',
              base64,
              isNew: true,
              isMain: currentImages.length === 0 && idx === 0,
            };
          }),
        );

        const updatedImages = [...currentImages, ...newImages];
        if (!updatedImages.some((img) => img.isMain)) {
          updatedImages[0].isMain = true;
        } else if (updatedImages.filter((img) => img.isMain).length > 1) {
          const firstMainIndex = updatedImages.findIndex((img) => img.isMain);
          updatedImages.forEach((img, i) => (img.isMain = i === firstMainIndex));
        }

        setPendingImages([...pendingImages, ...imagesToAdd]);
        step2Methods.setValue('images', updatedImages, { shouldValidate: true });
        toast.success(`${imagesToAdd.length} image(s) added.`, { id: 'images-added', style: { background: '#DCFCE7', color: '#15803D' } });
      }
      e.target.value = '';
    },
    [step2Methods, pendingImages],
  );

  const removeImage = useCallback(
    (index: number) => {
      const currentImages = step2Methods.getValues('images') || [];
      const imageToRemove = currentImages[index];
      const updatedImages = currentImages.filter((_, i) => i !== index);

      if (imageToRemove.isNew && imageToRemove.file) {
        setPendingImages((prev) =>
          prev.filter(
            (file) => file.name !== imageToRemove.file!.name || file.size !== imageToRemove.file!.size,
          ),
        );
      }

      if (updatedImages.length > 0 && !updatedImages.some((img) => img.isMain)) {
        updatedImages[0].isMain = true;
      }
      step2Methods.setValue('images', updatedImages, { shouldValidate: true });
      toast.success(`Image ${index + 1} removed.`, { id: `image-removed-${index}`, style: { background: '#DCFCE7', color: '#15803D' } });
    },
    [step2Methods],
  );

  const handleDeleteRoom = useCallback(
    (index: number) => {
      const rooms = step4Methods.getValues('rooms').filter((room): room is RoomInfo => room != null);
      if (rooms.length <= 1) {
        setErrorMessage('At least one room is required.');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      const roomName = rooms[index]?.name || `Room ${index + 1}`;
      setDeleteRoom({ index, name: roomName });
    },
    [step4Methods],
  );

  const steps = [
    {
      title: 'Basic Information',
      description: 'Provide the core details of your property.',
      children: (
        <FormProvider {...step1Methods}>
          <Step
            stepNumber={1}
            isActive={currentStep === 0}
            isCompleted={currentStep > 0}
            title="Basic Information"
            description="Provide the core details of your property."
            onComplete={async () => {
              if (!sessionId) {
                toast.error('Session ID is missing. Please restart the process.', { id: 'no-session', style: { background: '#FEE2E2', color: '#B91C1C' } });
                return;
              }
              try {
                await step1Methods.handleSubmit(async () => {
                  await handleBasicInfoSubmit(
                    step1Methods,
                    sessionId,
                    setSessionIdMemo,
                    setCurrentStep,
                    steps.length,
                    initializeSession,
                  );
                })();
              } catch (error) {
                console.error('Step 1 submission failed:', error);
                toast.error('An error occurred while submitting Basic Information.', { id: 'step1-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
              }
            }}
            onBack={currentStep > 0 ? () => setCurrentStep(currentStep - 1) : undefined}
          >
            <Step1BasicInformation
              user={useAuth()}
              sessionId={sessionId}
              setSessionId={setSessionIdMemo}
              step1Data={step1Data}
              isLoadingSession={isLoadingSession}
            />
          </Step>
        </FormProvider>
      ),
    },
    {
      title: 'Property Details',
      description: 'Add images and a description of your property.',
      children: (
        <FormProvider {...step2Methods}>
          <Step
            stepNumber={2}
            isActive={currentStep === 1}
            isCompleted={currentStep > 1}
            title="Property Details"
            description="Add images and a description of your property."
            onComplete={async () => {
              if (!sessionId) {
                toast.error('Session ID is missing. Please restart the process.', { id: 'no-session', style: { background: '#FEE2E2', color: '#B91C1C' } });
                return;
              }
              try {
                await step2Methods.handleSubmit(async () => {
                  await handlePropertyDetailsSubmit(
                    step2Methods,
                    sessionId,
                    setCurrentStep,
                    steps.length,
                    pendingImages,
                    setPendingImages,
                  );
                })();
              } catch (error) {
                console.error('Step 2 submission failed:', error);
                toast.error('An error occurred while submitting Property Details.', { id: 'step2-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
              }
            }}
            onBack={() => setCurrentStep(currentStep - 1)}
          >
            <Step2PropertyDetails handleImageChange={handleImageChange} removeImage={removeImage} sessionId={sessionId} />
          </Step>
        </FormProvider>
      ),
    },
    {
      title: 'Facilities',
      description: 'Select facilities available at your property.',
      children: (
        <FormProvider {...step3Methods}>
          <Step
            stepNumber={3}
            isActive={currentStep === 2}
            isCompleted={currentStep > 2}
            title="Facilities"
            description="Select facilities available at your property."
            onComplete={async () => {
              if (!sessionId) {
                toast.error('Session ID is missing. Please restart the process.', { id: 'no-session', style: { background: '#FEE2E2', color: '#B91C1C' } });
                return;
              }
              try {
                await step3Methods.handleSubmit(async () => {
                  await handleFacilitiesSubmit(
                    step3Methods,
                    sessionId,
                    setCurrentStep,
                    steps.length,
                    facilities,
                    hasStep3Data,
                    (error) => {
                      toast.error(error, { id: 'step3-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
                    },
                  );
                })();
              } catch (error) {
                console.error('Step 3 submission failed:', error);
                toast.error('An error occurred while submitting Facilities.', { id: 'step3-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
              }
            }}
            onBack={() => setCurrentStep(currentStep - 1)}
          >
            <Step3Facilities
              sessionId={sessionId!}
              onDefaultFacilitiesLoaded={(facilities) => setFacilities(facilities)}
              onSubmissionError={(error) => {
                toast.error(error, { id: 'step3-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
              }}
              setHasExistingData={setHasStep3Data}
            />
          </Step>
        </FormProvider>
      ),
    },
    {
      title: 'Room Information',
      description: 'Provide details about the rooms in your property.',
      children: (
        <FormProvider {...step4Methods}>
          <Step
            stepNumber={4}
            isActive={currentStep === 3}
            isCompleted={currentStep > 3}
            title="Room Information"
            description="Provide details about the rooms in your property."
            onComplete={async () => {
              if (!sessionId) {
                toast.error('Session ID is missing. Please restart the process.', { id: 'no-session', style: { background: '#FEE2E2', color: '#B91C1C' } });
                return;
              }
              try {
                await step4Methods.handleSubmit(async () => {
                  await handleRoomInfoSubmit(step4Methods, sessionId, setCurrentStep, steps.length, { toast });
                })();
              } catch (error) {
                console.error('Step 4 submission failed:', error);
                toast.error('An error occurred while submitting Room Information.', { id: 'step4-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
              }
            }}
            onBack={() => setCurrentStep(currentStep - 1)}
          >
            <Step4RoomInformation onDeleteRoom={handleDeleteRoom} />
          </Step>
        </FormProvider>
      ),
    },
    {
      title: 'Register',
      description: 'Create your account to complete the listing.',
      children: (
        <FormProvider {...registerMethods}>
          <Step
            stepNumber={5}
            isActive={currentStep === 4}
            isCompleted={currentStep > 4}
            title="Register"
            description="Create your account."
            onComplete={async () => {
              if (!sessionId) {
                toast.error('Session ID is missing. Please restart the process.', { id: 'no-session', style: { background: '#FEE2E2', color: '#B91C1C' } });
                return;
              }
              try {
                await registerMethods.handleSubmit(async () => {
                  const userData = await handleRegisterSubmit(
                    registerMethods,
                    sessionId,
                    setCurrentStep,
                    steps.length,
                    { toast },
                  );
                  if (userData) {
                    console.log('User registered:', userData);
                  }
                })();
              } catch (error) {
                console.error('Step 5 submission failed:', error);
                toast.error('An error occurred while completing registration.', { id: 'step5-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
              }
            }}
            onBack={() => setCurrentStep(currentStep - 1)}
          >
            <Step5Register methods={registerMethods} />
          </Step>
        </FormProvider>
      ),
    },
  ];

  if (isLoadingSession || !sessionId) {
    return <div className="text-center">Initializing session...</div>;
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-50 text-green-700 px-3 py-2 rounded-md shadow-sm animate-fade-in flex items-center gap-2 z-50 text-sm">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-md shadow-sm animate-fade-in flex items-center gap-2 z-50 text-sm">
          <AlertTriangle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6 min-h-screen">
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <Onboarding
            title="List Your Property"
            description="Set up your property listing with Homestays Nepal. Complete these steps to showcase your property and start welcoming guests."
            steps={steps}
            currentStep={currentStep}
            onStepComplete={async () => {
              if (currentStep < steps.length) {
                await steps[currentStep].children.props.children.props.onComplete();
              }
            }}
            onStepBack={() => {
              if (currentStep > 0) {
                setCurrentStep((prev) => Math.max(prev - 1, 0));
              }
            }}
            logo={
              <Image
                src={theme === 'dark' ? '/images/logo/darkmode_logo.png' : '/images/logo/logo.png'}
                alt="Homestays Nepal Logo"
                width={80}
                height={40}
                className="object-contain"
              />
            }
          />
        </div>
      </div>
      <Dialog open={!!deleteRoom} onOpenChange={() => setDeleteRoom(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteRoom?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteRoom(null)} className="rounded-lg h-9 px-4">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const rooms = step4Methods.getValues('rooms').filter((room): room is RoomInfo => room != null);
                if (rooms.length > 1) {
                  const updatedRooms = rooms.filter((_, i) => i !== deleteRoom!.index);
                  step4Methods.setValue('rooms', updatedRooms, { shouldValidate: true });
                  setDeleteRoom(null);
                  toast.success(`${deleteRoom!.name} has been removed.`, { id: `delete-room-${deleteRoom!.index}`, style: { background: '#DCFCE7', color: '#15803D' } });
                } else {
                  setErrorMessage('At least one room is required.');
                  setTimeout(() => setErrorMessage(''), 3000);
                }
              }}
              className="rounded-lg h-9 px-4"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default memo(ListYourProperty, () => true);