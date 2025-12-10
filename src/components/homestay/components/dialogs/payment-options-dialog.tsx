// src/components/homestay/components/dialogs/payment-options-dialog.tsx
"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  Bed, 
  CreditCard, 
  Home, 
  X,
  Shield,
  Clock,
  Star,
  MapPin,
  ChevronDown,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { useHomestayStore } from "@/store/homestayStore";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentOptionsProps {
  children: React.ReactNode;
  nightlyPrice: number;
  totalPrice: number;
  checkIn?: string | null;
  checkOut?: string | null;
  guests?: string | null;
  rooms?: string | null;
  homestayName?: string;
  homestayId: number;
}

export default function PaymentOptionsDialog({
  children,
  nightlyPrice,
  totalPrice,
  checkIn,
  checkOut,
  guests,
  rooms,
  homestayName,
  homestayId,
}: PaymentOptionsProps) {
  const router = useRouter();
  const { selectedRooms, clearSelectedRooms } = useHomestayStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  const numNights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) || 1 : 1;

  const inputGuests = useCallback(() => {
    try {
      return (
        guests?.split(",").reduce(
          (acc, guest) => {
            const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
            if (isNaN(adults) || isNaN(children)) {
              throw new Error(`Invalid guest format: ${guest}`);
            }
            return { adults: acc.adults + adults, children: acc.children + children };
          },
          { adults: 0, children: 0 }
        ) || { adults: 0, children: 0 }
      );
    } catch (error) {
      console.warn(
        `Error parsing guests: ${
          error instanceof Error ? error.message : String(error)
        }. Defaulting to 2A0C.`
      );
      return { adults: 2, children: 0 };
    }
  }, [guests])();

  const handlePaymentSelection = useCallback(
    async (paymentMethod: string) => {
      console.log("Initiating payment selection:", {
        paymentMethod,
        homestayId,
        checkIn,
        checkOut,
        guests,
        rooms,
        selectedRooms,
      });

      // Only validate selectedRooms if they exist (for individual homestay bookings)
      // Skip validation for community bookings where selectedRooms is empty
      if (selectedRooms.length > 0) {
        const selectedGuests = selectedRooms.reduce(
          (acc, room) => {
            if (!room.roomId) {
              throw new Error(`Room ID missing for selected room: ${room.roomTitle}`);
            }
            return {
              adults: acc.adults + room.adults,
              children: acc.children + room.children,
            };
          },
          { adults: 0, children: 0 }
        );

        if (
          inputGuests.adults !== selectedGuests.adults ||
          inputGuests.children !== selectedGuests.children
        ) {
          setError("The number of guests selected does not match the input. Please adjust your room selections.");
          console.error("Guest validation failed:", { inputGuests, selectedGuests });
          return;
        }

        const inputRooms = parseInt(rooms || "1");
        if (selectedRooms.length !== inputRooms) {
          setError(`Please select exactly ${inputRooms} room${inputRooms !== 1 ? "s" : ""}.`);
          console.error("Room count validation failed:", { selectedRooms, inputRooms });
          return;
        }
      }

      setIsLoading(true);
      setSelectedPayment(paymentMethod);
      
      try {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        clearSelectedRooms();
        const queryParams = new URLSearchParams();
        queryParams.append("paymentMethod", paymentMethod);
        queryParams.append("homestayName", homestayName || "");
        queryParams.append("totalPrice", totalPrice.toString());
        queryParams.append("checkIn", checkIn || "");
        queryParams.append("checkOut", checkOut || "");
        queryParams.append("guests", guests || "");

        // Determine if this is a community booking (no selected rooms)
        const isCommunityBooking = selectedRooms.length === 0;

        if (!isCommunityBooking) {
          // For individual homestay bookings, include rooms and selectedRooms
          queryParams.append("rooms", rooms || "");
          queryParams.append(
            "selectedRooms",
            JSON.stringify(
              selectedRooms.map((room) => ({
                roomTitle: room.roomTitle,
                adults: room.adults,
                children: room.children || 0,
                nightlyPrice: room.nightlyPrice,
                totalPrice: room.totalPrice,
                roomId: room.roomId,
              }))
            )
          );
        }

        queryParams.append("homestayId", homestayId.toString());

        // Redirect to appropriate checkout page
        const redirectUrl = isCommunityBooking
          ? `/community-checkout?${queryParams.toString()}`
          : `/checkout?${queryParams.toString()}`;

        console.log("Redirecting to:", redirectUrl);
        router.push(redirectUrl);
      } catch (err: any) {
        console.error("Error during redirect:", err.message);
        setError("Failed to proceed to checkout. Please try again.");
      } finally {
        setIsLoading(false);
        setSelectedPayment(null);
      }
    },
    [guests, rooms, selectedRooms, homestayId, homestayName, checkIn, checkOut, totalPrice, router, clearSelectedRooms]
  );

  const paymentOptions = [
    {
      id: "credit-debit",
      title: "Pay Now",
      icon: <CreditCard className="h-6 w-6" />,
      description: "Secure online payment",
      features: [
        "Credit/Debit Card accepted",
        "Digital wallets supported",
        "Instant confirmation",
        "Secure encryption"
      ],
      badge: "Popular",
      badgeColor: "bg-blue-500",
      gradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      id: "pay-at-property",
      title: "Pay at Property",
      icon: <Home className="h-6 w-6" />,
      description: "Pay when you arrive",
      features: [
        "Pay directly at homestay",
        "Cash or card accepted",
        "No advance payment",
        "Flexible payment method"
      ],
      badge: "Flexible",
      badgeColor: "bg-green-500",
      gradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700"
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-4xl p-0 bg-white rounded-2xl max-h-[90vh] overflow-hidden"
        aria-label="Confirm booking dialog"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Complete Your Booking
                </DialogTitle>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{homestayName || "Your Homestay"}</span>
                </div>
              </div>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          {/* Refundable Notice */}
          <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-900">Free Cancellation</p>
              <p className="text-sm text-green-700">Fully refundable before 24 hours prior to check-in</p>
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-8 mt-6"
              >
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-800">{error}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-8 py-6 space-y-8">
            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Booking Summary</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">NPR {totalPrice.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">for {numNights} night{numNights !== 1 ? "s" : ""}</div>
                </div>
              </div>

              {/* Quick Details */}
              <div className={`grid ${selectedRooms.length > 0 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'} gap-4 mb-6`}>
                <div className="text-center p-3 bg-white rounded-xl">
                  <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <div className="text-xs text-gray-500 mb-1">Check-in</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {checkIn ? format(new Date(checkIn), "MMM d") : "N/A"}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-xl">
                  <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <div className="text-xs text-gray-500 mb-1">Check-out</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {checkOut ? format(new Date(checkOut), "MMM d") : "N/A"}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-xl">
                  <Users className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <div className="text-xs text-gray-500 mb-1">Guests</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {inputGuests.adults + inputGuests.children}
                  </div>
                </div>
                {/* Only show Rooms for individual homestay bookings */}
                {selectedRooms.length > 0 && (
                  <div className="text-center p-3 bg-white rounded-xl">
                    <Bed className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                    <div className="text-xs text-gray-500 mb-1">Rooms</div>
                    <div className="text-sm font-semibold text-gray-900">{rooms}</div>
                  </div>
                )}
              </div>

              {/* Room Details Toggle */}
              {selectedRooms.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowRoomDetails(!showRoomDetails)}
                    className="flex items-center justify-between w-full p-3 hover:bg-white rounded-xl transition-colors"
                  >
                    <span className="font-semibold text-gray-900">Room Details ({selectedRooms.length})</span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${showRoomDetails ? "rotate-180" : ""}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showRoomDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 mt-4">
                          {selectedRooms.map((room, index) => (
                            <div key={room.roomId} className="p-4 bg-white rounded-xl border border-gray-100">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{room.roomTitle}</h4>
                                  <p className="text-sm text-gray-500">Room {index + 1}</p>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">NPR {room.totalPrice.toLocaleString()}</div>
                                  <div className="text-xs text-gray-500">total</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{room.adults} Adult{room.adults !== 1 ? "s" : ""}</span>
                                <span>{room.children || 0} Child{(room.children || 0) !== 1 ? "ren" : ""}</span>
                                <span>NPR {room.nightlyPrice.toLocaleString()}/night</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Payment Options */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Choose Payment Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      relative bg-gradient-to-br ${option.gradient} border-2 ${option.borderColor} 
                      rounded-2xl p-6 cursor-pointer group hover:shadow-lg transition-all
                    `}
                  >
                    {/* Badge */}
                    <div className="absolute -top-3 left-6">
                      <Badge className={`${option.badgeColor} text-white px-3 py-1 text-xs font-semibold`}>
                        {option.badge}
                      </Badge>
                    </div>

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        {option.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{option.title}</h4>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {option.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-2xl font-bold text-gray-900">NPR {totalPrice.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Total amount</div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handlePaymentSelection(option.id)}
                      disabled={isLoading}
                      className={`
                        w-full ${option.buttonColor} text-white py-3 rounded-xl font-semibold 
                        shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {isLoading && selectedPayment === option.id ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span>Choose {option.title}</span>
                        </div>
                      )}
                    </Button>

                    {/* Loading Overlay */}
                    {isLoading && selectedPayment === option.id && (
                      <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">Setting up your booking...</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Secure Booking</p>
                <p className="text-xs text-blue-700">Your payment information is protected with bank-level encryption</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}