"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="flex justify-between items-center px-6 md:px-12 py-4 shadow-md"
        style={{ backgroundColor: "#111c4e" }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <Image
            src="/logos/UMAK LOGO.png"
            alt="UMak Logo"
            width={60}
            height={60}
            className="w-12 h-12 md:w-15 md:h-15 rounded-full object-cover"
          />
          <Image
            src="/logos/CSFD LOGO.png"
            alt="CSFD Logo"
            width={60}
            height={60}
            className="w-12 h-12 md:w-15 md:h-15 rounded-full object-cover"
          />
          <span className="hidden sm:block text-sm md:text-lg text-white">
            Center for Student Formation and Discipline
          </span>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link
            href="/services"
            className="text-white font-medium hover:opacity-80 transition-opacity"
          >
            Services
          </Link>
          <Link
            href="/about"
            className="text-white font-medium hover:opacity-80 transition-opacity"
          >
            About
          </Link>
          <Link
            href="/auth/login"
            className="text-white font-medium hover:opacity-80 transition-opacity"
          >
            Log In
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[400px] md:h-[500px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/landingpagebg.png')`,
        }}
      >
        <div className="text-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Welcome back, <span style={{ color: "#ffc400" }}>Heron!</span>
          </h1>
          <p className="text-lg md:text-2xl font-light drop-shadow-md">
            University of Makati, University of Character.
          </p>
        </div>
      </section>

      {/* UMak CSFD Section */}
      <section
        className="px-6 md:px-12 py-12 md:py-16 relative"
        style={{
          backgroundColor: "#111c4e",
          backgroundImage: `url('/images/BG-1.png')`,
          backgroundSize: "contain",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
          <div className="flex-1 text-white text-center md:text-left">
            <h2
              className="text-4xl md:text-7xl font-bold mb-4 md:mb-5 leading-none"
              style={{ color: "#ffc400" }}
            >
              UMak CSFD
            </h2>
            <p className="text-lg md:text-xl mb-4 leading-relaxed">
              The Center for Student Formation & Discipline monitors and
              supervises student&apos;s moral rectitude.
            </p>
            <p className="text-sm md:text-base opacity-80">
              (Formerly Prefect of Student Discipline)
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="/images/FILLER IMAGE 1.png"
              alt="Students"
              width={450}
              height={300}
              className="w-full max-w-[450px] h-auto object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Main Service Section */}
      <section
        className="px-6 md:px-12 py-12 md:py-16 text-center"
        style={{
          background: "linear-gradient(135deg, #ffc400 0%, #e6b000 100%)",
        }}
      >
        <h2
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: "#111c4e" }}
        >
          Main Service
        </h2>
        <p
          className="text-lg md:text-xl mb-8 md:mb-10"
          style={{ color: "#111c4e" }}
        >
          Want to request good moral or complaint?
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8 mb-8">
          <Link
            href="/services/gmc"
            className="text-white px-6 md:px-8 py-3 md:py-4 rounded font-medium hover:shadow-xl transform hover:-translate-y-1 transition-all shadow-lg"
            style={{ backgroundColor: "#111c4e" }}
          >
            Request Good Moral Certificate
          </Link>
          <Link
            href="/complaint"
            className="text-white px-6 md:px-8 py-3 md:py-4 rounded font-medium hover:shadow-xl transform hover:-translate-y-1 transition-all shadow-lg"
            style={{ backgroundColor: "#111c4e" }}
          >
            File a complaint
          </Link>
        </div>
        <p className="italic" style={{ color: "#111c4e" }}>
          or visit our services offered
        </p>
      </section>

      {/* Services Preview Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: "#111c4e" }}
          >
            Center for Student Formation and Discipline
          </h2>
          <h3
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "#ffc400" }}
          >
            Services
          </h3>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          {/* Good Moral Certificate */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 text-center hover:shadow-xl transition-shadow flex flex-col">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 flex items-center justify-center flex-shrink-0">
              <Image
                src="/logos/GMC 1.png"
                alt="Good Moral Certificate"
                width={80}
                height={80}
                className="w-14 h-14 md:w-16 md:h-16 object-contain"
              />
            </div>
            <h3
              className="text-xs md:text-sm font-bold mb-3 md:mb-4 flex-grow"
              style={{ color: "#111c4e" }}
            >
              Good Moral Certificate
            </h3>
            <Link
              href="/services/gmc"
              className="w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm"
              style={{ backgroundColor: "#2563eb" }}
            >
              Request
            </Link>
          </div>

          {/* Uniform Exemption */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 text-center hover:shadow-xl transition-shadow flex flex-col">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 flex items-center justify-center flex-shrink-0">
              <Image
                src="/logos/UNIFORM EXEMPTION 1.png"
                alt="Uniform Exemption"
                width={80}
                height={80}
                className="w-14 h-14 md:w-16 md:h-16 object-contain"
              />
            </div>
            <h3
              className="text-xs md:text-sm font-bold mb-3 md:mb-4 flex-grow"
              style={{ color: "#111c4e" }}
            >
              Uniform Exemption
            </h3>
            <Link
              href="/services/uer"
              className="w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm"
              style={{ backgroundColor: "#2563eb" }}
            >
              Apply
            </Link>
          </div>

          {/* Child Admission Clearance */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 text-center hover:shadow-xl transition-shadow flex flex-col">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 flex items-center justify-center flex-shrink-0">
              <Image
                src="/logos/BRINGING CHILD 1.png"
                alt="Child Admission Clearance"
                width={96}
                height={96}
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
            </div>
            <h3
              className="text-xs md:text-sm font-bold mb-3 md:mb-4 flex-grow"
              style={{ color: "#111c4e" }}
            >
              Child Admission Clearance
            </h3>
            <Link
              href="/services/cac"
              className="w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm"
              style={{ backgroundColor: "#2563eb" }}
            >
              Apply
            </Link>
          </div>

          {/* Cross-Dressing Permit */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 text-center hover:shadow-xl transition-shadow flex flex-col">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 flex items-center justify-center flex-shrink-0">
              <Image
                src="/logos/CROSS DRESS (1) 1.png"
                alt="Cross-Dressing Permit"
                width={80}
                height={80}
                className="w-14 h-14 md:w-16 md:h-16 object-contain"
              />
            </div>
            <h3
              className="text-xs md:text-sm font-bold mb-3 md:mb-4 flex-grow"
              style={{ color: "#111c4e" }}
            >
              Cross-Dressing Permit
            </h3>
            <Link
              href="/services/cdc"
              className="w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm"
              style={{ backgroundColor: "#2563eb" }}
            >
              Apply
            </Link>
          </div>

          {/* Complaint Desk */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 text-center hover:shadow-xl transition-shadow flex flex-col col-span-2 sm:col-span-1">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 flex items-center justify-center flex-shrink-0">
              <Image
                src="/logos/COMPLAINT 1.png"
                alt="Complaint Desk"
                width={80}
                height={80}
                className="w-14 h-14 md:w-16 md:h-16 object-contain"
              />
            </div>
            <h3
              className="text-xs md:text-sm font-bold mb-3 md:mb-4 flex-grow"
              style={{ color: "#111c4e" }}
            >
              Complaint Desk
            </h3>
            <Link
              href="/complaint"
              className="w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm"
              style={{ backgroundColor: "#2563eb" }}
            >
              Submit
            </Link>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Violation Notice Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex items-center gap-4 md:gap-6">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#dc2626" }}
            >
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3
                className="text-base md:text-lg font-bold mb-1"
                style={{ color: "#111c4e" }}
              >
                Received a Violation Notice/Citation?
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-3">
                Access and read the instructions below.
              </p>
              <Link
                href="/citation-slip"
                className="inline-block px-4 md:px-6 py-2 rounded-lg font-medium text-xs md:text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#ffc400", color: "#111c4e" }}
              >
                Instructions
              </Link>
            </div>
          </div>

          {/* Other Request Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0">
              <Image
                src="/icons/pepicons-pop_bulletin-notice.png"
                alt="Other Request"
                width={80}
                height={80}
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
            </div>
            <div>
              <h3
                className="text-base md:text-lg font-bold mb-1"
                style={{ color: "#111c4e" }}
              >
                Other request?
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                Please proceed to the CSFD Office.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
