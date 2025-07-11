"use client";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OtpDialog } from "@/components/dialog/otp-dialog";

export default function AddMobileDialog() {
  const [open, setOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    setOtpOpen(true);
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (otpError) setOtpError("");
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits.");
      return;
    }
    setOtpError("");
    setOtpOpen(false);
    // Here you would verify the OTP and update the user's mobile number
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setCountdown(60);
    // Simulate resend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsResending(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mb-2">Add</Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-sm sm:max-w-sm max-h-[90vh] overflow-y-auto p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add your mobile number</DialogTitle>
            <div className="text-sm text-muted-foreground mt-1">Enter your mobile number to securely sign in and get critical updates.</div>
          </DialogHeader>
          <form className="space-y-4 mt-4" onSubmit={handleMobileSubmit}>
            <Input
              id="mobile"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              required
            />
            <Button type="submit" className="w-full mt-2">Send OTP</Button>
          </form>
        </DialogContent>
      </Dialog>
      <OtpDialog
        open={otpOpen}
        onOpenChange={setOtpOpen}
        otp={otp}
        onOtpChange={handleOtpChange}
        otpError={otpError}
        onSubmitOtp={handleOtpSubmit}
        isResending={isResending}
        onResend={handleResendOtp}
        title="Verify your mobile number"
        description={`Enter the 6-digit code sent to ${mobile}`}
        isBlocked={false}
      />
    </>
  );
} 