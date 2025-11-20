import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";
import React from "react";
import Link from "next/link"; // Added import for Link
import { Calendar, FileText, Shield, Scale } from "lucide-react";

const lastUpdated = "Jun 26, 2025";

const LegalPage = () => {
    return (
        <>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white mt-16">
                <Navbar />
                
                {/* Hero Section */}
                <div className="bg-primary text-white py-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center mb-4">
                            <Scale className="w-8 h-8 mr-3" />
                            <h1 className="text-4xl lg:text-5xl font-bold">Legal Information</h1>
                        </div>
                        <p className="text-primary-30 text-lg max-w-2xl mx-auto leading-relaxed">
                            Your privacy and trust matter to us. Review our policies and terms to understand how we protect and serve you.
                        </p>
                        <div className="flex items-center justify-center mt-6 text-primary-30">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">Last updated: {lastUpdated}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 py-12">
                    
                    {/* Table of Contents */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
                        <div className="flex items-center mb-6">
                            <FileText className="w-6 h-6 mr-3 text-muted-foreground" />
                            <h2 className="text-2xl font-semibold text-foreground">Table of Contents</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <a 
                                href="#privacy-policy" 
                                className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary-30/20 transition-colors duration-200"
                            >
                                <div className="flex items-center">
                                    <Shield className="w-5 h-5 mr-3 text-primary" />
                                    <span className="font-medium text-foreground group-hover:text-primary">Privacy Policy</span>
                                </div>
                                <span className="text-muted-foreground text-sm group-hover:text-primary">→</span>
                            </a>
                            <a 
                                href="#terms-of-service" 
                                className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-accent/20 transition-colors duration-200"
                            >
                                <div className="flex items-center">
                                    <Scale className="w-5 h-5 mr-3 text-accent" />
                                    <span className="font-medium text-foreground group-hover:text-accent">Terms of Service</span>
                                </div>
                                <span className="text-muted-foreground text-sm group-hover:text-accent">→</span>
                            </a>
                        </div>
                    </div>

                    {/* Privacy Policy Section */}
                    <section id="privacy-policy" className="mb-16">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary to-primary-90 p-8">
                                <div className="flex items-center text-white">
                                    <Shield className="w-8 h-8 mr-4" />
                                    <h2 className="text-3xl font-bold">Privacy Policy</h2>
                                </div>
                            </div>
                            <div className="p-8 lg:p-12">
                                <div className="prose prose-lg max-w-none">
                                    <div className="bg-primary-30/20 border-l-4 border-primary p-6 rounded-r-lg mb-8">
                                        <p className="text-primary font-medium mb-2">Your Privacy Matters</p>
                                        <p className="text-primary-70 text-sm">We&apos;re committed to protecting your personal information and being transparent about how we use it.</p>
                                    </div>
                                    
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Information We Collect</h3>
                                    <p className="text-muted-foreground leading-relaxed mb-6">
                                        At Nepal Homestays, your privacy is our priority. We collect personal information such as your name, contact details, and payment information when you create an account, book a stay, or communicate with us. We also gather technical data like your IP address and device information to enhance your experience and improve our services.
                                    </p>

                                    <h3 className="text-xl font-semibold text-foreground mb-4">How We Use Your Information</h3>
                                    <p className="text-muted-foreground leading-relaxed mb-6">
                                        Your information is used to process bookings, facilitate payments, provide customer support, and send you important updates or promotional offers. We may share your details with hosts, payment processors, and service providers who help us operate Nepal Homestays, but only as necessary and in accordance with the law.
                                    </p>

                                    <h3 className="text-xl font-semibold text-foreground mb-4">Data Security & Your Rights</h3>
                                    <p className="text-muted-foreground leading-relaxed mb-6">
                                        We take reasonable steps to protect your data, but please note that no online system is completely secure. You have the right to access, update, or delete your personal information at any time. We may update this Privacy Policy periodically and will notify you of significant changes.
                                    </p>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <p className="text-foreground font-medium">Questions about privacy?</p>
                                        <p className="text-muted-foreground text-sm mt-1">
                                            Contact us at <a href="mailto:privacy@nepalhomestays.com" className="text-primary hover:underline">privacy@nepalhomestays.com</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Terms of Service Section */}
                    <section id="terms-of-service" className="mb-16">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-accent to-accent/90 p-8">
                                <div className="flex items-center text-white">
                                    <Scale className="w-8 h-8 mr-4" />
                                    <h2 className="text-3xl font-bold">Terms of Service</h2>
                                </div>
                            </div>
                            <div className="p-8 lg:p-12">
                                <div className="prose prose-lg max-w-none">
                                    <div className="bg-accent/20 border-l-4 border-accent p-6 rounded-r-lg mb-8">
                                        <p className="text-accent font-medium mb-2">Welcome to Nepal Homestays!</p>
                                        <p className="text-accent/80 text-sm">By using our platform, you agree to these terms that help ensure a safe and enjoyable experience for everyone.</p>
                                    </div>
                                    
                                    <h3 className="text-xl font-semibold text-foreground mb-4">Platform Usage</h3>
                                    <p className="text-muted-foreground leading-relaxed mb-6">
                                        Nepal Homestays connects travelers with homestay hosts in Nepal. You must be at least 18 years old to use our services and are responsible for keeping your account information accurate and secure. You agree to use Nepal Homestays for lawful purposes only. Any fraudulent, harmful, or discriminatory activity is strictly prohibited.
                                    </p>

                                    <h3 className="text-xl font-semibold text-foreground mb-4">Booking & Payments</h3>
                                    <p className="text-muted-foreground leading-relaxed mb-6">
                                        When you book a stay, you agree to pay all applicable fees and taxes, and to follow the host&apos;s rules and cancellation policy. Payments are processed securely through our trusted partners. All bookings are subject to host approval and availability.
                                    </p>

                                    <h3 className="text-xl font-semibold text-foreground mb-4">Responsibilities & Limitations</h3>
                                    <p className="text-muted-foreground leading-relaxed mb-6">
                                        Nepal Homestays is not responsible for the conduct of hosts or guests, or for the quality of accommodations. We facilitate connections but do not guarantee specific outcomes. We may update these terms from time to time and will notify you of major changes.
                                    </p>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                        <p className="text-foreground font-medium">Need help or have questions?</p>
                                        <p className="text-muted-foreground text-sm mt-1">
                                            Contact us at <a href="mailto:support@nepalhomestays.com" className="text-accent hover:underline">support@nepalhomestays.com</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Bottom CTA */}
                    <div className="bg-gradient-to-r from-primary to-primary-90 text-white rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold mb-4">Ready to Start Your Nepal Adventure?</h3>
                        <p className="text-primary-30 mb-6 max-w-2xl mx-auto">
                            Now that you understand our policies, explore authentic homestay experiences across Nepal.
                        </p>
                        <Link 
                            href="/" 
                            className="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                            Explore Homestays
                        </Link>
                    </div>
                </div>
            </div>
            
            <Footer />
        </>
    );
};

export default LegalPage;