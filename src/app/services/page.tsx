"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";

export default function ServicesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      {/* Services Content with Background */}
      <div className="relative flex-1">
        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/images/BG-1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: "1",
          }}
        ></div>

        {/* Services Title Section */}
        <section className="px-6 md:px-12 py-8 md:py-12 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <h1
              className="text-3xl md:text-5xl font-bold mb-2"
              style={{ color: "#111c4e" }}
            >
              Center for Student Formation and Discipline
            </h1>
            <h2
              className="text-3xl md:text-5xl font-bold"
              style={{ color: "#ffc400" }}
            >
              Services
            </h2>
          </div>
        </section>

        {/* Services Cards Section */}
        <section className="px-6 md:px-12 py-4 md:py-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* First Row - 5 Service Cards */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Good Moral Certificate */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 w-[160px] md:w-[200px] text-center hover:shadow-xl transition-shadow flex flex-col">
                <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/logos/GMC 1.png"
                    alt="Good Moral Certificate"
                    width={80}
                    height={80}
                    className="w-14 h-14 md:w-20 md:h-20 object-contain"
                  />
                </div>
                <h3
                  className="text-xs md:text-sm font-bold mb-3 md:mb-4 flex-grow"
                  style={{ color: "#111c4e" }}
                >
                  Good Moral Certificate
                </h3>
                <button
                  className="w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm cursor-pointer"
                  style={{ backgroundColor: "#2563eb" }}
                  onClick={() => router.push("/services/gmc")}
                >
                  Request
                </button>
              </div>

              {/* Uniform Exemption */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 w-[160px] md:w-[200px] text-center hover:shadow-xl transition-shadow flex flex-col">
                <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/logos/UNIFORM EXEMPTION 1.png"
                    alt="Uniform Exemption"
                    width={80}
                    height={80}
                    className="w-14 h-14 md:w-20 md:h-20 object-contain"
                  />
                </div>
                <h3
                  className="text-xs md:text-sm font-bold mb-3 md:mb-4 flex-grow"
                  style={{ color: "#111c4e" }}
                >
                  Uniform Exemption
                </h3>
                <button
                  className="w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm cursor-pointer"
                  style={{ backgroundColor: "#2563eb" }}
                  onClick={() => router.push("/services/uer")}
                >
                  Apply
                </button>
              </div>

              {/* Child Admission Clearance */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 w-[160px] md:w-[200px] text-center hover:shadow-xl transition-shadow flex flex-col">
                <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/logos/BRINGING CHILD 1.png"
                    alt="Child Admission Clearance"
                    width={96}
                    height={96}
                    className="w-16 h-16 md:w-24 md:h-24 object-contain"
                  />
                </div>
                <h3
                  className="text-xs md:text-sm font-bold mb-3 md:mb-4 flex-grow"
                  style={{ color: "#111c4e" }}
                >
                  Child Admission Clearance
                </h3>
                <button
                  className="w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm cursor-pointer"
                  style={{ backgroundColor: "#2563eb" }}
                  onClick={() => router.push("/services/cac")}
                >
                  Apply
                </button>
              </div>

              {/* Cross-Dressing Permit */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 w-[160px] md:w-[200px] text-center hover:shadow-xl transition-shadow flex flex-col">
                <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/logos/CROSS DRESS (1) 1.png"
                    alt="Cross-Dressing Permit"
                    width={80}
                    height={80}
                    className="w-14 h-14 md:w-20 md:h-20 object-contain"
                  />
                </div>
                <h3
                  className="text-xs md:text-sm font-bold mb-3 md:mb-4 flex-grow"
                  style={{ color: "#111c4e" }}
                >
                  Cross-Dressing Permit
                </h3>
                <button
                  className="w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm cursor-pointer"
                  style={{ backgroundColor: "#2563eb" }}
                  onClick={() => router.push("/services/cdc")}
                >
                  Apply
                </button>
              </div>

              {/* Complaint Desk */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 w-[160px] md:w-[200px] text-center hover:shadow-xl transition-shadow flex flex-col">
                <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/logos/COMPLAINT 1.png"
                    alt="Complaint Desk"
                    width={80}
                    height={80}
                    className="w-14 h-14 md:w-20 md:h-20 object-contain"
                  />
                </div>
                <h3
                  className="text-xs md:text-sm font-bold mb-3 md:mb-4 flex-grow"
                  style={{ color: "#111c4e" }}
                >
                  Complaint Desk
                </h3>
                <button
                  className="w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity text-xs md:text-sm cursor-pointer"
                  style={{ backgroundColor: "#2563eb" }}
                  onClick={() => router.push("/complaint")}
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Second Row - 2 Info Cards */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {/* Violation Notice Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex items-center gap-4 md:gap-6 w-full md:w-[500px]">
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
                  <button
                    className="px-4 md:px-6 py-2 rounded-lg font-medium text-xs md:text-sm hover:opacity-90 transition-opacity cursor-pointer"
                    style={{ backgroundColor: "#ffc400", color: "#111c4e" }}
                    onClick={() => router.push("/citation-slip")}
                  >
                    Instructions
                  </button>
                </div>
              </div>

              {/* Other Request Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex items-center gap-4 md:gap-6 w-full md:w-[500px]">
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
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}
