"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OtpDialog } from "@/components/dialog/otp-dialog";
import { useErrorBlock } from "@/hooks/block-hook/useErrorBlock";
import Image from "next/image";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();
  const { handleFailedAttempt, isBlocked, getBlockedMessage } = useErrorBlock();
  const router = useRouter();

  const isEmail = (identifier: string) => z.string().email().safeParse(identifier).success;

  const handleOtpChange = (value: string) => {
    console.log("[handleOtpChange] OTP changed to:", value);
    setOtp(value);
    if (otpError) setOtpError("");
  };

  const handleOtpSubmit = async () => {
    console.log("[handleOtpSubmit] Starting OTP submission:", { otp, isBlocked: isBlocked("otp") });
    setOtpError("");
    if (isBlocked("otp")) {
      console.log("[handleOtpSubmit] OTP blocked:", getBlockedMessage("otp"));
      toast.error(getBlockedMessage("otp") || "Too many attempts.");
      setOtp("");
      return { status: "error", message: getBlockedMessage("otp") || "Too many attempts." };
    }

    if (otp.length !== 6) {
      console.log("[handleOtpSubmit] Invalid OTP length:", otp.length);
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
      console.log("[handleOtpSubmit] OTP validation payload:", payload);
      const response = await fetch("/api/auth/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[handleOtpSubmit] HTTP status:", response.status);
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
        console.log("[handleOtpSubmit] OTP validation response:", result);
      } catch (e) {
        console.error("[handleOtpSubmit] Failed to parse response:", text);
        setOtpError("Invalid response from server. Please try again.");
        toast.error("Invalid response from server.");
        setOtp("");
        handleFailedAttempt("otp");
        return { status: "error", message: "Invalid response from server." };
      }

      if (result.status !== "success") {
        console.log("[handleOtpSubmit] Validation failed:", result.message);
        setOtpError(result.message || "Invalid OTP. Please try again.");
        toast.error(result.message || "Invalid OTP.");
        setOtp("");
        handleFailedAttempt("otp");
        return { status: "error", message: result.message || "Invalid OTP." };
      }

      console.log("[handleOtpSubmit] Validation successful:", result.message);
      // Store identifier and code for reset password
      sessionStorage.setItem(
        "resetPasswordIdentifier",
        JSON.stringify({ [isEmail(identifier) ? "email" : "mobileNumber"]: identifier })
      );
      sessionStorage.setItem("resetPasswordCode", otp);
      return { status: "success", message: result.message || "OTP verified successfully." };
    } catch (error) {
      console.error("[handleOtpSubmit] OTP validation error:", error);
      setOtpError("Failed to verify OTP.");
      toast.error("Failed to verify OTP.");
      setOtp("");
      handleFailedAttempt("otp");
      return { status: "error", message: "Failed to verify OTP." };
    }
  };

  const handleResendOtp = async () => {
    console.log("[handleResendOtp] Starting resend OTP for:", form.getValues("identifier"));
    if (isBlocked("otp") || isResending || countdown > 0) {
      console.log("[handleResendOtp] Blocked or resending:", getBlockedMessage("otp"));
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
      console.log("[handleResendOtp] Resend OTP payload:", payload);
      const response = await fetch("/api/verification/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[handleResendOtp] HTTP status:", response.status);
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
        console.log("[handleResendOtp] Resend OTP response:", result);
      } catch (e) {
        console.error("[handleResendOtp] Failed to parse response:", text);
        throw new Error("Invalid response from server");
      }

      if (result.status !== "success") {
        console.log("[handleResendOtp] Resend failed:", result.message);
        throw new Error(result.message || "Failed to resend OTP");
      }

      console.log("[handleResendOtp] Resend successful");
      toast.success(
        isEmail(identifier)
          ? "New OTP sent to your email."
          : "New OTP sent to your mobile number."
      );
    } catch (error) {
      console.error("[handleResendOtp] Resend OTP error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to resend OTP.");
      handleFailedAttempt("otp");
    } finally {
      setIsResending(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("[onSubmit] Form submitted with values:", values);
    if (isBlocked("identifier")) {
      console.log("[onSubmit] Blocked:", getBlockedMessage("identifier"));
      toast.error(getBlockedMessage("identifier") || "Too many attempts.");
      return;
    }

    try {
      const payload = {
        [isEmail(values.identifier) ? "email" : "mobileNumber"]: values.identifier,
      };
      console.log("[onSubmit] Sending reset code with payload:", payload);
      const response = await fetch("/api/verification/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[onSubmit] HTTP status:", response.status);
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
        console.log("[onSubmit] Forgot password response:", result);
      } catch (e) {
        console.error("[onSubmit] Failed to parse response:", text);
        throw new Error("Invalid response from server");
      }

      if (result.status !== "success") {
        console.log("[onSubmit] Failed to send reset code:", result.message);
        handleFailedAttempt("identifier");
        throw new Error(result.message || "Failed to send password reset code");
      }

      console.log("[onSubmit] Reset code sent successfully");
      toast.success(
        isEmail(values.identifier)
          ? "Password reset email sent. Please check your inbox."
          : "Password reset code sent to your mobile number."
      );
      setShowOtpDialog(true);
      await handleResendOtp();
    } catch (error) {
      console.error("[onSubmit] Error sending password reset code:", error);
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
    <div className="flex min-h-[40vh] h-full w-full items-center justify-center px-4 mt-60">
      <Card className="border-none max-w-md p-4 sm:p-8 space-y-8 rounded-xl shadow-lg mx-2">
        <div className="flex justify-center mb-4">
          <Image
            src={
              theme === "dark"
                ? "/images/logo/darkmode_logo.png"
                : "/images/logo/logo.png"
            }
            alt="Homestay Nepal Logo"
            width={80}
            height={80}
          />
        </div>
        <CardHeader>
          <CardTitle className="text-2xl justify-center text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="justify-center text-center">
            Enter your email address or mobile number to receive a password reset code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="identifier">Email or Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          id="identifier"
                          placeholder="Enter your email or mobile number (e.g., +1234567890)"
                          type="text"
                          autoComplete="email tel"
                          disabled={isBlocked("identifier")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting || isBlocked("identifier")}
                >
                  Send Reset Code
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
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
        title="Verify Your Account"
        description={
          isEmail(form.getValues("identifier"))
            ? "Enter the 6-digit code sent to your email address to verify your account."
            : "Enter the 6-digit code sent to your mobile number to verify your account."
        }
      />
    </div>
  );
}