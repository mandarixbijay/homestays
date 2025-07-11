"use client";
import React from "react";
import Image from "next/image";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Leaf,
    Users,
    Sparkles,
    Star,
    ThumbsUp,
    MessageCircle,
    UserCircle2,
    Home,
    Heart,
    MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Values data
const values = [
    {
        icon: <Leaf className="w-8 h-8 mb-4 text-accent" />, // Changed to accent for highlight
        title: "Sustainability",
        desc: "We are committed to minimizing our environmental impact and supporting eco-friendly practices in our homestays.",
    },
    {
        icon: <Users className="w-8 h-8 mb-4 text-primary" />, // Changed to primary
        title: "Community",
        desc: "We work closely with local communities to ensure that our homestays provide economic opportunities and cultural preservation.",
    },
    {
        icon: <Sparkles className="w-8 h-8 mb-4 text-accent" />, // Changed to accent
        title: "Authenticity",
        desc: "We believe in providing genuine experiences that allow travelers to connect with the heart and soul of Nepal.",
    },
];

// Team data
const team = [
    {
        name: "Priya Sharma",
        role: "Co-founder & CEO",
        icon: <UserCircle2 className="w-24 h-24 sm:w-28 sm:h-28 text-primary/80" />,
    },
    {
        name: "Rohan Thapa",
        role: "Co-founder & Operations",
        icon: <UserCircle2 className="w-24 h-24 sm:w-28 sm:h-28 text-primary/80" />,
    },
    {
        name: "Anjali Gurung",
        role: "Community Manager",
        icon: <UserCircle2 className="w-24 h-24 sm:w-28 sm:h-28 text-primary/80" />,
    },
];

// Reviews data
const reviews = [
    {
        name: "Ethan Carter",
        date: "May 15, 2023",
        icon: <UserCircle2 className="w-12 h-12 text-muted-foreground" />,
        stars: 5,
        review:
            "My stay with the Rai family in the Solukhumbu region was an unforgettable experience. The warmth and hospitality I received were beyond anything I could have imagined.",
        likes: 12,
        comments: 1,
    },
    {
        name: "Olivia Bennett",
        date: "April 22, 2023",
        icon: <UserCircle2 className="w-12 h-12 text-muted-foreground" />,
        stars: 5,
        review:
            "Staying with the Tamang family in the Langtang Valley was the highlight of my trip to Nepal. The views were breathtaking, and the family made me feel like one of their own.",
        likes: 8,
        comments: 0,
    },
];

// Cultural Highlights for Carousel
const culturalHighlights = [
    {
        title: "Dashain Festival",
        desc: "Experience the vibrant Dashain festival with local families, filled with blessings, feasts, and cultural rituals.",
        image: "/images/culture/dashain.jpg",
    },
    {
        title: "Traditional Cuisine",
        desc: "Savor authentic Nepali dishes like Dal Bhat and Momos, prepared with love by homestay hosts.",
        image: "/images/culture/cuisine.jpg",
    },
    {
        title: "Local Crafts",
        desc: "Learn traditional crafts like weaving and pottery from skilled artisans in rural Nepal.",
        image: "/images/culture/crafts.jpg",
    },
];

// Mission Images for Carousel
const missionImages = [
    { src: "/images/mission/community.jpg", alt: "Community engagement" },
    { src: "/images/mission/homestay.jpg", alt: "Traditional homestay" },
    { src: "/images/mission/culture.jpg", alt: "Nepali culture" },
];

// Impact Stats
const stats = [
    { icon: <Home className="w-8 h-8 text-primary" />, value: "50+", label: "Homestays" },
    { icon: <Users className="w-8 h-8 text-primary" />, value: "1000+", label: "Travelers Hosted" },
    { icon: <Heart className="w-8 h-8 text-primary" />, value: "20+", label: "Communities Supported" },
];

