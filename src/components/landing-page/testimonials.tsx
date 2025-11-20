"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
  homestay: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    location: "United States",
    avatar: "/images/avatars/avatar1.jpg",
    rating: 5,
    comment: "Staying at the Sitapaila Homestay was an unforgettable experience! The family made us feel right at home, and the traditional meals were absolutely delicious. Highly recommend!",
    homestay: "Sitapaila Homestay",
    date: "March 2025",
  },
  {
    id: 2,
    name: "James Anderson",
    location: "United Kingdom",
    avatar: "/images/avatars/avatar2.jpg",
    rating: 5,
    comment: "The Tibetan Homestay in Pokhara exceeded all expectations. Stunning mountain views, warm hospitality, and authentic local cuisine. A truly magical experience!",
    homestay: "Tibetan Homestay",
    date: "February 2025",
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    location: "Spain",
    avatar: "/images/avatars/avatar3.jpg",
    rating: 5,
    comment: "Best decision ever! The homestay in Bhaktapur gave us an authentic glimpse into Nepalese culture. The hosts were incredibly kind and welcoming.",
    homestay: "Bhaktapur Heritage Home",
    date: "January 2025",
  },
  {
    id: 4,
    name: "David Chen",
    location: "Australia",
    avatar: "/images/avatars/avatar4.jpg",
    rating: 5,
    comment: "Absolutely wonderful experience at Dorje Homestay! The family treated us like their own. Great location, clean rooms, and amazing food. Will definitely return!",
    homestay: "Dorje Homestay",
    date: "December 2024",
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export default function Testimonials() {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const testimonialIndex = ((page % testimonials.length) + testimonials.length) % testimonials.length;

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  }, [page]);

  // Auto-advance testimonials
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        paginate(1);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [page, isPaused, paginate]);

  const currentTestimonial = testimonials[testimonialIndex];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="w-full py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-muted/30 to-background overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Guest Experiences
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover what our guests have to say about their authentic homestay experiences in Nepal
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full"
              >
                <div className="bg-card rounded-3xl shadow-lg border border-border p-8 sm:p-12 md:p-16 relative">
                  {/* Quote Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="absolute top-6 left-6 sm:top-8 sm:left-8"
                  >
                    <Quote className="w-12 h-12 sm:w-16 sm:h-16 text-primary/20" />
                  </motion.div>

                  <div className="flex flex-col items-center text-center relative z-10">
                    {/* Rating Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.1 * i, type: "spring" }}
                        >
                          <Star className="w-6 h-6 fill-accent text-accent" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-lg sm:text-xl md:text-2xl text-card-foreground font-medium leading-relaxed mb-8 max-w-3xl">
                      "{currentTestimonial.comment}"
                    </p>

                    {/* Guest Info */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/10">
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">
                            {currentTestimonial.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-card-foreground">
                          {currentTestimonial.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {currentTestimonial.location}
                        </p>
                        <p className="text-xs text-accent font-medium mt-1">
                          Stayed at {currentTestimonial.homestay}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {currentTestimonial.date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(-1)}
              className="w-12 h-12 rounded-full bg-card border-2 border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-card-foreground" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newDirection = index > testimonialIndex ? 1 : -1;
                    setPage([index, newDirection]);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === testimonialIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted hover:bg-muted-foreground/20"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(1)}
              className="w-12 h-12 rounded-full bg-card border-2 border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-card-foreground" />
            </motion.button>
          </div>

          {/* Trust Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">500+</div>
              <div className="text-sm sm:text-base text-muted-foreground mt-1">
                Happy Guests
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">4.9</div>
              <div className="text-sm sm:text-base text-muted-foreground mt-1">
                Average Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary">98%</div>
              <div className="text-sm sm:text-base text-muted-foreground mt-1">
                Would Recommend
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
