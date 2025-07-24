// src/app/components/PaymentMethods.tsx
"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle, CreditCard, Home, AlertCircle, Wallet } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Currency conversion constants
const USD_TO_NPR = 137; // $1 = NPR 137.10
const convertToUSD = (npr: number): number => npr / USD_TO_NPR;

interface PaymentMethodsProps {
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (value: string) => void;
}

export default function PaymentMethods({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
}: PaymentMethodsProps) {
  const searchParams = useSearchParams();

  // Parse query parameters
  const totalPriceNPR = parseFloat(searchParams.get("totalPrice") || "0");
  const nightlyPriceNPR = parseFloat(searchParams.get("nightlyPrice") || "0");

  // Convert prices to USD for Stripe payment
  const totalPriceUSD = convertToUSD(totalPriceNPR);
  const nightlyPriceUSD = convertToUSD(nightlyPriceNPR);

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
    // {
    //   id: "esewa",
    //   icon: <Wallet className="h-6 w-6 text-primary" />, // Placeholder; replace with eSewa logo if available
    //   title: "eSewa",
    //   subtitle: "Secure Mobile Payment",
    // },
    {
      id: "pay-at-property",
      icon: <Home className="h-6 w-6 text-primary" />,
      title: "Pay at Property",
      subtitle: "Cash on Check-in",
    },
  ];

  return (
    <div className="w-full max-w-full bg-white rounded-lg shadow-sm p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        Payment Method
      </h2>

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-colors duration-200 ${selectedPaymentMethod === method.id
              ? "border-primary bg-primary/10 shadow-md"
              : "border-gray-200 hover:border-primary hover:bg-primary/5"
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            onClick={() => setSelectedPaymentMethod(method.id)}
            aria-pressed={selectedPaymentMethod === method.id}
            aria-label={`Select ${method.title}`}
            disabled={false}
          >
            {selectedPaymentMethod === method.id && (
              <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary" />
            )}
            {method.icon}
            <span className="text-xs font-semibold text-gray-900 mt-2 text-center">
              {method.title}
            </span>
            <span className="text-[0.65rem] text-gray-500">{method.subtitle}</span>
          </button>
        ))}
      </div>

      {/* Credit/Debit Card Instructions (Stripe) */}
      {selectedPaymentMethod === "credit-debit" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Image
              src="/images/visa.png"
              alt="Visa"
              height={32}
              width={48}
              className="object-contain"
            />
            <Image
              src="/images/master.png"
              alt="Mastercard"
              height={32}
              width={48}
              className="object-contain"
            />
            <Image
              src="https://cdn.worldvectorlogo.com/logos/stripe-4.svg"
              alt="Stripe"
              height={32}
              width={48}
              className="object-contain"
            />
            <p className="text-xs font-medium text-gray-500">
              Processed securely by <span className="font-semibold text-primary">Stripe&apos;s</span>
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-900 p-3 bg-accent/10 rounded-md border border-accent">
            Total amount to be paid: <span className="text-base text-accent">${totalPriceUSD.toFixed(2)}</span> USD
          </p>
          <p className="text-xs text-gray-600">
            You will be redirected to Stripe&apos;s secure checkout page to enter your card details and complete the payment.
          </p>
        </div>
      )}

      {/* Khalti Payment Instructions */}
      {selectedPaymentMethod === "khalti" && (
        <div className="space-y-6">
          <p className="text-sm font-semibold text-gray-900 p-3 bg-accent/10 rounded-md border border-accent">
            Total amount to be paid: <span className="text-base text-accent">NPR {totalPriceNPR.toFixed(2)}</span>
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

      {/* eSewa Payment Instructions */}
      {/* {selectedPaymentMethod === "esewa" && (
        <div className="space-y-6">
          <p className="text-sm font-semibold text-gray-900 p-3 bg-accent/10 rounded-md border border-accent">
            Total amount to be paid: <span className="text-base text-accent">NPR {totalPriceNPR.toFixed(2)}</span>
          </p>
          <ol className="list-decimal pl-5 text-xs text-gray-600 space-y-2">
            <li className="font-semibold">Log in with your eSewa ID and password.</li>
            <li>Ensure your account has sufficient balance.</li>
            <li>Confirm the payment with the OTP sent to your registered mobile number.</li>
          </ol>
          <p className="text-xs font-medium text-red-600 bg-red-50 p-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            Note: Ensure your eSewa account is active and verified.
          </p>
        </div>
      )} */}

      {/* Pay at Property Instructions */}
      {selectedPaymentMethod === "pay-at-property" && (
        <div className="space-y-6">
          <p className="text-sm font-semibold text-gray-900 p-3 bg-accent/10 rounded-md border border-accent">
            Total amount to be paid at check-in: <span className="text-base text-accent">NPR {totalPriceNPR.toFixed(2)}</span>
          </p>
          <p className="text-xs text-gray-600">
            Ensure you have the exact amount ready in cash at check-in.
          </p>
        </div>
      )}
    </div>
  );
}