"use client";

import React from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Users,
  Target,
  Eye,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur mb-6">
              <div className="text-3xl font-bold">i+</div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              CENTER FOR STUDENT FORMATION AND DISCIPLINE
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              University of Makati - College of Computing and Information Sciences
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">ABOUT CSFD</h2>
            <Card className="p-8">
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  The Center for Student Formation and Discipline (CSFD) is committed to
                  developing well-rounded individuals who embody the core values of the
                  University of Makati. We provide comprehensive student services including
                  certificate issuance, disciplinary guidance, and character formation programs.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Our mission is to nurture responsible, ethical, and community-oriented
                  individuals through holistic student formation programs and fair disciplinary
                  processes. We believe in the transformative power of education and character
                  development.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="h-8 w-8" />
                    <h3 className="text-xl font-bold">VISION</h3>
                  </div>
                  <p className="text-white/90 leading-relaxed">
                    A leading center for student formation and discipline that produces
                    graduates of character and integrity, recognized for excellence in
                    developing holistic individuals ready to contribute to nation-building.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 text-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-8 w-8" />
                    <h3 className="text-xl font-bold">MISSION</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    To provide holistic student formation programs and fair disciplinary
                    processes that nurture responsible, ethical, and community-oriented
                    individuals who embody the core values of the University of Makati.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Staff & Administrators */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">STAFF & ADMINISTRATORS</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Dr. Maria Santos", title: "CSFD Director", initial: "MS" },
                { name: "Prof. Juan dela Cruz", title: "Assistant Director", initial: "JC" },
                { name: "Ms. Ana Reyes", title: "Administrative Officer", initial: "AR" },
                { name: "Mr. Carlo Mendoza", title: "Student Formation Officer", initial: "CM" },
                { name: "Ms. Grace Villanueva", title: "Discipline Officer", initial: "GV" },
                { name: "Mr. Peter Garcia", title: "Administrative Staff", initial: "PG" },
              ].map((staff, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {staff.initial}
                    </div>
                    <h3 className="font-semibold">{staff.name}</h3>
                    <p className="text-sm text-muted-foreground">{staff.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-slate-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">CONTACT INFORMATION</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6 text-center">
                    <MapPin className="h-8 w-8 mx-auto text-orange-500 mb-3" />
                    <h3 className="font-medium mb-2">Address</h3>
                    <p className="text-sm text-slate-400">
                      University of Makati, J.P. Rizal Extension, West Rembo, Makati City
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6 text-center">
                    <Phone className="h-8 w-8 mx-auto text-orange-500 mb-3" />
                    <h3 className="font-medium mb-2">Phone</h3>
                    <p className="text-sm text-slate-400">8883-1875</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6 text-center">
                    <Mail className="h-8 w-8 mx-auto text-orange-500 mb-3" />
                    <h3 className="font-medium mb-2">Email</h3>
                    <p className="text-sm text-slate-400">csfd@umak.edu.ph</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6 text-center">
                    <ExternalLink className="h-8 w-8 mx-auto text-orange-500 mb-3" />
                    <h3 className="font-medium mb-2">Website</h3>
                    <p className="text-sm text-slate-400">umak.edu.ph/centers/csfd</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
