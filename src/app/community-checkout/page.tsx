"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, Users, Phone, Info, Home, Shield, Clock, Loader2, CheckCircle } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format, differenceInDays } from "date-fns";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function CommunityCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryRegion, setCountryRegion] = useState("Nepal +977");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    searchParams.get("paymentMethod")?.toLowerCase() || "pay-at-property"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string>("");

  type Errors = {
    firstName?: string;
    lastName?: string;
    email?: string;
    countryRegion?: string;
    phoneNumber?: string;
  };

  const [errors, setErrors] = useState<Errors>({});

  // Get params from URL
  const homestayName = searchParams.get("homestayName") || "Community Homestay";
  const homestayId = parseInt(searchParams.get("homestayId") || "0");
  const totalPrice = parseFloat(searchParams.get("totalPrice") || "0");
  const checkIn = searchParams.get("checkIn") || format(new Date(), "yyyy-MM-dd");
  const checkOut = searchParams.get("checkOut") || format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd");
  const guests = searchParams.get("guests") || "0A0C";

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const numNights = differenceInDays(checkOutDate, checkInDate) || 1;

  const displayCheckInDate = format(checkInDate, "EEE, MMM d");
  const displayCheckOutDate = format(checkOutDate, "EEE, MMM d");
  const nightStay = `${numNights}-night stay`;

  const totalGuests = guests
    ?.split(",")
    .reduce(
      (acc, guest) => {
        const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
        return { adults: acc.adults + adults, children: acc.children + children };
      },
      { adults: 0, children: 0 }
    ) || { adults: 0, children: 0 };

  // Fetch user details if authenticated
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (session?.user?.accessToken) {
        try {
          const response = await fetch("/api/users/me", {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status}`);
          }

          const responseData = await response.json();
          const userData = responseData.data;

          if (!userData) {
            throw new Error("No user data returned from API");
          }

          // Parse name into first and last name
          const nameParts = (userData.name || "").trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          setFirstName(firstName);
          setLastName(lastName);
          setEmail(userData.email || "");

          // Handle phone number
          if (userData.mobileNumber) {
            const mobileNumber = userData.mobileNumber;
            let countryCode = "+977";
            let phoneOnly = mobileNumber;

            // Parse country code
            if (mobileNumber.startsWith("+977")) {
              countryCode = "+977";
              phoneOnly = mobileNumber.substring(4);
            } else if (mobileNumber.startsWith("+1")) {
              countryCode = "+1";
              phoneOnly = mobileNumber.substring(2);
            } else if (mobileNumber.startsWith("+44")) {
              countryCode = "+44";
              phoneOnly = mobileNumber.substring(3);
            } else if (mobileNumber.startsWith("+91")) {
              countryCode = "+91";
              phoneOnly = mobileNumber.substring(3);
            }

            setPhoneNumber(phoneOnly);

            const countryNames: Record<string, string> = {
              "+977": "Nepal +977",
              "+1": "United States +1",
              "+44": "United Kingdom +44",
              "+91": "India +91",
            };

            setCountryRegion(countryNames[countryCode] || "Nepal +977");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          toast.error("Failed to load user details. Please enter them manually.");
        }
      }
    };

    if (status === "authenticated") {
      fetchUserDetails();
    }
  }, [session, status]);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!session?.user) {
      if (!firstName.trim()) newErrors.firstName = "First name is required";
      if (!lastName.trim()) newErrors.lastName = "Last name is required";
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Invalid email format";
      }
      if (!phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!/^\d{7,15}$/.test(phoneNumber.replace(/[\s-]/g, ""))) {
        newErrors.phoneNumber = "Invalid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentRedirect = async (paymentMethod: string) => {
    // Validate form first for guest users
    if (!session?.user && !validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsLoading(true);
    setPaymentError("");

    try {
      const endpoint = session?.user ? "/communities/bookings" : "/communities/bookings/guest";
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        accept: "application/json",
      };

      if (session?.user?.accessToken) {
        headers["Authorization"] = `Bearer ${session.user.accessToken}`;
      }

      let paymentMethodEnum: string;
      switch (paymentMethod) {
        case "credit-debit":
        case "khalti":
          paymentMethodEnum = "KHALTI";
          break;
        case "pay-at-property":
          paymentMethodEnum = "PAY_AT_PROPERTY";
          break;
        default:
          throw new Error(`Invalid payment method: ${paymentMethod}`);
      }

      const body: any = {
        communityId: homestayId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalGuests: totalGuests.adults + totalGuests.children,
        paymentMethod: paymentMethodEnum,
      };

      if (!session?.user) {
        const countryCode = countryRegion.match(/\+\d+/)?.[0] || "+977";
        const cleanPhoneNumber = phoneNumber.replace(/[\s-]/g, "");

        body.guestName = `${firstName} ${lastName}`.trim();
        body.guestEmail = email;
        body.guestPhone = `${countryCode}${cleanPhoneNumber}`;
      }

      // For Khalti payment, redirect to payment gateway
      if (paymentMethod === "khalti" || paymentMethod === "credit-debit") {
        // Store booking details in session storage
        sessionStorage.setItem("communityBookingDetails", JSON.stringify(body));
        sessionStorage.setItem("communityBookingEndpoint", endpoint);
        sessionStorage.setItem("communityBookingHeaders", JSON.stringify(headers));

        // Initialize Khalti payment
        const khaltiUrl = `https://khalti.com/payment/checkout/?amount=${totalPrice * 100}&product_identity=${homestayId}&product_name=${encodeURIComponent(homestayName)}`;
        window.location.href = khaltiUrl;
        return;
      }

      // For Pay at Property, create booking directly
      const url = `/api${endpoint}`;
      console.log("Creating community booking:", body);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      const bookingData = await response.json();
      console.log("Booking created successfully:", bookingData);

      toast.success("Booking confirmed successfully!");
      router.push(`/bookings/${bookingData.bookingId}`);
    } catch (error: any) {
      console.error("Booking error:", error);
      setPaymentError(error.message || "Failed to complete booking");
      toast.error(error.message || "Failed to complete booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Toaster />
      <div className="min-h-screen bg-gradient-to-b from-background to-gray-50/50 pt-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-card-foreground mb-2">Complete Your Booking</h1>
            <p className="text-muted-foreground">You're almost there! Just a few more details.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Who's Checking In */}
              {!session?.user && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-xl font-bold text-card-foreground mb-4">Who's checking in?</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={`w-full px-4 py-2 border ${
                            errors.firstName ? "border-red-500" : "border-border"
                          } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                          placeholder="John"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className={`w-full px-4 py-2 border ${
                            errors.lastName ? "border-red-500" : "border-border"
                          } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                          placeholder="Doe"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-2 border ${
                          errors.email ? "border-red-500" : "border-border"
                        } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                        placeholder="john.doe@example.com"
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">
                        Phone Number *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={countryRegion}
                          onChange={(e) => setCountryRegion(e.target.value)}
                          className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="Nepal +977">Nepal +977</option>
                          <option value="United States +1">USA +1</option>
                          <option value="United Kingdom +44">UK +44</option>
                          <option value="India +91">India +91</option>
                        </select>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className={`col-span-2 px-4 py-2 border ${
                            errors.phoneNumber ? "border-red-500" : "border-border"
                          } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                          placeholder="9841234567"
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Error */}
              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700">{paymentError}</p>
                </div>
              )}

              {/* Payment Methods */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-bold text-card-foreground mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => handlePaymentRedirect("credit-debit")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-4 border-2 border-primary/20 rounded-lg hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-card-foreground">Pay with Khalti</p>
                        <p className="text-sm text-muted-foreground">Digital wallet payment</p>
                      </div>
                    </div>
                    {isLoading && selectedPaymentMethod === "credit-debit" && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                  </button>

                  <button
                    onClick={() => handlePaymentRedirect("pay-at-property")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Home className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-card-foreground">Pay at Property</p>
                        <p className="text-sm text-muted-foreground">Pay when you arrive</p>
                      </div>
                    </div>
                    {isLoading && selectedPaymentMethod === "pay-at-property" && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground mb-4">{homestayName}</h2>

                  {/* Booking Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">{displayCheckInDate}</p>
                        <p className="text-xs text-muted-foreground">Check-in</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">{displayCheckOutDate}</p>
                        <p className="text-xs text-muted-foreground">Check-out</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">
                          {totalGuests.adults + totalGuests.children} guests
                        </p>
                        <p className="text-xs text-muted-foreground">{nightStay}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{nightStay}</span>
                      <span className="text-sm font-medium text-card-foreground">
                        NPR {totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-px bg-border my-3"></div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-card-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        NPR {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900 text-sm">Free Cancellation</p>
                      <p className="text-xs text-green-700 mt-1">
                        Cancel up to 24 hours before check-in for a full refund
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function CommunityCheckout() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CommunityCheckoutContent />
    </Suspense>
  );
}
