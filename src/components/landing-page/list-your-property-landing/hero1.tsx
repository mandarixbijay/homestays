"use client";

import React from "react";
import { Globe, Users, TrendingUp } from "lucide-react";
import { motion, Variants } from "framer-motion";

function Hero1() {
  // Animation variants for cards with explicit type
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.2, ease: [0.25, 0.1, 0.25, 1] }, // Use cubic-bezier for easeOut
    }),
    hover: { scale: 1.05, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }, // Use cubic-bezier for easeOut
  };

  // Data for cards to reduce repetition
  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Access a world of travelers",
      description:
        "From long-range planners to last-minute bookers, bring travelers to your door from around the world.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Attract your ideal guests",
      description:
        "Book your ideal guests—travelers who delight in what you provide and want to return again and again.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Grow your business",
      description:
        "Make decisions based on real-time data, be more competitive & help increase visibility and bookings.",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }} // Use cubic-bezier for easeOut
      className="py-16 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }} // Use cubic-bezier for easeOut
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary mb-4"
        >
          Connect with the Right Guests
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }} // Use cubic-bezier for easeOut
          className="text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
        >
          Reach millions of travelers whose purpose, taste, and budget make your property their perfect stay.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200/50"
              role="article"
              aria-labelledby={`feature-title-${index}`}
            >
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3
                id={`feature-title-${index}`}
                className="text-xl font-semibold text-gray-900 mb-2"
              >
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default Hero1;