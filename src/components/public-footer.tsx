"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowUp,
  Heart,
  ExternalLink,
} from "lucide-react";

// Color scheme
const COLORS = {
  primary: "#111c4e",
  accent: "#ffc400",
  success: "#1F9E55",
  danger: "#dc2626",
};

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const serviceLinks = [
  { label: "Good Moral Certificate", href: "/services/gmc" },
  { label: "Uniform Exemption", href: "/services/uer" },
  { label: "Cross-Dressing Clearance", href: "/services/cdc" },
  { label: "Child Admission", href: "/services/cac" },
  { label: "File a Complaint", href: "/complaints" },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/UMakCSFD", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com/UMakCSFD", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com/UMakCSFD", icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com/company/umak-csfd", icon: Linkedin },
];

const contactInfo = {
  phone: "8883-1875",
  email: "csfd.umak.edu.ph",
  website: "umak.edu.ph/centers/csfd/",
  address: "University of Makati, J.P. Rizal Extension, West Rembo, Makati City",
};

export function PublicFooter() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const currentYear = new Date().getFullYear();

  // Handle scroll for back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-auto">
      {/* Main Footer Content */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${COLORS.primary} 0%, #0a1229 100%)`,
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top wave decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffc400]/50 to-transparent" />
          
          {/* Subtle pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
          
          {/* Gradient orbs */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-[#ffc400]/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-[#ffc400]/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1 - Branding & About */}
            <div className="lg:col-span-1">
              {/* Logo Section */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#ffc400]/30 rounded-full blur-sm" />
                  <Image
                    src="/logos/UMAK LOGO.png"
                    alt="University of Makati"
                    width={48}
                    height={48}
                    className="relative w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-[#ffc400]/30 rounded-full blur-sm" />
                  <Image
                    src="/logos/CSFD LOGO.png"
                    alt="CSFD"
                    width={48}
                    height={48}
                    className="relative w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                iCSFD<span className="text-[#ffc400]">+</span>
              </h2>
              <p className="text-sm text-white/60 mb-4 leading-relaxed">
                Center for Student Formation and Discipline - University of Makati. 
                Fostering student development and maintaining institutional standards.
              </p>

              {/* Social Media Links */}
              <div className="flex items-center gap-2">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#ffc400]/20 border border-white/10 hover:border-[#ffc400]/30 flex items-center justify-center text-white/60 hover:text-[#ffc400] transition-all duration-200 group"
                      aria-label={item.label}
                    >
                      <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-[#ffc400] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-[#ffc400]/50" />
                Quick Links
              </h3>
              <nav className="space-y-1">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 py-2 text-white/70 hover:text-white group transition-colors"
                  >
                    <ArrowUp className="h-3 w-3 rotate-90 text-[#ffc400]/50 group-hover:text-[#ffc400] transition-colors" />
                    <span className="text-sm">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 3 - Services */}
            <div>
              <h3 className="text-sm font-semibold text-[#ffc400] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-[#ffc400]/50" />
                Our Services
              </h3>
              <nav className="space-y-1">
                {serviceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 py-2 text-white/70 hover:text-white group transition-colors"
                  >
                    <ArrowUp className="h-3 w-3 rotate-90 text-[#ffc400]/50 group-hover:text-[#ffc400] transition-colors" />
                    <span className="text-sm">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 4 - Contact Information */}
            <div>
              <h3 className="text-sm font-semibold text-[#ffc400] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-[#ffc400]/50" />
                Contact Us
              </h3>
              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <MapPin className="h-4 w-4 text-[#ffc400]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Phone className="h-4 w-4 text-[#ffc400]" />
                  </div>
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Mail className="h-4 w-4 text-[#ffc400]" />
                  </div>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {contactInfo.email}
                  </a>
                </div>

                {/* Website */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Globe className="h-4 w-4 text-[#ffc400]" />
                  </div>
                  <a
                    href={`https://${contactInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {contactInfo.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Specific Emails */}
                <div className="pt-2 space-y-2">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-[10px] uppercase text-[#ffc400] font-medium mb-1">For General Concerns</p>
                    <p className="text-xs text-white/60">csfd.umak.edu.ph</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-[10px] uppercase text-[#ffc400] font-medium mb-1">For Complaints</p>
                    <p className="text-xs text-white/60">umakpsd.umak.edu.ph</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-[10px] uppercase text-[#ffc400] font-medium mb-1">Good Moral Certificate</p>
                    <p className="text-xs text-white/60">csfdgoodmoral.umak.edu.ph</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                <p className="text-sm text-white/50">
                  © {currentYear} University of Makati - Center for Student Formation and Discipline
                </p>
              </div>

              {/* Made with love */}
              <div className="flex items-center gap-1 text-sm text-white/50">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-400 fill-red-400 animate-pulse" />
                <span>for UMAK students</span>
              </div>

              {/* Legal Links */}
              <div className="flex items-center gap-4 text-sm">
                <Link
                  href="/privacy"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <span className="text-white/20">|</span>
                <Link
                  href="/terms"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        style={{
          background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff8c00 100%)`,
        }}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5 text-[#111c4e]" />
      </button>
    </footer>
  );
}
