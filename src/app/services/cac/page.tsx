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

const relationships = [
  "Mother",
  "Father",
  "Guardian",
  "Grandmother",
  "Grandfather",
  "Aunt",
  "Uncle",
  "Other",
];

export default function CACRequestPage() {
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
    childName: "",
    childAge: "",
    childBirthday: "",
    relationship: "",
    reasonForBringing: "",
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
    if (!formData.childName.trim()) newErrors.childName = "Child's name is required";
    if (!formData.childAge.trim()) newErrors.childAge = "Child's age is required";
    if (!formData.childBirthday.trim()) newErrors.childBirthday = "Child's birthday is required";
    if (!formData.relationship) newErrors.relationship = "Relationship is required";
    if (!formData.reasonForBringing.trim()) newErrors.reasonForBringing = "Reason is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "CAC",
          requestorFirstName: formData.givenName,
          requestorMiddleName: formData.middleName,
          requestorLastName: formData.surname,
          requestorExtensionName: formData.extensionName,
          requestorEmail: formData.email,
          requestorPhone: formData.phone,
          requestorStudentNo: formData.studentNumber,
          requestorCollege: formData.college,
          requestorSex: formData.sex,
          childName: formData.childName,
          childAge: formData.childAge,
          childBirthday: formData.childBirthday,
          relationship: formData.relationship,
          reasonForBringing: formData.reasonForBringing,
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
                CHILD ADMISSION CLEARANCE
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-green-600"></div>

              {[
                "Fill out the Child Admission Clearance request form with accurate information about yourself and the child.",
                "Provide the reason for bringing the child to the university campus and your relationship to the child.",
                "Submit the request and wait for approval from the CSFD office. Processing typically takes 1-2 business days.",
                "Once approved, bring the child to the campus on the scheduled date with the clearance confirmation.",
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
              {currentStep === 1 ? "REQUESTER/PARENT" : currentStep === 2 ? "CHILD" : "SUMMARY"}
            </h1>
            <h2
              className="text-xl md:text-3xl font-black"
              style={{ color: "#ffc400", fontFamily: "Metropolis, sans-serif" }}
            >
              {currentStep === 1 ? "INFORMATION" : currentStep === 2 ? "INFORMATION" : "REVIEW"}
            </h2>
          </div>

          {/* Step 1: Requester/Parent Information */}
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

          {/* Step 2: Child Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    CHILD&apos;S NAME<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter child's full name"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: errors.childName ? "#dc2626" : "#111c4e" }}
                    value={formData.childName}
                    onChange={(e) => handleInputChange("childName", e.target.value)}
                  />
                  {errors.childName && <p className="text-red-500 text-sm mt-1">{errors.childName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    CHILD&apos;S AGE<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter child's age"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: errors.childAge ? "#dc2626" : "#111c4e" }}
                    value={formData.childAge}
                    onChange={(e) => handleInputChange("childAge", e.target.value)}
                  />
                  {errors.childAge && <p className="text-red-500 text-sm mt-1">{errors.childAge}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    CHILD&apos;S BIRTHDAY<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                    style={{ borderColor: errors.childBirthday ? "#dc2626" : "#111c4e" }}
                    value={formData.childBirthday}
                    onChange={(e) => handleInputChange("childBirthday", e.target.value)}
                  />
                  {errors.childBirthday && <p className="text-red-500 text-sm mt-1">{errors.childBirthday}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    RELATIONSHIP TO CHILD<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                    style={{ borderColor: errors.relationship ? "#dc2626" : "#111c4e" }}
                    value={formData.relationship}
                    onChange={(e) => handleInputChange("relationship", e.target.value)}
                  >
                    <option value="">Select relationship</option>
                    {relationships.map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                  {errors.relationship && <p className="text-red-500 text-sm mt-1">{errors.relationship}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                  REASON FOR BRINGING CHILD<span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Explain why you need to bring the child to campus..."
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none min-h-[100px]"
                  style={{ borderColor: errors.reasonForBringing ? "#dc2626" : "#111c4e" }}
                  value={formData.reasonForBringing}
                  onChange={(e) => handleInputChange("reasonForBringing", e.target.value)}
                />
                {errors.reasonForBringing && <p className="text-red-500 text-sm mt-1">{errors.reasonForBringing}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h3 className="text-lg font-bold mb-6" style={{ color: "#111c4e" }}>
                Please review your information before submitting
              </h3>
              
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-4 pb-2 border-b" style={{ color: "#111c4e" }}>
                  Requester/Parent Information
                </h4>
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
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-4 pb-2 border-b" style={{ color: "#111c4e" }}>
                  Child Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Child&apos;s Name</p>
                    <p className="font-medium">{formData.childName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Child&apos;s Age</p>
                    <p className="font-medium">{formData.childAge}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Child&apos;s Birthday</p>
                    <p className="font-medium">{formData.childBirthday}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Relationship</p>
                    <p className="font-medium">{formData.relationship}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Reason for Bringing Child</p>
                    <p className="font-medium">{formData.reasonForBringing}</p>
                  </div>
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
                onClick={handleNextStep}
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
