"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Star,
  Upload,
  X,
  Check,
  Loader2,
  AlertCircle,
  Gift,
  Home,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  trackQRScan,
  verifyUserForReview,
  verifyOTPForReview,
  completeRegistration,
  uploadReviewImages,
  submitReview,
} from "@/lib/api/campaign";
import type { TrackQRScanResponse } from "@/types/campaign";
import { toast } from "sonner";
import Image from "next/image";
import { HomestayRegistrationForm } from "@/components/campaign/HomestayRegistrationForm";

type Step = "scan" | "verify" | "otp" | "register" | "review" | "success";
type UserFlow = "registration" | "review" | "loading";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const qrCode = params.qrCode as string;

  const [userFlow, setUserFlow] = useState<UserFlow>("loading");
  const [currentStep, setCurrentStep] = useState<Step>("scan");
  const [loading, setLoading] = useState(true);
  const [scanData, setScanData] = useState<TrackQRScanResponse | null>(null);

  // Verification state
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState<"email" | "phone">("email");
  const [otp, setOtp] = useState("");
  const [userExists, setUserExists] = useState(false);

  // Registration state
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // Review state
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Success state
  const [discountCode, setDiscountCode] = useState<any>(null);

  useEffect(() => {
    if (status !== "loading") {
      handleQRScan();
    }
  }, [qrCode, status]);

  const handleQRScan = async () => {
    try {
      setLoading(true);
      const data = await trackQRScan({ qrCode });
      setScanData(data);

      // Determine user flow based on authentication and role
      const userRole = (session?.user as any)?.role;

      // Check if homestay is already registered to this QR code
      const isHomestayRegistered = data.homestay && data.homestay.id;

      if (session && (userRole === "ADMIN" || userRole === "FIELD_STAFF") && !isHomestayRegistered) {
        // Admin/Field Staff + QR not linked to homestay → Registration Flow
        setUserFlow("registration");
      } else {
        // Guest or QR already linked → Review Flow
        setUserFlow("review");
        setCurrentStep(session ? "review" : "verify");
      }
    } catch (error: any) {
      toast.error("Invalid QR Code", {
        description: error.response?.data?.message || "This QR code is not valid or has expired",
      });
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    try {
      setLoading(true);
      const result = await verifyUserForReview({
        qrCode,
        contact,
        contactType,
      });

      setUserExists(result.userExists);

      if (result.userExists) {
        toast.success("OTP sent", {
          description: `Please check your ${contactType} for the verification code`,
        });
        setCurrentStep("otp");
      } else {
        toast.info("New User", {
          description: "Please complete registration to continue",
        });
        // Send OTP for new user registration
        await verifyUserForReview({ qrCode, contact, contactType });
        setCurrentStep("register");
      }
    } catch (error: any) {
      toast.error("Verification failed", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      await verifyOTPForReview({
        qrCode,
        contact,
        code: otp,
      });

      toast.success("Verified successfully. Please log in to continue.");

      // Redirect to login - user needs to login with their password
      // Store the QR code in session storage so we can redirect back after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('reviewQRCode', qrCode);
        router.push(`/login?callbackUrl=/review/${qrCode}`);
      }
    } catch (error: any) {
      toast.error("Invalid OTP", {
        description: error.response?.data?.message || "Please check your code and try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    try {
      setLoading(true);
      await completeRegistration({
        qrCode,
        contact,
        contactType,
        code: otp,
        name,
        password,
      });

      toast.success("Registration successful. Logging you in...");

      // Automatically log the user in with their new credentials
      const result = await signIn("credentials", {
        email: contactType === 'email' ? contact : '',
        mobileNumber: contactType === 'phone' ? contact : '',
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Login failed", {
          description: "Please try logging in manually",
        });
        router.push(`/login?callbackUrl=/review/${qrCode}`);
      } else {
        toast.success("Logged in successfully!");
        setCurrentStep("review");
      }
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + selectedFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate file size and type
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name} is not a valid image format`);
        return false;
      }
      return true;
    });

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    try {
      setSubmitting(true);

      // Upload images if any
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const uploadResult = await uploadReviewImages(selectedFiles);
        imageUrls = uploadResult.imageUrls;
        setUploadedImageUrls(imageUrls);
      }

      // Submit review
      const result = await submitReview({
        qrCode,
        rating,
        description,
        checkInDate,
        checkOutDate,
        images: imageUrls,
      });

      if (result.discountIssued && result.discountCode) {
        setDiscountCode(result.discountCode);
      }

      setCurrentStep("success");
      toast.success("Review submitted successfully!");
    } catch (error: any) {
      toast.error("Failed to submit review", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && currentStep === "scan") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!scanData) {
    return null;
  }

  // Show homestay registration form for admin/field staff
  if (userFlow === "registration") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <HomestayRegistrationForm
          qrCode={qrCode}
          scanData={scanData}
          assignedBy={(session?.user as any)?.name || "Field Staff"}
        />
      </div>
    );
  }

  // Show review submission flow for guests or already-registered homestays
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Homestay Info Card - only show if homestay is registered */}
        {scanData.homestay && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {scanData.homestay.images && scanData.homestay.images.length > 0 && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={scanData.homestay.images[0].url}
                      alt={scanData.homestay.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{scanData.homestay.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    {scanData.homestay.address}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(scanData.homestay.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({scanData.homestay.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show error if QR code not assigned to homestay for non-admin users */}
        {!scanData.homestay && (
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>QR Code Not Assigned</strong>
                  <p className="mt-2">
                    This QR code hasn&apos;t been assigned to a homestay yet. Only admin or field staff can register homestays.
                  </p>
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Button onClick={() => router.push("/")} className="w-full">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Only show review flow if homestay is registered */}
        {scanData.homestay && (
          <>
            {/* Campaign Info */}
            {scanData.campaign.discountPercentage && (
              <Alert>
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  <strong>Special Offer!</strong> Submit your review and get{" "}
                  <strong>{scanData.campaign.discountPercentage}%</strong> off your next booking!
                </AlertDescription>
              </Alert>
            )}

            {/* Verify Contact */}
            {currentStep === "verify" && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Your Contact</CardTitle>
              <CardDescription>
                We&apos;ll send you an OTP to verify your identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contact Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={contactType === "email" ? "default" : "outline"}
                    onClick={() => setContactType("email")}
                    className="flex-1"
                  >
                    Email
                  </Button>
                  <Button
                    variant={contactType === "phone" ? "default" : "outline"}
                    onClick={() => setContactType("phone")}
                    className="flex-1"
                  >
                    Phone
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">
                  {contactType === "email" ? "Email Address" : "Phone Number"}
                </Label>
                <Input
                  id="contact"
                  type={contactType === "email" ? "email" : "tel"}
                  placeholder={
                    contactType === "email" ? "your@email.com" : "+977 98XXXXXXXX"
                  }
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>

              <Button onClick={handleVerifyUser} disabled={loading || !contact} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Verify OTP */}
        {currentStep === "otp" && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Verification Code</CardTitle>
              <CardDescription>
                We sent a 6-digit code to your {contactType}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              <Button variant="ghost" onClick={() => handleVerifyUser()} className="w-full">
                Resend Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Registration */}
        {currentStep === "register" && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Registration</CardTitle>
              <CardDescription>
                Create your account to submit the review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                onClick={handleCompleteRegistration}
                disabled={loading || !name || !password || otp.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account & Continue"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Review Form */}
        {currentStep === "review" && (
          <Card>
            <CardHeader>
              <CardTitle>Share Your Experience</CardTitle>
              <CardDescription>
                Help others by sharing your honest review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating */}
              <div className="space-y-2">
                <Label>Rating *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          value <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-in Date *</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-out Date *</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Your Review</Label>
                <Textarea
                  id="description"
                  placeholder="Share details about your stay..."
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label>Photos (Optional, max 5)</Label>
                <div className="space-y-4">
                  {selectedFiles.length < 5 && (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload photos
                        </span>
                      </label>
                    </div>
                  )}

                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={submitting || rating === 0 || !checkInDate || !checkOutDate}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Review...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {currentStep === "success" && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                  <p className="text-muted-foreground">
                    Your review has been submitted successfully
                  </p>
                </div>

                {discountCode && (
                  <Alert>
                    <Gift className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-semibold">Your Discount Code:</p>
                        <p className="text-2xl font-bold tracking-wider">
                          {discountCode.discountCode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {discountCode.discountPercent}% off • Valid until{" "}
                          {new Date(discountCode.expiresAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          Check your {contactType} for the discount code!
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={() => router.push("/")} className="w-full">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
          </>
        )}
      </div>
    </div>
  );
}
