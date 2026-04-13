"use client";

import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileCheck,
  Shirt,
  Users,
  BadgeCheck,
  MessageSquareWarning,
  Clock,
  CheckCircle2,
  Search,
  ShieldCheck,
  ArrowRight,
  Megaphone,
} from "lucide-react";

const services = [
  {
    title: "Good Moral Certificate",
    description: "Request a certificate of good moral character for employment, scholarship, or other purposes.",
    icon: FileCheck,
    href: "/services/gmc",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Uniform Exemption",
    description: "Apply for exemption from wearing the prescribed uniform due to medical or religious reasons.",
    icon: Shirt,
    href: "/services/uer",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Cross-Dressing Clearance",
    description: "Request clearance for cross-dressing for events, performances, or other activities.",
    icon: BadgeCheck,
    href: "/services/cdc",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Child Admission",
    description: "Request clearance for bringing children to the university campus.",
    icon: Users,
    href: "/services/cac",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "File a Complaint",
    description: "Report incidents or file complaints related to student conduct and discipline.",
    icon: MessageSquareWarning,
    href: "/complaint",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    title: "Track Request",
    description: "Check the status of your submitted requests using your control number.",
    icon: Search,
    href: "/track",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

const steps = [
  {
    step: 1,
    title: "Submit Request",
    description: "Fill out the online form with your details and upload required documents.",
  },
  {
    step: 2,
    title: "Wait for Processing",
    description: "Our staff will review your request during office hours (Mon-Fri, 8AM-5PM).",
  },
  {
    step: 3,
    title: "Receive Updates",
    description: "Get email notifications about your request status and any updates.",
  },
  {
    step: 4,
    title: "Download Certificate",
    description: "Once approved, download your certificate directly from the portal.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('/umak-building.svg')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-6">
              <ShieldCheck className="h-4 w-4" />
              University of Makati - CSFD
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Center for Student Formation and Discipline
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Your digital gateway to student services at the University of Makati.
              Submit requests, track status, and access certificates online — anytime, anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-white/90"
                asChild
              >
                <Link href="/services/gmc">
                  Request Certificate
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/track">Track Request</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Office Hours Banner */}
      <section className="container mx-auto px-4 -mt-4 relative z-10">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-semibold">Office Hours:</span> Monday–Friday, 8:00 AM – 5:00 PM.
            You may submit requests anytime and we will respond during office hours.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access various student services online. Submit requests, upload documents,
            and track your applications from anywhere.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.href} href={service.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${service.bgColor} ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get your certificates and clearances in four simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-orange-500 to-amber-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-orange-500" />
            Announcements
          </h2>
          <Button variant="ghost" asChild>
            <Link href="/announcements">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                {new Date().toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <CardTitle className="text-lg">Welcome to iCSFD+</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The Center for Student Formation and Discipline is now accepting online
                requests for certificates and clearances. Please use this portal to submit
                your requests and track their status.
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                {new Date(Date.now() - 86400000).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <CardTitle className="text-lg">Office Hours Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Please note that while you can submit requests 24/7, processing is done
                during office hours (Monday-Friday, 8:00 AM - 5:00 PM).
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                {new Date(Date.now() - 172800000).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <CardTitle className="text-lg">QR Code Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All certificates now include a QR code for easy verification. Employers
                and institutions can verify the authenticity of your certificate instantly.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About CSFD */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About CSFD</h2>
              <p className="text-slate-300 mb-6">
                The Center for Student Formation and Discipline (CSFD) is committed to
                developing well-rounded individuals who embody the core values of the
                University of Makati. We provide comprehensive student services including
                certificate issuance, disciplinary guidance, and character formation programs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-orange-400 mb-2">Vision</h3>
                  <p className="text-sm text-slate-300">
                    A leading center for student formation and discipline that produces
                    graduates of character and integrity.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-400 mb-2">Mission</h3>
                  <p className="text-sm text-slate-300">
                    To provide holistic student formation programs and fair disciplinary
                    processes that nurture responsible, ethical, and community-oriented individuals.
                  </p>
                </div>
              </div>
              <Button className="mt-6 bg-orange-500 hover:bg-orange-600" asChild>
                <Link href="/about">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl blur-2xl opacity-30" />
                <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-4xl">
                      i+
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold mb-2">iCSFD+</div>
                    <div className="text-sm text-slate-400">
                      Integrated CSFD Digital Management System
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400">24/7</div>
                      <div className="text-xs text-slate-400">Online Access</div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400">Fast</div>
                      <div className="text-xs text-slate-400">Processing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to submit your request?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Start your certificate request today. Our online portal makes it easy to submit
            your application and track its progress from anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-white/90"
              asChild
            >
              <Link href="/services/gmc">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/track">Check Request Status</Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
