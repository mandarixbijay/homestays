// src/app/layout.tsx
import type { Metadata } from "next";
import { Sora } from "next/font/google";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nepalhomestays.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Nepal Homestays - Discover Authentic Nepalese Hospitality",
    template: "%s | Nepal Homestays"
  },
  description: "Experience authentic Nepalese culture with 1000+ verified homestays across Nepal. Immerse yourself in traditional hospitality, local cuisine, and breathtaking mountain views. Book your perfect homestay adventure today.",
  keywords: [
    "Nepal homestays",
    "authentic Nepalese hospitality",
    "Nepal accommodation",
    "traditional homestays Nepal",
    "village homestays",
    "cultural experiences Nepal",
    "Nepal travel",
    "mountain homestays",
    "rural tourism Nepal",
    "homestay booking Nepal"
  ].join(", "),
  authors: [{ name: "Nepal Homestays", url: baseUrl }],
  creator: "Nepal Homestays",
  publisher: "Nepal Homestays",
  applicationName: "Nepal Homestays",
  verification: {
    google: "-NHCSFQEg9wPjYMJgljuZ_fZeGOgTKNDx81QFQHj3bw",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Nepal Homestays',
    title: 'Nepal Homestays - Discover Authentic Nepalese Hospitality',
    description: 'Experience authentic Nepalese culture with 1000+ verified homestays across Nepal. Immerse yourself in traditional hospitality, local cuisine, and breathtaking mountain views.',
    images: [
      {
        url: `${baseUrl}/images/logo/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Nepal Homestays - Authentic Nepalese Hospitality',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nepal Homestays - Discover Authentic Nepalese Hospitality',
    description: 'Experience authentic Nepalese culture with 1000+ verified homestays across Nepal. Book your perfect homestay adventure today.',
    creator: '@nepalhomestays',
    site: '@nepalhomestays',
    images: [`${baseUrl}/images/logo/logo.png`],
  },
  other: {
    'og:locale': 'en_US',
    'og:site_name': 'Nepal Homestays',
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
