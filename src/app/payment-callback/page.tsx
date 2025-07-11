// src/app/payment-callback/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { LoaderPinwheel } from "lucide-react";
import axios from "axios";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get("pidx");
      const purchaseOrderId = searchParams.get("purchase_order_id");

      if (!pidx) {
        setStatus("error");
        window.location.href = `/payment-cancel?error=Missing payment identifier`;
        return;
      }

      try {
        const response = await axios.post(
          "/api/khalti/verify",
          { pidx },
          {
            headers: {
              Authorization: `Key ${
                process.env.NEXT_PUBLIC_KHALTI_TEST_SECRET_KEY ||
                "05bf95cc57244045b8df5fad06748dab"
              }`,
            },
          }
        );

        const data = response.data as { status?: string };
        if (data.status === "Completed") {
          setStatus("success");
          window.location.href = `/payment-success?purchase_order_id=${encodeURIComponent(
            purchaseOrderId || ""
          )}`;
        } else {
          setStatus("error");
          window.location.href = `/payment-cancel?error=Payment not completed`;
        }
      } catch (error) {
        console.error("Error verifying Khalti payment:", error);
        setStatus("error");
        window.location.href = `/payment-cancel?error=Payment verification failed`;
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <LoaderPinwheel className="animate-spin h-12 w-12 text-primary" />
        <p className="ml-4 text-lg text-gray-700">Verifying payment...</p>
      </div>
    );
  }

  return null;
}

export default function PaymentCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <LoaderPinwheel className="animate-spin h-12 w-12 text-primary" />
          <p className="ml-4 text-lg text-gray-700">Verifying payment...</p>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}