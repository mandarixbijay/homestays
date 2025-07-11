// src/app/list-your-property/owner-registration/steps/step4/submit.ts
import { UseFormReturn } from 'react-hook-form';
import { toast, ToastOptions } from 'react-hot-toast';
import { Step4FormData } from '../../types';

interface Step4Response {
  totalRooms: number;
  rooms: Array<{
    id: string;
    name: string;
    maxOccupancy: { adults: number; children: number };
    minOccupancy: { adults: number; children: number };
    price: { value: number; currency: string };
  }>;
  step?: number;
}

export const handleRoomInfoSubmit = async (
  step4Methods: UseFormReturn<Step4FormData>,
  sessionId: string,
  setCurrentStep: (step: number) => void,
  stepsLength: number,
  { toast }: { toast: (message: string, options?: ToastOptions) => string },
) => {
  try {
    const isValid = await step4Methods.trigger();
    if (!isValid) {
      toast('Please fill in all required fields correctly.', {
        id: 'step4-validation-error',
        style: { background: '#FEE2E2', color: '#B91C1C' },
      });
      return;
    }

    // Check current session step
    const sessionResponse = await fetch(`/api/onboarding/step3/${sessionId}?t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(5000),
    });
    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json().catch(() => ({ message: 'Failed to fetch session data' }));
      console.error('Step 3 check failed:', errorData);
      toast(errorData.message || 'Failed to verify previous step.', {
        id: 'step4-session-error',
        style: { background: '#FEE2E2', color: '#B91C1C' },
      });
      return;
    }
    const sessionData: Step4Response = await sessionResponse.json();
    console.log('Step 3 session data:', JSON.stringify(sessionData, null, 2));
    if (typeof sessionData.step !== 'number' || sessionData.step < 3) {
      toast(`Cannot submit Step 4; current step is ${typeof sessionData.step === 'number' ? sessionData.step : 'unknown'}. Please complete previous steps.`, {
        id: 'step4-invalid-step',
        style: { background: '#FEE2E2', color: '#B91C1C' },
      });
      return;
    }

    const data = step4Methods.getValues();
    console.log('Submitting Step 4 data:', JSON.stringify(data, null, 2));

    // Validate rooms data
    if (data.rooms.length !== data.totalRooms) {
      toast(`Number of rooms (${data.rooms.length}) does not match totalRooms (${data.totalRooms}).`, {
        id: 'step4-room-mismatch',
        style: { background: '#FEE2E2', color: '#B91C1C' },
      });
      return;
    }

    for (const room of data.rooms) {
      if (!room.name || !Number.isFinite(room.maxOccupancy.adults) || !Number.isFinite(room.price.value)) {
        toast(`Room ${room.name || 'unnamed'} has invalid data. Ensure all fields are filled correctly.`, {
          id: 'step4-invalid-room',
          style: { background: '#FEE2E2', color: '#B91C1C' },
        });
        return;
      }
    }

    const response = await fetch(`/api/onboarding/step4/${sessionId}?t=${Date.now()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Step 4 submission error:', errorData);
      if (errorData.message.includes('Expected step')) {
        toast('Please complete the previous step before submitting Room Information.', {
          id: 'step4-step-error',
          style: { background: '#FEE2E2', color: '#B91C1C' },
        });
      } else {
        toast(errorData.message || 'Failed to submit Room Information.', {
          id: 'step4-submission-error',
          style: { background: '#FEE2E2', color: '#B91C1C' },
        });
      }
      throw new Error(errorData.message || 'Failed to submit Step 4');
    }

    // Verify session step
    const checkSessionStep = async (retries = 3, delay = 2000): Promise<boolean> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await fetch(`/api/onboarding/step4/${sessionId}?t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            signal: AbortSignal.timeout(5000),
          });
          if (!response.ok) {
            console.error(`Failed to fetch session step 4 (Status: ${response.status}, attempt ${attempt})`);
            continue;
          }
          const responseText = await response.text();
          console.log(`Raw Step 4 response (attempt ${attempt}):`, responseText);
          const sessionData: Step4Response = JSON.parse(responseText);
          console.log(`Session step check (attempt ${attempt}):`, JSON.stringify(sessionData, null, 2));

          if (!sessionData) {
            console.error('Empty session data:', sessionData);
            continue;
          }

          // Fallback: Assume step 5 if totalRooms and rooms are present
          if (
            typeof sessionData.step !== 'number' &&
            sessionData.totalRooms > 0 &&
            sessionData.rooms?.length > 0
          ) {
            console.warn(`Step field missing, assuming step 5 for session ${sessionId}`);
            return true;
          }

          if (typeof sessionData.step === 'number' && sessionData.step >= 5) {
            return true;
          }

          console.log(`Session step ${sessionData.step || 'undefined'} < 5, retrying in ${delay}ms...`);
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } catch (error) {
          console.error(`Error checking session step 4 (attempt ${attempt}):`, error);
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
      return false;
    };

    const isStepValid = await checkSessionStep();
    if (isStepValid) {
      const nextStep = Math.min(4, stepsLength - 1); // Step 4 -> Step 5
      setCurrentStep(nextStep);
      step4Methods.reset({
        totalRooms: data.totalRooms,
        rooms: data.rooms,
      });
      toast('Room Information Saved. Proceeding to finalize your registration.', {
        id: 'step4-success',
        style: { background: '#DCFCE7', color: '#15803D' },
      });
    } else {
      console.error('Session step validation failed:', { sessionId, expectedStep: 5 });
      toast('Failed to advance to Finalize. Please try again.', {
        id: 'step4-advance-error',
        style: { background: '#FEE2E2', color: '#B91C1C' },
      });
    }
  } catch (error) {
    console.error('Error in handleRoomInfoSubmit:', error);
    toast(error instanceof Error ? error.message : 'An error occurred while saving Room Information.', {
      id: 'step4-submission-error',
      style: { background: '#FEE2E2', color: '#B91C1C' },
    });
  }
};