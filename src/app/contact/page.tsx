"use client";

import React from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
} from "lucide-react";

const contactInfo = {
  office: {
    name: "Center for Student Formation and Discipline (CSFD)",
    address: "University of Makati, J.P. Rizal Extension, West Rembo, Makati City 1210",
    building: "Admin Building, 2nd Floor, Room 201",
  },
  phones: [
    { label: "Main Office", number: "8883-1875" },
    { label: "Good Moral Certificate", number: "8883-1875 loc. 2101" },
  ],
  emails: [
    { label: "General Concerns", email: "csfd.umak.edu.ph" },
    { label: "Complaints (PSD)", email: "umakpsd.umak.edu.ph" },
    { label: "Good Moral Certificate", email: "csfdgoodmoral.umak.edu.ph" },
  ],
  hours: [
    { day: "Monday - Friday", time: "8:00 AM - 5:00 PM" },
    { day: "Saturday - Sunday", time: "Closed" },
  ],
};

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/UMakCSFD", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com/UMakCSFD", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com/UMakCSFD", icon: Instagram },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative py-16 md:py-24 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, #111c4e 0%, #0a1229 100%)`,
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffc400]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffc400]/5 rounded-full blur-2xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Get in <span style={{ color: "#ffc400" }}>Touch</span>
              </h1>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                We&apos;re here to help. Reach out to us through any of the channels below.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Contact Details */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Office Address */}
                <div className="bg-card rounded-2xl shadow-lg p-6 border border-border hover:border-[#ffc400]/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#111c4e]">
                      <MapPin className="h-6 w-6 text-[#ffc400]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2" style={{ color: "#111c4e" }}>
                        Office Address
                      </h3>
                      <p className="text-muted-foreground font-medium">
                        {contactInfo.office.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contactInfo.office.building}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contactInfo.office.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="bg-card rounded-2xl shadow-lg p-6 border border-border hover:border-[#ffc400]/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#111c4e]">
                      <Phone className="h-6 w-6 text-[#ffc400]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-3" style={{ color: "#111c4e" }}>
                        Phone Numbers
                      </h3>
                      <div className="space-y-2">
                        {contactInfo.phones.map((phone, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{phone.label}</span>
                            <a
                              href={`tel:${phone.number}`}
                              className="text-sm font-medium hover:text-[#ffc400] transition-colors"
                              style={{ color: "#111c4e" }}
                            >
                              {phone.number}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Addresses */}
                <div className="bg-card rounded-2xl shadow-lg p-6 border border-border hover:border-[#ffc400]/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#111c4e]">
                      <Mail className="h-6 w-6 text-[#ffc400]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-3" style={{ color: "#111c4e" }}>
                        Email Addresses
                      </h3>
                      <div className="space-y-3">
                        {contactInfo.emails.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <a
                              href={`mailto:${item.email}`}
                              className="text-sm font-medium hover:text-[#ffc400] transition-colors"
                              style={{ color: "#111c4e" }}
                            >
                              {item.email}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="bg-card rounded-2xl shadow-lg p-6 border border-border hover:border-[#ffc400]/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#111c4e]">
                      <Clock className="h-6 w-6 text-[#ffc400]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-3" style={{ color: "#111c4e" }}>
                        Office Hours
                      </h3>
                      <div className="space-y-2">
                        {contactInfo.hours.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{item.day}</span>
                            <span className="text-sm font-medium" style={{ color: "#111c4e" }}>
                              {item.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Map & Social */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Map */}
                <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border h-[300px] md:h-[400px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.8454676995077!2d121.05594931483827!3d14.556209889826615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8a15a6d2c53%3A0x9e6a3c0e37c8f2a1!2sUniversity%20of%20Makati!5e0!3m2!1sen!2sph!4v1620000000000!5m2!1sen!2sph"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Social Media */}
                <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-[#111c4e]">
                      <MessageCircle className="h-6 w-6 text-[#ffc400]" />
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: "#111c4e" }}>
                      Connect With Us
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    {socialLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111c4e]/5 hover:bg-[#111c4e] text-[#111c4e] hover:text-white transition-all duration-200"
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-gradient-to-br from-[#111c4e] to-[#0a1229] rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="/services/gmc"
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-center transition-colors"
                    >
                      Request Certificate
                    </a>
                    <a
                      href="/track"
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-center transition-colors"
                    >
                      Track Request
                    </a>
                    <a
                      href="/faq"
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-center transition-colors"
                    >
                      FAQs
                    </a>
                    <a
                      href="/about"
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-center transition-colors"
                    >
                      About Us
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
