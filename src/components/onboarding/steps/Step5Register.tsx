// src/components/onboarding/steps/Step5Register.tsx
"use client";

import { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { RegisterFormData } from "@/app/list-your-property/owner-registration/steps";
// Import your API request utility (adjust the path as needed)

interface Step5RegisterProps {
  sessionId: string | null;
  setCurrentStep: (step: number) => void;
}

export function Step5Register({ sessionId, setCurrentStep }: Step5RegisterProps) {
  const { register, formState: { errors, isSubmitting }, watch, trigger, setValue } = useFormContext<RegisterFormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [contactMethod, setContactMethod] = useState<"email" | "mobileNumber">("email");

  const handleSubmit = useCallback(async () => {
    if (!sessionId) {
      toast.error("Session ID is missing.");
      return;
    }

    const isValid = await trigger();
    if (!isValid) return;

    const values = watch();
    const payload = {
      name: values.name,
      password: values.password,
      ...(contactMethod === "email" ? { email: values.email } : { mobileNumber: values.mobileNumber }),
    };

    try {
      // await apiRequest(`/onboarding/finalize/${sessionId}`, "POST", payload);
      // Clear session logic here (replace with your actual implementation)
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("onboardingSession");
      }
      setCurrentStep(5);
      toast.success("Account created successfully!");
    } catch (error) {}
  }, [sessionId, trigger, watch, setCurrentStep]);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="h-4 w-4" /> Name
        </Label>
        <Input id="name" {...register("name")} placeholder="e.g., John Doe" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <Label>Contact Method</Label>
        <RadioGroup
          value={contactMethod}
          onValueChange={(value: "email" | "mobileNumber") => {
            setContactMethod(value);
            setValue("email", value === "email" ? watch("email") || "" : "", { shouldValidate: true });
            setValue("mobileNumber", value === "mobileNumber" ? watch("mobileNumber") || "" : "", { shouldValidate: true });
          }}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email">Email</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="mobileNumber" id="mobileNumber" />
            <Label htmlFor="mobileNumber">Mobile Number</Label>
          </div>
        </RadioGroup>
      </div>
      {contactMethod === "email" ? (
        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </Label>
          <Input id="email" type="email" {...register("email")} placeholder="e.g., user@example.com" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
      ) : (
        <div>
          <Label htmlFor="mobileNumber" className="flex items-center gap-2">
            <Phone className="h-4 w-4" /> Mobile Number
          </Label>
          <Input id="mobileNumber" type="tel" {...register("mobileNumber")} placeholder="e.g., 9802005009" />
          {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber.message}</p>}
        </div>
      )}
      <div>
        <Label htmlFor="password" className="flex items-center gap-2">
          <Lock className="h-4 w-4" /> Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="Enter your password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Registration"}
      </Button>
    </div>
  );
}
