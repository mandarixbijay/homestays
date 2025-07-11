// src/app/checkout/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Calendar, LoaderPinwheel } from "lucide-react";
import SignInCard from "@/components/homestay/components/sign-in-card";
import React, { Suspense } from "react";
import BookingForm from "@/components/homestay/components/checkout/BookingForm";
import PaymentMethods from "@/components/homestay/components/checkout/PaymentMethods";
import PoliciesAndSummary from "@/components/homestay/components/checkout/PoliciesAndSummary";
import RoomDetailsCard from "@/components/homestay/components/checkout/RoomDetailsCard";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format, differenceInDays, subDays } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
const USD_TO_NPR = 137.10;
const convertToNPR = (usd: number): number => usd * USD_TO_NPR;
const convertToPaisa = (npr: number): number => Math.round(npr * 100); // Ensure integer

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <LoaderPinwheel className="animate-spin h-12 w-12 text-primary" />
        </div>
      }
    >
      <HomestayCheckoutContent />
    </Suspense>
  );
}

function HomestayCheckoutContent() {
  const searchParams = useSearchParams();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [countryRegion, setCountryRegion] = React.useState("USA +1");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [cardName, setCardName] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [expMonth, setExpMonth] = React.useState("");
  const [expYear, setExpYear] = React.useState("");
  const [securityCode, setSecurityCode] = React.useState("");
  const [billingZip, setBillingZip] = React.useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState(
    searchParams.get("paymentMethod") || "credit-debit"
  );
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  type Errors = {
    firstName?: string;
    lastName?: string;
    email?: string;
    countryRegion?: string;
    phoneNumber?: string;
    cardName?: string;
    cardNumber?: string;
    expMonth?: string;
    expYear?: string;
    securityCode?: string;
    billingZip?: string;
  };

  const [errors, setErrors] = React.useState<Errors>({});

  const roomTitle = searchParams.get("roomTitle") || "Deluxe Double Room";
  const nightlyPrice = parseFloat(searchParams.get("nightlyPrice") || "0");
  const totalPrice = parseFloat(searchParams.get("totalPrice") || "0");
  const bedType = searchParams.get("bedType") || "1 Twin Bed and 1 Double Bed";
  const imageUrl = searchParams.get("imageUrl") || "";
  const homestayName = searchParams.get("homestayName") || "Homestay";
  const checkIn = searchParams.get("checkIn") || new Date().toISOString().split("T")[0];
  const checkOut = searchParams.get("checkOut") || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0];
  const guests = searchParams.get("guests") || "";
  const rooms = searchParams.get("rooms") || "";
  const extra = searchParams.get("extra") || "";

  // Calculate check-in/out dates and night stay
  let checkInDate = "Today";
  let checkOutDate = "Tomorrow";
  let nightStay = "1-night stay";
  try {
    checkInDate = format(new Date(checkIn), "EEE, MMM d");
    checkOutDate = format(new Date(checkOut), "EEE, MMM d");
    const numNights = differenceInDays(new Date(checkOut), new Date(checkIn));
    if (numNights > 0) {
      nightStay = `${numNights}-night stay`;
    }
  } catch (error) {
    console.error("Error formatting dates:", error);
  }

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize");

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice * 100,
          currency: "usd",
          description: `Booking for ${roomTitle} at ${homestayName}`,
          metadata: {
            roomTitle,
            homestayName,
            checkIn,
            checkOut,
            guests,
            rooms,
            extra,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to create Stripe checkout session");

      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        setErrorMessage(error.message || "Failed to redirect to Stripe checkout");
      }
    } catch (error) {
      console.error("Error initiating Stripe checkout:", error);
      setErrorMessage("An error occurred while initiating Stripe payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKhaltiCheckout = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const purchaseOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const totalPriceNPR = convertToNPR(totalPrice);
      const amountInPaisa = convertToPaisa(totalPriceNPR);

      // Validate amount
      if (!Number.isInteger(amountInPaisa) || amountInPaisa < 1000) {
        throw new Error("Amount must be an integer and at least 1000 paisa (10 NPR)");
      }

      const payload = {
        amount: amountInPaisa,
        purchase_order_id: purchaseOrderId,
        purchase_order_name: roomTitle,
        customer_info: {
          name: `${firstName} ${lastName}`.trim() || "Test Guest",
          email: email || "test@example.com",
          phone: phoneNumber || "9800000001", // Khalti sandbox test phone
        },
        amount_breakdown: [
          { label: "Room Price", amount: convertToPaisa(totalPriceNPR * 0.8) },
          { label: "Taxes & Fees", amount: convertToPaisa(totalPriceNPR * 0.2) },
        ],
        product_details: [
          {
            identity: purchaseOrderId,
            name: roomTitle,
            total_price: amountInPaisa,
            quantity: 1,
            unit_price: amountInPaisa,
          },
        ],
      };

      // Log payload for debugging
      console.log("Sending Khalti payload:", payload);

      const response = await fetch("/api/khalti/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate Khalti payment");
      }

      const { payment_url } = await response.json();
      if (payment_url) {
        window.location.href = payment_url;
      } else {
        throw new Error("No payment URL received from Khalti");
      }
    } catch (error: any) {
      console.error("Error initiating Khalti payment:", error);
      setErrorMessage(
        error.message === "Invalid payment details"
          ? "Invalid payment details. Please check and try again."
          : error.message || "Failed to initiate Khalti payment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleESewaCheckout = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      console.log("Redirecting to eSewa with amount:", convertToNPR(totalPrice).toFixed(2), "NPR");
      // Implement actual eSewa redirect here
    } catch (error) {
      console.error("Error initiating eSewa payment:", error);
      setErrorMessage("Failed to initiate eSewa payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const newErrors: Errors = {};
    if (!firstName) newErrors.firstName = "First name is required.";
    if (!lastName) newErrors.lastName = "Last name is required.";
    if (!email) newErrors.email = "Email address is required.";
    if (!countryRegion) newErrors.countryRegion = "Country/region is required.";
    if (!phoneNumber) newErrors.phoneNumber = "Phone number is required.";

    if (selectedPaymentMethod === "credit-debit") {
      if (!cardName) newErrors.cardName = "Name on Card is required.";
      if (!cardNumber) newErrors.cardNumber = "Debit/Credit card number is required.";
      if (!expMonth) newErrors.expMonth = "Expiration month is required.";
      if (!expYear) newErrors.expYear = "Expiration year is required.";
      if (!securityCode) newErrors.securityCode = "Security code is required.";
      if (!billingZip) newErrors.billingZip = "Billing ZIP code is required.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (selectedPaymentMethod === "credit-debit") {
      await handleStripeCheckout();
    } else if (selectedPaymentMethod === "khalti") {
      await handleKhaltiCheckout();
    } else if (selectedPaymentMethod === "esewa") {
      await handleESewaCheckout();
    } else if (selectedPaymentMethod === "pay-at-property") {
      window.location.href = `/payment-success?roomTitle=${encodeURIComponent(roomTitle)}&homestayName=${encodeURIComponent(homestayName)}&totalPrice=${totalPrice}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12 overflow-x-hidden">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Secure Reservation</h1>
          <p className="mt-2 text-base text-gray-600">Complete your booking in a few simple steps</p>
        </header>

        {errorMessage && (
          <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
        )}

        {/* Refundable Banner */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex items-start gap-4">
          <Calendar className="text-primary h-6 w-6 flex-shrink-0 mt-1" />
          <div>
            <p className="text-base font-semibold text-gray-900">
              Fully refundable until {format(subDays(new Date(checkIn), 3), "EEE, MMM d")}, 6:00 PM (property local time)
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Change or cancel your stay for a full refund if plans change.
            </p>
          </div>
        </div>

        {/* SignInCard */}
        <div className="p-6 mb-8 flex items-start">
          <SignInCard />
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 mb-8">
          <div className="flex-1 space-y-8 max-w-full">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
              <BookingForm
                bedType={bedType}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                email={email}
                setEmail={setEmail}
                countryRegion={countryRegion}
                setCountryRegion={setCountryRegion}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                errors={errors}
              />
            </div>
          </div>

          <div className="w-full lg:w-[400px] flex flex-col gap-6 max-w-full">
            <div className="lg:sticky lg:top-20">
              <RoomDetailsCard
                roomTitle={roomTitle}
                imageUrl={imageUrl}
                homestayName={homestayName}
                checkInDate={checkIn}
                checkOutDate={checkOut}
                nightStay={nightStay}
                totalPrice={totalPrice}
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            <PaymentMethods
              cardName={cardName}
              setCardName={setCardName}
              cardNumber={cardNumber}
              setCardNumber={setCardNumber}
              expMonth={expMonth}
              setExpMonth={setExpMonth}
              expYear={expYear}
              setExpYear={setExpYear}
              securityCode={securityCode}
              setSecurityCode={setSecurityCode}
              billingZip={billingZip}
              setBillingZip={setBillingZip}
              selectedPaymentMethod={selectedPaymentMethod}
              setSelectedPaymentMethod={setSelectedPaymentMethod}
              errors={errors}
            />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            <PoliciesAndSummary handleSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>

        {/* Loading Modal */}
        <Dialog open={isLoading}>
          <DialogContent className="flex justify-center items-center">
            <VisuallyHidden>
              <DialogTitle>Processing Payment</DialogTitle>
            </VisuallyHidden>
            <LoaderPinwheel className="animate-spin h-12 w-12 text-primary" />
            <p className="ml-4 text-lg text-gray-700">Processing payment...</p>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <Skeleton className="h-24 w-full rounded-lg mb-8" />
        <Skeleton className="h-24 w-full rounded-lg mb-8" />
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 mb-8">
          <div className="flex-1 space-y-8 max-w-full">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="w-full lg:w-[400px] max-w-full">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-8">
          <Skeleton className="h-80 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}