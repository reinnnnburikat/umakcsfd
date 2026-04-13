"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useAnimation } from "framer-motion";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Shirt,
  Users,
  Baby,
  Clock,
  Bell,
  MonitorSmartphone,
  Award,
  ArrowRight,
  CheckCircle2,
  Send,
  Loader2,
  FileCheck,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Users as UsersIcon,
  Clock as ClockIcon,
  Award as AwardIcon,
} from "lucide-react";

// Color scheme
const COLORS = {
  primary: "#111c4e",
  accent: "#ffc400",
  success: "#1F9E55",
  danger: "#dc2626",
};

// Certificate types data
const certificateTypes = [
  {
    id: "gmc",
    title: "Good Moral Certificate",
    shortTitle: "GMC",
    description: "Certificate of good moral character for employment, transfer, or other purposes.",
    icon: FileText,
    href: "/services/gmc",
    processingTime: "3-5 days",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "uer",
    title: "Uniform Exemption Request",
    shortTitle: "UER",
    description: "Apply for exemption from wearing the university uniform due to valid reasons.",
    icon: Shirt,
    href: "/services/uer",
    processingTime: "2-3 days",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "cdc",
    title: "Cross-Dressing Clearance",
    shortTitle: "CDC",
    description: "Request clearance for cross-dressing due to academic or institutional activities.",
    icon: Users,
    href: "/services/cdc",
    processingTime: "2-3 days",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "cac",
    title: "Child Admission Clearance",
    shortTitle: "CAC",
    description: "Apply for clearance to bring a child to the university premises.",
    icon: Baby,
    href: "/services/cac",
    processingTime: "2-3 days",
    color: "from-pink-500 to-pink-600",
  },
];

// Features data
const features = [
  {
    icon: MonitorSmartphone,
    title: "Easy Online Request",
    description: "Submit requests anytime, anywhere through our user-friendly online platform.",
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    description: "Monitor your request status in real-time with our tracking system.",
  },
  {
    icon: Bell,
    title: "Email Notifications",
    description: "Receive instant email updates on your request progress and status changes.",
  },
  {
    icon: Award,
    title: "Digital Certificates",
    description: "Get your certificates digitally with secure verification and easy download.",
  },
];

// How it works steps
const steps = [
  {
    step: 1,
    title: "Submit Request",
    description: "Fill out the online form with your details and purpose",
    icon: Send,
  },
  {
    step: 2,
    title: "Processing",
    description: "CSFD staff reviews and processes your request",
    icon: Loader2,
  },
  {
    step: 3,
    title: "Notification",
    description: "Receive email notification when ready",
    icon: Bell,
  },
  {
    step: 4,
    title: "Claim Certificate",
    description: "Download or claim your certificate",
    icon: FileCheck,
  },
];

// News/Announcements data
const announcements = [
  {
    id: 1,
    title: "Online Certificate Request System Launched",
    date: "January 15, 2025",
    excerpt: "We're excited to announce the launch of our new digital certificate request system...",
    type: "announcement",
  },
  {
    id: 2,
    title: "Office Hours Update for Semester Break",
    date: "January 10, 2025",
    excerpt: "Please be advised of modified office hours during the semester break period...",
    type: "advisory",
  },
  {
    id: 3,
    title: "New: Track Your Request in Real-Time",
    date: "January 5, 2025",
    excerpt: "You can now track your certificate request status in real-time using our new tracking feature...",
    type: "feature",
  },
];

