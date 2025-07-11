"use client"

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight } from "lucide-react";
import { useState } from "react";
import BasicInfoDialog from "./dialogs/BasicInfoDialog";
import ContactInfoDialog from "./dialogs/ContactInfoDialog";
import PaymentHistory from "./BookingHistory";

interface MainContentProps {
  selected: string;
}

const bookings = [
  {
    id: "BKG123456",
    property: "Mountain View Homestay",
    date: "2024-06-01",
    nights: 3,
    guests: 2,
    amount: 210,
    status: "Paid",
    payment: {
      method: "Credit Card",
      transactionId: "TXN987654321",
      breakdown: [
        { label: "Room", value: 180 },
        { label: "Taxes & Fees", value: 30 },
      ],
      paidOn: "2024-05-20",
      last4: "4242",
    },
  },
  {
    id: "BKG654321",
    property: "City Center Apartment",
    date: "2024-05-15",
    nights: 2,
    guests: 1,
    amount: 140,
    status: "Paid",
    payment: {
      method: "PayPal",
      transactionId: "TXN123456789",
      breakdown: [
        { label: "Room", value: 120 },
        { label: "Taxes & Fees", value: 20 },
      ],
      paidOn: "2024-05-01",
      last4: null,
    },
  },
];

export default function MainContent({ selected }: MainContentProps) {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  if (selected === "payment-history") {
    return <PaymentHistory />;
  }

  // Default: Profile
  return (
    <Card className="flex-1 p-4 md:p-8 w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">David John</h2>
      </div>
      <div className="flex flex-col gap-8 mb-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-lg">Basic information</span>
            <BasicInfoDialog open={open} setOpen={setOpen} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Name</div>
              <div>David John</div>
              <div className="text-muted-foreground mt-2">Date of birth</div>
              <div>Not provided</div>
              <div className="text-muted-foreground mt-2">Accessibility needs</div>
              <div>Not provided</div>
            </div>
            <div>
              <div className="text-muted-foreground">Bio</div>
              <div>Not provided</div>
              <div className="text-muted-foreground mt-2">Gender</div>
              <div>Not provided</div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-lg">Contact</span>
            <ContactInfoDialog open={contactOpen} setOpen={setContactOpen} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Mobile number</div>
              <div>Not provided</div>
              <div className="text-muted-foreground mt-2">Emergency contact</div>
              <div>Not provided</div>
            </div>
            <div>
              <div className="text-muted-foreground">Email</div>
              <div>devidjond45@gmail.com</div>
              <div className="text-muted-foreground mt-2">Address</div>
              <div>Not provided</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="font-semibold text-lg mb-2">More details</div>
          <div className="flex flex-col gap-3">
            <Card className="p-4 flex flex-row items-center gap-3 cursor-pointer hover:shadow-md transition-shadow group">
              <FileText className="w-5 h-5 text-muted-foreground mr-2" />
              <div className="flex-1">
                <div className="font-semibold">Travel documents</div>
                <div className="text-xs text-muted-foreground">Passport</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Card>
          </div>
        </div>
        <div className="w-full md:w-80">
          <div className="font-semibold text-lg mb-2">Additional travelers</div>
          <div className="text-sm text-muted-foreground mb-4">Make booking a breeze by saving profiles of family, friends, or teammates who often travel with you.</div>
          <Button variant="outline" className="w-full">Add additional traveler</Button>
        </div>
      </div>
    </Card>
  );
} 