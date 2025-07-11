import React from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { List, Search, X, Check } from "lucide-react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

const steps = [
    {
        icon: <List className="w-6 h-6 text-muted-foreground" />,
        title: "1. Access Your Bookings",
        description: "Go to your profile and select 'Trips'.",
    },
    {
        icon: <Search className="w-6 h-6 text-muted-foreground" />,
        title: "2. Locate Your Booking",
        description: "Find the booking you wish to cancel and click 'View Details'.",
    },
    {
        icon: <X className="w-6 h-6 text-muted-foreground" />,
        title: "3. Initiate Cancellation",
        description: "Click the 'Cancel Booking' button and follow the on-screen instructions.",
    },
    {
        icon: <Check className="w-6 h-6 text-muted-foreground" />,
        title: "4. Confirm Cancellation",
        description: "Review the cancellation policy and confirm your cancellation.",
    },
];

const faqs = [
    {
        question: "What is the cancellation fee?",
        answer:
            "The cancellation fee depends on the homestay's policy and the timing of your cancellation. Please refer to your booking details for specific information.",
    },
    {
        question: "How will I receive my refund?",
        answer:
            "Refunds are processed according to the payment method used during booking. Please allow a few business days for the refund to appear in your account.",
    },
    {
        question: "Can I modify my booking instead of canceling?",
        answer:
            "In many cases, you can modify your booking instead of canceling. Please check your booking details or contact support for assistance.",
    },
];

const CancellationOption = () => {
    return (
        <>
            <div className="max-w-3xl mx-auto py-10 px-4">
                <Navbar />
                <h1 className="text-3xl font-bold mb-2 mt-20">Cancellation Options</h1>
                <p className="text-muted-foreground mb-8">
                    Learn about our cancellation policies and how to cancel your booking.
                </p>

                <h2 className="text-xl font-bold mb-2">Cancellation Policy</h2>
                <p className="mb-8">
                    Our cancellation policy varies depending on the homestay and the time of cancellation. Please review the specific cancellation policy for your booking, which can be found in your booking confirmation email or on the homestays listing page. Generally, cancellations made within a certain period before the check-in date may be subject to a cancellation fee. Cancellations made closer to the check-in date may result in a higher fee or forfeiture of the entire booking amount.
                </p>

                <h2 className="text-xl font-bold mb-2">How to Cancel Your Booking</h2>
                <p className="mb-4">
                    To cancel your booking, please follow these steps:
                </p>
                <div className="space-y-3 mb-10">
                    {steps.map((step, idx) => (
                        <Card key={idx} className="flex items-start gap-4 p-4">
                            <div className="mt-1">{step.icon}</div>
                            <div>
                                <div className="font-semibold">{step.title}</div>
                                <div className="text-muted-foreground text-sm">{step.description}</div>
                            </div>
                        </Card>
                    ))}
                </div>

                <h2 className="text-xl font-bold mb-2">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, idx) => (
                        <AccordionItem value={`faq-${idx}`} key={idx}>
                            <AccordionTrigger className="text-base font-semibold">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <Footer />

        </>

    );
};

export default CancellationOption;
