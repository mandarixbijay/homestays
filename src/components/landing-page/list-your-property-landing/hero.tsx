"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function Hero() {
  const router = useRouter();

  const handleHomestayCardClick = () => {
    router.push("/list-your-property/owner-registration");
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1], // Smooth ease-in-out
      },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.4 },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const buttonVariants: Variants = {
    hover: { scale: 1.1, backgroundColor: "#d97706" }, // Vibrant hover color
    tap: { scale: 0.95 },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="relative min-h-[80vh] pt-16 overflow-hidden bg-gradient-to-b from-gray-50/50 to-white/50"
    >
      {/* Background Image with Refined Curved Clip Path */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ scale: 1.2, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%)", // Smoother curve
          }}
        >
          <Image
            src="/images/list_property.avif"
            alt="Authentic Nepal Homestay Background"
            fill
            style={{ objectFit: "cover" }}
            quality={90}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" /> {/* Gradient overlay */}
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-12 py-16">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            {/* Left Section: Text Content */}
            <motion.div
              className="space-y-8 text-center lg:text-left"
              variants={textVariants}
            >
              <motion.h1
                variants={textVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-xl tracking-tight leading-tight"
              >
                Discover <span className="text-amber-400">Authentic Nepal</span>
              </motion.h1>
              <motion.p
                variants={textVariants}
                className="text-lg sm:text-xl text-gray-100 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              >
                Immerse yourself in the heart of Nepali culture with unique homestay experiences.
              </motion.p>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="inline-block px-8 py-4 bg-amber-500 text-white font-semibold rounded-full shadow-xl hover:bg-amber-600 transition-colors duration-300"
                onClick={handleHomestayCardClick}
                aria-label="Start your journey with Nepal Homestays"
              >
                Start Your Journey
              </motion.button>
            </motion.div>

            {/* Right Section: Card */}
            <motion.div
              className="backdrop-blur-xl bg-white/90 rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md mx-auto w-full border border-gray-200/20"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="flex justify-center mb-8">
                <Image
                  src="/images/logo/logo.png"
                  alt="Homestay Nepal Logo"
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                List Your Homestay
              </h2>
              <motion.div
                variants={cardVariants}
                onClick={handleHomestayCardClick}
                className="cursor-pointer"
                role="button"
                aria-label="List your homestay"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleHomestayCardClick()}
              >
                <Card className="border-2 border-amber-500 hover:border-amber-600 transition-all duration-300 group hover:shadow-lg rounded-2xl overflow-hidden bg-white/95">
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 group-hover:text-amber-700 group-hover:bg-amber-200 transition-all duration-300">
                        <Home className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Homestay
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Share your space and create unforgettable experiences for travelers!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default Hero;