// Animated counter component
function AnimatedCounter({ 
  target, 
  duration = 2, 
  suffix = "" 
}: { 
  target: number; 
  duration?: number; 
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * target));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Floating element component
function FloatingElement({ 
  children, 
  delay = 0, 
  className = "" 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ 
        y: [0, -15, 0],
        opacity: 1,
      }}
      transition={{
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        opacity: {
          duration: 0.5,
          delay,
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Section wrapper with animation
function AnimatedSection({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, #1a2d6b 30%, #2a3f8f 50%, #1a2d6b 70%, ${COLORS.primary} 100%)`,
              backgroundSize: "400% 400%",
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, #1a2d6b 30%, #2a3f8f 50%, #1a2d6b 70%, ${COLORS.primary} 100%)`,
                backgroundSize: "400% 400%",
              }}
            />
          </div>
          
          {/* Gold accent overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 70% 30%, ${COLORS.accent}40 0%, transparent 50%)`,
            }}
          />
          
          {/* Pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Certificate icons floating */}
          <FloatingElement delay={0} className="absolute top-[15%] left-[10%] md:left-[15%]">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
              <FileText className="w-8 h-8 md:w-10 md:h-10 text-[#ffc400]" />
            </div>
          </FloatingElement>
          
          <FloatingElement delay={0.5} className="absolute top-[25%] right-[10%] md:right-[15%]">
            <div className="w-14 h-14 md:w-18 md:h-18 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
              <Award className="w-7 h-7 md:w-9 md:h-9 text-[#ffc400]" />
            </div>
          </FloatingElement>
          
          <FloatingElement delay={1} className="absolute bottom-[30%] left-[5%] md:left-[10%]">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
            </div>
          </FloatingElement>
          
          <FloatingElement delay={1.5} className="absolute bottom-[20%] right-[8%] md:right-[12%]">
            <div className="w-14 h-14 md:w-18 md:h-18 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
              <Clock className="w-7 h-7 md:w-9 md:h-9 text-[#ffc400]" />
            </div>
          </FloatingElement>

          {/* Glowing orbs */}
          <div className="absolute top-[20%] right-[20%] w-64 h-64 bg-[#ffc400]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] left-[10%] w-48 h-48 bg-[#ffc400]/5 rounded-full blur-2xl" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#ffc400]/30 rounded-full blur-sm" />
              <Image
                src="/logos/UMAK LOGO.png"
                alt="UMak Logo"
                width={64}
                height={64}
                className="relative w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/30"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#ffc400]/30 rounded-full blur-sm" />
              <Image
                src="/logos/CSFD LOGO.png"
                alt="CSFD Logo"
                width={64}
                height={64}
                className="relative w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/30"
              />
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight">
              <span className="block">iCSFD</span>
              <span className="text-[#ffc400]">+</span>
              <span className="block text-2xl md:text-3xl lg:text-4xl mt-2 text-white/90">
                Digital Management System
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-white/80 mb-8 max-w-3xl mx-auto"
          >
            University of Makati - Center for Student Welfare and Development
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/services/gmc">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#ffc400] to-[#ff9500] text-[#111c4e] font-bold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                <FileText className="mr-2 h-5 w-5" />
                Request Certificate
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/track">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold px-8 py-6 text-lg rounded-xl hover:bg-white/20 hover:border-[#ffc400] transition-all duration-300"
              >
                <Clock className="mr-2 h-5 w-5" />
                Track Request
              </Button>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-2.5 rounded-full bg-[#ffc400]"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L48 105C96 90 192 60 288 45C384 30 480 30 576 37.5C672 45 768 60 864 67.5C960 75 1056 75 1152 67.5C1248 60 1344 45 1392 37.5L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <AnimatedSection className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: COLORS.primary }}>
              Our <span style={{ color: COLORS.accent }}>Services</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our range of certificate and clearance services designed to serve your academic needs.
            </p>
          </motion.div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certificateTypes.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } },
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group"
                >
                  <Card className="relative h-full bg-card border-border hover:border-[#ffc400]/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ffc400]/0 to-[#ffc400]/0 group-hover:from-[#ffc400]/5 group-hover:to-transparent transition-all duration-300" />
                    
                    <CardContent className="relative p-6 flex flex-col h-full">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.primary }}>
                        {service.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 flex-grow">
                        {service.description}
                      </p>

                      {/* Processing Time Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-[#ffc400]" />
                        <span className="text-xs text-muted-foreground">
                          {service.processingTime} processing
                        </span>
                      </div>

                      {/* Request Button */}
                      <Link href={service.href} className="block">
                        <Button 
                          className="w-full bg-[#111c4e] hover:bg-[#111c4e]/90 text-white group/btn"
                        >
                          Request Now
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection className="py-16 md:py-24 relative overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, #0a1229 100%)`,
          }}
        />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#ffc400]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ffc400]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Why Choose <span style={{ color: COLORS.accent }}>iCSFD+</span>?
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Experience a modern, efficient, and user-friendly approach to certificate requests.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } },
                  }}
                  className="group"
                >
                  <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#ffc400]/50 transition-all duration-300 h-full">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ffc400] to-[#ff9500] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-[#111c4e]" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/60">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Statistics Section */}
      <AnimatedSection className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: COLORS.primary }}>
              By The <span style={{ color: COLORS.accent }}>Numbers</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our commitment to serving the UMAK community is reflected in these achievements.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: 15420, label: "Total Requests Processed", icon: TrendingUp, suffix: "+" },
              { value: 12580, label: "Certificates Issued", icon: AwardIcon, suffix: "+" },
              { value: 8500, label: "Active Students", icon: UsersIcon, suffix: "+" },
              { value: 2, label: "Avg. Processing Days", icon: ClockIcon, suffix: "" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } },
                  }}
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-card border-border hover:border-[#ffc400]/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-full bg-[#ffc400]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ffc400]/20 transition-colors">
                        <Icon className="w-6 h-6" style={{ color: COLORS.accent }} />
                      </div>

                      {/* Counter */}
                      <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2" style={{ color: COLORS.primary }}>
                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                      </div>

                      {/* Label */}
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* How It Works Section */}
      <AnimatedSection className="py-16 md:py-24 relative overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, hsl(var(--background)) 0%, ${COLORS.primary}/10 100%)`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: COLORS.primary }}>
              How It <span style={{ color: COLORS.accent }}>Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple 4-step process to get your certificates.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ffc400]/20 via-[#ffc400]/50 to-[#ffc400]/20 -translate-y-1/2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.15 } },
                    }}
                    className="relative group"
                  >
                    {/* Step Card */}
                    <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-[#ffc400]/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                      {/* Step Number */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#ffc400] flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold text-[#111c4e]">{step.step}</span>
                      </div>

                      {/* Icon */}
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#111c4e] to-[#1a2d6b] flex items-center justify-center mx-auto mb-4 mt-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-[#ffc400]" />
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.primary }}>
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>

                    {/* Arrow for desktop */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#ffc400] items-center justify-center shadow-lg z-10">
                        <ChevronRight className="w-5 h-5 text-[#111c4e]" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* News & Announcements Section */}
      <AnimatedSection className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: COLORS.primary }}>
              Latest <span style={{ color: COLORS.accent }}>Updates</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay informed with the latest news and announcements from CSFD.
            </p>
          </motion.div>

          {/* News Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((item, index) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } },
                }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <Card className="relative h-full bg-card border-border hover:border-[#ffc400]/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Type badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.type === 'announcement' 
                        ? 'bg-blue-100 text-blue-700' 
                        : item.type === 'advisory' 
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </div>

                  <CardContent className="p-6">
                    {/* Date */}
                    <p className="text-sm text-muted-foreground mb-2">{item.date}</p>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-3 group-hover:text-[#ffc400] transition-colors" style={{ color: COLORS.primary }}>
                      {item.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.excerpt}
                    </p>

                    {/* Read more */}
                    <div className="flex items-center text-[#ffc400] text-sm font-medium group-hover:gap-2 transition-all">
                      <span>Read more</span>
                      <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
            }}
            className="relative overflow-hidden rounded-3xl"
          >
            {/* Background */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, #1a2d6b 50%, #2a3f8f 100%)`,
              }}
            />
            
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ffc400]/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#ffc400]/10 rounded-full blur-2xl" />
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '32px 32px',
                }}
              />
            </div>

            <div className="relative p-8 md:p-12 lg:p-16 text-center">
              {/* Sparkle icon */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-[#ffc400] flex items-center justify-center mx-auto mb-6 shadow-xl"
              >
                <Sparkles className="w-8 h-8 text-[#111c4e]" />
              </motion.div>

              {/* Heading */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>

              {/* Description */}
              <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                Join thousands of UMAK students who have already experienced the convenience of our digital certificate system.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/services/gmc">
                  <Button
                    size="lg"
                    className="bg-[#ffc400] hover:bg-[#ffc400]/90 text-[#111c4e] font-bold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Request a Certificate
                  </Button>
                </Link>
                <Link href="/track">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-2 border-white/30 text-white font-bold px-8 py-6 text-lg rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                  >
                    <Clock className="mr-2 h-5 w-5" />
                    Track Your Request
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      <PublicFooter />
    </div>
  );
}
