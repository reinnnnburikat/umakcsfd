"use client";

import React, { useState } from "react";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "@/lucide-react";
import { HelpCircle, Mail, Phone } from "lucide-react";

const faqCategories = [
  {
    category: "General Questions",
    faqs: [
      {
        question: "What is iCSFD+?",
        answer:
          "iCSFD+ (Integrated CSFD Digital Management System Plus) is the online portal for the Center for Student Formation and Discipline of the University of Makati. It allows students to submit certificate requests, track their status, and verify certificates online.",
      },
      {
        question: "Do I need an account to submit a request?",
        answer:
          "No, you do not need an account to submit certificate requests. You can submit requests anonymously. However, you will need to provide your email address to receive updates about your request.",
      },
      {
        question: "What are the office hours of CSFD?",
        answer:
          "CSFD processes requests during office hours: Monday to Friday, 8:00 AM to 5:00 PM. However, you can submit requests online 24/7 through this portal.",
      },
    ],
  },
  {
    category: "Good Moral Certificate",
    faqs: [
      {
        question: "What is a Good Moral Certificate?",
        answer:
          "A Good Moral Certificate is an official document issued by CSFD certifying that a student has good moral character and has no pending disciplinary cases. It is commonly required for employment, scholarship applications, graduate school admission, and other purposes.",
      },
      {
        question: "How long does it take to process a Good Moral Certificate?",
        answer:
          "Processing time typically takes 3-5 working days, depending on the volume of requests. You will receive an email notification once your certificate is ready for download.",
      },
      {
        question: "How long is the certificate valid?",
        answer:
          "Good Moral Certificates are valid for 6 months from the date of issuance. After that, you will need to request a new certificate.",
      },
      {
        question: "What documents do I need to submit?",
        answer:
          "Requirements vary based on your classification. Currently enrolled students need a valid School ID and current COR. Graduates need a valid ID and TOR or Diploma. Non-completers need proof of last enrollment.",
      },
    ],
  },
  {
    category: "Request Status & Tracking",
    faqs: [
      {
        question: "How can I track my request?",
        answer:
          "You can track your request using the Track Request page. Enter your control number (e.g., GMC-00001) or the tracking token sent to your email to view the status.",
      },
      {
        question: "What does each status mean?",
        answer:
          "NEW: Your request has been received and is waiting for review. PROCESSING: Your request is being processed. ISSUED: Your certificate is ready for download. HOLD: Your request needs additional information or documents. REJECTED: Your request was not approved.",
      },
      {
        question: "I haven't received any email updates. What should I do?",
        answer:
          "Please check your spam/junk folder. If you still can't find the email, you can track your request using your control number on the Track Request page. You can also contact CSFD directly at csfd@umak.edu.ph.",
      },
    ],
  },
  {
    category: "Certificate Verification",
    faqs: [
      {
        question: "How can I verify a certificate?",
        answer:
          "You can verify certificates through the Verify Certificate page. Enter the 16-character verification code found on the certificate or scan the QR code to check its authenticity.",
      },
      {
        question: "What if a certificate shows as expired?",
        answer:
          "Certificates are valid for 6 months. If a certificate is expired, the holder needs to request a new one from CSFD.",
      },
      {
        question: "What if a certificate cannot be found?",
        answer:
          "If a certificate cannot be found in our system, it may be fraudulent. Please contact CSFD immediately to report this.",
      },
    ],
  },
  {
    category: "Technical Support",
    faqs: [
      {
        question: "I'm having trouble uploading documents. What should I do?",
        answer:
          "Make sure your files are in PDF, JPG, PNG, DOC, or DOCX format and each file is under 10MB. If you're still having trouble, try using a different browser or contact CSFD for assistance.",
      },
      {
        question: "Can I edit my request after submission?",
        answer:
          "No, you cannot edit a request after submission. If you need to make changes, please contact CSFD at csfd@umak.edu.ph with your control number.",
      },
      {
        question: "Is my information secure?",
        answer:
          "Yes, we take data security seriously. All information is encrypted and stored securely. We only collect information necessary for processing your requests.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur mb-6">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Find answers to common questions about our services
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {faqCategories.map((category, index) => (
              <div key={index}>
                <h2 className="text-xl font-bold mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${index}-${faqIndex}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-muted-foreground mb-8">
                If you couldn't find the answer you're looking for, please reach out to us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Card className="flex-1">
                  <CardContent className="p-6 flex items-center gap-4">
                    <Mail className="h-8 w-8 text-orange-500" />
                    <div className="text-left">
                      <h3 className="font-medium">Email Us</h3>
                      <p className="text-sm text-muted-foreground">csfd@umak.edu.ph</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="flex-1">
                  <CardContent className="p-6 flex items-center gap-4">
                    <Phone className="h-8 w-8 text-orange-500" />
                    <div className="text-left">
                      <h3 className="font-medium">Call Us</h3>
                      <p className="text-sm text-muted-foreground">8883-1875</p>
                    </div>
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
