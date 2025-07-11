"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

function Faq() {
  const [activeTab, setActiveTab] = useState("Homestays");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const faqs = {
    Homestays: [
      {
        question: "Can I work with you if I’m already with other OTAs?",
        answer:
          "Yes, you can partner with us alongside other OTAs. Many hosts distribute their properties across multiple platforms seamlessly.",
      },
      {
        question: "Do I need to sign up for each of your brands separately?",
        answer:
          "No, a single sign-up gives you access to all our brands. Manage your listings across the entire network from one intuitive account.",
      },
      {
        question: "How do I manage my business with you?",
        answer:
          "Our Partner Central platform offers tools to manage rates, availability, content, and reservations, plus real-time performance insights.",
      },
      {
        question: "What is Homestay all about?",
        answer:
          "Homestay connects millions of travelers with unique accommodations through brands like Expedia, Hotels.com, and Vrbo, powered by cutting-edge travel technology.",
      },
    ],
    Reservations: [
      {
        question: "How do I receive bookings?",
        answer:
          "Bookings are managed via Partner Central, with instant notifications and detailed reservation information at your fingertips.",
      },
      {
        question: "Can I set my own cancellation policy?",
        answer:
          "Yes, you can customize cancellation policies to align with your business needs, offering flexibility and control.",
      },
      {
        question: "What happens if a guest cancels?",
        answer:
          "Cancellations follow your set policies, with automated notifications sent to you and the guest via Partner Central.",
      },
    ],
    Payments: [
      {
        question: "How do I get paid?",
        answer:
          "Secure payments are processed through our platform, with flexible payout options to your bank account based on your preferred schedule.",
      },
      {
        question: "Are there any fees?",
        answer:
          "We use a transparent commission-based fee structure for confirmed bookings, detailed in your partnership agreement.",
      },
      {
        question: "When do I get paid?",
        answer:
          "Payouts are typically processed shortly after guest check-out, depending on your location and preferences.",
      },
    ],
  };

  const toggleFAQ = (question: string) => {
    setOpenFAQ(openFAQ === question ? null : question);
  };

  const handleListPropertyClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Animation variants with explicit type
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } // Use cubic-bezier for easeOut
    },
  };

  const faqVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }, // Use cubic-bezier for easeOut
    }),
  };

  return (
    <>
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} // Use cubic-bezier for easeOut
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary mb-8"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="flex justify-center mb-12 space-x-4 sm:space-x-6">
            {Object.keys(faqs).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`text-base sm:text-lg font-semibold py-2 px-4 rounded-full transition-colors duration-300 ${
                  activeTab === tab
                    ? "bg-primary text-white"
                    : "bg-white text-primary border border-primary/20 hover:bg-primary/10"
                }`}
                aria-pressed={activeTab === tab}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs[activeTab as keyof typeof faqs].map((item, index) => (
              <motion.div
                key={item.question}
                custom={index}
                variants={faqVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="bg-white rounded-xl shadow-md border border-gray-200/50 overflow-hidden"
              >
                <button
                  className="flex justify-between items-center w-full p-5 text-left text-lg font-semibold text-gray-900 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onClick={() => toggleFAQ(item.question)}
                  aria-expanded={openFAQ === item.question}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary transition-transform duration-300 ${
                      openFAQ === item.question ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFAQ === item.question && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }} // Use cubic-bezier for easeOut
                      id={`faq-answer-${index}`}
                      className="px-5 pb-5 pt-2 text-gray-600 text-base leading-relaxed"
                    >
                      {item.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="bg-primary/5 py-16 text-center"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} // Use cubic-bezier for easeOut
            className="text-3xl sm:text-4xl font-extrabold text-primary mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }} // Use cubic-bezier for easeOut
            className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Join us today and connect with high-value guests worldwide.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-colors duration-300"
            onClick={handleListPropertyClick}
          >
            List Your Property
          </motion.button>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }} // Use cubic-bezier for easeOut
            className="mt-6 text-sm sm:text-base text-gray-600"
          >
            Already a partner with Nepal Homestays?{" "}
            <a href="/login" className="text-primary hover:underline">
              Log in here
            </a>.
          </motion.p>
        </div>
      </motion.section>
    </>
  );
}

export default Faq;