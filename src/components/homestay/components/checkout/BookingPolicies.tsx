"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronRight, Calendar, Shield } from "lucide-react";
import { motion } from "framer-motion"; // For subtle animations

interface BookingPoliciesProps {
  handleSubmit: (e: React.FormEvent) => void;
}

export default function BookingPolicies({ handleSubmit }: BookingPoliciesProps) {
  return (
    <div className="w-full max-w-full space-y-6">
      {/* Cancellation Policy Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md p-6 sm:p-8"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Cancellation Policy
        </h2>
        <ul className="list-none pl-0 text-sm sm:text-base text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✔</span>
            <span>
              <span className="font-medium text-green-600">Fully refundable</span> until Wed, Jun 4, 6:00 PM (property local time)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500">•</span>
            <span>
              Cancellations or changes after Jun 4, 2025, 6:00 PM, or no-shows incur a fee equal to the first night’s rate plus taxes and fees.
            </span>
          </li>
        </ul>
      </motion.div>

      {/* Important Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-6 sm:p-8"
      >
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Important Information
        </h2>
        <ul className="list-none pl-0 text-sm sm:text-base text-gray-700 mb-6">
          <li className="flex items-start gap-2">
            <span className="text-gray-500">•</span>
            <span>Front desk staff will greet guests on arrival at the property.</span>
          </li>
        </ul>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-4 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-900">Check-in</p>
              <p className="text-sm text-gray-700">Today, Fri, Jun 6, 2:00 PM</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-900">Check-out</p>
              <p className="text-sm text-gray-700">Fri, Jun 20, 12:00 PM (14-night stay)</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          By clicking “Complete Booking,” you agree to our{" "}
          <a
            href="#"
            className="text-primary font-medium hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Privacy Statement"
          >
            Privacy Statement
          </a>
          ,{" "}
          <a
            href="#"
            className="text-primary font-medium hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Government Travel Advice"
          >
            Government Travel Advice
          </a>
          ,{" "}
          <a
            href="#"
            className="text-primary font-medium hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Rules and Restrictions"
          >
            Rules & Restrictions
          </a>
          , and{" "}
          <a
            href="#"
            className="text-primary font-medium hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Terms of Use"
          >
            Terms of Use
          </a>
          .
        </p>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full"
        >
          <Button
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
            onClick={handleSubmit}
            aria-label="Complete Booking"
          >
            Complete Booking
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>

        <div className="flex items-start gap-2 mt-4 text-sm text-gray-600">
          <Wallet className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <p>
            Your personal information is protected with secure transmission and encrypted storage.
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Payments are processed in the U.S. A foreign transaction fee may apply if processed outside the U.S. by the travel provider.
        </p>
      </motion.div>
    </div>
  );
}