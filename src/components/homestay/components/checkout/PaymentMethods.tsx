// src/components/homestay/components/checkout/PaymentMethods.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, CreditCard, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Currency conversion constants
const USD_TO_NPR = 137.10; // $1 = NPR 137.10
const convertToNPR = (usd: number): number => usd * USD_TO_NPR;

interface PaymentMethodsProps {
  cardName: string;
  setCardName: (value: string) => void;
  cardNumber: string;
  setCardNumber: (value: string) => void;
  expMonth: string;
  setExpMonth: (value: string) => void;
  expYear: string;
  setExpYear: (value: string) => void;
  securityCode: string;
  setSecurityCode: (value: string) => void;
  billingZip: string;
  setBillingZip: (value: string) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (value: string) => void;
  errors: { [key: string]: string };
}

export default function PaymentMethods({
  cardName,
  setCardName,
  cardNumber,
  setCardNumber,
  expMonth,
  setExpMonth,
  expYear,
  setExpYear,
  securityCode,
  setSecurityCode,
  billingZip,
  setBillingZip,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  errors,
}: PaymentMethodsProps) {
  const [saveCard, setSaveCard] = React.useState(false);
  const searchParams = useSearchParams();

  // Parse query parameters
  const roomTitle = searchParams.get("roomTitle") || "Deluxe Double Room";
  const homestayName = searchParams.get("homestayName") || "Homestay";
  const totalPriceUSD = parseFloat(searchParams.get("totalPrice") || "0");
  const nightlyPriceUSD = parseFloat(searchParams.get("nightlyPrice") || "0");

  // Convert prices to NPR for non-Stripe methods
  const totalPriceNPR = convertToNPR(totalPriceUSD);
  const nightlyPriceNPR = convertToNPR(nightlyPriceUSD);

  const paymentMethods = [
    {
      id: "credit-debit",
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Credit/Debit Card",
      subtitle: "Visa, Mastercard",
    },
    // {
    //   id: "esewa",
    //   icon: <Image src="/images/esewa.png" alt="eSewa" width={24} height={24} />,
    //   title: "eSewa Mobile Wallet",
    //   subtitle: "Secure Mobile Payment",
    // },
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
    <div className="w-full max-w-full bg-white rounded-lg shadow-sm p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        Payment Method
      </h2>

      {/* Security Assurance */}
      <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-700">
        <p className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
          Secure Transmission
        </p>
        <p className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
          Personal Information Protected
        </p>
      </div>

      {/* Payment Method Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors duration-200 ${
              selectedPaymentMethod === method.id
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-primary`}
            onClick={() => setSelectedPaymentMethod(method.id)}
            aria-pressed={selectedPaymentMethod === method.id}
            aria-label={`Select ${method.title}`}
            disabled={false}
          >
            {method.icon}
            <span className="text-sm font-semibold text-gray-900 mt-2 text-center">
              {method.title}
            </span>
            <span className="text-xs text-gray-500">{method.subtitle}</span>
          </button>
        ))}
      </div>

      {/* Credit/Debit Card Form */}
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
            <p className="text-sm text-gray-500">Processed securely by Stripe</p>
          </div>

          <p className="text-base text-gray-700">
            You will be redirected to a secure Stripe checkout page to enter your card details.
            Total amount: ${totalPriceUSD.toFixed(2)}.
          </p>

          <div>
            <Label
              htmlFor="cardName"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Name on Card <span className="text-red-600">*</span>
            </Label>
            <Input
              id="cardName"
              placeholder="John Smith"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className={`w-full rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.cardName
                  ? "border-red-600 focus:ring-red-600 focus:border-red-600"
                  : ""
              }`}
              aria-invalid={!!errors.cardName}
              aria-describedby={errors.cardName ? "cardName-error" : undefined}
            />
            {errors.cardName && (
              <p id="cardName-error" className="text-red-600 text-xs mt-1">
                {errors.cardName}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="cardNumber"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Card Number <span className="text-red-600">*</span>
            </Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className={`w-full rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.cardNumber
                  ? "border-red-600 focus:ring-red-600 focus:border-red-600"
                  : ""
              }`}
              aria-invalid={!!errors.cardNumber}
              aria-describedby={errors.cardNumber ? "cardNumber-error" : undefined}
            />
            {errors.cardNumber && (
              <p id="cardNumber-error" className="text-red-600 text-xs mt-1">
                {errors.cardNumber}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="expMonth"
                className="text-sm font-medium text-gray-700 mb-1 block"
              >
                Expiry Date <span className="text-red-600">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="expMonth"
                  placeholder="MM"
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  className={`w-1/2 rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.expMonth
                      ? "border-red-600 focus:ring-red-600 focus:border-red-600"
                      : ""
                  }`}
                  aria-invalid={!!errors.expMonth}
                  aria-describedby={errors.expMonth ? "expMonth-error" : undefined}
                />
                <Input
                  id="expYear"
                  placeholder="YY"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  className={`w-1/2 rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.expYear
                      ? "border-red-600 focus:ring-red-600 focus:border-red-600"
                      : ""
                  }`}
                  aria-invalid={!!errors.expYear}
                  aria-describedby={errors.expYear ? "expYear-error" : undefined}
                />
              </div>
              {(errors.expMonth || errors.expYear) && (
                <p id="expMonth-error" className="text-red-600 text-xs mt-1">
                  {errors.expMonth || errors.expYear}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="securityCode"
                className="text-sm font-medium text-gray-700 mb-1 block"
              >
                CVV <span className="text-red-600">*</span>
                <span
                  className="ml-1 text-gray-500 text-xs cursor-help"
                  title="3-digit code on the back of your card"
                >
                  ⓘ
                </span>
              </Label>
              <Input
                id="securityCode"
                placeholder="123"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                className={`w-full rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.securityCode
                    ? "border-red-600 focus:ring-red-600 focus:border-red-600"
                    : ""
                  }`}
                aria-invalid={!!errors.securityCode}
                aria-describedby={errors.securityCode ? "securityCode-error" : undefined}
              />
              {errors.securityCode && (
                <p id="securityCode-error" className="text-red-600 text-xs mt-1">
                  {errors.securityCode}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="billingZip"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Billing ZIP Code <span className="text-red-600">*</span>
            </Label>
            <Input
              id="billingZip"
              placeholder="12345"
              value={billingZip}
              onChange={(e) => setBillingZip(e.target.value)}
              className={`w-full rounded-md border-gray-300 text-base focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.billingZip
                  ? "border-red-600 focus:ring-red-600 focus:border-red-600"
                  : ""
              }`}
              aria-invalid={!!errors.billingZip}
              aria-describedby={errors.billingZip ? "billingZip-error" : undefined}
            />
            {errors.billingZip && (
              <p id="billingZip-error" className="text-red-600 text-xs mt-1">
                {errors.billingZip}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 mb-6">
            <input
              type="checkbox"
              id="saveCard"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
              aria-label="Save card for future use"
            />
            <Label
              htmlFor="saveCard"
              className="text-sm text-gray-700 cursor-pointer"
            >
              <span className="font-semibold">Save Card</span>
              <br />
              Save this card for faster bookings. You can manage saved cards in your account settings.
            </Label>
          </div>
        </div>
      )}

      {/* eSewa Payment Instructions */}
      {/* {selectedPaymentMethod === "esewa" && (
        <div className="space-y-6">
          <p className="text-base text-gray-700">
            You will be redirected to eSewa to complete your payment securely. Total amount: NPR {totalPriceNPR.toFixed(2)}.
          </p>
          <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2">
            <li>Log in with your eSewa ID and password (not MPIN).</li>
            <li>Ensure your account has sufficient balance.</li>
            <li>Enter the OTP sent to your registered mobile number.</li>
          </ol>
          <p className="text-sm text-red-600 font-medium">
            Note: Use your eSewa password, not MPIN, for login.
          </p>
        </div>
      )} */}

      {/* Khalti Payment Instructions */}
      {selectedPaymentMethod === "khalti" && (
        <div className="space-y-6">
          <p className="text-base text-gray-700">
            You will be redirected to Khalti to complete your payment securely. Total amount: NPR {totalPriceNPR.toFixed(2)}.
          </p>
          <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2">
            <li>Log in with your Khalti ID and password (not MPIN).</li>
            <li>Ensure your account has sufficient balance.</li>
            <li>Enter the OTP sent to your registered mobile number.</li>
          </ol>
          <p className="text-sm text-red-600 font-medium">
            Note: Use your Khalti password, not MPIN, for login.
          </p>
        </div>
      )}

      {/* Pay at Property Instructions */}
      {selectedPaymentMethod === "pay-at-property" && (
        <div className="space-y-6">
          <p className="text-base text-gray-700">
            Pay the total amount in cash at check-in. Ensure you have the exact amount ready: NPR {totalPriceNPR.toFixed(2)}.
          </p>
        </div>
      )}
    </div>
  );
}