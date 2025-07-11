// src/app/payment-success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { CheckCircle } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const roomTitle = searchParams.get("roomTitle") || "Deluxe Double Room";
  const homestayName = searchParams.get("homestayName") || "Homestay";
  const totalPrice = parseFloat(searchParams.get("totalPrice") || "0");

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-base text-gray-600 mb-6">
            Your booking for {roomTitle} at {homestayName} has been confirmed.
          </p>
          <p className="text-base text-gray-600">
            Total Amount Paid: ${totalPrice.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="text-lg text-gray-700">Loading...</div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}