import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partnerships | Nepal Homestays",
  description: "Partner with Nepal Homestays to connect travelers with authentic experiences, increase visibility, and support sustainable tourism.",
  keywords: "Nepal, homestays, partnerships, travel agencies, sustainable tourism",
  robots: "index, follow",
  openGraph: {
    title: "Partnerships | Nepal Homestays",
    description: "Join us to create unforgettable journeys and support local communities in Nepal.",
    images: ["/images/partnership.avif"],
    url: "https://nepalhomestays.com/partnerships",
    type: "website",
  },
};

export default function PartnershipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
