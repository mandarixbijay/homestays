// src/components/Hero4Wrapper.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import Hero4 with SSR disabled
const Hero4 = dynamic(() => import("@/components/landing-page/hero4"), { ssr: false });

export default function Hero4Wrapper() {
  return <Hero4 />;
}