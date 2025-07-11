// src/components/onboarding/Step1.tsx
"use client";

import { useEffect, useState } from "react";
import { OnboardingProps } from "@/app/types/onboarding";
import { Step } from "./Step";
import { Button } from "@/components/ui/button";
import { CheckCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function Onboarding({
  title,
  description,
  steps,
  currentStep,
  onStepComplete,
  onStepBack,
  logo,
}: OnboardingProps & { logo: React.ReactNode }) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const router = useRouter();
  const stepHeight = 100 / steps.length;
  const progressHeight = (currentStep + 1) * stepHeight;

  // Log nested <a> tags with detailed info
  useEffect(() => {
    if (typeof window !== "undefined") {
      const nestedLinks = document.querySelectorAll("a a");
      if (nestedLinks.length > 0) {
        console.warn("Nested <a> tags detected in Onboarding:", Array.from(nestedLinks).map(link => ({
          outerHTML: link.outerHTML,
          parentHTML: link.parentElement?.outerHTML,
        })));
      }
    }
  }, [currentStep]);

  // Simulate pending status in frontend only
  useEffect(() => {
    if (currentStep >= steps.length) {
      setShowPending(true);
      const timer = setTimeout(() => {
        setShowPending(false);
        router.push("/host/dashboard");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4 py-6 sm:py-12 mt-16">
      <Dialog open={showPending}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Listing Pending Approval</DialogTitle>
            <DialogDescription>
              Your property listing is pending approval by our team. You will be redirected to your dashboard once your listing is active.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-muted-foreground text-sm">This page will refresh automatically.</div>
        </DialogContent>
      </Dialog>
      <div className="w-full max-w-[95vw] sm:max-w-5xl flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Mobile Progress UI */}
        <div className="sm:hidden w-full">
          <Accordion
            type="single"
            collapsible
            value={isAccordionOpen ? "steps" : ""}
            onValueChange={(value) => setIsAccordionOpen(value === "steps")}
            className="bg-background rounded-lg shadow-sm border border-gray-300"
          >
            <AccordionItem value="steps" className="border-b-0">
              <AccordionTrigger
                className="py-3 px-4 hover:no-underline focus:outline-none"
                role="button"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs sm:text-sm font-semibold text-foreground">
                    {currentStep < steps.length
                      ? `Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].title}`
                      : "Listing Complete"}
                  </span>
                  {isAccordionOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 px-4 pb-4">
                <div className="relative flex flex-col gap-2">
                  <div className="absolute left-4 w-0.5 h-[calc(100%-1.5rem)] bg-muted">
                    <div
                      className="absolute top-0 left-0 w-full bg-primary transition-all duration-300"
                      style={{ height: `${progressHeight}%` }}
                    />
                  </div>
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 z-10">
                      <div className="absolute left-4 transform -translate-x-1/2 h-8 w-8 bg-background border border-gray-300 rounded-full flex items-center justify-center">
                        <CheckCircle2
                          className={`h-5 w-5 ${
                            currentStep > index
                              ? "text-green-500"
                              : currentStep === index
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-medium ml-10 ${
                          currentStep >= index ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Progress UI */}
            <div className="hidden lg:block w-64 flex-shrink-0 relative">
              <div className="absolute left-4 w-0.5 h-[calc(100%-4rem)] bg-muted">
                <div
                  className="absolute top-0 left-0 w-full bg-primary transition-all duration-300"
                  style={{ height: `${progressHeight}%` }}
                />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-around py-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="absolute left-4 transform -translate-x-1/2 h-8 w-8 bg-background border border-gray-300 rounded-full flex items-center justify-center">
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          currentStep > index
                            ? "text-green-500"
                            : currentStep === index
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ml-12 ${
                        currentStep >= index ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Card */}
            <div className="flex-1 rounded-xl shadow-lg border border-gray-300 bg-background p-6 sm:p-8 space-y-6">
              {logo && (
                <div className="flex justify-center mb-6">
                  {logo}
                </div>
              )}
              <div className="text-center space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
                  {description}
                </p>
              </div>
              <div className="flex-1">
                {currentStep >= steps.length ? (
                  <div className="flex flex-col items-center text-center space-y-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <h2 className="text-xl font-bold text-foreground">Congratulations!</h2>
                    <p className="text-base text-muted-foreground">
                      Your property has been successfully listed.
                    </p>
                    <Button
                      className="w-full sm:w-auto py-3 px-6 rounded-lg text-sm font-medium"
                      role="button"
                      aria-label="View property listing"
                      onClick={() => window.location.href = "/listing"}
                    >
                      View Listing
                    </Button>
                  </div>
                ) : (
                  steps[currentStep].children // Render the FormProvider-wrapped Step component
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}