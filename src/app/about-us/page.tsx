"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Button } from "@/components/ui/button";
import { Leaf, Users, Sparkles, Home, Heart, MapPin } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Data
const values = [
  { icon: <Leaf className="w-6 h-6 text-primary" />, title: "Sustainability", desc: "Minimizing environmental impact through eco-friendly homestays." },
  { icon: <Users className="w-6 h-6 text-primary" />, title: "Community", desc: "Empowering local communities with economic and cultural opportunities." },
  { icon: <Sparkles className="w-6 h-6 text-primary" />, title: "Authenticity", desc: "Offering genuine experiences to connect with Nepal’s essence." },
];

const culturalHighlights = [
  { title: "Dashain Festival", desc: "Join vibrant Dashain celebrations with local families.", image: "/images/culture/dashain.jpg" },
  { title: "Traditional Cuisine", desc: "Enjoy authentic Nepali dishes like Dal Bhat and Momos.", image: "/images/culture/cuisine.jpg" },
  { title: "Local Crafts", desc: "Learn traditional weaving and pottery from artisans.", image: "/images/culture/crafts.jpg" },
];

const missionImages = [
  { src: "/images/mission/community.jpg", alt: "Community engagement" },
  { src: "/images/mission/homestay.jpg", alt: "Traditional homestay" },
  { src: "/images/mission/culture.jpg", alt: "Nepali culture" },
];

const stats = [
  { icon: <Home className="w-6 h-6 text-primary" />, value: "50+", label: "Homestays" },
  { icon: <Users className="w-6 h-6 text-primary" />, value: "1000+", label: "Travelers Hosted" },
  { icon: <Heart className="w-6 h-6 text-primary" />, value: "20+", label: "Communities Supported" },
];

const AboutUsPage = () => {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50">
        {/* Hero Section */}
        <section className="relative h-[50vh] overflow-hidden">
          <Image
            src="/images/carousel/carousel-01.webp"
            alt="Discover Nepal Homestays"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onError={(e) => (e.currentTarget.src = "/images/fallback-image.png")}
            placeholder="blur"
            blurDataURL="/images/fallback-image.png"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">Discover Nepal Homestays</h1>
              <p className="text-white/90 text-sm md:text-base mb-6">
                Experience authentic Nepali hospitality through immersive homestays.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="bg-white text-primary hover:bg-gray-100 text-sm px-4 py-2">
                  <Link href="/search">Book Now</Link>
                </Button>
                <Button asChild className="bg-yellow-400 text-primary hover:bg-yellow-500 text-sm px-4 py-2">
                  <Link href="/deals">View Deals</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <Carousel className="w-full max-w-md mx-auto">
                <CarouselContent>
                  {missionImages.map((img, i) => (
                    <CarouselItem key={i}>
                      <div className="relative h-64 w-full">
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="/images/fallback-image.png"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/90 transition-colors"
                  aria-label="Previous mission image"
                />
                <CarouselNext
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/90 transition-colors"
                  aria-label="Next mission image"
                />
              </Carousel>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">Our Mission</h2>
              <p className="text-gray-600 text-sm md:text-base">
                We promote sustainable tourism that uplifts local communities and offers authentic Nepali experiences.
              </p>
              <blockquote className="italic text-gray-500 text-sm md:text-base border-l-4 border-primary pl-3">
                &ldquo;Connecting hearts through authentic Nepali hospitality.&rdquo;
              </blockquote>

              <div className="flex gap-3">
                <Button
                  asChild
                  className="bg-primary text-white hover:bg-primary/90 text-sm px-4 py-2 rounded-md"
                >
                  <Link href="/partnerships">Our Vision</Link>
                </Button>
                <Button
                  asChild
                  className="border border-primary text-white hover:bg-primary/10 text-sm px-4 py-2 rounded-md"
                >
                  <Link href="/blogs">Read More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg text-center flex flex-col items-center"
              >
                <div className="flex justify-center mb-4">{v.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800">{v.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cultural Highlights */}
        <section className="max-w-6xl mx-auto px-4 py-12 md:py-16 bg-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8">Nepal’s Culture</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {culturalHighlights.map((highlight, i) => (
                <CarouselItem key={i} className="basis-full sm:basis-1/2 md:basis-1/3 p-2">
                  <div className="bg-white rounded-lg p-4 flex flex-col h-[360px]">
                    <div className="relative h-48 mb-4">
                      <Image
                        src={highlight.image}
                        alt={highlight.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="/images/fallback-image.png"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{highlight.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{highlight.desc}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>

        {/* Impact Stats */}
        <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <h3 className="text-2xl font-bold text-primary">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary text-white text-center py-12 md:py-16">
          <MapPin className="w-8 h-8 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Experience Nepal?</h2>
          <p className="text-white/90 text-sm md:text-base mb-6 max-w-md mx-auto">
            Discover authentic homestays that connect you with Nepal’s heart.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild className="bg-white text-primary hover:bg-gray-100 text-sm px-4 py-2">
              <Link href="/search">Book a Homestay</Link>
            </Button>
            <Button asChild className="bg-yellow-400 text-primary hover:bg-yellow-500 text-sm px-4 py-2">
              <Link href="/contact-support">Contact Us</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AboutUsPage;