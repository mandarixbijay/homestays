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
import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Phone, Lock, User } from "lucide-react";
import {
  passwordSchema,
  getPasswordStrength,
  getStrengthColor,
  getStrengthText,
} from "@/hooks/password-hook/password-utils";
import { OtpDialog } from "@/components/dialog/otp-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useErrorBlock } from "@/hooks/block-hook/useErrorBlock";
import { signIn } from "next-auth/react";
import Navbar from "@/components/navbar/navbar";

const formSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
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
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignupPage = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      fullName: "",
      identifier: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  });

  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { handleFailedAttempt, isBlocked, getBlockedMessage } = useErrorBlock();

  const isEmail = (identifier: string) => z.string().email().safeParse(identifier).success;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isBlocked("register")) {
      toast.error(getBlockedMessage("register") || "Too many attempts. Please try again later.");
      return;
    }

    try {
      const payload = {
        action: "register",
        name: values.fullName,
        [isEmail(values.identifier) ? "email" : "mobileNumber"]: values.identifier,
        password: values.password,
      };
      const response = await signIn("credentials", {
        redirect: false,
        ...payload,
      });

      if (response?.error) {
        toast.error(response.error);
        handleFailedAttempt("register");
        return;
      }

      toast.success(
        isEmail(values.identifier)
          ? "OTP sent to your email. Please verify your account."
          : "OTP sent to your mobile number. Please verify your account."
      );
      setShowOtpDialog(true);
      setCountdown(60);
    } catch (error) {
      toast.error("Failed to register. Please try again.");
      handleFailedAttempt("register");
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPasswordStrength(getPasswordStrength(password));
    form.setValue("password", password);
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (otpError) setOtpError("");
  };

  const handleOtpSubmit = async () => {
    setOtpError("");
    if (isBlocked("otp")) {
      toast.error(getBlockedMessage("otp") || "Too many attempts. Please try again later.");
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

      toast.success(result.message || "Verification successful! Please sign in.");
      setShowOtpDialog(false);
      router.push("/signin");
      return { status: "success", message: result.message || "Verification successful." };
    } catch (error) {
      setOtpError("Failed to verify OTP. Please try again.");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 pt-20 pb-8 px-4">
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
              Create Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join Nepal Homestays and start your journey
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Enter your full name"
                          className="pl-10 h-11 bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary/30"
                          disabled={form.formState.isSubmitting || isBlocked("register")}
                          {...field}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

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
                          disabled={form.formState.isSubmitting || isBlocked("register")}
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
                          placeholder="Create a strong password"
                          className="pl-10 pr-10 h-11 bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary/30"
                          disabled={form.formState.isSubmitting || isBlocked("register")}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handlePasswordChange(e);
                          }}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={form.formState.isSubmitting || isBlocked("register")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    {/* Password Strength Indicator */}
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getStrengthText(passwordStrength)}
                      </p>
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
                    <FormLabel className="text-sm font-medium text-foreground">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10 h-11 bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary/30"
                          disabled={form.formState.isSubmitting || isBlocked("register")}
                          {...field}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={form.formState.isSubmitting || isBlocked("register")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
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
                className="w-full h-11 font-medium"
                disabled={form.formState.isSubmitting || isBlocked("register")}
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>

          {/* Footer Links */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <OtpDialog
        title="Verify Your Account"
        isBlocked={isBlocked("otp")}
        description={
          isEmail(form.getValues("identifier"))
            ? "Enter the 6-digit verification code sent to your email."
            : "Enter the 6-digit verification code sent to your mobile number."
        }
        open={showOtpDialog}
        onOpenChange={setShowOtpDialog}
        otp={otp}
        onOtpChange={handleOtpChange}
        otpError={otpError}
        onSubmitOtp={handleOtpSubmit}
        isResending={isResending}
        onResend={handleResendOtp}
      />
    </div>
  );
};

export default SignupPage;
