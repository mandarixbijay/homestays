// components/onboarding/Step.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { StepProps } from "@/app/types/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

import { debounce } from "@/lib/debounce";


export function Step({
  title,
  description,
  children,
  stepNumber,
  isActive,
  isCompleted,
  onComplete,
  onBack,
}: StepProps) {
  const formContext = useFormContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  // Debounced handleNext
  const handleNext = useCallback(
    debounce(async () => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      console.log("Step.handleNext called for step:", stepNumber);
      try {
        if (formContext) {
          const isValid = await formContext.trigger();
          console.log("Step.handleNext - Validation result:", isValid, "Form errors:", formContext.formState.errors);
          if (isValid) {
            console.log("Form is valid, calling onComplete");
            await onComplete();
          } else {
            console.error("Form is invalid, showing error");
            toast({
              variant: "destructive",
              description: "Please fix the form errors before proceeding.",
            });
          }
        } else {
          console.warn("No form context, proceeding to next step");
          await onComplete();
          toast({
            variant: "default",
            description: "No form context found. Proceeding to next step.",
          });
        }
      } catch (error) {
        console.error("Error in handleNext:", error);
        toast({
          variant: "destructive",
          description: "An error occurred while proceeding to the next step.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 300), // 300ms debounce
    [formContext, onComplete, toast, stepNumber, isSubmitting]
  );

  // Log hydration issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      const nestedLinks = document.querySelectorAll("a a");
      if (nestedLinks.length > 0) {
        console.warn("Nested <a> tags detected, which may cause hydration errors:", nestedLinks);
      }
    }
  }, []);

  if (!isActive && !isCompleted) return null;

  return (
    <Card
      className={`border border-gray-300 rounded-lg shadow-sm flex-1 flex flex-col transition-opacity duration-200
        ${!isActive ? "opacity-0" : "opacity-100"}
      `}
      role="region"
      aria-labelledby={`step-${stepNumber}-title`}
    >
      <CardContent className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3
              id={`step-${stepNumber}-title`}
              className="text-base sm:text-lg font-semibold text-foreground"
            >
              {title}
            </h3>
            {isCompleted && (
              <CheckCircle2 className="text-green-500 h-4 w-5 sm:h-4 sm:w-5" />
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex-1 flex flex-col">{children}</div>
        <div className="flex-col sm:flex sm:flex-row gap-2 justify-end">
          {onBack && stepNumber > 1 && (
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-auto py-3 px-6 rounded-lg text-xs sm:text-sm border-gray-300 transition-all duration-200 hover:bg-muted hover:scale-105"
              role="button"
              aria-label="Go to previous step"
              disabled={isSubmitting}
            >
              Previous
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={
              isSubmitting ||
              (formContext && !formContext.formState.isValid && formContext.formState.isSubmitted)
            }
            className="w-full sm:w-auto py-3 px-6 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-primary/90 hover:scale-105"
            role="button"
            aria-label="Go to next step"
          >
            {stepNumber === 5 ? "Finish" : "Next Step"} {/* Adjust based on total steps */}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}