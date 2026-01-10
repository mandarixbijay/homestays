"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpDialog } from "@/components/dialog/otp-dialog";
import { useErrorBlock } from "@/hooks/block-hook/useErrorBlock";
import Image from "next/image";
import Navbar from "@/components/navbar/navbar";

const formSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or mobile number is required")
    .refine(
      (value) =>
        z.string().email().safeParse(value).success ||
        /^\+?[1-9]\d{1,14}$/.test(value),
      {
        message: "Please enter a valid email or mobile number",
      }
    ),
});

export default function ForgotPasswordPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { handleFailedAttempt, isBlocked, getBlockedMessage } = useErrorBlock();
  const router = useRouter();

  const isEmail = (identifier: string) => z.string().email().safeParse(identifier).success;

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (otpError) setOtpError("");
  };

  const handleOtpSubmit = async () => {
    setOtpError("");
    if (isBlocked("otp")) {
      toast.error(getBlockedMessage("otp") || "Too many attempts.");
      setOtp("");
      return { status: "error", message: getBlockedMessage("otp") || "Too many attempts." };
    }

    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits.");
      toast.error("OTP must be 6 digits.");
      setOtp("");
      return { status: "error", message: "OTP must be 6 digits." };
    }

    try {
      const identifier = form.getValues("identifier");
      const payload = {
        [isEmail(identifier) ? "email" : "mobileNumber"]: identifier,
        code: otp,
      };
      const response = await fetch("/api/auth/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        setOtpError("Invalid response from server. Please try again.");
        toast.error("Invalid response from server.");
        setOtp("");
        handleFailedAttempt("otp");
        return { status: "error", message: "Invalid response from server." };
      }

      if (result.status !== "success") {
        setOtpError(result.message || "Invalid OTP. Please try again.");
        toast.error(result.message || "Invalid OTP.");
        setOtp("");
        handleFailedAttempt("otp");
        return { status: "error", message: result.message || "Invalid OTP." };
      }

      // Store identifier and code for reset password
      sessionStorage.setItem(
        "resetPasswordIdentifier",
        JSON.stringify({ [isEmail(identifier) ? "email" : "mobileNumber"]: identifier })
      );
      sessionStorage.setItem("resetPasswordCode", otp);
      return { status: "success", message: result.message || "OTP verified successfully." };
    } catch (error) {
      setOtpError("Failed to verify OTP.");
      toast.error("Failed to verify OTP.");
      setOtp("");
      handleFailedAttempt("otp");
      return { status: "error", message: "Failed to verify OTP." };
    }
  };

  const handleResendOtp = async () => {
    if (isBlocked("otp") || isResending || countdown > 0) {
      toast.error(getBlockedMessage("otp") || "Please wait before resending OTP.");
      return;
    }

    setIsResending(true);
    setCountdown(60);

    try {
      const identifier = form.getValues("identifier");
      const payload = {
        [isEmail(identifier) ? "email" : "mobileNumber"]: identifier,
      };
      const response = await fetch("/api/verification/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response from server");
      }

      if (result.status !== "success") {
        throw new Error(result.message || "Failed to resend OTP");
      }

      toast.success(
        isEmail(identifier)
          ? "New OTP sent to your email."
          : "New OTP sent to your mobile number."
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend OTP.");
      handleFailedAttempt("otp");
    } finally {
      setIsResending(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isBlocked("identifier")) {
      toast.error(getBlockedMessage("identifier") || "Too many attempts.");
      return;
    }

    try {
      const payload = {
        [isEmail(values.identifier) ? "email" : "mobileNumber"]: values.identifier,
      };
      const response = await fetch("/api/verification/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid response from server");
      }

      if (result.status !== "success") {
        handleFailedAttempt("identifier");
        throw new Error(result.message || "Failed to send password reset code");
      }

      // Only show one toast - the success message
      toast.success(
        isEmail(values.identifier)
          ? "Password reset code sent to your email."
          : "Password reset code sent to your mobile number."
      );
      setShowOtpDialog(true);
      setCountdown(60); // Start countdown without calling handleResendOtp (which shows another toast)
    } catch (error) {
      handleFailedAttempt("identifier");
      toast.error(error instanceof Error ? error.message : "Failed to send password reset code. Please try again.");
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 pb-8 px-4">
      <Navbar hideUserCircle />

      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Sign In
        </Link>

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
            <h1 className="text-2xl font-bold text-gray-900">
              Forgot Password?
            </h1>
            <p className="text-sm text-gray-600">
              No worries! Enter your email or mobile number and we&apos;ll send you a reset code.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email or Mobile Number
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter your email or mobile number"
                          className="pl-10 h-11 bg-white border-gray-300 focus:border-[#1A403D] focus:ring-1 focus:ring-[#1A403D]/30"
                          disabled={isBlocked("identifier") || form.formState.isSubmitting}
                          {...field}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {field.value && isEmail(field.value) ? (
                            <Mail className="h-4 w-4" />
                          ) : (
                            <Phone className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-[#1A403D] hover:bg-[#1A403D]/90 text-white"
                disabled={form.formState.isSubmitting || isBlocked("identifier")}
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          </Form>

          {/* Footer Links */}
          <div className="text-center space-y-3 pt-2">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                href="/signin"
                className="font-medium text-[#1A403D] hover:text-[#1A403D]/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-[#1A403D] hover:text-[#1A403D]/80 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <OtpDialog
        open={showOtpDialog}
        isBlocked={isBlocked("otp")}
        onOpenChange={setShowOtpDialog}
        otp={otp}
        onOtpChange={handleOtpChange}
        otpError={otpError}
        onSubmitOtp={handleOtpSubmit}
        isResending={isResending}
        onResend={handleResendOtp}
        title="Verify Your Identity"
        description={
          isEmail(form.getValues("identifier"))
            ? "Enter the 6-digit code sent to your email address."
            : "Enter the 6-digit code sent to your mobile number."
        }
      />
    </div>
  );
}