const AboutUsPage = () => {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden"
                >
                    <motion.div
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src="/images/carousel/carousel-01.webp"
                            alt="Discover Homestay Nepal"
                            fill
                            className="object-cover object-center"
                            priority
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                            onError={(e) => (e.currentTarget.src = "/images/fallback-image.png")}
                            placeholder="blur"
                            blurDataURL="/images/fallback-image.png"
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-4xl mx-auto">
                            <motion.h2
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
                            >
                                Discover Homestay Nepal
                            </motion.h2>
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                                className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8"
                            >
                                Experience the heart of Nepal through authentic homestays, fostering cultural exchange and unforgettable memories.
                            </motion.p>
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
                            >
                                <Button
                                    className="bg-primary text-white hover:bg-primary/90 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    aria-label="Book your homestay"
                                >
                                    Book Your Stay
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-white text-primary hover:bg-white/20 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    aria-label="Discover more about Homestay Nepal"
                                >
                                    Discover More
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Mission Statement */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-muted">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col md:flex-row items-center gap-6 sm:gap-8"
                    >
                        <div className="w-full md:w-1/2">
                            <Carousel
                                className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto"
                                opts={{ align: "start", loop: true }}
                            >
                                <CarouselContent>
                                    {missionImages.map((img, i) => (
                                        <CarouselItem key={i}>
                                            <div className="relative h-48 sm:h-56 md:h-64 lg:h-80 w-full">
                                                <Image
                                                    src={img.src}
                                                    alt={img.alt}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                                    loading="lazy"
                                                    onError={(e) => (e.currentTarget.src = "/images/fallback-image.png")}
                                                    placeholder="blur"
                                                    blurDataURL="/images/fallback-image.png"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious aria-label="Previous mission image" className="hidden sm:flex" />
                                <CarouselNext aria-label="Next mission image" className="hidden sm:flex" />
                            </Carousel>
                        </div>
                        <div className="w-full md:w-1/2">
                            <Card className="p-4 sm:p-6 bg-card/90 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent>
                                    <motion.h3
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-primary"
                                    >
                                        Our Mission
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                                        className="text-foreground text-sm sm:text-base md:text-lg mb-6"
                                    >
                                        At Homestay Nepal, we are dedicated to promoting sustainable tourism that uplifts local communities and offers travelers immersive, authentic experiences. Our goal is to preserve Nepal’s cultural heritage and natural beauty for future generations.
                                    </motion.p>
                                    <motion.blockquote
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                                        className="italic text-muted-foreground mb-6 border-l-4 border-primary pl-4 text-sm sm:text-base"
                                    >
                                        &quot;Connecting hearts through authentic Nepali hospitality.&quot;
                                    </motion.blockquote>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                                        className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                                    >
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                className="bg-primary text-white hover:bg-primary/90 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                                aria-label="Explore our vision"
                                            >
                                                Explore Our Vision
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="outline"
                                                className="border-primary text-primary hover:bg-primary/10 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                                aria-label="Join our community"
                                            >
                                                Join Our Community
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </section>

                {/* Our Values */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-primary"
                    >
                        Our Values
                    </motion.h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {values.map((v, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                            >
                                <Card className="p-6 bg-card shadow-sm hover:shadow-md transition-all duration-300 border-none flex flex-col items-center text-center">
                                    {v.icon}
                                    <h4 className="font-semibold text-lg sm:text-xl mb-2 text-foreground">{v.title}</h4>
                                    <p className="text-muted-foreground text-sm sm:text-base">{v.desc}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Cultural Highlights Carousel */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-muted">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-primary"
                    >
                        Experience Nepal’s Culture
                    </motion.h3>
                    <Carousel className="w-full max-w-5xl mx-auto" opts={{ align: "start", loop: true }}>
                        <CarouselContent>
                            {culturalHighlights.map((highlight, i) => (
                                <CarouselItem key={i} className="basis-full sm:basis-1/2 lg:basis-1/3 p-2">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                        <Card className="bg-card border-none h-[400px] sm:h-[450px] flex flex-col shadow-sm hover:shadow-md transition-all duration-300">
                                            <CardContent className="p-4 flex flex-col flex-grow">
                                                <div className="relative h-48 sm:h-56 mb-4">
                                                    <Image
                                                        src={highlight.image}
                                                        alt={highlight.title}
                                                        fill
                                                        className="object-cover rounded-md"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                                        loading="lazy"
                                                        onError={(e) => (e.currentTarget.src = "/images/fallback-image.png")}
                                                        placeholder="blur"
                                                        blurDataURL="/images/fallback-image.png"
                                                    />
                                                </div>
                                                <h4 className="font-semibold text-lg sm:text-xl mb-2 text-foreground">{highlight.title}</h4>
                                                <p className="text-muted-foreground text-sm sm:text-base line-clamp-3">{highlight.desc}</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious aria-label="Previous slide" className="hidden sm:flex" />
                        <CarouselNext aria-label="Next slide" className="hidden sm:flex" />
                    </Carousel>
                </section>

                {/* Impact Stats */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-primary"
                    >
                        Our Impact
                    </motion.h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                                className="text-center"
                            >
                                <div className="flex justify-center mb-4">{stat.icon}</div>
                                <h4 className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</h4>
                                <p className="text-muted-foreground text-sm sm:text-base">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Meet the Team */}
                {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-card">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-primary"
                    >
                        Meet the Team
                    </motion.h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {team.map((member, i) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                            >
                                <Card
                                    role="article"
                                    aria-label={`Team member ${member.name}`}
                                    className="flex flex-col items-center p-6 bg-muted shadow-sm hover:shadow-md transition-all duration-300 border-none"
                                >
                                    <div className="rounded-full bg-gray-100 p-2 mb-4 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                                        {member.icon}
                                    </div>
                                    <h4 className="font-semibold text-lg sm:text-xl text-foreground">{member.name}</h4>
                                    <p className="text-muted-foreground text-sm sm:text-base">{member.role}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section> */}

                {/* What Our Guests Say */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-primary"
                    >
                        What Our Guests Say
                    </motion.h3>
                    <div className="space-y-6">
                        {reviews.map((r, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                            >
                                <Card
                                    role="article"
                                    aria-label={`Review by ${r.name}`}
                                    className="p-6 bg-card shadow-sm hover:shadow-md transition-all duration-300 border-none"
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                                        <div className="rounded-full bg-gray-100 p-2">{r.icon}</div>
                                        <div>
                                            <h4 className="font-semibold text-lg sm:text-xl text-foreground">{r.name}</h4>
                                            <p className="text-xs sm:text-sm text-muted-foreground">{r.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center mb-3">
                                        {[...Array(r.stars)].map((_, idx) => (
                                            <Star key={idx} className="w-4 h-4 text-accent fill-accent mr-1" />
                                        ))}
                                    </div>
                                    <p className="text-foreground text-sm sm:text-base mb-4">{r.review}</p>
                                    <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <ThumbsUp className="w-4 h-4" /> {r.likes}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4" /> {r.comments}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative overflow-hidden bg-gradient-to-b from-primary/90 to-primary/70">
                    <div className="absolute inset-0">
                        <Image
                            src="/images/cta-bg.jpg"
                            alt="CTA Background"
                            fill
                            className="object-cover opacity-10"
                            loading="lazy"
                            onError={(e) => (e.currentTarget.src = "/images/fallback-image.png")}
                            placeholder="blur"
                            blurDataURL="/images/fallback-image.png"
                        />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="flex justify-center mb-4"
                        >
                            <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
                        </motion.div>
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6"
                        >
                            Ready to Experience Nepal?
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                            className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto"
                        >
                            Join us to discover authentic homestay experiences that connect you with the heart of Nepal. Book your stay or get in touch to learn more!
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
                        >
                            <Button
                                className="bg-white text-primary hover:bg-gray-100 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                aria-label="Book a homestay"
                            >
                                Book a Homestay
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white text-primary hover:bg-white/20 text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                aria-label="Contact us"
                            >
                                Contact Us
                            </Button>
                        </motion.div>
                    </motion.div>
                </section>
                
            </div>
            <Footer/>
          
        </>
    );
};

export default AboutUsPage;