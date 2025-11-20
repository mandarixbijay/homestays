"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, User, Clock } from "lucide-react";

interface Booking {
  id: number;
  name: string;
  location: string;
  timeAgo: string;
}

const bookings: Booking[] = [
  { id: 1, name: "John", location: "Kathmandu Valley Homestay", timeAgo: "2 minutes ago" },
  { id: 2, name: "Sarah", location: "Pokhara Lakeside Home", timeAgo: "5 minutes ago" },
  { id: 3, name: "Michael", location: "Bhaktapur Heritage Stay", timeAgo: "7 minutes ago" },
  { id: 4, name: "Emma", location: "Patan Traditional Home", timeAgo: "12 minutes ago" },
  { id: 5, name: "David", location: "Nagarkot Hill Resort", timeAgo: "15 minutes ago" },
  { id: 6, name: "Lisa", location: "Chitwan Jungle Homestay", timeAgo: "18 minutes ago" },
];

export default function BookingTicker() {
  const [currentBooking, setCurrentBooking] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentBooking((prev) => (prev + 1) % bookings.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const booking = bookings[currentBooking];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 z-50 hidden lg:block"
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 pr-6 flex items-center gap-3 max-w-sm hover:shadow-xl transition-shadow cursor-pointer"
          >
            {/* Indicator Dot */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-3 h-3 bg-green-500 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full"
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <span className="font-semibold text-gray-900 text-sm">
                  {booking.name}
                </span>
                <span className="text-gray-600 text-sm">just booked</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="line-clamp-1">{booking.location}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{booking.timeAgo}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
