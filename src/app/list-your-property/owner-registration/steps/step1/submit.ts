// src/app/list-your-property/owner-registration/steps/step1/submit.ts
import { UseFormReturn } from "react-hook-form";
import { Step1FormData } from "../../types";



export const handleBasicInfoSubmit = async (
  step1Methods: UseFormReturn<Step1FormData>,
  sessionId: string | null,
  setSessionId: (id: string) => void,
  setCurrentStep: (step: number) => void,
  stepsLength: number,
  initializeSession: () => Promise<string>
) => {
  // Use a closure to track submission state (no hooks)
  let isSubmitting = false;

  if (isSubmitting) {
    console.log("Submission already in progress, skipping...");
    return;
  }

  isSubmitting = true;
  try {
    const isValid = await step1Methods.trigger();
    if (!isValid) {
      const errors = step1Methods.formState.errors;
      console.error("Form validation failed in handleBasicInfoSubmit:", JSON.stringify(errors, null, 2));
  
      return;
    }

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      console.log("No session ID found, initializing new session...");
      currentSessionId = await initializeSession();
      setSessionId(currentSessionId);
    }

    const formDataValues = step1Methods.getValues();
    const formData = new FormData();
    formData.append("propertyName", formDataValues.propertyName || "");
    formData.append("propertyAddress", formDataValues.propertyAddress || "");
    formData.append("contactNumber", formDataValues.contactNumber || "");
    if (formDataValues.documentType) {
      formData.append("documentType", formDataValues.documentType);
    }

    if (formDataValues.idScanFront instanceof File) {
      formData.append("files", formDataValues.idScanFront);
    } else if (typeof formDataValues.idScanFront === "string" && formDataValues.idScanFront) {
      formData.append("idScanFront", formDataValues.idScanFront);
    }

    if (formDataValues.idScanBack instanceof File) {
      formData.append("files", formDataValues.idScanBack);
    } else if (typeof formDataValues.idScanBack === "string" && formDataValues.idScanBack) {
      formData.append("idScanBack", formDataValues.idScanBack);
    }

    console.log(`Submitting FormData entries:`, Array.from(formData.entries()));

    const response = await fetch(`/api/onboarding/step1/${currentSessionId}`, {
      method: "POST",
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    let responseData;
    if (response.status === 200 && contentType === null && response.headers.get("content-length") === "0") {
      responseData = {};
    } else if (contentType?.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
      console.error("Non-JSON response received:", responseData || "[empty]");
      throw new Error(`Invalid response from server (status: ${response.status})`);
    }

    if (!response.ok) {
      console.error("Backend error response:", JSON.stringify(responseData, null, 2));
      const errorMessage = Array.isArray(responseData.message)
        ? responseData.message.join(", ")
        : responseData.message || `Failed to submit Step 1 (Status: ${response.status})`;
      throw new Error(errorMessage);
    }

    const nextStep = Math.min(1, stepsLength - 1);
    console.log("Setting step to:", nextStep);
    setCurrentStep(nextStep);
   
  } catch (error) {
    console.error("Error in handleBasicInfoSubmit:", error);
    
  } finally {
    isSubmitting = false;
  }
};