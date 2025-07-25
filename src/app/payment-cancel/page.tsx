"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { XCircle, Home, ArrowLeft, AlertTriangle, LoaderPinwheel } from "lucide-react";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get("error") || "Payment was not completed.";
  const bookingId = searchParams.get("bookingId") || "N/A";
  const homestayName = searchParams.get("homestayName") || "Homestay";
  const totalPrice = searchParams.get("totalPrice") || "0";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "";
  const rooms = searchParams.get("rooms") || "";
  const selectedRooms = searchParams.get("selectedRooms") || "[]";

  console.log("Payment cancel params:", {
    error,
    bookingId,
    homestayName,
    totalPrice,
    checkIn,
    checkOut,
    guests,
    rooms,
    selectedRooms,
  });

  const tryAgainUrl = `/checkout?homestayId=${searchParams.get("homestayId") || "0"}&homestayName=${encodeURIComponent(homestayName)}&totalPrice=${totalPrice}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}&selectedRooms=${encodeURIComponent(selectedRooms)}&paymentMethod=khalti`;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12 font-manrope">
      <Toaster position="top-right" richColors />
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 max-w-lg mx-auto text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Payment Cancelled</h1>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            We couldn&apos;t process your payment for {homestayName}.
            {bookingId !== "N/A" && (
              <>
                <br />
                <span className="text-gray-500 text-sm">Booking ID: {bookingId}</span>
              </>
            )}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              Error: {error}
              <br />
              {error.includes("Khalti server") || error.includes("Invalid Khalti authorization key")
                ? "Please try another payment method (e.g., pay-at-property) or try again later."
                : error.includes("Payment confirmation failed")
                  ? "Payment was processed but booking confirmation failed. Please contact support with your Booking ID."
                  : "Please try again with a different payment method or contact support if the issue persists."}
            </p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={() => router.push(tryAgainUrl)}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-2 w-full sm:w-auto transition-colors mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Try Again with Khalti
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 rounded-lg px-6 py-2 w-full sm:w-auto transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Homepage
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            Need help?{" "}
            <a href="mailto:support@nepalhomestays.com" className="text-primary hover:underline">
              Contact our support team
            </a>
            .
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function PaymentCancel() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 pt-16 pb-12 font-manrope">
          <Toaster position="top-right" richColors />
          <Navbar />
          <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <LoaderPinwheel className="animate-spin h-12 w-12 text-primary" />
            <p className="ml-4 text-lg text-gray-700">Loading...</p>
          </div>
          <Footer />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}