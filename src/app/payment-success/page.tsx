// src/app/payment-success/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle, Calendar, Users, Bed, Home } from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState(searchParams.get("status") || "PENDING");
  const [isVerifying, setIsVerifying] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    bookingId: string;
    homestayName: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    currency: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    transactionId: string;
    rooms: { roomId: number; roomName: string; adults: number; children: number; totalPrice: number }[];
  } | null>(null);

  // Extract query parameters
  const bookingId = searchParams.get("bookingId") || "N/A";
  const homestayName = searchParams.get("homestayName") || "Homestay";
  const totalPrice = parseFloat(searchParams.get("totalPrice") || "0");
  const checkIn = searchParams.get("checkIn") || new Date().toISOString().split("T")[0];
  const checkOut = searchParams.get("checkOut") || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0];
  const guests = searchParams.get("guests") || "0A0C";
  const rooms = searchParams.get("rooms") || "0";
  const selectedRooms = searchParams.get("selectedRooms") ? JSON.parse(searchParams.get("selectedRooms") || "[]") : [];
  const transactionId = searchParams.get("transactionId") || "N/A";
  const sessionId = searchParams.get("session_id");

  // Format dates and calculate nights
  let checkInDate = "Today";
  let checkOutDate = "Tomorrow";
  let nightStay = "1-night stay";
  try {
    checkInDate = format(new Date(checkIn), "EEE, MMM d, yyyy");
    checkOutDate = format(new Date(checkOut), "EEE, MMM d, yyyy");
    const numNights = differenceInDays(new Date(checkOut), new Date(checkIn));
    if (numNights > 0) {
      nightStay = `${numNights}-night stay`;
    }
  } catch (error) {
    console.error("Error formatting dates:", error);
  }

  // Calculate total guests
  const totalGuests = guests
    ?.split(",")
    .reduce(
      (acc, guest) => {
        const [adults, children] = guest.split("A").map((part) => parseInt(part.replace("C", "")));
        return { adults: acc.adults + adults, children: acc.children + children };
      },
      { adults: 0, children: 0 }
    ) || { adults: 0, children: 0 };

  // Verify Stripe payment
  useEffect(() => {
    if (status === "CONFIRMED" || !sessionId) {
      // For "Pay at Property" or already confirmed bookings, fetch booking details
      const fetchBookingDetails = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/${bookingId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", accept: "application/json" },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch booking details");
          }
          const data = await response.json();
          setBookingDetails(data);
          setStatus(data.status || "CONFIRMED");
        } catch (error: any) {
          console.error("Error fetching booking details:", error);
          toast.error("Failed to load booking details. Displaying available information.");
        }
      };
      fetchBookingDetails();
      return;
    }

    const verifyPayment = async () => {
      setIsVerifying(true);
      try {
        const response = await fetch("/api/stripe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, bookingId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to verify payment");
        }

        const data = await response.json();
        if (data.status === "CONFIRMED") {
          setStatus("CONFIRMED");
          setBookingDetails(data.booking);
          toast.success("Payment confirmed! Your booking is now confirmed.");
        } else {
          throw new Error("Payment not completed");
        }
      } catch (error: any) {
        console.error("Error verifying payment:", error);
        toast.error("Payment verification failed. Please contact support.");
        router.push(`/payment-cancel?error=${encodeURIComponent(error.message)}&bookingId=${bookingId}`);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, router, bookingId, sessionId, status]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Verifying Payment...
            </h1>
            <p className="text-base text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12 font-manrope">
      <Toaster position="top-right" richColors />
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-base text-gray-600 mb-6">
              Your booking for {bookingDetails?.homestayName || homestayName} has been successfully confirmed.
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-6 mb-6 border border-primary/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Booking Details
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">Booking ID:</span> {bookingDetails?.bookingId || bookingId}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Transaction ID:</span> {bookingDetails?.transactionId || transactionId}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Payment Method:</span> {bookingDetails?.paymentMethod || (status === "CONFIRMED" && !sessionId ? "Pay at Property" : "Stripe")}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  <strong>Check-in:</strong> {bookingDetails?.checkInDate ? format(new Date(bookingDetails.checkInDate), "EEE, MMM d, yyyy") : checkInDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  <strong>Check-out:</strong> {bookingDetails?.checkOutDate ? format(new Date(bookingDetails.checkOutDate), "EEE, MMM d, yyyy") : checkOutDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  <strong>Guests:</strong> {totalGuests.adults} Adult{totalGuests.adults !== 1 ? "s" : ""}, {totalGuests.children} Child{totalGuests.children !== 1 ? "ren" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-primary" />
                <span>
                  <strong>Rooms:</strong> {bookingDetails?.rooms?.length || rooms}
                </span>
              </div>
              {(bookingDetails?.rooms || selectedRooms).map((room: any, index: number) => (
                <div key={index} className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-800">
                    Room {index + 1}: {room.roomName || room.roomTitle}
                  </p>
                  <p className="text-xs text-gray-600">
                    {room.adults} Adult{room.adults !== 1 ? "s" : ""}, {room.children || 0} Child{(room.children || 0) !== 1 ? "ren" : ""}
                  </p>
                  <p className="text-xs text-gray-600">
                    Total: NPR {(room.totalPrice || room.nightlyPrice).toFixed(2)} for {nightStay}
                  </p>
                </div>
              ))}
              <div className="mt-4 text-center">
                <p className="text-base font-semibold text-primary">
                  Grand Total: {bookingDetails?.currency || "NPR"} {(bookingDetails?.totalPrice || totalPrice).toFixed(2)}
                </p>
                <p className="text-xs text-primary">{nightStay}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mb-6">
            A confirmation email has been sent to your registered email address.
          </p>

          <div className="text-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-2"
            >
              Return to Homepage
            </Button>
          </div>
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
        <div className="min-h-screen bg-gray-50 pt-16 pb-12">
          <Navbar />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Loading...
              </h1>
              <p className="text-base text-gray-600">Please wait while we load your booking details.</p>
            </div>
          </div>
          <Footer />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}