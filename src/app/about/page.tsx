"use client";

import React from "react";
import Image from "next/image";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Target,
  Eye,
  Award,
  Users,
  BookOpen,
  Shield,
  Clock,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

// Staff data based on CSFD UMAK
const staffMembers = [
  {
    id: 1,
    name: "Mr. Pompeyo S. Maralit",
    title: "CSFD Director",
    description: "Leads the Center for Student Formation and Discipline with dedication to student development and character formation.",
    image: "/staff/pompeyo-maralit.jpg",
    placeholder: true,
  },
  {
    id: 2,
    name: "Ms. Samares C. Galindez",
    title: "Administrative Officer",
    description: "Manages administrative operations and ensures efficient delivery of student services.",
    image: "/staff/samares-galindez.jpg",
    placeholder: true,
  },
];

const teamMembers = [
  {
    name: "Student Formation Team",
    description: "Handles student development programs, workshops, and formation activities.",
    icon: Users,
  },
  {
    name: "Discipline Office",
    description: "Manages student conduct, disciplinary proceedings, and conflict resolution.",
    icon: Shield,
  },
  {
    name: "Administrative Support",
    description: "Provides clerical and administrative assistance for all CSFD operations.",
    icon: BookOpen,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative py-16 md:py-24 overflow-hidden"
          style={{ backgroundColor: "#111c4e" }}
        >
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffc400]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffc400]/5 rounded-full blur-2xl" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#ffc400]/30 rounded-full blur-sm" />
                <Image
                  src="/logos/UMAK LOGO.png"
                  alt="UMak Logo"
                  width={72}
                  height={72}
                  className="relative w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white/30"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-[#ffc400]/30 rounded-full blur-sm" />
                <Image
                  src="/logos/CSFD LOGO.png"
                  alt="CSFD Logo"
                  width={72}
                  height={72}
                  className="relative w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white/30"
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                CENTER FOR STUDENT FORMATION AND DISCIPLINE
              </h1>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                University of Makati - Nurturing Character, Building Future Leaders
              </p>
            </motion.div>
          </div>

          {/* Wave decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
              <path
                d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                className="fill-background"
              />
            </svg>
          </div>
        </section>

        {/* About Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2
                className="text-2xl md:text-3xl font-bold mb-6 text-center"
                style={{ color: "#111c4e" }}
              >
                ABOUT CSFD
              </h2>
              <Card className="p-6 md:p-8 border-2 hover:border-[#ffc400]/30 transition-colors">
                <CardContent className="prose prose-lg dark:prose-invert max-w-none p-0">
                  <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                    The <strong>Center for Student Formation and Discipline (CSFD)</strong> is a 
                    vital unit of the University of Makati dedicated to the holistic development 
                    of students. We are committed to nurturing well-rounded individuals who embody 
                    the core values of the University: <strong>Integrity, Excellence, and Service</strong>.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4 text-base md:text-lg">
                    Our center provides comprehensive services including certificate issuance 
                    (Good Moral Certificate, Uniform Exemption, Cross-Dressing Clearance, and 
                    Child Admission Clearance), student formation programs, and fair disciplinary 
                    processes. We believe in the transformative power of education combined with 
                    character development.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4 text-base md:text-lg">
                    Through our digital platform <strong>iCSFD+</strong>, we aim to provide 
                    efficient, transparent, and accessible services to the UMAK community.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card
                  className="h-full text-white overflow-hidden"
                  style={{ backgroundColor: "#111c4e" }}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-[#ffc400]">
                        <Eye className="h-6 w-6 text-[#111c4e]" />
                      </div>
                      <h3 className="text-xl font-bold">VISION</h3>
                    </div>
                    <p className="text-white/90 leading-relaxed">
                      A leading center for student formation and discipline that produces 
                      graduates of character and integrity, recognized for excellence in 
                      developing holistic individuals ready to contribute to nation-building.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card
                  className="h-full text-white overflow-hidden"
                  style={{ backgroundColor: "#ffc400" }}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-[#111c4e]">
                        <Target className="h-6 w-6 text-[#ffc400]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#111c4e]">MISSION</h3>
                    </div>
                    <p className="text-[#111c4e]/90 leading-relaxed">
                      To provide holistic student formation programs and fair disciplinary 
                      processes that nurture responsible, ethical, and community-oriented 
                      individuals who embody the core values of the University of Makati.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Staff & Administrators */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2
                className="text-2xl md:text-3xl font-bold mb-4 text-center"
                style={{ color: "#111c4e" }}
              >
                STAFF & ADMINISTRATORS
              </h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                Meet the dedicated team behind the Center for Student Formation and Discipline
              </p>
            </motion.div>

            {/* Leadership */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {staffMembers.map((staff, index) => (
                <motion.div
                  key={staff.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow border-2 hover:border-[#ffc400]/30">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Staff Photo */}
                        <div className="sm:w-40 flex-shrink-0">
                          <div
                            className="h-48 sm:h-full w-full relative"
                            style={{ backgroundColor: "#111c4e" }}
                          >
                            {staff.placeholder ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-24 h-24 rounded-full bg-[#ffc400]/20 flex items-center justify-center mx-auto mb-2">
                                    <span className="text-3xl font-bold text-[#ffc400]">
                                      {staff.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                    </span>
                                  </div>
                                  <span className="text-xs text-white/50">Photo coming soon</span>
                                </div>
                              </div>
                            ) : (
                              <Image
                                src={staff.image}
                                alt={staff.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                        </div>

                        {/* Staff Info */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start gap-2 mb-2">
                            {staff.title.includes("Director") && (
                              <Award className="w-5 h-5 text-[#ffc400] mt-0.5 flex-shrink-0" />
                            )}
                            <h3
                              className="text-lg md:text-xl font-bold"
                              style={{ color: "#111c4e" }}
                            >
                              {staff.name}
                            </h3>
                          </div>
                          <p
                            className="text-sm font-semibold mb-3"
                            style={{ color: "#ffc400" }}
                          >
                            {staff.title}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {staff.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Team Sections */}
            <div className="grid sm:grid-cols-3 gap-6">
              {teamMembers.map((team, index) => {
                const Icon = team.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 hover:border-[#ffc400]/30 h-full">
                      <CardContent className="p-0">
                        <div
                          className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                          style={{ backgroundColor: "#111c4e" }}
                        >
                          <Icon className="w-7 h-7 text-[#ffc400]" />
                        </div>
                        <h4
                          className="font-bold mb-2"
                          style={{ color: "#111c4e" }}
                        >
                          {team.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {team.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Office Hours */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-6 h-6" style={{ color: "#111c4e" }} />
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "#111c4e" }}
                  >
                    OFFICE HOURS
                  </h3>
                </div>
                <Card className="inline-block">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                      <div className="text-center">
                        <p className="font-semibold" style={{ color: "#111c4e" }}>
                          Monday - Friday
                        </p>
                        <p className="text-muted-foreground">8:00 AM - 5:00 PM</p>
                      </div>
                      <div className="hidden sm:block w-px bg-border" />
                      <div className="text-center">
                        <p className="font-semibold" style={{ color: "#111c4e" }}>
                          Saturday - Sunday
                        </p>
                        <p className="text-muted-foreground">Closed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section style={{ backgroundColor: "#111c4e" }} className="py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
                  CONTACT <span style={{ color: "#ffc400" }}>INFORMATION</span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white/10 backdrop-blur border-white/20">
                    <CardContent className="p-6 text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-3" style={{ color: "#ffc400" }} />
                      <h3 className="font-medium mb-2">Address</h3>
                      <p className="text-sm text-white/70">
                        University of Makati, J.P. Rizal Extension, West Rembo, Makati City 1210
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur border-white/20">
                    <CardContent className="p-6 text-center">
                      <Phone className="h-8 w-8 mx-auto mb-3" style={{ color: "#ffc400" }} />
                      <h3 className="font-medium mb-2">Phone</h3>
                      <p className="text-sm text-white/70">8883-1875</p>
                      <p className="text-xs text-white/50 mt-1">loc. 2101</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur border-white/20">
                    <CardContent className="p-6 text-center">
                      <Mail className="h-8 w-8 mx-auto mb-3" style={{ color: "#ffc400" }} />
                      <h3 className="font-medium mb-2">Email</h3>
                      <p className="text-sm text-white/70">csfd@umak.edu.ph</p>
                      <p className="text-xs text-white/50 mt-1">csfdgoodmoral@umak.edu.ph</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur border-white/20">
                    <CardContent className="p-6 text-center">
                      <ExternalLink className="h-8 w-8 mx-auto mb-3" style={{ color: "#ffc400" }} />
                      <h3 className="font-medium mb-2">Website</h3>
                      <p className="text-sm text-white/70">umak.edu.ph</p>
                      <div className="flex justify-center gap-3 mt-3">
                        <a
                          href="https://facebook.com/UMakCSFD"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/60 hover:text-[#ffc400] transition-colors"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                        <a
                          href="https://twitter.com/UMakCSFD"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/60 hover:text-[#ffc400] transition-colors"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                        <a
                          href="https://instagram.com/UMakCSFD"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/60 hover:text-[#ffc400] transition-colors"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
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
