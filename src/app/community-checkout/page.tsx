"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, Users, Phone, Info, Home, Shield, Clock, Loader2, CheckCircle, CreditCard, AlertCircle } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format, differenceInDays } from "date-fns";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";

// Currency conversion constants
const USD_TO_NPR = 137;
const convertToUSD = (npr: number): number => npr / USD_TO_NPR;
const convertToPaisa = (npr: number): number => Math.round(npr * 100);

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

  const totalPriceUSD = convertToUSD(totalPrice);

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

          const nameParts = (userData.name || "").trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          setFirstName(firstName);
          setLastName(lastName);
          setEmail(userData.email || "");

          if (userData.mobileNumber) {
            const mobileNumber = userData.mobileNumber;
            let countryCode = "+977";
            let phoneOnly = mobileNumber;

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
      } else {
        const cleanNumber = phoneNumber.replace(/[\s-]/g, "");
        const selectedCountry = countryRegion.match(/\+\d+/)?.[0];

        let isValidPhone = false;
        switch (selectedCountry) {
          case "+977":
            isValidPhone = /^9[678]\d{8}$/.test(cleanNumber);
            if (!isValidPhone) {
              newErrors.phoneNumber = "Nepal mobile numbers should start with 98, 97, or 96 (10 digits total)";
            }
            break;
          case "+1":
            isValidPhone = /^\d{10}$/.test(cleanNumber);
            if (!isValidPhone) {
              newErrors.phoneNumber = "US/Canada phone numbers should be 10 digits";
            }
            break;
          case "+44":
            isValidPhone = /^[1-9]\d{6,9}$/.test(cleanNumber);
            if (!isValidPhone) {
              newErrors.phoneNumber = "UK phone numbers should be 7-10 digits";
            }
            break;
          case "+91":
            isValidPhone = /^[6-9]\d{9}$/.test(cleanNumber);
            if (!isValidPhone) {
              newErrors.phoneNumber = "India mobile numbers should start with 6-9 (10 digits total)";
            }
            break;
          default:
            isValidPhone = /^\d{6,15}$/.test(cleanNumber);
            if (!isValidPhone) {
              newErrors.phoneNumber = "Phone number should be 6-15 digits";
            }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateBooking = async () => {
    setIsLoading(true);

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
      switch (selectedPaymentMethod) {
        case "credit-debit":
          paymentMethodEnum = "STRIPE";
          break;
        case "khalti":
          paymentMethodEnum = "KHALTI";
          break;
        case "pay-at-property":
          paymentMethodEnum = "PAY_AT_PROPERTY";
          break;
        default:
          throw new Error(`Invalid payment method: ${selectedPaymentMethod}`);
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

      const url = `/api${endpoint}`;
      console.log("Creating community booking:", body);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const responseData = await response.json();
      console.log("Booking API response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || "Failed to create booking");
      }

      if (!responseData.bookingId) {
        throw new Error("Booking ID not returned from API");
      }

      toast.success("Booking created successfully!");
      return responseData;
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error(error.message || "Failed to create booking");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeCheckout = async (bookingId: string) => {
    if (!bookingId) throw new Error("Missing bookingId");

    setIsLoading(true);
    try {
      const amountInUSDCents = Math.round(totalPriceUSD * 100);
      if (amountInUSDCents < 50) throw new Error("Amount in USD must be at least 50 cents");

      const payload = {
        amount: amountInUSDCents,
        currency: "usd",
        description: `Community Booking for ${homestayName} (Booking ID: ${bookingId})`,
        metadata: {
          homestayName,
          checkIn,
          checkOut,
          guests,
          bookingId,
          totalPriceNPR: totalPrice.toString(),
          payment_timestamp: new Date().toISOString(),
          type: "community",
        },
      };

      console.log("Stripe checkout payload:", payload);

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("Stripe API response:", responseData);

      if (!response.ok) throw new Error(responseData.error || "Failed to initiate Stripe payment");

      const { sessionId } = responseData;
      if (!sessionId) throw new Error("Missing sessionId from Stripe response");

      // Redirect to Stripe
      const stripe = await import("@stripe/stripe-js").then(m => m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""));
      if (!stripe) throw new Error("Stripe failed to initialize");

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw new Error(error.message || "Failed to redirect to Stripe checkout");
    } catch (error: any) {
      console.error("Error initiating Stripe:", error);
      toast.error(error.message || "Failed to initiate Stripe payment");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleKhaltiCheckout = async (bookingId: string) => {
    if (!bookingId) throw new Error("Missing bookingId");

    setIsLoading(true);
    try {
      const amountInPaisa = convertToPaisa(totalPrice);
      if (!Number.isInteger(amountInPaisa) || amountInPaisa < 1000)
        throw new Error("Amount must be ≥ 1000 paisa");

      sessionStorage.setItem(
        `booking_${bookingId}`,
        JSON.stringify({
          homestayName,
          totalPrice,
          checkIn,
          checkOut,
          guests,
          paymentMethod: "KHALTI",
          type: "community",
        })
      );

      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.nepalhomestays.com";
      const queryParams = new URLSearchParams({
        bookingId,
        paymentMethod: "KHALTI",
        type: "community",
      });

      const return_url = `${baseUrl}/payment-callback?${queryParams.toString()}`;

      const payload = {
        return_url,
        website_url: baseUrl,
        amount: amountInPaisa,
        purchase_order_id: bookingId,
        purchase_order_name: `Community Booking for ${homestayName}`,
      };

      console.log("Khalti payload:", payload);

      const response = await fetch("/api/khalti/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("Khalti response:", responseData);

      if (!response.ok) throw new Error(responseData.error || "Failed to initiate Khalti payment");

      const { pidx, payment_url } = responseData;
      if (!pidx || !payment_url) throw new Error("Missing pidx or payment_url");

      console.log("Redirecting to:", payment_url);
      window.location.href = payment_url;
    } catch (error: any) {
      console.error("Khalti checkout error:", error);
      toast.error(error.message || "Failed to initiate Khalti payment");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user && !validateForm()) {
      Object.values(errors).forEach((error) => toast.error(error));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const bookingData = await handleCreateBooking();

      if (selectedPaymentMethod === "pay-at-property") {
        console.log("Redirecting to payment-success for PAY_AT_PROPERTY");
        const queryParams = new URLSearchParams({
          bookingId: bookingData.bookingId,
          homestayName: encodeURIComponent(bookingData.communityName || homestayName),
          totalPrice: bookingData.totalPrice.toString(),
          checkIn: bookingData.checkInDate,
          checkOut: bookingData.checkOutDate,
          guests: `${bookingData.totalGuests}A0C`,
          transactionId: bookingData.transactionId || "N/A",
          status: bookingData.status,
          paymentMethod: bookingData.paymentMethod,
          type: "community",
        });
        router.push(`/payment-success?${queryParams.toString()}`);
      } else if (selectedPaymentMethod === "credit-debit") {
        await handleStripeCheckout(bookingData.bookingId);
      } else if (selectedPaymentMethod === "khalti") {
        await handleKhaltiCheckout(bookingData.bookingId);
      } else {
        throw new Error(`Unsupported payment method: ${selectedPaymentMethod}`);
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      // Error already shown via toast in individual functions
    }
  };

  const paymentMethods = [
    {
      id: "credit-debit",
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Credit/Debit Card",
      subtitle: "Visa, Mastercard via Stripe",
    },
    {
      id: "khalti",
      icon: <Image src="/images/khalti.png" alt="Khalti" width={24} height={24} />,
      title: "Khalti Wallet",
      subtitle: "Fast Digital Payment",
    },
    {
      id: "pay-at-property",
      icon: <Home className="h-6 w-6 text-primary" />,
      title: "Pay at Property",
      subtitle: "Cash on Check-in",
    },
  ];

  return (
    <>
      <Navbar />
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12 font-manrope">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Secure Reservation</h1>
            <p className="text-sm text-gray-600">Complete your community booking at {homestayName}</p>
          </header>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-6 flex items-start gap-3">
            <Shield className="text-primary h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-600">Fully refundable before 24 Hours prior to check-in</p>
              <p className="text-xs text-gray-600 mt-1">Change or cancel your stay for a full refund if plans change.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Who's Checking In */}
                {!session?.user && (
                  <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Who's checking in?</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={`w-full px-4 py-2 border ${
                              errors.firstName ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                            placeholder="John"
                          />
                          {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={`w-full px-4 py-2 border ${
                              errors.lastName ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                            placeholder="Doe"
                          />
                          {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-4 py-2 border ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                          placeholder="john.doe@example.com"
                        />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                        <div className="grid grid-cols-3 gap-2">
                          <select
                            value={countryRegion}
                            onChange={(e) => setCountryRegion(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                              errors.phoneNumber ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                            placeholder="9841234567"
                          />
                        </div>
                        {errors.phoneNumber && <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

                  {/* Security Assurance */}
                  <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="flex items-center font-semibold text-green-700 text-xs">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Secure Transmission
                    </p>
                    <p className="flex items-center font-semibold text-green-700 text-xs">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Personal Information Protected
                    </p>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-colors duration-200 ${
                          selectedPaymentMethod === method.id
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-gray-200 hover:border-primary hover:bg-primary/5"
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary" />
                        )}
                        {method.icon}
                        <span className="text-xs font-semibold text-gray-900 mt-2 text-center">{method.title}</span>
                        <span className="text-[0.65rem] text-gray-500">{method.subtitle}</span>
                      </button>
                    ))}
                  </div>

                  {/* Credit/Debit Card Instructions */}
                  {selectedPaymentMethod === "credit-debit" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Image src="/images/visa.png" alt="Visa" height={32} width={48} className="object-contain" />
                        <Image src="/images/master.png" alt="Mastercard" height={32} width={48} className="object-contain" />
                        <Image src="https://cdn.worldvectorlogo.com/logos/stripe-4.svg" alt="Stripe" height={32} width={48} className="object-contain" />
                        <p className="text-xs font-medium text-gray-500">
                          Processed securely by <span className="font-semibold text-primary">Stripe</span>
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 p-3 bg-accent/10 rounded-md border border-accent">
                        Total amount to be paid: <span className="text-base text-accent">${totalPriceUSD.toFixed(2)}</span> USD
                      </p>
                      <p className="text-xs text-gray-600">
                        You will be redirected to Stripe's secure checkout page to enter your card details and complete the payment.
                      </p>
                    </div>
                  )}

                  {/* Khalti Payment Instructions */}
                  {selectedPaymentMethod === "khalti" && (
                    <div className="space-y-6">
                      <p className="text-sm font-semibold text-gray-900 p-3 bg-accent/10 rounded-md border border-accent">
                        Total amount to be paid: <span className="text-base text-accent">NPR {totalPrice.toFixed(2)}</span>
                      </p>
                      <ol className="list-decimal pl-5 text-xs text-gray-600 space-y-2">
                        <li className="font-semibold">Log in with your Khalti ID and password (not MPIN).</li>
                        <li>Ensure your account has sufficient balance.</li>
                        <li>Enter the OTP sent to your registered mobile number.</li>
                      </ol>
                      <p className="text-xs font-medium text-red-600 bg-red-50 p-3 rounded-md flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        Note: Use your Khalti password, not MPIN, for login.
                      </p>
                    </div>
                  )}

                  {/* Pay at Property Instructions */}
                  {selectedPaymentMethod === "pay-at-property" && (
                    <div className="space-y-6">
                      <p className="text-sm font-semibold text-gray-900 p-3 bg-accent/10 rounded-md border border-accent">
                        Total amount to be paid at check-in: <span className="text-base text-accent">NPR {totalPrice.toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-gray-600">Ensure you have the exact amount ready in cash at check-in.</p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Confirm and Pay</>
                  )}
                </button>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 sticky top-24 space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Booking Summary
                  </h2>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span><strong>Check-in:</strong> {displayCheckInDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span><strong>Check-out:</strong> {displayCheckOutDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        <strong>Guests:</strong> {totalGuests.adults + totalGuests.children} {totalGuests.adults + totalGuests.children === 1 ? "Guest" : "Guests"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-600">{nightStay}</span>
                      <span className="font-medium text-gray-900">NPR {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary">NPR {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
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
