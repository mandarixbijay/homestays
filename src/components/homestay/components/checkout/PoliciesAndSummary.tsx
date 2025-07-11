// src/components/homestay/components/checkout/PoliciesAndSummary.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PoliciesAndSummaryProps {
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function PoliciesAndSummary({ handleSubmit, isLoading }: PoliciesAndSummaryProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Policies & Summary</h2>
      <div className="text-sm text-gray-600">
        <p><strong>Cancellation Policy:</strong> Fully refundable until 3 days before check-in.</p>
        <p><strong>Check-in:</strong> After 2:00 PM</p>
        <p><strong>Check-out:</strong> Before 11:00 AM</p>
        <p><strong>Payment:</strong> Secure payment processing with your selected method.</p>
      </div>
      <Button
        onClick={handleSubmit}
        className="w-full bg-primary hover:bg-primary-800 text-white py-3 rounded-md font-semibold text-lg"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Complete Booking"}
      </Button>
    </div>
  );
}