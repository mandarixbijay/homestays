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
import { motion } from "framer-motion";

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
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { handleFailedAttempt, isBlocked, getBlockedMessage } = useErrorBlock();

  const isEmail = (identifier: string) => z.string().email().safeParse(identifier).success;

  useEffect(() => {
    console.log("[Form Errors]", form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    if (form.formState.isSubmitting) {
      const timer = setTimeout(() => form.reset(form.getValues()), 5000);
      return () => clearTimeout(timer);
    }
  }, [form.formState.isSubmitting, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("[onSubmit] Form submitted with values:", values);
    console.log("[onSubmit] isBlocked:", isBlocked("register"), getBlockedMessage("register"));
    if (isBlocked("register")) {
      console.log("[onSubmit] Blocked:", getBlockedMessage("register"));
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
      console.log("[onSubmit] Calling signIn with:", payload);
      const response = await signIn("credentials", {
        redirect: false,
        ...payload,
      });
      console.log("[onSubmit] signIn response:", response);

      if (response?.error) {
        console.error("[onSubmit] signIn error:", response.error);
        toast.error(response.error);
        handleFailedAttempt("register");
        return;
      }

      console.log("[onSubmit] Registration successful, opening OTP dialog");
      toast.success(
        isEmail(values.identifier)
          ? "OTP sent to your email. Please check your inbox."
          : "OTP sent to your mobile number. Please check your messages."
      );
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
    console.log("[handleOtpChange] OTP changed to:", value);
    setOtp(value);
    if (otpError) setOtpError("");
  };

  const handleOtpSubmit = async () => {
    console.log("[handleOtpSubmit] Starting OTP submission:", { otp, isBlocked: isBlocked("otp") });
    setOtpError("");
    if (isBlocked("otp")) {
      console.log("[handleOtpSubmit] OTP blocked:", getBlockedMessage("otp"));
      toast.error(getBlockedMessage("otp") || "Too many attempts. Please try again later.");
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
      console.log("[handleOtpSubmit] OTP verification payload:", payload);
      const response = await fetch("/api/verification/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[handleOtpSubmit] HTTP status:", response.status);
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
        console.log("[handleOtpSubmit] OTP verification response:", result);
      } catch (e) {
        console.error("[handleOtpSubmit] Failed to parse response:", text);
        setOtpError("Invalid response from server. Please try again.");
        toast.error("Invalid response from server.");
        setOtp("");
        handleFailedAttempt("otp");
        return { status: "error", message: "Invalid response from server." };
      }

      if (result.status !== "success") {
        console.log("[handleOtpSubmit] Verification failed:", result.message);
        setOtpError(result.message || "Invalid OTP. Please try again.");
        toast.error(result.message || "Invalid OTP.");
        setOtp("");
        handleFailedAttempt("otp");
        return { status: "error", message: result.message || "Invalid OTP." };
      }

      console.log("[handleOtpSubmit] Verification successful:", result.message);
      toast.success(result.message || "Verification successful. Please sign in.");
      setShowOtpDialog(false);
      router.push("/signin");
      return { status: "success", message: result.message || "Verification successful." };
    } catch (error) {
      console.error("[handleOtpSubmit] OTP verification error:", error);
      setOtpError("Failed to verify OTP. Please try again.");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 pt-20 overflow-auto">
      <Navbar hideUserCircle />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4 sm:p-6 md:p-8 space-y-6 rounded-xl shadow-lg mx-2 bg-white dark:bg-gray-800"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image
              src={theme === "dark" ? "/images/logo/darkmode_logo.png" : "/images/logo/logo.png"}
              alt="Nepal Homestays Nepal Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </motion.div>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create Account
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Join Nepal Homestays and start your journey
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                      disabled={form.formState.isSubmitting || isBlocked("register")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Email or Mobile Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your email or mobile number (e.g., +1234567890)"
                      className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                      disabled={form.formState.isSubmitting || isBlocked("register")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 pr-10"
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
                        disabled={form.formState.isSubmitting || isBlocked("register")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setShowPassword(!showPassword);
                          }
                        }}
                      >
                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <div className="mt-2">
                    <div className="h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-300">
                      {getStrengthText(passwordStrength)}
                    </p>
                  </div>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 pr-10"
                        disabled={form.formState.isSubmitting || isBlocked("register")}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={form.formState.isSubmitting || isBlocked("register")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setShowPassword(!showPassword);
                          }
                        }}
                      >
                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                className="w-full py-2 px-4 font-medium rounded-lg transition-colors duration-200 text-white dark:text-white bg-primary hover:bg-primary/90"
                disabled={form.formState.isSubmitting || isBlocked("register")}
              >
                {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </motion.div>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary hover:text-primary-hover transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      <OtpDialog
        title="Verify your account"
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