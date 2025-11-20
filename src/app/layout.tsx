// src/app/layout.tsx
import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { HomestayProvider } from "@/context/HomestayContext";
import ClientWrapper from "@/components/ClientWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Nepal Homestays",
  description: "",
  verification: {
    google: "-NHCSFQEg9wPjYMJgljuZ_fZeGOgTKNDx81QFQHj3bw", // ✅ Site verification added here
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JVT4LXYD7B"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JVT4LXYD7B');
          `}
        </Script>
      </head>
      <body className={`${sora.variable} antialiased`}>
        <ClientWrapper>
          <HomestayProvider>{children}</HomestayProvider>
        </ClientWrapper>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
