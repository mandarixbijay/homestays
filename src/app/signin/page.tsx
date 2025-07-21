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
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signinPasswordSchema } from "@/hooks/password-hook/password-utils";
import { useErrorBlock } from "@/hooks/block-hook/useErrorBlock";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { OtpDialog } from "@/components/dialog/otp-dialog";
import { useSession, signIn } from "next-auth/react";
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
  password: signinPasswordSchema,
});

const LoginPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      identifier: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  });

  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const { handleFailedAttempt, isBlocked, getBlockedMessage } = useErrorBlock();
  const router = useRouter();
  const { data: session, status } = useSession();

  const isEmail = (identifier: string) => z.string().email().safeParse(identifier).success;

  useEffect(() => {
    if (status === "loading") {
      console.log("[LoginPage] Session loading");
      setIsCheckingSession(true);
      return;
    }
    setIsCheckingSession(false);
    if (status === "authenticated") {
      if (session?.user?.isEmailVerified || session?.user?.isMobileVerified) {
        console.log("[LoginPage] User authenticated and verified, redirecting");
        toast.success("Successfully logged in!");
        const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(redirectPath);
      } else {
        console.log("[LoginPage] User authenticated but unverified, opening OTP dialog");
        setIsOtpDialogOpen(true);
        handleResendOtp();
      }
    }
  }, [status, session, router]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("[onSubmit] Form submitted with values:", data);
    if (isBlocked("identifier") || isBlocked("password")) {
      console.log("[onSubmit] Blocked:", getBlockedMessage("identifier") || getBlockedMessage("password"));
      toast.error(getBlockedMessage("identifier") || getBlockedMessage("password") || "Too many attempts.");
      return;
    }

    try {
      setIsCheckingSession(true);
      const payload = {
        action: "login",
        [isEmail(data.identifier) ? "email" : "mobileNumber"]: data.identifier,
        password: data.password,
      };
      console.log("[onSubmit] Calling signIn with:", payload);
      const response = await signIn("credentials", {
        redirect: false,
        ...payload,
      });
      console.log("[onSubmit] signIn response:", response);

      if (response?.error) {
        console.error("[onSubmit] signIn error:", response.error);
        handleFailedAttempt("identifier");
        handleFailedAttempt("password");
        toast.error(response.error);
        return;
      }

      console.log("[onSubmit] Login successful, awaiting session update");
    } catch (error) {
      console.error("[onSubmit] Login error:", error);
      handleFailedAttempt("identifier");
      handleFailedAttempt("password");
      toast.error("Failed to login. Please try again.");
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleOtpOpenChange = (open: boolean) => {
    console.log("[handleOtpOpenChange] OTP dialog open state:", open);
    setIsOtpDialogOpen(open);
    if (!open) {
      setOtpValue("");
      setOtpError("");
    }
  };

  const handleOtpChange = (value: string) => {
    console.log("[handleOtpChange] OTP changed to:", value);
    setOtpValue(value);
    if (otpError) setOtpError("");
  };

  const handleSubmitOtp = async () => {
    console.log("[handleSubmitOtp] Starting OTP submission:", { otp: otpValue, isBlocked: isBlocked("otp") });
    setOtpError("");
    if (isBlocked("otp")) {
      console.log("[handleSubmitOtp] OTP blocked:", getBlockedMessage("otp"));
      toast.error(getBlockedMessage("otp") || "Too many attempts.");
      setOtpValue("");
      return { status: "error", message: getBlockedMessage("otp") || "Too many attempts." };
    }

    if (otpValue.length !== 6) {
      console.log("[handleSubmitOtp] Invalid OTP length:", otpValue.length);
      setOtpError("OTP must be 6 digits.");
      toast.error("OTP must be 6 digits.");
      setOtpValue("");
      return { status: "error", message: "OTP must be 6 digits." };
    }

    try {
      const identifier = form.getValues("identifier");
      const payload = {
        [isEmail(identifier) ? "email" : "mobileNumber"]: identifier,
        code: otpValue,
      };
      console.log("[handleSubmitOtp] OTP verification payload:", payload);
      const response = await fetch("/api/verification/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[handleSubmitOtp] HTTP status:", response.status);
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
        console.log("[handleSubmitOtp] OTP verification response:", result);
      } catch (e) {
        console.error("[handleSubmitOtp] Failed to parse response:", text);
        setOtpError("Invalid response from server. Please try again.");
        toast.error("Invalid response from server.");
        setOtpValue("");
        handleFailedAttempt("otp");
        return { status: "error", message: "Invalid response from server." };
      }

      if (result.status !== "success") {
        console.log("[handleSubmitOtp] Verification failed:", result.message);
        setOtpError(result.message || "Invalid OTP. Please try again.");
        toast.error(result.message || "Invalid OTP.");
        setOtpValue("");
        handleFailedAttempt("otp");
        return { status: "error", message: result.message || "Invalid OTP." };
      }

      console.log("[handleSubmitOtp] Verification successful:", result.message);
      // Re-authenticate after OTP verification
      const loginResponse = await signIn("credentials", {
        redirect: false,
        [isEmail(identifier) ? "email" : "mobileNumber"]: identifier,
        password: form.getValues("password"),
        action: "login",
      });

      if (loginResponse?.error) {
        console.error("[handleSubmitOtp] Re-authentication failed:", loginResponse.error);
        toast.error("Failed to authenticate after verification.");
        setOtpValue("");
        return { status: "error", message: "Failed to authenticate after verification." };
      }

      console.log("[handleSubmitOtp] Re-authentication successful");
      toast.success(result.message || "Account verified successfully!");
      setIsOtpDialogOpen(false);
      return { status: "success", message: result.message || "Account verified successfully." };
    } catch (error) {
      console.error("[handleSubmitOtp] OTP verification error:", error);
      setOtpError("Failed to verify OTP.");
      toast.error("Failed to verify OTP.");
      setOtpValue("");
      handleFailedAttempt("otp");
      return { status: "error", message: "Failed to verify OTP." };
    }
  };

  const handleResendOtp = async () => {
    console.log("[handleResendOtp] Starting resend OTP for:", form.getValues("identifier"));
    if (isBlocked("otp") || isResendingOtp || countdown > 0) {
      console.log("[handleResendOtp] Blocked or resending:", getBlockedMessage("otp"));
      toast.error(getBlockedMessage("otp") || "Please wait before resending OTP.");
      return;
    }

    setIsResendingOtp(true);
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
      setIsResendingOtp(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br overflow-auto mt-20">
      <Navbar hideUserCircle />
      <div className="w-full max-w-md p-4 sm:p-8 space-y-8 rounded-xl shadow-lg mx-2 bg-background">
        <div className="flex justify-center mb-4">
          <Image
            src={theme === "dark" ? "/images/logo/darkmode_logo.png" : "/images/logo/logo.png"}
            alt="Homestay Nepal Logo"
            width={80}
            height={80}
          />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p>Please login to your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email or Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your email or mobile number (e.g., +1234567890)"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                      disabled={isBlocked("identifier") || isCheckingSession}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent pr-10"
                        disabled={isBlocked("password") || isCheckingSession}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full py-2 px-4 font-medium rounded-lg transition-colors duration-200"
              disabled={form.formState.isSubmitting || isBlocked("identifier") || isBlocked("password") || isCheckingSession}
            >
              {isCheckingSession ? "Processing..." : form.formState.isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="space-y-4">
          <Link
            href="/forgot-password"
            className="block text-sm text-center text-primary hover:text-primary-hover transition-colors duration-200"
          >
            Forgot password?
          </Link>
          <div className="text-center">
            <p className="text-sm">
              <span>
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:text-primary-hover transition-colors duration-200"
                >
                  Create account
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
      <OtpDialog
        open={isOtpDialogOpen}
        onOpenChange={handleOtpOpenChange}
        otp={otpValue}
        onOtpChange={handleOtpChange}
        otpError={otpError}
        onSubmitOtp={handleSubmitOtp}
        isResending={isResendingOtp}
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
};

export default LoginPage;