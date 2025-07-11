"use client";
import React from "react";
import Link from "next/link"; // Import Link for internal navigation
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

function Footer() {
  return (
    <footer className="w-full bg-background font-manrope border-t border-border py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 animate-fade-in">
          <div>
            <h4 className="font-semibold text-sm text-text-primary mb-4">Support</h4>
            <ul className="space-y-3 text-xs text-text-secondary">
              <li>
                <Link href="/help-center" className="hover:text-accent transition-colors" aria-label="Visit Help Center">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact-support" className="hover:text-accent transition-colors" aria-label="Contact Support">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/cancellation-options" className="hover:text-accent transition-colors" aria-label="View Cancellation Options">
                  Cancellation Options
                </Link>
              </li>
              <li>
                <Link href="/safety-information" className="hover:text-accent transition-colors" aria-label="View Safety Information">
                  Safety Information
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-text-primary mb-4">Company</h4>
            <ul className="space-y-3 text-xs text-text-secondary">
              <li>
                <Link href="/about-us" className="hover:text-accent transition-colors" aria-label="Learn About Us">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-accent transition-colors" aria-label="Read Community Blog">
                  Community Blog
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-accent transition-colors" aria-label="View Privacy Policy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-accent transition-colors" aria-label="View Terms of Service">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-text-primary mb-4">Contact</h4>
            <ul className="space-y-3 text-xs text-text-secondary">
              <li>
                <Link href="/partnerships" className="hover:text-accent transition-colors" aria-label="Explore Partnerships">
                  Partnerships
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-accent transition-colors" aria-label="View FAQs">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact-support" className="hover:text-accent transition-colors" aria-label="Get in Touch">
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-text-primary mb-4">Social</h4>
            <div className="flex justify-start space-x-4">
              {[
                { icon: Facebook, url: "https://www.facebook.com/share/1HTz5gRcvc/" },
                { icon: Instagram, url: "https://www.instagram.com/nepalhomestays?igsh=YWdrMGZiZ2djd3kz" },
                { icon: Linkedin, url: "https://www.linkedin.com/company/nepalhomestays/" },
                { icon: Twitter, url: "https://x.com/nepalhomestays?s=11" },
              ].map(({ icon: Icon, url }, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent hover:text-white cursor-pointer transition-colors"
                  aria-label={`Visit our ${Icon.displayName} page`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-text-secondary">
          © Homestay Nepal 2025
        </div>
      </div>
    </footer>
  );
}

export default Footer;