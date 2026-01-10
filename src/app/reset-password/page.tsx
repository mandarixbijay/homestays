"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  getPasswordStrength,
  getStrengthColor,
  getStrengthText,
  signinPasswordSchema,
} from "@/hooks/password-hook/password-utils";
import { useErrorBlock } from "@/hooks/block-hook/useErrorBlock";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const formSchema = z
  .object({
    newPassword: signinPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { handleFailedAttempt, isBlocked, getBlockedMessage } = useErrorBlock();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
      code: "",
    },
  });

  useEffect(() => {
    const identifierData = sessionStorage.getItem("resetPasswordIdentifier");
    const code = sessionStorage.getItem("resetPasswordCode");
    if (!identifierData) {
      console.log("[ResetPasswordPage] No identifier found, redirecting to /forgot-password");
      toast.error("Invalid session. Please start the password reset process again.");
      router.push("/forgot-password");
      return;
    }
    if (code) {
      console.log("[ResetPasswordPage] Setting code from sessionStorage:", code);
      form.setValue("code", code);
    }
  }, [form, router]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPasswordStrength(getPasswordStrength(password));
    form.setValue("newPassword", password);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("[onSubmit] Form submitted with values:", data);
    if (isBlocked("reset-password")) {
      console.log("[onSubmit] Blocked:", getBlockedMessage("reset-password"));
      toast.error(getBlockedMessage("reset-password") || "Too many attempts.");
      return;
    }

    try {
      const identifierData = sessionStorage.getItem("resetPasswordIdentifier");
      if (!identifierData) {
        console.log("[onSubmit] No identifier found");
        throw new Error("Invalid session. Please start the password reset process again.");
      }
      const { email, mobileNumber } = JSON.parse(identifierData);
      const payload = {
        newPassword: data.newPassword,
        code: data.code,
        ...(email ? { email } : { mobileNumber }),
      };
      console.log("[onSubmit] Sending reset password request with payload:", payload);
      const response = await fetch("/api/verification/reset-password-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[onSubmit] HTTP status:", response.status);
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
        console.log("[onSubmit] Reset password response:", result);
      } catch (e) {
        console.error("[onSubmit] Failed to parse response:", text);
        throw new Error("Invalid response from server");
      }

      if (result.status !== "success") {
        console.log("[onSubmit] Reset password failed:", result.message);
        handleFailedAttempt("reset-password");
        throw new Error(result.message || "Failed to reset password");
      }

      console.log("[onSubmit] Password reset successful");
      toast.success(result.message || "Password reset successfully!");
      sessionStorage.removeItem("resetPasswordIdentifier");
      sessionStorage.removeItem("resetPasswordCode");
      router.push("/signin");
    } catch (error) {
      console.error("[onSubmit] Reset password error:", error);
      handleFailedAttempt("reset-password");
      toast.error(error instanceof Error ? error.message : "Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 pb-8 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/images/logo/logo.png"
              alt="Nepal Homestays Logo"
              width={100}
              height={100}
              className="h-20 w-auto"
            />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-sm text-gray-600">Enter your new password below</p>
          </div>

          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className="h-11 bg-white border-gray-300 focus:border-[#1A403D] focus:ring-1 focus:ring-[#1A403D]/30 pr-10"
                          disabled={form.formState.isSubmitting || isBlocked("reset-password")}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handlePasswordChange(e);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    {/* Password Strength Indicator */}
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{getStrengthText(passwordStrength)}</p>
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Retype new password"
                          className="h-11 bg-white border-gray-300 focus:border-[#1A403D] focus:ring-1 focus:ring-[#1A403D]/30 pr-10"
                          disabled={form.formState.isSubmitting || isBlocked("reset-password")}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-[#1A403D] hover:bg-[#1A403D]/90 text-white"
                disabled={form.formState.isSubmitting || isBlocked("reset-password")}
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>

          {/* Footer Links */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/signin"
                className="font-medium text-[#1A403D] hover:text-[#1A403D]/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}