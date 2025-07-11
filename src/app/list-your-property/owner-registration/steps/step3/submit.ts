// src/app/list-your-property/owner-registration/steps/step3/submit.ts
import { UseFormReturn } from 'react-hook-form';
import { toast, ToastOptions } from 'react-hot-toast';
import { Step3FormData, CustomFacility } from '../../types';
import { Facility } from '@/components/onboarding/steps/Step3Facilities';

interface Step3Response {
  facilityIds: number[];
  customFacilities: CustomFacility[];
  step?: number;
}

export const handleFacilitiesSubmit = async (
  methods: UseFormReturn<Step3FormData>,
  sessionId: string,
  setCurrentStep: (step: number) => void,
  totalSteps: number,
  defaultFacilities: Facility[],
  hasExistingData: boolean,
  onError?: (error: string) => void,
) => {
  console.log('handleFacilitiesSubmit called with sessionId:', sessionId, 'hasExistingData:', hasExistingData);
  const data = methods.getValues();
  console.log('Form state before validation:', {
    selectedFacilities: data.selectedFacilities,
    customFacilities: data.customFacilities,
  });

  const isValid = await methods.trigger();
  if (!isValid) {
    const errorMessage =
      methods.formState.errors.selectedFacilities?.message ||
      methods.formState.errors.customFacilities?.message ||
      'Please fix form errors.';
    console.error('Validation errors:', methods.formState.errors);
    if (onError) onError(errorMessage);
    toast.error(errorMessage, { id: 'step3-validation-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
    return;
  }

  // Filter valid facility IDs (numeric only)
  const validFacilityIds = data.selectedFacilities
    .filter((id: number | string) => typeof id === 'number' && id > 0)
    .map((id) => {
      if (typeof id !== 'number') return undefined;
      const facility = defaultFacilities.find((f) => f.id === id);
      if (!facility) console.warn(`No facility found for ID: ${id}`);
      return facility?.id;
    })
    .filter((id: any): id is number => id !== undefined);

  // Filter custom facilities
  const customFacilities = (data.customFacilities || []).filter((cf: CustomFacility) => {
    const isDuplicate = defaultFacilities.some((f) => f.name.toLowerCase() === cf.name.toLowerCase());
    if (isDuplicate) {
      console.warn(`Duplicate custom facility ignored: ${cf.name}`);
      return false;
    }
    return true;
  });

  // Validate at least one facility
  if (validFacilityIds.length === 0 && customFacilities.length === 0) {
    const errorMessage = 'Please select at least one valid facility.';
    console.error('Validation error: No valid facilities selected');
    if (onError) onError(errorMessage);
    toast.error(errorMessage, { id: 'step3-no-facilities', style: { background: '#FEE2E2', color: '#B91C1C' } });
    return;
  }

  const payload = { facilityIds: validFacilityIds, customFacilities };
  const method = hasExistingData ? 'PATCH' : 'POST';
  console.log(`Submitting ${method} to:`, `/api/onboarding/step3/${sessionId}`, 'with payload:', payload);

  try {
    const res = await fetch(`/api/onboarding/step3/${sessionId}?t=${Date.now()}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'No error details' }));
      console.error(`${method} request failed:`, res.status, errorData);
      const errorMessage = errorData.message || `Failed to ${hasExistingData ? 'update' : 'save'} facilities.`;
      if (onError) onError(errorMessage);
      toast.error(errorMessage, { id: 'step3-submission-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
      throw new Error(errorMessage);
    }

    // Verify session step
    const checkSessionStep = async (retries = 3, delay = 2000): Promise<boolean> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await fetch(`/api/onboarding/step3/${sessionId}?t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            signal: AbortSignal.timeout(5000),
          });
          if (!response.ok) {
            console.error(`Failed to fetch session step 3 (Status: ${response.status}, attempt ${attempt})`);
            continue;
          }
          const responseText = await response.text();
          console.log(`Raw Step 3 response (attempt ${attempt}):`, responseText);
          const sessionData: Step3Response = JSON.parse(responseText);
          console.log(`Session step check (attempt ${attempt}):`, JSON.stringify(sessionData, null, 2));

          if (!sessionData) {
            console.error('Empty session data:', sessionData);
            continue;
          }

          // Fallback: Assume step 4 if facilityIds or customFacilities are present
          if (
            typeof sessionData.step !== 'number' &&
            (sessionData.facilityIds?.length > 0 || sessionData.customFacilities?.length > 0)
          ) {
            console.warn(`Step field missing, assuming step 4 for session ${sessionId}`);
            return true;
          }

          if (typeof sessionData.step === 'number' && sessionData.step >= 4) {
            return true;
          }

          console.log(`Session step ${sessionData.step || 'undefined'} < 4, retrying in ${delay}ms...`);
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } catch (error) {
          console.error(`Error checking session step 3 (attempt ${attempt}):`, error);
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
      return false;
    };

    const isStepValid = await checkSessionStep();
    if (isStepValid) {
      console.log('Advancing to Step 4');
      setCurrentStep(3);
      toast.success('Facilities saved successfully.', { id: 'step3-success', style: { background: '#DCFCE7', color: '#15803D' } });
    } else {
      const errorMessage = 'Failed to advance to Room Information. Please try again.';
      console.error('Session step validation failed:', { sessionId, expectedStep: 4 });
      if (onError) onError(errorMessage);
      toast.error(errorMessage, { id: 'step3-advance-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
    }
  } catch (error) {
    console.error('Submission error:', error);
    const errorMessage = error instanceof Error ? error.message : `Could not ${hasExistingData ? 'update' : 'save'} facilities.`;
    if (onError) onError(errorMessage);
    toast.error(errorMessage, { id: 'step3-submission-error', style: { background: '#FEE2E2', color: '#B91C1C' } });
  }
};