"use client";
import { Button } from "@/components/ui/button";
import {} from "@/components/ui/card";
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
  signinPasswordSchema,
} from "@/hooks/password-hook/password-utils";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const formSchema = z
  .object({
    newPassword: signinPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;

    setPasswordStrength(getPasswordStrength(password));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Password Reset Data:", data);
    toast.success("Password reset successfully!");
    router.push("/signin");
  };

  const getStrengthLabel = (strength: number) => {
    if (strength < 2) return "Weak";
    if (strength < 4) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br overflow-auto mt-20">
      <div className="w-full max-w-md p-4 sm:p-8 space-y-8 rounded-xl shadow-lg mx-2">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo/logo.png"
            alt="Homestay Nepal Logo"
            width={80}
            height={80}
          />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="">Enter your new password below</p>
        </div>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent pr-10"
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
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  {form.getValues("newPassword") && (
                    <p
                      className={`text-sm mt-1 ${
                        passwordStrength < 2
                          ? "text-red-500"
                          : passwordStrength < 4
                          ? "text-yellow-500"
                          : "text-green-600"
                      }`}
                    >
                      Strength: {getStrengthLabel(passwordStrength)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Retype new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        </Form>

        <div className="space-y-4">
          <Link
            href="/signin"
            className="block text-sm text-center transition-colors duration-200"
          >
            Go back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
