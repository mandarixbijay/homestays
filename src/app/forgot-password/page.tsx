"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect } from "react";

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
  email: z.string().email({ message: "Invalid email address" }),
});

export default function ForgetPasswordPreview() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const { theme } = useTheme();
  const [countdown, setCountdown] = useState(0);
  const { handleFailedAttempt, isBlocked,  } =
    useErrorBlock();

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (otpError) setOtpError("");
  };

  const handleOtpSubmit = () => {
    if (isBlocked("otp")) return;

    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits.");
      return;
    }
    setOtpError("");
    console.log("Verifying OTP:", otp);
    if (otp === "123456") {
      toast.success("OTP verified successfully. Redirecting...");
      setShowOtpDialog(false);
    } else {
      toast.error("Invalid OTP. Please try again.");
      handleFailedAttempt("otp");
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setCountdown(60);
    console.log("Resending OTP...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("New OTP sent. Please check your email.");
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Sending reset code for email:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password reset email sent. Please check your inbox.");
      setShowOtpDialog(true);
    } catch (error) {
      console.error("Error sending password reset email", error);
      toast.error("Failed to send password reset email. Please try again.");
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResending && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResending, countdown]);

  useEffect(() => {
    if (countdown === 0) {
      setIsResending(false);
    }
  }, [countdown]);

  return (
    <div className="flex min-h-[40vh] h-full w-full items-center justify-center px-4 mt-60">
      <Card className=" border-none  max-w-md p-4 sm:p-8 space-y-8 rounded-xl shadow-lg mx-2">
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
          <CardTitle className="text-2xl  justify-center text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="justify-center text-center">
            Enter your email address to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
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
      />
    </div>
  );
}
