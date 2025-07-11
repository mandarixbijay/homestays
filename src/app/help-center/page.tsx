"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Collapse } from "@/components/ui/Collapse";
import { useRouter } from "next/navigation";

const primaryColor = "text-primary";

const articles = [
    {
        icon: (
            <svg className={primaryColor} width="28" height="28" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        title: "Getting started",
        desc: "Learn how to get started",
    },
    {
        icon: (
            <svg className={primaryColor} width="28" height="28" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M4 20v-1a4 4 0 014-4h8a4 4 0 014 4v1" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        title: "Account",
        desc: "Manage your account",
    },
    {
        icon: (
            <svg className={primaryColor} width="28" height="28" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M8 12h8M8 16h8M8 8h8" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        title: "Payments",
        desc: "Learn about payments",
    },
    {
        icon: (
            <svg className={primaryColor} width="28" height="28" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        title: "Trust and safety",
        desc: "Learn about trust and safety",
    },
    {
        icon: (
            <svg className={primaryColor} width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path d="M21 21l-6-6M3 11a8 8 0 1116 0 8 8 0 01-16 0z" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        title: "Traveling",
        desc: "Learn about traveling",
    },
    {
        icon: (
            <svg className={primaryColor} width="28" height="28" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 16h.01M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        title: "General",
        desc: "Learn about general topics",
    },
];

const faqs = [
    {
        q: "How do I book a homestay?",
        a: "To book a homestay, search for your destination, select your dates, and follow the booking instructions on the property page.",
    },
    {
        q: "What is the cancellation policy?",
        a: "Cancellation policies vary by property. Please check the policy on the homestay's page before booking.",
    },
    {
        q: "How do I contact the host?",
        a: "You can contact the host through the messaging feature on the property page after booking.",
    },
    {
        q: "What payment methods are accepted?",
        a: "We accept major credit cards, eSewa, Khalti, and other local payment methods.",
    },
    {
        q: "How do I leave a review?",
        a: "After your stay, you will receive an email with a link to leave a review.",
    },
];

const HelpCenterPage = () => {
    const route = useRouter();
    return (
        <>
            <div className="max-w-5xl mx-auto py-12 px-4 mt-20">
                <Navbar />
                <h1 className="text-3xl font-bold mb-6">How can we help?</h1>
                <div className="mb-10">
                    <input
                        type="text"
                        placeholder="Search for help"
                        className="w-full rounded-lg bg-primary/10 px-4 py-3 outline-none" />
                </div>

                <h2 className="text-xl font-semibold mb-4">Popular articles</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                    {articles.map((art, idx) => (
                        <div
                            key={idx}
                            className="border rounded-lg p-4 flex flex-col items-start bg-white hover:shadow cursor-pointer"
                        >
                            {art.icon}
                            <div className="mt-2 font-bold">{art.title}</div>
                            <div className="text-sm text-muted-foreground">{art.desc}</div>
                        </div>
                    ))}
                </div>

                <h2 className="text-xl font-semibold mb-4">Frequently asked questions</h2>
                <div className="space-y-2 mb-10">
                    {faqs.map((faq, idx) => (
                        <Collapse key={idx} title={faq.q}>
                            <div className="text-muted-foreground">{faq.a}</div>
                        </Collapse>
                    ))}
                </div>

                <div className="flex flex-col items-center text-center mb-10">
                    <h3 className="text-xl font-bold mb-2 ">Get Started</h3>
                    <p className="mb-4 max-w-xl">
                        Still need help? Contact us for personalized assistance.
                    </p>
                    <Button onClick={() => {
                        route.push('/get-in-touch')
                    }} className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-2 text-lg rounded-full">
                        Contact Us
                    </Button>
                </div>

            </div>
            <Footer />

        </>
    );
};

export default HelpCenterPage;
