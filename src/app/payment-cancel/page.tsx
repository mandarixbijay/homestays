// src/app/payment-cancel/page.tsx
"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 max-w-md w-full text-center">
        <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-4">
          Your payment was not completed. Please try again or choose another payment method.
        </p>
        <Link href="/checkout" className="text-primary hover:underline">
          Try Again
        </Link>
      </div>
    </div>
  );
}