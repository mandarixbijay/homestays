// src/components/homestay/components/dialogs/payment-options-dialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, subDays } from "date-fns";

const USD_TO_NPR = 137.10; // $1 = NPR 137.10
const convertToNPR = (usd: number): number => usd * USD_TO_NPR;

interface PaymentOptions {
  children: React.ReactNode;
  nightlyPrice: number;
  totalPrice: number;
  roomTitle?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  guests?: string | null;
  rooms?: string | null;
  extra?: string;
  homestayName?: string;
  bedType?: string;
  imageUrl?: string;
}

export default function PaymentOptionsDialog({
  children,
  nightlyPrice,
  totalPrice,
  roomTitle,
  checkIn,
  checkOut,
  guests,
  rooms,
  extra,
  homestayName,
  bedType,
  imageUrl,
}: PaymentOptions) {
  const router = useRouter();
  const nightlyPriceNPR = convertToNPR(nightlyPrice);
  const totalPriceNPR = convertToNPR(totalPrice);

  const handlePaymentSelection = (paymentMethod: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append("paymentMethod", paymentMethod);
    if (roomTitle) queryParams.append("roomTitle", roomTitle);
    if (checkIn) queryParams.append("checkIn", checkIn);
    if (checkOut) queryParams.append("checkOut", checkOut);
    if (guests) queryParams.append("guests", guests);
    if (rooms) queryParams.append("rooms", rooms);
    if (extra) queryParams.append("extra", extra);
    if (homestayName) queryParams.append("homestayName", homestayName);
    if (bedType) queryParams.append("bedType", bedType);
    if (imageUrl) queryParams.append("imageUrl", imageUrl);
    queryParams.append("nightlyPrice", nightlyPrice.toString());
    queryParams.append("totalPrice", totalPrice.toString());

    router.push(`/checkout?${queryParams.toString()}`);
  };

  // Calculate refundable date (e.g., 3 days before check-in)
  const refundableDate = checkIn
    ? format(subDays(new Date(checkIn), 3), "EEE, MMM d")
    : "N/A";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0 relative">
          <DialogTitle className="text-xl font-bold text-center">
            Your payment options
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className="flex items-center text-primary mb-4 text-sm font-semibold">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Fully refundable before {refundableDate}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-start">
              <h3 className="font-semibold text-lg mb-2">Pay the total now</h3>
              <ul className="text-sm space-y-1 mb-4 flex-grow">
                <li>More ways to pay: use Debit/Credit card or PayPal</li>
                <li>You can use a valid Expedia coupon</li>
              </ul>
              <p className="text-lg line-through">${nightlyPrice} nightly</p>
              <p className="text-2xl font-bold text-black">${totalPrice.toFixed(2)} total</p>
              <p className="text-primary text-sm mt-1 mb-4">
                <CheckCircle className="inline h-4 w-4 mr-1" /> Total includes taxes and fees
              </p>
              <Button
                onClick={() => handlePaymentSelection("credit-debit")}
                className="w-full py-3 rounded-md font-semibold text-lg"
              >
                Pay now
              </Button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-start">
              <h3 className="font-semibold text-lg mb-2">Pay when you stay</h3>
              <ul className="text-sm space-y-1 mb-4 flex-grow">
                <li>Pay the property directly in their preferred currency (NPR)</li>
              </ul>
              <p className="text-lg line-through">NPR {nightlyPriceNPR.toFixed(2)} nightly</p>
              <p className="text-2xl font-bold text-black">NPR {totalPriceNPR.toFixed(2)} total</p>
              <p className="text-primary text-sm mt-1 mb-4">
                <CheckCircle className="inline h-4 w-4 mr-1" /> Total includes taxes and fees
              </p>
              <Button
                onClick={() => handlePaymentSelection("pay-at-property")}
                className="w-full text-white py-3 rounded-md font-semibold text-lg"
              >
                Pay at property
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}