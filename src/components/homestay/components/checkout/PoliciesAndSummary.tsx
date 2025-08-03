"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Clock, Shield } from "lucide-react"; // Added icons for policies

interface PoliciesAndSummaryProps {
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function PoliciesAndSummary({ handleSubmit, isLoading }: PoliciesAndSummaryProps) {
  return (
    <div className="space-y-6 p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
      {/* Heading with reduced size and modern styling */}
      <h2 className="text-xl font-semibold text-gray-900">Policies & Summary</h2>

      {/* Policy List with Icons */}
      <div className="space-y-4 text-sm text-gray-600">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-gray-800">Cancellation Policy</p>
            <p>Fully refundable until 24 Hours before check-in.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-gray-800">Check-in</p>
            <p>After 2:00 PM</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-gray-800">Check-out</p>
            <p>Before 11:00 AM</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-gray-800">Payment</p>
            <p>Secure payment processing with your selected method.</p>
          </div>
        </div>
      </div>

      {/* Modern Button with Flat Design */}
      <Button
        onClick={handleSubmit}
        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium text-base transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          "Complete Booking"
        )}
      </Button>
    </div>
  );
}