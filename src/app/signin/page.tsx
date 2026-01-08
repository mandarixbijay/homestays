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
import { Eye, EyeOff, Mail, Phone, Lock } from "lucide-react";
import { signinPasswordSchema } from "@/hooks/password-hook/password-utils";
import { useErrorBlock } from "@/hooks/block-hook/useErrorBlock";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { OtpDialog } from "@/components/dialog/otp-dialog";
import { useSession, signIn } from "next-auth/react";
import Navbar from "@/components/navbar/navbar";
import LoginRedirect from "@/components/LoginRedirect";

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
      setIsCheckingSession(true);
      return;
    }
    setIsCheckingSession(false);
    if (status === "authenticated") {
      if (session?.user?.isEmailVerified || session?.user?.isMobileVerified) {
        toast.success("Successfully logged in!");
        const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(redirectPath);
      } else {
        setIsOtpDialogOpen(true);
        handleResendOtp();
      }
    }
  }, [status, session, router]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isBlocked("identifier") || isBlocked("password")) {
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
      const response = await signIn("credentials", {
        redirect: false,
        ...payload,
      });

      if (response?.error) {
        handleFailedAttempt("identifier");
        handleFailedAttempt("password");
        toast.error(response.error);
        return;
      }
    } catch (error) {
      handleFailedAttempt("identifier");
      handleFailedAttempt("password");
      toast.error("Failed to login. Please try again.");
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleOtpOpenChange = (open: boolean) => {
    setIsOtpDialogOpen(open);
    if (!open) {
      setOtpValue("");
      setOtpError("");
    }
  };

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    if (otpError) setOtpError("");
  };

  const handleSubmitOtp = async () => {
    setOtpError("");
    if (isBlocked("otp")) {
      toast.error(getBlockedMessage("otp") || "Too many attempts.");
      setOtpValue("");
      return { status: "error", message: getBlockedMessage("otp") || "Too many attempts." };
    }

    if (otpValue.length !== 6) {
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
      const response = await fetch("/api/verification/verify-code", {
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
        setOtpValue("");
        handleFailedAttempt("otp");
        return { status: "error", message: "Invalid response from server." };
      }

      if (result.status !== "success") {
        setOtpError(result.message || "Invalid OTP. Please try again.");
        toast.error(result.message || "Invalid OTP.");
        setOtpValue("");
        handleFailedAttempt("otp");
        return { status: "error", message: result.message || "Invalid OTP." };
      }

      // Re-authenticate after OTP verification
      const loginResponse = await signIn("credentials", {
        redirect: false,
        [isEmail(identifier) ? "email" : "mobileNumber"]: identifier,
        password: form.getValues("password"),
        action: "login",
      });

      if (loginResponse?.error) {
        toast.error("Failed to authenticate after verification.");
        setOtpValue("");
        return { status: "error", message: "Failed to authenticate after verification." };
      }

      toast.success(result.message || "Account verified successfully!");
      setIsOtpDialogOpen(false);
      return { status: "success", message: result.message || "Account verified successfully." };
    } catch (error) {
      setOtpError("Failed to verify OTP.");
      toast.error("Failed to verify OTP.");
      setOtpValue("");
      handleFailedAttempt("otp");
      return { status: "error", message: "Failed to verify OTP." };
    }
  };

  const handleResendOtp = async () => {
    if (isBlocked("otp") || isResendingOtp || countdown > 0) {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 pt-20 pb-8 px-4">
      <LoginRedirect />
      <Navbar hideUserCircle />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src={theme === "dark" ? "/images/logo/darkmode_logo.png" : "/images/logo/logo.png"}
              alt="Nepal Homestays Logo"
              width={72}
              height={72}
              className="rounded-full"
            />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your journey
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
                    <FormLabel className="text-sm font-medium text-foreground">
                      Email or Mobile Number
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Enter your email or mobile number"
                          className="pl-10 h-11 bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary/30"
                          disabled={isBlocked("identifier") || isCheckingSession}
                          {...field}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-11 bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary/30"
                          disabled={isBlocked("password") || isCheckingSession}
                          {...field}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={form.formState.isSubmitting || isBlocked("identifier") || isBlocked("password") || isCheckingSession}
              >
                {isCheckingSession ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : form.formState.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          {/* Footer Links */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Create account
              </Link>
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
