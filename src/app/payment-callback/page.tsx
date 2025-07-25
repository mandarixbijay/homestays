"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { LoaderPinwheel } from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get("pidx"); // Khalti
      const sessionId = searchParams.get("session_id"); // Stripe
      const paymentStatus = searchParams.get("status"); // Khalti status
      const bookingId = searchParams.get("bookingId");
      const paymentMethod = searchParams.get("paymentMethod") || "Unknown";

      console.log("Payment callback params:", { pidx, sessionId, paymentStatus, bookingId, paymentMethod });

      if (!bookingId) {
        setStatus("error");
        toast.error("Missing booking ID");
        router.push(`/payment-cancel?error=Missing booking ID&bookingId=N/A`);
        return;
      }

      // Retrieve stored data from sessionStorage
      const storedData = sessionStorage.getItem(`booking_${bookingId}`);
      const bookingData = storedData
        ? JSON.parse(storedData)
        : {
            homestayName: "Homestay",
            totalPrice: "0",
            checkIn: "",
            checkOut: "",
            guests: "0A0C",
            rooms: "0",
            selectedRooms: [],
            paymentMethod: paymentMethod,
          };

      const { homestayName, totalPrice, checkIn, checkOut, guests, rooms, selectedRooms } = bookingData;

      if (paymentMethod === "PAY_AT_PROPERTY") {
        setStatus("success");
        toast.success("Booking confirmed successfully!");
        router.push(
          `/payment-success?bookingId=${bookingId}&homestayName=${encodeURIComponent(homestayName)}&totalPrice=${totalPrice}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}&selectedRooms=${encodeURIComponent(JSON.stringify(selectedRooms))}&status=CONFIRMED&paymentMethod=${paymentMethod}&transactionId=N/A`
        );
        return;
      }

      if (!pidx && !sessionId) {
        setStatus("error");
        toast.error("Missing payment identifier");
        router.push(`/payment-cancel?error=Missing payment identifier&bookingId=${bookingId}`);
        return;
      }

      try {
        let response;
        if (pidx) {
          if (paymentStatus !== "Completed") {
            setStatus("error");
            toast.error(`Payment status: ${paymentStatus}`);
            router.push(`/payment-cancel?error=Payment status ${paymentStatus}&bookingId=${bookingId}`);
            return;
          }
          response = await fetch("/api/khalti/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pidx, bookingId }),
          });
        } else if (sessionId) {
          response = await fetch("/api/stripe/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, bookingId }),
          });
        } else {
          throw new Error("Invalid payment method");
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Verify error:", {
            status: response.status,
            error: errorData.error,
            details: errorData.details,
          });
          throw new Error(errorData.error || "Failed to verify payment");
        }

        const { status: paymentConfirmationStatus, redirect } = await response.json();
        console.log("Verify response:", { paymentConfirmationStatus, redirect });
        if (paymentConfirmationStatus !== "CONFIRMED") {
          throw new Error("Payment confirmation failed");
        }

        setStatus("success");
        toast.success("Payment and booking confirmed successfully!");
        router.push(
          redirect ||
            `/payment-success?bookingId=${bookingId}&homestayName=${encodeURIComponent(homestayName)}&totalPrice=${totalPrice}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}&selectedRooms=${encodeURIComponent(JSON.stringify(selectedRooms))}&status=CONFIRMED&paymentMethod=${paymentMethod}`
        );
      } catch (error: any) {
        console.error("Error verifying payment:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          pidx,
          bookingId,
        });
        setStatus("error");
        toast.error(error.message || "Payment verification failed");
        router.push(`/payment-cancel?error=${encodeURIComponent(error.message)}&bookingId=${bookingId}`);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12 font-manrope">
      <Toaster position="top-right" richColors />
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <LoaderPinwheel className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-4 text-lg text-gray-700">Verifying...</p>
      </div>
      <Footer />
    </div>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 pt-16 pb-12 font-manrope">
          <Toaster position="top-right" richColors />
          <Navbar />
          <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <LoaderPinwheel className="animate-spin h-12 w-12 text-primary" />
            <p className="ml-4 text-lg text-gray-700">Loading...</p>
          </div>
          <Footer />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}