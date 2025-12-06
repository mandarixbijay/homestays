"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AccountRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new guest dashboard
    router.replace("/guest/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-[#214B3F] animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
