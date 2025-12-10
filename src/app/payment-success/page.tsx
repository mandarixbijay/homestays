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

  // Extract and log query parameters
  const bookingId = searchParams.get("bookingId") || "N/A";
  const homestayName = searchParams.get("homestayName") || "Homestay";
  const totalPrice = parseFloat(searchParams.get("totalPrice") || "0");
  const checkIn = searchParams.get("checkIn") || new Date().toISOString().split("T")[0];
  const checkOut = searchParams.get("checkOut") || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0];
  const guests = searchParams.get("guests") || "0A0C";
  const rooms = searchParams.get("rooms") || "0";
  const selectedRoomsParam = searchParams.get("selectedRooms");
  const selectedRooms = selectedRoomsParam && selectedRoomsParam !== "undefined" ? JSON.parse(selectedRoomsParam) : [];
  const transactionId = searchParams.get("transactionId") || "N/A";
  const bookingType = searchParams.get("type") || "homestay"; // "community" or "homestay"
  const sessionId = searchParams.get("session_id");
  const paymentMethod = searchParams.get("paymentMethod") || "Unknown";

  console.log("Payment success params:", {
    bookingId,
    homestayName,
    totalPrice,
    checkIn,
    checkOut,
    guests,
    rooms,
    selectedRooms,
    transactionId,
    sessionId,
    status,
    paymentMethod,
    bookingType,
  });

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
    console.log("Formatted dates:", { checkInDate, checkOutDate, nightStay });
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
  console.log("Total guests:", totalGuests);

  // Fetch booking details
  useEffect(() => {
    if (status === "CONFIRMED" || !sessionId) {
      const fetchBookingDetails = async () => {
        console.log("Fetching booking details for:", bookingId);
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://13.61.8.56:3001"; // Fallback URL
          const url = `${baseUrl}/bookings/${bookingId}`;
          console.log("Fetching from:", url);
          const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json", accept: "application/json" },
            cache: "no-store", // Ensure fresh data
          });
          console.log("Booking details response status:", response.status);
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Fetch error:", {
              status: response.status,
              error: errorData.error,
              details: errorData,
            });
            throw new Error(errorData.error || `Failed to fetch booking details (status: ${response.status})`);
          }
          const data = await response.json();
          console.log("Booking details fetched:", JSON.stringify(data, null, 2));
          setBookingDetails(data);
          setStatus(data.status || "CONFIRMED");
        } catch (error: any) {
          console.error("Error fetching booking details:", {
            message: error.message,
            status: error.response?.status,
            details: error.response?.data,
          });
          toast.error("Failed to load booking details. Displaying available information.");
        }
      };
      if (bookingId !== "N/A") {
        fetchBookingDetails();
      } else {
        console.log("Skipping fetch: Invalid bookingId");
        toast.error("Invalid booking ID. Displaying available information.");
      }
      return;
    }

    // Stripe verification (for Stripe payments)
    const verifyPayment = async () => {
      setIsVerifying(true);
      console.log("Verifying Stripe payment:", { sessionId, bookingId });
      try {
        const response = await fetch("/api/stripe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, bookingId }),
        });
        console.log("Stripe verify response status:", response.status);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to verify payment");
        }
        const data = await response.json();
        console.log("Stripe verify response:", JSON.stringify(data, null, 2));
        if (data.status === "CONFIRMED") {
          setStatus("CONFIRMED");
          setBookingDetails(data);
          toast.success("Payment confirmed! Your booking is confirmed.");
          console.log("Stripe payment confirmed:", JSON.stringify(data, null, 2));
        } else {
          throw new Error("Payment not completed");
        }
      } catch (error: any) {
        console.error("Error verifying payment:", {
          message: error.message,
          status: error.response?.status,
          details: error.response?.data,
        });
        toast.error("Payment verification failed. Please contact support.");
        router.push(`/payment-cancel?error=${encodeURIComponent(error.message)}&bookingId=${bookingId}`);
      } finally {
        setIsVerifying(false);
        console.log("Stripe verification completed");
      }
    };

    verifyPayment();
  }, [searchParams, router, bookingId, sessionId, status]);

  if (isVerifying) {
    console.log("Rendering verifying state");
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

  console.log("Rendering success page with details:", bookingDetails || "Using query params");
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
                <span className="font-medium">Payment Method:</span> {bookingDetails?.paymentMethod || (paymentMethod !== "Unknown" ? paymentMethod : "Khalti")}
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
              {/* Only show rooms section for individual homestay bookings */}
              {bookingType !== "community" && (
                <>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-primary" />
                    <span>
                      <strong>Rooms:</strong> {bookingDetails?.rooms?.length || rooms}
                    </span>
                  </div>
                  {(bookingDetails?.rooms || selectedRooms).map((room: any, index: number) => (
                    <div key={index} className="border-t border-gray-200 pt-3 mt-3">
                      <p className="text-sm font-medium text-gray-800">
                        Room {index + 1}: {room.roomName || room.roomTitle || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {room.adults || 0} Adult{room.adults !== 1 ? "s" : ""}, {room.children || 0} Child{(room.children || 0) !== 1 ? "ren" : ""}
                      </p>
                      <p className="text-xs text-gray-600">
                        Total: NPR {(room.totalPrice || room.nightlyPrice || 0).toFixed(2)} for {nightStay}
                      </p>
                    </div>
                  ))}
                </>
              )}
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