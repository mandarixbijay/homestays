// src/app/list-your-property/owner-registration/steps/step2/submit.ts
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Step2FormData } from '../../types';
import { sanitizeFileName } from '../sanitizeFileName';



interface Step2Response {
  description: string;
  imageMetadata: Array<{ url: string; tags?: string[]; isMain: boolean }>;
  step?: number;
}

export const handlePropertyDetailsSubmit = async (
  step2Methods: UseFormReturn<Step2FormData>,
  sessionId: string,
  setCurrentStep: (step: number) => void,
  stepsLength: number,
  pendingImages: File[],
  setPendingImages: (images: File[]) => void,
) => {
  try {
    const isValid = await step2Methods.trigger();
    if (!isValid) {
 
      return;
    }

    // Check if Step 2 data exists
    const checkResponse = await fetch(`/api/onboarding/step2/${sessionId}?t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    });
    let hasData = false;
    let existingImages: { url: string; tags?: string[]; isMain: boolean }[] = [];
    if (checkResponse.ok) {
      const existingData = await checkResponse.json();
      console.log('Step 2 GET response:', JSON.stringify(existingData, null, 2));
      hasData = !!(existingData.description || (existingData.imageMetadata && existingData.imageMetadata.length > 0));
      existingImages = existingData.imageMetadata || [];
    } else {
      console.log('No Step 2 data found (status:', checkResponse.status, ')');
    }

    const data = step2Methods.getValues();
    const formData = new FormData();
    formData.append('description', data.description);

    if (data.images && data.images.length > 0) {
      // Filter valid images
      const validImages = data.images.filter((img) =>
        img.isNew ? img.file !== null && img.file instanceof File : !!img.url,
      );

      if (validImages.length !== data.images.length) {
        console.error('Invalid images detected:', {
          totalImages: data.images.length,
          validImages: validImages.length,
          invalidImages: data.images.filter(
            (img) => !(img.isNew ? img.file !== null && img.file instanceof File : !!img.url),
          ),
        });
       
        return;
      }

      // Ensure exactly one image is marked as main
      const mainImages = validImages.filter((img) => img.isMain);
      if (mainImages.length !== 1) {
        console.error('Invalid main image count:', { mainImagesCount: mainImages.length, images: validImages });
    
        return;
      }

      // Create imageMetadata for valid images
      const imageMetadata = validImages.map((img) => ({
        tags: img.tags || [],
        isMain: img.isMain,
        ...(img.url && !img.isNew ? { url: img.url } : {}),
      }));

      // Append new images from pendingImages
      const newImages = validImages.filter((img) => img.isNew && img.file);
      if (newImages.length !== pendingImages.length) {
        console.error('Image count mismatch:', {
          newImagesCount: newImages.length,
          pendingImagesCount: pendingImages.length,
          newImages: newImages.map((img) => ({ name: img.file?.name, size: img.file?.size })),
          pendingImages: pendingImages.map((file) => ({ name: file.name, size: file.size })),
        });
       
        return;
      }

      // Append files to FormData
      newImages.forEach((img, index) => {
        if (img.file) {
          const sanitizedFile = new File([img.file], sanitizeFileName(img.file.name), {
            type: img.file.type,
          });
          formData.append('images', sanitizedFile);
          console.log(`Appending image ${index + 1}: ${sanitizedFile.name} (${sanitizedFile.size} bytes)`);
        }
      });

      console.log('imageMetadata:', JSON.stringify(imageMetadata, null, 2));
      formData.append('imageMetadata', JSON.stringify(imageMetadata));
    } else {
      console.error('No images provided:', { images: data.images });
     
      return;
    }

    // Log FormData entries
    const formDataEntries = Array.from(formData.entries()).map(([key, value]) => [
      key,
      value instanceof File ? `File: ${value.name} (${value.size} bytes, type: ${value.type})` : value,
    ]);
    console.log('FormData entries for submission:', JSON.stringify(formDataEntries, null, 2));

    // Send request to backend
    const response = await fetch(`/api/onboarding/step2/${sessionId}`, {
      method: hasData ? 'PATCH' : 'POST',
      headers: { 'Cache-Control': 'no-cache' },
      body: formData,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const responseData = await response.json();
      console.error('Backend error response:', JSON.stringify(responseData, null, 2));
      throw new Error(
        responseData.message || `Failed to ${hasData ? 'update' : 'submit'} Step 2 (Status: ${response.status})`,
      );
    }

    // Verify session step
    const checkSessionStep = async (retries = 3, delay = 2000): Promise<boolean> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await fetch(`/api/onboarding/step2/${sessionId}?t=${Date.now()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
            signal: AbortSignal.timeout(5000),
          });
          if (!response.ok) {
            console.error(`Failed to fetch session step 2 (Status: ${response.status}, attempt ${attempt})`);
            continue;
          }
          const responseText = await response.text();
          console.log(`Raw Step 2 response (attempt ${attempt}):`, responseText);
          const sessionData: Step2Response = JSON.parse(responseText);
          console.log(`Session step check (attempt ${attempt}):`, JSON.stringify(sessionData, null, 2));

          if (!sessionData) {
            console.error('Empty session data:', sessionData);
            continue;
          }

          // Fallback: Assume step 3 if description and imageMetadata are present
          if (
            typeof sessionData.step !== 'number' &&
            sessionData.description &&
            sessionData.imageMetadata?.length > 0
          ) {
            console.warn(`Step field missing, assuming step 3 for session ${sessionId}`);
            return true;
          }

          if (typeof sessionData.step === 'number' && sessionData.step >= 3) {
            return true;
          }

          console.log(`Session step ${sessionData.step || 'undefined'} < 3, retrying in ${delay}ms...`);
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } catch (error) {
          console.error(`Error checking session step 2 (attempt ${attempt}):`, error);
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
      return false;
    };

    const isStepValid = await checkSessionStep();
    if (isStepValid) {
      const nextStep = Math.min(2, stepsLength - 1); // Step 2 -> Step 3
      setCurrentStep(nextStep);
      step2Methods.reset({
        description: data.description,
        images: data.images.map((img) => ({
          ...img,
          file: null,
          base64: undefined,
        })),
      });
      setPendingImages([]);
     
    } else {
      console.error('Session step validation failed:', { sessionId, expectedStep: 3 });
     
    }
  } catch (error) {
    console.error('Error in handlePropertyDetailsSubmit:', error);
    
  }
};