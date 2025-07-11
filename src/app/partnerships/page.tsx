"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, Globe, LineChart, Briefcase, Store, Users } from "lucide-react";
import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Image from "next/image";

const benefits = [
  {
    icon: <Globe className="w-6 h-6 mb-2 text-primary" />,
    title: "Reach a Global Audience",
    desc: "Connect with a diverse community of travelers seeking unique experiences in Nepal.",
  },
  {
    icon: <LineChart className="w-6 h-6 mb-2 text-primary" />,
    title: "Increase Your Visibility",
    desc: "Gain exposure through our platform and marketing channels, reaching a wider customer base.",
  },
  {
    icon: <DollarSign className="w-6 h-6 mb-2 text-primary" />,
    title: "Grow Your Revenue",
    desc: "Benefit from a mutually beneficial partnership that drives growth and revenue for both parties.",
  },
];

const models = [
  {
    icon: <Briefcase className="w-6 h-6 mb-2 text-primary" />,
    title: "Travel Agencies",
    desc: "Integrate Homestay into your travel packages and offer your clients unique homestay options in Nepal.",
  },
  {
    icon: <Store className="w-6 h-6 mb-2 text-primary" />,
    title: "Local Businesses",
    desc: "Promote your products or services to our community of travelers and collaborate on joint initiatives.",
  },
  {
    icon: <Users className="w-6 h-6 mb-2 text-primary" />,
    title: "Organizations",
    desc: "Partner with us on projects that support sustainable tourism and community development in Nepal.",
  },
];

const stories = [
  {
    quote: `Partnering with Homestay has been a game-changer for our agency. We have seen a significant increase in bookings and positive feedback from clients.`,
    author: "Himalayan Treks & Tours",
  },
  {
    quote: `Our collaboration with Homestay has allowed us to reach a new audience and showcase our products to travelers interested in authentic experiences.`,
    author: "Nepal Handicrafts",
  },
  {
    quote: `Working with Homestay has helped us achieve our mission of supporting local communities and promoting sustainable tourism in Nepal.`,
    author: "Community Development Initiative",
  },
];

const PartnershipPage = () => {
  const router = useRouter();

  return (
    <>
      <div className="min-h-screen bg-background font-manrope">
        <Head>
          <title>Partnerships | Nepal Homestays</title>
          <meta
            name="description"
            content="Partner with Nepal Homestays to connect travelers with authentic experiences, increase visibility, and support sustainable tourism."
          />
          <meta name="keywords" content="Nepal, homestays, partnerships, travel agencies, sustainable tourism" />
          <meta name="robots" content="index, follow" />
          <meta property="og:title" content="Partnerships | Nepal Homestays" />
          <meta
            property="og:description"
            content="Join us to create unforgettable journeys and support local communities in Nepal."
          />
          <meta property="og:image" content="/images/partnership.avif" />
          <meta property="og:url" content="https://nepalhomestays.com/partnerships" />
          <meta property="og:type" content="website" />
        </Head>
        <Navbar />

        {/* Hero Section */}
        <section className="relative w-full h-56 sm:h-72 md:h-96 lg:h-[32rem] overflow-hidden mt-20 mb-12">
          <Image
            src="/images/partnership.avif"
            alt="Partner with Nepal Homestays"
            fill
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
            priority
            sizes="100vw"
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
            <div className="text-center px-4 sm:px-6 md:px-8 max-w-4xl animate-fade-in">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 drop-shadow-xl leading-tight">
                Partner with Nepal Homestays
              </h1>
              <p className="text-base sm:text-lg text-white mb-6 drop-shadow-lg leading-relaxed">
                Join us to connect travelers with authentic homestay experiences, promote sustainable tourism, and empower local communities in Nepal.
              </p>
              <Button
                className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 text-lg rounded-full transition-transform hover:scale-105 focus:ring-2 focus:ring-primary"
                onClick={() => router.push("/contact-support")}
                aria-label="Contact us to learn more about partnerships"
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Why Partner */}
          <section className="mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Why Partner with Us?
            </h2>
            <p className="text-base sm:text-lg text-text-secondary mb-8 leading-relaxed max-w-3xl">
              Partnering with Nepal Homestays connects you with a global audience, boosts your visibility, and drives revenue growth while supporting sustainable tourism and community development.
            </p>
            <hr className="border-border mb-8" />
          </section>

          {/* Benefits */}
          <section className="mb-16 animate-fade-in">
            <h3 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
              Benefits of Partnership
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <Card
                  key={idx}
                  className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start animate-fade-in"
                  role="article"
                  aria-label={benefit.title}
                >
                  {benefit.icon}
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {benefit.desc}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* Partnership Models */}
          <section className="mb-16 animate-fade-in">
            <h3 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
              Partnership Models
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model, idx) => (
                <Card
                  key={idx}
                  className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start animate-fade-in"
                  role="article"
                  aria-label={model.title}
                >
                  {model.icon}
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    {model.title}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {model.desc}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* Success Stories */}
          <section className="mb-16 animate-fade-in">
            <h3 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
              Success Stories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story, idx) => (
                <Card
                  key={idx}
                  className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col animate-fade-in"
                  role="article"
                  aria-label={`Success story by ${story.author}`}
                >
                  <p className="text-sm text-text-primary mb-4 italic leading-relaxed">
                    {story.quote}
                  </p>
                  <p className="text-xs font-semibold text-text-secondary mt-auto">
                    — {story.author}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* Get Started */}
          <section className="text-center mb-16 animate-fade-in">
            <h3 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
              Ready to Partner?
            </h3>
            <p className="text-base sm:text-lg text-text-secondary mb-6 max-w-2xl mx-auto leading-relaxed">
              Collaborate with us to create unforgettable experiences and support Nepal’s local communities. Contact us today to explore partnership opportunities.
            </p>
            <Button
              onClick={() => router.push("/contact-support")}
              className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 text-lg rounded-full transition-transform hover:scale-105 focus:ring-2 focus:ring-primary"
              aria-label="Contact us to start a partnership"
            >
              Get Started
            </Button>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PartnershipPage;