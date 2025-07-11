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
import { Eye, EyeOff } from "lucide-react";
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
    email: z.string().email("Invalid email"),
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
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  });

  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { handleFailedAttempt, isBlocked, getBlockedMessage } = useErrorBlock();

  // Log form errors for debugging
  useEffect(() => {
    console.log("[Form Errors]", form.formState.errors);
  }, [form.formState.errors]);

  // Reset isSubmitting to prevent stuck state
  useEffect(() => {
    if (form.formState.isSubmitting) {
      const timer = setTimeout(() => form.reset(form.getValues()), 5000);
      return () => clearTimeout(timer);
    }
  }, [form.formState.isSubmitting]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("[onSubmit] Form submitted with values:", values);
    console.log("[onSubmit] isBlocked:", isBlocked("register"), getBlockedMessage("register"));
    if (isBlocked("register")) {
      console.log("[onSubmit] Blocked:", getBlockedMessage("register"));
      toast.error(getBlockedMessage("register") || "Too many attempts. Please try again later.");
      return;
    }

    try {
      console.log("[onSubmit] Calling signIn with:", {
        action: "register",
        name: values.fullName,
        email: values.email,
        password: values.password,
      });
      const response = await signIn("credentials", {
        redirect: false,
        action: "register",
        name: values.fullName,
        email: values.email,
        password: values.password,
      });
      console.log("[onSubmit] signIn response:", response);

      if (response?.error) {
        console.error("[onSubmit] signIn error:", response.error);
        toast.error(response.error);
        handleFailedAttempt("register");
        return;
      }

      console.log("[onSubmit] Registration successful, opening OTP dialog");
      toast.success("OTP sent to your email. Please check your inbox.");
      setShowOtpDialog(true);
    } catch (error) {
      console.error("[onSubmit] signIn failed:", error);
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
    console.log("[handleOtpSubmit] Submitting OTP:", otp);
    if (isBlocked("otp")) {
      console.log("[handleOtpSubmit] OTP blocked:", getBlockedMessage("otp"));
      toast.error(getBlockedMessage("otp") || "Too many attempts. Please try again later.");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits.");
      toast.error("OTP must be 6 digits.");
      return;
    }

    try {
      const response = await fetch("/api/verification/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.getValues("email"), code: otp }),
      });

      const result = await response.json();
      console.log("[handleOtpSubmit] OTP verification response:", result);

      if (!response.ok) {
        setOtpError(result.message || "Invalid OTP. Please try again.");
        handleFailedAttempt("otp");
        toast.error(result.message || "Invalid OTP.");
        return;
      }

      toast.success("Email verified successfully. Please sign in.");
      setShowOtpDialog(false);
      router.push("/signin");
    } catch (error) {
      console.error("[handleOtpSubmit] OTP verification error:", error);
      setOtpError("Failed to verify OTP. Please try again.");
      handleFailedAttempt("otp");
      toast.error("Failed to verify OTP.");
    }
  };

  const handleResendOtp = async () => {
    console.log("[handleResendOtp] Resending OTP for email:", form.getValues("email"));
    if (isBlocked("otp") || isResending || countdown > 0) {
      console.log("[handleResendOtp] Blocked or resending:", getBlockedMessage("otp"));
      toast.error(getBlockedMessage("otp") || "Please wait before resending OTP.");
      return;
    }

    setIsResending(true);
    setCountdown(60);

    try {
      const response = await fetch("/api/verification/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.getValues("email") }),
      });

      const result = await response.json();
      console.log("[handleResendOtp] Resend OTP response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to resend OTP");
      }

      toast.success("New OTP sent to your email.");
    } catch (error) {
      console.error("[handleResendOtp] Resend OTP error:", error);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br pt-10 overflow-auto mt-20">
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
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p>Join Homestay and start your journey</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                      disabled={form.formState.isSubmitting || isBlocked("register")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

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
                      disabled={form.formState.isSubmitting || isBlocked("register")}
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
                        placeholder="******"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent pr-10"
                        disabled={form.formState.isSubmitting || isBlocked("register")}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handlePasswordChange(e);
                        }}
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
                  <div className="mt-2">
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-gray-500">{getStrengthText(passwordStrength)}</p>
                  </div>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent pr-10"
                        disabled={form.formState.isSubmitting || isBlocked("register")}
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
              disabled={form.formState.isSubmitting || isBlocked("register")}
            >
              {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-primary hover:text-primary-hover transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <OtpDialog
        title="Verify your email"
        isBlocked={isBlocked("otp")}
        description="Enter the 6-digit verification code sent to your email."
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