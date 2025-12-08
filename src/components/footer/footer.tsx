"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  ariaLabel: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  label: string;
  ariaLabel: string;
}

const footerSections: FooterSection[] = [
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help-center", ariaLabel: "Visit Help Center" },
      { label: "Contact Support", href: "/contact-support", ariaLabel: "Contact Support" },
      { label: "Cancellation Options", href: "/cancellation-options", ariaLabel: "View Cancellation Options" },
      { label: "Safety Information", href: "/safety-information", ariaLabel: "View Safety Information" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us", ariaLabel: "Learn About Us" },
      { label: "Community Homestays", href: "/community-homestays", ariaLabel: "Explore Community Homestays" },
      { label: "Community Blog", href: "/blogs", ariaLabel: "Read Community Blog" },
      { label: "Privacy Policy", href: "/legal", ariaLabel: "View Privacy Policy" },
      { label: "Terms of Service", href: "/legal", ariaLabel: "View Terms of Service" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Partnerships", href: "/partnerships", ariaLabel: "Explore Partnerships" },
      { label: "FAQ", href: "/faqs", ariaLabel: "View FAQs" },
      { label: "Get in Touch", href: "/contact-support", ariaLabel: "Get in Touch" },
    ],
  },
];

const socialLinks: SocialLink[] = [
  { icon: Facebook, url: "https://www.facebook.com/share/1HTz5gRcvc/", label: "Facebook", ariaLabel: "Visit our Facebook page" },
  { icon: Instagram, url: "https://www.instagram.com/nepalhomestays", label: "Instagram", ariaLabel: "Visit our Instagram page" },
  { icon: Linkedin, url: "https://www.linkedin.com/company/nepalhomestays/", label: "LinkedIn", ariaLabel: "Visit our LinkedIn page" },
  { icon: Twitter, url: "https://x.com/nepalhomestays?s=11", label: "Twitter", ariaLabel: "Visit our Twitter page" },
];

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-5 gap-12">
              {/* Brand Section - Desktop */}
              <div className="col-span-2 space-y-4 pt-0">
                <Link href="/" aria-label="Nepal Homestays Home" className="inline-block">
                  <Image
                    src="/images/logo/logo.png"
                    alt="Nepal Homestays Logo"
                    width={120}
                    height={60}
                    className="object-contain transition-opacity hover:opacity-80"
                    priority
                  />
                </Link>
                <p className="text-slate-600 leading-relaxed max-w-sm text-base">
                  Discover authentic homestay experiences in Nepal. Connect with local families and immerse yourself in the rich culture of the Himalayas.
                </p>
                
                {/* Social Links */}
                <div className="flex items-center space-x-3 pt-2">
                  {socialLinks.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                    >
                      <social.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Navigation Sections - Desktop */}
              <div className="col-span-3">
                <div className="grid grid-cols-3 gap-8">
                  {footerSections.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                      <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">
                        {section.title}
                      </h3>
                      <ul className="space-y-3">
                        {section.links.map((link, linkIdx) => (
                          <li key={linkIdx}>
                            <Link
                              href={link.href}
                              aria-label={link.ariaLabel}
                              className="text-slate-600 hover:text-slate-900 transition-colors duration-200 text-sm block py-1"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="block lg:hidden space-y-8">
            {/* Brand Section - Mobile */}
            <div className="text-center space-y-4">
              <Link href="/" aria-label="Nepal Homestays Home" className="inline-block">
                <Image
                  src="/images/logo/logo.png"
                  alt="Nepal Homestays Logo"
                  width={120}
                  height={60}
                  className="object-contain transition-opacity hover:opacity-80"
                  priority
                />
              </Link>
              <p className="text-slate-600 leading-relaxed text-sm max-w-xs mx-auto">
                Discover authentic homestay experiences in Nepal. Connect with local families and immerse yourself in the rich culture of the Himalayas.
              </p>
              
              {/* Social Links - Mobile */}
              <div className="flex items-center justify-center space-x-3 pt-2">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation Sections - Mobile (3 columns) */}
            <div className="grid grid-cols-3 gap-6">
              {footerSections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-center">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={link.href}
                          aria-label={link.ariaLabel}
                          className="text-slate-600 hover:text-slate-900 transition-colors duration-200 text-xs block py-1 text-center"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 text-center sm:text-left">
              © {new Date().getFullYear()} Nepal Homestays. All rights reserved.
            </p>
            
            {/* Additional Links */}
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Terms
              </Link>
              <Link 
                href="/cookies" 
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;