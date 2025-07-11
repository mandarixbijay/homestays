"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import Resend from "../ui/resendbutton";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

interface OtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otp: string;
  onOtpChange: (value: string) => void;
  otpError: string;
  onSubmitOtp: (otp: string) => void;
  isResending: boolean;
  onResend: () => Promise<void>;
  title?: string;
  description?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  blockedMessage?: string;
  isBlocked?: boolean;
}

export function OtpDialog({
  open,
  onOpenChange,
  otp,
  onOtpChange,
  otpError,
  onSubmitOtp,
  isResending,
  onResend,
  title,
  description,
  footerLinkText,
  footerLinkHref,
  blockedMessage,
  isBlocked,
}: OtpDialogProps) {
  const router = useRouter();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [countdown, setCountdown] = useState(60);

  // Auto-focus first OTP input and manage countdown
  useEffect(() => {
    if (open) {
      firstInputRef.current?.focus();
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [open]);

  const handleInternalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitOtp(otp);
    if (location.pathname === "/forgot-password") {
      router.push("/reset-password");
    }
  };

  const handleResend = async () => {
    await onResend();
    setCountdown(60); // Reset countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] max-w-[92vw] p-6 sm:p-8 rounded-2xl bg-background shadow-2xl border border-border">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
            {title || "Verify Your Email"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            {description ||
              "Enter the 6-digit code sent to your email to continue."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInternalSubmit} className="mt-6 space-y-6">
          {blockedMessage && (
            <div
              className="text-sm text-center text-destructive bg-destructive/10 p-3 rounded-lg transition-opacity duration-300"
              role="alert"
            >
              {blockedMessage}
            </div>
          )}
          <div className="space-y-3">
            <label
              htmlFor="otp"
              className="text-sm font-semibold text-foreground text-center block"
            >
              Verification Code
            </label>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={onOtpChange}
              className="flex justify-center"
            >
              <InputOTPGroup className="flex gap-1 sm:gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    ref={index === 0 ? firstInputRef : null}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-base sm:text-lg font-medium text-center border-2 border-input rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 bg-background shadow-sm"
                  />
                ))}
                <InputOTPSeparator className="text-muted-foreground self-center mx-1 sm:mx-2" />
                {Array.from({ length: 3 }).map((_, index) => (
                  <InputOTPSlot
                    key={index + 3}
                    index={index + 3}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-base sm:text-lg font-medium text-center border-2 border-input rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 bg-background shadow-sm"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {otpError && (
              <div
                className="text-sm text-center text-destructive transition-opacity duration-300"
                role="alert"
              >
                {otpError}
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            disabled={isResending || isBlocked}
          >
            {isResending ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-primary-foreground"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </Button>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground font-medium">
              {countdown > 0
                ? `Resend available in ${countdown}s`
                : "Didn't receive a code?"}
            </p>
            <Resend
              onClick={handleResend}
              disabled={isResending || countdown > 0}
              countdown={countdown}
              className="text-sm font-semibold text-primary hover:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
            />
          </div>
          {footerLinkText && footerLinkHref && (
            <div className="text-center text-sm text-muted-foreground mt-4">
              <Link
                href={footerLinkHref}
                className="text-primary hover:underline font-semibold transition-colors duration-200"
              >
                {footerLinkText}
              </Link>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}