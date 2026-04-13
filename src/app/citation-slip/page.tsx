"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";

const steps = [
  {
    title: "Step 1",
    description: "Prepare an apology letter using the provided format.",
  },
  {
    title: "Step 2",
    description: "Wait for the validation of your request. Once validated, an email will be sent through your email for certification.",
  },
  {
    title: "Step 3",
    description: "Print the emailed certificate.",
  },
  {
    title: "Step 4",
    description: "Proceed to the Center for Student Formation and Discipline (CSFD) to have your Citation Slip request certified with the official University seal.",
  },
];

export default function CitationSlipPage() {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [iAgree, setIAgree] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <PublicNavbar />

      <section className="px-6 md:px-12 py-12 md:py-16 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1
              className="text-3xl md:text-4xl font-black mb-2"
              style={{ color: "#3d3d3d", fontFamily: "Metropolis, sans-serif" }}
            >
              CITATION SLIP
            </h1>
            <h2
              className="text-2xl md:text-3xl font-black"
              style={{ color: "#ffc400", fontFamily: "Metropolis, sans-serif" }}
            >
              PROCESS
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-green-600"></div>

            <div className="space-y-6 md:space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 md:gap-6 relative items-center">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0 z-10"
                  >
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex-1">
                    <h3
                      className="text-lg md:text-xl font-bold mb-2"
                      style={{ color: "#111c4e" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-gray-700 text-sm md:text-base">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* I Agree Checkbox */}
          <div className="flex justify-center mt-8 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  iAgree ? "bg-green-600 border-green-600" : "border-gray-400"
                }`}
                onClick={() => {
                  setIAgree(!iAgree);
                  setError("");
                }}
              >
                {iAgree && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="font-bold text-base md:text-lg" style={{ color: "#111c4e" }}>
                I Agree
              </span>
            </label>
          </div>
          {error && (
            <p className="text-center text-sm mb-4" style={{ color: "#dc2626" }}>
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 md:gap-6">
            <button
              className="px-6 md:px-8 py-3 rounded-lg font-medium text-base md:text-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#dc2626", color: "white" }}
              onClick={() => setShowCancelModal(true)}
            >
              CANCEL
            </button>
            <button
              className="px-6 md:px-8 py-3 rounded-lg font-medium text-base md:text-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#1F9E55", color: "white" }}
              onClick={() => {
                if (!iAgree) {
                  setError("Please agree to the terms to proceed");
                  return;
                }
                router.push("/services");
              }}
            >
              PROCEED
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full"
            style={{ backgroundColor: "#000B3C" }}
          >
            <div className="flex justify-center mb-6">
              <Image
                src="/icons/line-md_file-cancel-filled.png"
                alt="Cancel"
                width={96}
                height={96}
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
            </div>

            <div className="text-center mb-4">
              <h3
                className="text-xl md:text-2xl font-black text-white"
                style={{ fontFamily: "Metropolis, sans-serif" }}
              >
                Are you sure you want to cancel?
              </h3>
            </div>

            <div className="text-center mb-8">
              <p className="text-white text-sm md:text-base">
                Upon cancelling, the request will not be saved.
              </p>
            </div>

            <div className="flex justify-center gap-4 md:gap-6">
              <button
                className="px-8 md:px-12 py-3 rounded-lg font-bold text-base md:text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#dc2626", color: "white" }}
                onClick={() => {
                  setShowCancelModal(false);
                  router.push("/services");
                }}
              >
                YES
              </button>
              <button
                className="px-8 md:px-12 py-3 rounded-lg font-bold text-base md:text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#1F9E55", color: "white" }}
                onClick={() => setShowCancelModal(false)}
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
