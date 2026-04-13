"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const colleges = [
  "College of Business and Financial Management",
  "College of Continuing Advanced and Professional Studies",
  "College of Construction Sciences and Engineering",
  "College of Computing and Information Sciences",
  "College of Engineering Technology",
  "College of Governance and Public Policy",
  "College of Human Kinetics",
  "College of Innovative Teacher Education",
  "CITE-Higher School ng UMak",
  "College of Tourism and Hospitality Management",
  "Institute of Arts and Design",
  "Institute of Disaster and Emergency Management",
  "Institutes of Imaging Health Sciences",
  "Institute of Accountancy",
  "Institutes of Nursing",
  "Institutes of Pharmacy",
  "Institute of Psychology",
  "Institute of Social Works",
  "School of Law",
  "Other",
];

export default function CDCRequestPage() {
  const router = useRouter();
  const [page, setPage] = useState<"process" | "form" | "success">("process");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [controlNumber, setControlNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");

  const [formData, setFormData] = useState({
    givenName: "",
    surname: "",
    middleName: "",
    extensionName: "",
    sex: "",
    studentNumber: "",
    college: "",
    email: "",
    phone: "",
    purpose: "",
    eventName: "",
    eventDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.givenName.trim()) newErrors.givenName = "Given name is required";
    if (!formData.surname.trim()) newErrors.surname = "Surname is required";
    if (!formData.sex) newErrors.sex = "Sex is required";
    if (!formData.studentNumber.trim()) newErrors.studentNumber = "Student number is required";
    if (!formData.college) newErrors.college = "College/Institute is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose/Reason is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      if (!validateStep1()) {
        setCurrentStep(1);
        return;
      }
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "CDC",
          requestorFirstName: formData.givenName,
          requestorMiddleName: formData.middleName,
          requestorLastName: formData.surname,
          requestorExtensionName: formData.extensionName,
          requestorEmail: formData.email,
          requestorPhone: formData.phone,
          requestorStudentNo: formData.studentNumber,
          requestorCollege: formData.college,
          requestorSex: formData.sex,
          purpose: formData.purpose,
          eventName: formData.eventName,
          eventDate: formData.eventDate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setControlNumber(data.data.controlNumber);
        setTrackingToken(data.data.trackingToken);
        setPage("success");
        toast.success("Request submitted successfully!");
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Page
  if (page === "success") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <PublicNavbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <Image
                src="/icons/thankyoucheck.png"
                alt="Success"
                width={120}
                height={120}
                className="mx-auto"
              />
            </div>
            <h1
              className="text-3xl font-black mb-4"
              style={{ color: "#111c4e", fontFamily: "Metropolis, sans-serif" }}
            >
              THANK YOU!
            </h1>
            <p className="text-gray-600 mb-6">
              Your request has been submitted successfully.
            </p>
            <div
              className="rounded-xl p-6 mb-6"
              style={{ backgroundColor: "#000B3C" }}
            >
              <p className="text-white text-sm mb-2">Your Control Number</p>
              <p
                className="text-3xl font-mono font-bold"
                style={{ color: "#ffc400" }}
              >
                {controlNumber}
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-8">
              Please save your control number. You can use it to track your request status.
              A confirmation email has been sent to {formData.email}.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#111c4e", color: "white" }}
                onClick={() => router.push("/track")}
              >
                Track Request
              </button>
              <button
                className="px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#1F9E55", color: "white" }}
                onClick={() => router.push("/")}
              >
                Back to Home
              </button>
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Process Page
  if (page === "process") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <PublicNavbar />

        <section className="px-6 md:px-12 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1
                className="text-3xl md:text-4xl font-black mb-2"
                style={{ color: "#3d3d3d", fontFamily: "Metropolis, sans-serif" }}
              >
                PROCESS FOR REQUESTING
              </h1>
              <h2
                className="text-2xl md:text-3xl font-black"
                style={{ color: "#ffc400", fontFamily: "Metropolis, sans-serif" }}
              >
                CROSS-DRESSING CLEARANCE
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-green-600"></div>

              {[
                "Prepare a letter of request for Cross-Dressing Clearance addressed to the CSFD office, stating the purpose and event details.",
                "Submit the request letter along with your valid ID, COR, and endorsement letter from Dean/Department Head to the CSFD office.",
                "Wait for the processing of your request. The CSFD office will review your justification and supporting documents.",
                "Claim your Cross-Dressing Clearance from the CSFD office once approved.",
              ].map((text, index) => (
                <div key={index} className="flex gap-6 mb-8 relative items-center last:mb-0">
                  <div
                    className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0 z-10"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
                    <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: "#111c4e" }}>
                      Step {index + 1}
                    </h3>
                    <p className="text-gray-700 text-sm md:text-base">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-6 mt-12">
              <button
                className="px-8 py-3 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#dc2626", color: "white" }}
                onClick={() => router.push("/services")}
              >
                Cancel
              </button>
              <button
                className="px-8 py-3 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#1F9E55", color: "white" }}
                onClick={() => setPage("form")}
              >
                Proceed
              </button>
            </div>
          </div>
        </section>

        <PublicFooter />
      </div>
    );
  }

  // Form Page
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <PublicNavbar />

      <section className="px-6 md:px-12 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1
              className="text-2xl md:text-4xl font-black mb-2"
              style={{ color: "#3d3d3d", fontFamily: "Metropolis, sans-serif" }}
            >
              {currentStep === 1 ? "REQUESTER" : currentStep === 2 ? "REQUEST" : "SUMMARY"}
            </h1>
            <h2
              className="text-xl md:text-3xl font-black"
              style={{ color: "#ffc400", fontFamily: "Metropolis, sans-serif" }}
            >
              {currentStep === 1 ? "INFORMATION" : currentStep === 2 ? "DETAILS" : "REVIEW"}
            </h2>
          </div>

          {/* Step 1: Requester Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    GIVEN NAME<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your given name"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: errors.givenName ? "#dc2626" : "#111c4e" }}
                    value={formData.givenName}
                    onChange={(e) => handleInputChange("givenName", e.target.value)}
                  />
                  {errors.givenName && <p className="text-red-500 text-sm mt-1">{errors.givenName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    SURNAME<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your surname"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: errors.surname ? "#dc2626" : "#111c4e" }}
                    value={formData.surname}
                    onChange={(e) => handleInputChange("surname", e.target.value)}
                  />
                  {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    MIDDLE NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your middle name"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.middleName}
                    onChange={(e) => handleInputChange("middleName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    EXTENSION NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Jr., Sr., III"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.extensionName}
                    onChange={(e) => handleInputChange("extensionName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    SEX<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                    style={{ borderColor: errors.sex ? "#dc2626" : "#111c4e" }}
                    value={formData.sex}
                    onChange={(e) => handleInputChange("sex", e.target.value)}
                  >
                    <option value="">Select your sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    UMAK STUDENT NUMBER<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2020-00000"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: errors.studentNumber ? "#dc2626" : "#111c4e" }}
                    value={formData.studentNumber}
                    onChange={(e) => handleInputChange("studentNumber", e.target.value)}
                  />
                  {errors.studentNumber && <p className="text-red-500 text-sm mt-1">{errors.studentNumber}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                  COLLEGE/INSTITUTE<span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                  style={{ borderColor: errors.college ? "#dc2626" : "#111c4e" }}
                  value={formData.college}
                  onChange={(e) => handleInputChange("college", e.target.value)}
                >
                  <option value="">Select your college/institute</option>
                  {colleges.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
                {errors.college && <p className="text-red-500 text-sm mt-1">{errors.college}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    EMAIL ADDRESS<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: errors.email ? "#dc2626" : "#111c4e" }}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="09XX XXX XXXX"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Request Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                  PURPOSE / REASON FOR CROSS-DRESSING<span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Explain the purpose or reason for requesting cross-dressing clearance..."
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none min-h-[120px] resize-y"
                  style={{ borderColor: errors.purpose ? "#dc2626" : "#111c4e" }}
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                />
                {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    EVENT NAME (if applicable)
                  </label>
                  <input
                    type="text"
                    placeholder="Name of the event"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.eventName}
                    onChange={(e) => handleInputChange("eventName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    EVENT DATE (if applicable)
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.eventDate}
                    onChange={(e) => handleInputChange("eventDate", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h3 className="text-lg font-bold mb-6" style={{ color: "#111c4e" }}>
                Please review your information before submitting
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Given Name</p>
                  <p className="font-medium">{formData.givenName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Surname</p>
                  <p className="font-medium">{formData.surname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Middle Name</p>
                  <p className="font-medium">{formData.middleName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Extension Name</p>
                  <p className="font-medium">{formData.extensionName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sex</p>
                  <p className="font-medium">{formData.sex}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Student Number</p>
                  <p className="font-medium">{formData.studentNumber}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">College/Institute</p>
                  <p className="font-medium">{formData.college}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{formData.phone || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Purpose / Reason</p>
                  <p className="font-medium">{formData.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Event Name</p>
                  <p className="font-medium">{formData.eventName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Event Date</p>
                  <p className="font-medium">{formData.eventDate || "-"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 md:gap-6 mt-8 md:mt-12">
            {currentStep > 1 && (
              <button
                className="px-6 md:px-8 py-3 rounded-lg font-medium text-base md:text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#2563eb", color: "white" }}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                BACK
              </button>
            )}
            <button
              className="px-6 md:px-8 py-3 rounded-lg font-medium text-base md:text-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#dc2626", color: "white" }}
              onClick={() => setShowCancelModal(true)}
            >
              CANCEL
            </button>
            {currentStep < 3 ? (
              <button
                className="px-6 md:px-8 py-3 rounded-lg font-medium text-base md:text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#1F9E55", color: "white" }}
                onClick={() => {
                  if (currentStep === 1 && validateStep1()) {
                    setCurrentStep(currentStep + 1);
                  } else if (currentStep === 2 && validateStep2()) {
                    setCurrentStep(currentStep + 1);
                  }
                }}
              >
                PROCEED
              </button>
            ) : (
              <button
                className="px-6 md:px-8 py-3 rounded-lg font-medium text-base md:text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "#1F9E55", color: "white" }}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    SUBMITTING...
                  </span>
                ) : (
                  "SUBMIT REQUEST"
                )}
              </button>
            )}
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
