// src/app/list-your-property/owner-registration/steps/finalize/submit.ts
import { UseFormReturn } from 'react-hook-form';
import { toast, ToastOptions } from 'react-hot-toast';
import { RegisterFormData, UserResponseDto } from '../../types';

interface SessionDetails {
  sessionId: string;
  step: number;
  completed: boolean;
  data: any;
  expiresAt: string;
  updatedAt: string;
}

export const handleRegisterSubmit = async (
  registerMethods: UseFormReturn<RegisterFormData>,
  sessionId: string,
  setCurrentStep: (step: number) => void,
  stepsLength: number,
  { toast: toastFn }: { toast: (message: string, options?: ToastOptions) => string },
) => {
  try {
    const isValid = await registerMethods.trigger();
    if (!isValid) {
      toastFn('Please fill in all required fields correctly.', {
        id: 'validation-error',
        style: { background: '#FEE2E2', color: '#B91C1C' },
      });
      return;
    }

    // Verify session status
    const checkSessionStatus = async (retries = 3, delay = 2000): Promise<boolean> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await fetch(`/api/onboarding/session/${sessionId}?t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            signal: AbortSignal.timeout(5000),
          });
          if (!response.ok) {
            console.error(`Failed to fetch session details (Status: ${response.status}, attempt ${attempt})`);
            continue;
          }
          const sessionData: SessionDetails = await response.json();
          console.log(`Session check (attempt ${attempt}):`, JSON.stringify(sessionData, null, 2));

          if (!sessionData) {
            console.error('Empty session data:', sessionData);
            continue;
          }

          if (sessionData.completed || sessionData.step >= 5) {
            return true;
          }

          console.log(
            `Session not completed (step: ${sessionData.step}, completed: ${sessionData.completed}), retrying in ${delay}ms...`,
          );
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } catch (error) {
          console.error(`Error checking session status (attempt ${attempt}):`, error);
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
      return false;
    };

    const isSessionValid = await checkSessionStatus();
    if (!isSessionValid) {
      console.error('Session validation failed:', { sessionId, expectedCompleted: true });
      toastFn('Cannot complete registration; please complete previous steps.', {
        id: 'session-error',
        style: { background: '#FEE2E2', color: '#B91C1C' },
      });
      return;
    }

    const data = registerMethods.getValues();
    console.log('Submitting finalize data:', JSON.stringify(data, null, 2));

    const response = await fetch(`/api/onboarding/finalize/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const responseData = await response.json();
      console.error('Backend error response:', JSON.stringify(responseData, null, 2));
      throw new Error(responseData.message || `Failed to finalize (Status: ${response.status})`);
    }

    const userData: UserResponseDto = await response.json();
    setCurrentStep(stepsLength); // Move to completion state
    registerMethods.reset();
    toastFn('Your homestay has been registered successfully.', {
      id: 'registration-success',
      style: { background: '#DCFCE7', color: '#15803D' },
    });
    return userData;
  } catch (error) {
    console.error('Error in handleRegisterSubmit:', error);
    toastFn(error instanceof Error ? error.message : 'An error occurred while completing registration.', {
      id: 'submission-error',
      style: { background: '#FEE2E2', color: '#B91C1C' },
    });
    return null;
  }
};