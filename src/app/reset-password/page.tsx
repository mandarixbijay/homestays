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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br pt-10 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4 sm:p-6 md:p-8 space-y-6 rounded-xl shadow-lg mx-2 bg-background"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image
              src="/images/logo/logo.png"
              alt="Homestay Nepal Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </motion.div>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-sm text-muted-foreground">Enter your new password below</p>
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent pr-10"
                        disabled={form.formState.isSubmitting || isBlocked("reset-password")}
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
                        aria-label={showPassword ? "Hide password" : "Show password"}
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
                  <FormMessage className="text-red-500 text-xs" />
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
                        placeholder="Retype new password"
                        className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent pr-10"
                        disabled={form.formState.isSubmitting || isBlocked("reset-password")}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            {/* FormField for code is intentionally omitted as per request */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                className="w-full py-2 px-4 font-medium rounded-lg transition-colors duration-200"
                disabled={form.formState.isSubmitting || isBlocked("reset-password")}
              >
                {form.formState.isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>
            </motion.div>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm">
            Remember your password?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary hover:text-primary-hover transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}