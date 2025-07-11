import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
        { label: "Room", value: 80 },
        { label: "Taxes & Fees", value: 30 },
      ],
      paidOn: "2024-05-20",
      last4: "4242",
    },
  },
  {
    id: "BKG654321",
    property: "Chitlang Homestay",
    date: "2024-05-15",
    nights: 2,
    guests: 1,
    amount: 140,
    status: "Pending",
    payment: {
      method: "PayPal",
      transactionId: "TXN123456789",
      breakdown: [
        { label: "Room", value: 10 },
        { label: "Taxes & Fees", value: 20 },
      ],
      paidOn: "2024-05-01",
      last4: null,
    },
  },
  {
    id: "BKG999999",
    property: "Homesatys Inn",
    date: "2024-04-10",
    nights: 1,
    guests: 2,
    amount: 90,
    status: "Non-paid",
    payment: {
      method: "Credit Card",
      transactionId: "TXN555555555",
      breakdown: [
        { label: "Room", value: 20 },
        { label: "Taxes & Fees", value: 10 },
      ],
      paidOn: "2024-04-01",
      last4: "1234",
    },
  },
];

function getStatusClasses(status: string) {
  if (status === "Paid") return "bg-green-100 text-green-700";
  if (status === "Non-paid") return "bg-red-100 text-red-700";
  if (status === "Pending") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-700";
}

export default function BookingHistory() {
  return (
    <Card className="flex-1 p-4 md:p-8 w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Booking & Payment History</h2>
      </div>
      <Accordion type="single" collapsible className="w-full space-y-4">
        {bookings.map((booking) => (
          <AccordionItem value={booking.id} key={booking.id} className="border rounded-lg">
            <AccordionTrigger className="flex flex-row items-center justify-between px-4 py-3">
              <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                <div className="font-semibold text-base md:w-1/3 truncate">{booking.property}</div>
                <div className="text-sm text-muted-foreground md:w-1/4">{booking.date} • {booking.nights} nights • {booking.guests} guest{booking.guests > 1 ? "s" : ""}</div>
                <div className="font-semibold text-primary md:w-1/6">${booking.amount}</div>
                <div className={`text-xs md:w-1/6`}>
                  <span className={`inline-block px-2 py-1 rounded ${getStatusClasses(booking.status)}`}>{booking.status}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-muted/50 px-6 py-4">
              <div className="mb-2 font-semibold">Payment Details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm"><span className="font-medium">Method:</span> {booking.payment.method}{booking.payment.last4 && ` • **** ${booking.payment.last4}`}</div>
                  <div className="text-sm"><span className="font-medium">Transaction ID:</span> {booking.payment.transactionId}</div>
                  <div className="text-sm"><span className="font-medium">Paid on:</span> {booking.payment.paidOn}</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Breakdown:</div>
                  <ul className="text-sm space-y-1">
                    {booking.payment.breakdown.map((item, idx) => (
                      <li key={idx} className="flex justify-between"><span>{item.label}</span><span>${item.value}</span></li>
                    ))}
                  </ul>
                  <div className="font-semibold mt-2 flex justify-between border-t pt-2"><span>Total</span><span>${booking.amount}</span></div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
} 