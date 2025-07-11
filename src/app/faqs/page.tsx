"use client"
import React from "react";
import { Collapse } from "@/components/ui/Collapse";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

const faqSections = [
    {
        title: "General",
        questions: [
            {
                question: "What is Homestay?",
                description: "Homestay is a platform that connects travelers with unique homestay experiences in Nepal, offering authentic stays and supporting local communities.",
            },
            {
                question: "How do I create an account?",
                description: "To create an account, click on the 'Sign Up' button at the top right, fill in your details, and follow the instructions to verify your email.",
            },
            {
                question: "Is Homestay available in my area?",
                description: "Homestay is expanding across Nepal. You can search for available homestays in your area using our search feature on the homepage.",
            },
        ],
    },
    {
        title: "Booking",
        questions: [
            {
                question: "How do I book a stay?",
                description: "Browse available homestays, select your preferred dates, and click 'Book Now'. Follow the prompts to complete your reservation.",
            },
            {
                question: "Can I cancel my booking?",
                description: "Yes, you can cancel your booking from your account dashboard. Please review the cancellation policy for details on refunds.",
            },
            {
                question: "What payment methods are accepted?",
                description: "We accept major credit/debit cards, e-wallets, and other secure payment methods as shown during checkout.",
            },
        ],
    },
    {
        title: "Hosting",
        questions: [
            {
                question: "How do I become a host?",
                description: "Click on 'Become a Host', fill out the registration form, and submit your property details for review.",
            },
            {
                question: "What are the hosting requirements?",
                description: "Hosts must provide a safe, clean, and comfortable environment, and comply with local regulations. See our Host Guidelines for more info.",
            },
            {
                question: "How do I set my pricing and availability?",
                description: "You can manage your pricing and availability from your host dashboard after your property is approved.",
            },
        ],
    },
    {
        title: "Safety and Support",
        questions: [
            {
                question: "What safety measures are in place?",
                description: "We verify hosts and properties, and provide safety resources for both guests and hosts. Please review our Safety page for more details.",
            },
            {
                question: "How do I contact support?",
                description: "You can reach our support team via the 'Contact Support' page or by emailing support@Homestay.com.",
            },
            {
                question: "What if I have an issue during my stay?",
                description: "If you encounter any issues, contact us immediately through your account or our support channels. We're here to help!",
            },
        ],
    },
];

const FaqPage = () => {
    return (
        <><div className="max-w-3xl mx-auto py-10 px-4">
            <Navbar />
            <h1 className="text-3xl font-bold mb-2 mt-20">Frequently asked questions</h1>
            <p className="text-muted-foreground mb-8">
                Find answers to common questions about Homestay, whether you&apos;re a guest or a host.
            </p>
            {faqSections.map((section) => (
                <div key={section.title} className="mb-8">
                    <h2 className="text-xl font-bold mb-2">{section.title}</h2>
                    <div className="space-y-2">
                        {section.questions.map((q) => (
                            <Collapse key={q.question} title={q.question} className="mb-2">
                                {q.description}
                            </Collapse>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <Footer />
        
     
            
            </>
    );
};

export default FaqPage;
