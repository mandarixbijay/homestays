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
  email: z.string().email("Invalid email address"),
  password: signinPasswordSchema,
});

const LoginPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      email: "",
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
  const { handleFailedAttempt, isBlocked, getBlockedMessage } = useErrorBlock();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.isEmailVerified) {
      toast.success("Successfully logged in!");
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    }
  }, [status, session, router]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isBlocked("email") || isBlocked("password")) {
      toast.error(getBlockedMessage("email") || getBlockedMessage("password") || "Too many attempts.");
      return;
    }

    try {
      const response = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        action: "login", // Match auth.ts
      });

      if (response?.error) {
        if (response.error.toLowerCase().includes("verify")) {
          setIsOtpDialogOpen(true);
          await handleResendOtp();
        } else {
          handleFailedAttempt("email");
          handleFailedAttempt("password");
          toast.error(response.error);
        }
        return;
      }

      // If login succeeds but user is unverified, show OTP dialog
      if (status === "authenticated" && !session?.user?.isEmailVerified) {
        setIsOtpDialogOpen(true);
        await handleResendOtp();
      }
    } catch (error) {
      console.error("Login error:", error);
      handleFailedAttempt("email");
      handleFailedAttempt("password");
      toast.error("Failed to login. Please try again.");
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
    if (isBlocked("otp")) {
      toast.error(getBlockedMessage("otp") || "Too many attempts.");
      return;
    }

    if (otpValue.length !== 6) {
      setOtpError("OTP must be 6 digits.");
      toast.error("OTP must be 6 digits.");
      return;
    }

    try {
      const response = await fetch("/api/verification/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.getValues("email"), code: otpValue }),
      });

      const result = await response.json();

      if (!response.ok) {
        setOtpError(result.message || "Invalid OTP.");
        handleFailedAttempt("otp");
        toast.error(result.message || "Invalid OTP.");
        return;
      }

      // Re-authenticate after OTP verification
      const loginResponse = await signIn("credentials", {
        redirect: false,
        email: form.getValues("email"),
        password: form.getValues("password"),
        action: "login",
      });

      if (loginResponse?.error) {
        toast.error("Failed to authenticate after verification.");
        return;
      }

      toast.success("Account verified successfully!");
      setIsOtpDialogOpen(false);
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("Failed to verify OTP.");
      handleFailedAttempt("otp");
      toast.error("Failed to verify OTP.");
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
      const response = await fetch("/api/verification/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.getValues("email") }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to resend OTP");
      }

      toast.success("New OTP sent to your email.");
    } catch (error) {
      console.error("Resend OTP error:", error);
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                      disabled={isBlocked("email")}
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
                        disabled={isBlocked("password")}
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
              disabled={form.formState.isSubmitting || isBlocked("email") || isBlocked("password")}
            >
              {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
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
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium  text-primary hover:text-primary-hover transition-colors duration-200">
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
        description="Enter the 6-digit code sent to your email address to verify your account."
      />
    </div>
  );
};

export default LoginPage;