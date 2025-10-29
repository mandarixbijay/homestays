// src/app/layout.tsx
import type { Metadata } from "next";
import { Sora } from "next/font/google";
// @ts-ignore: allow side-effect CSS import without type declarations
import "./globals.css";
import { HomestayProvider } from "@/context/HomestayContext";
import ClientWrapper from "@/components/ClientWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nepal Homestays",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} antialiased`}>
        <ClientWrapper>
          <HomestayProvider>{children}</HomestayProvider>
        </ClientWrapper>
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  );
}