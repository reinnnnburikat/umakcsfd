"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const requestTypes = [
  {
    value: "Student | Working Student",
    label: "Student | Working Student",
    description: "For currently enrolled students who are also employed, seeking uniform exemption while balancing work and academic responsibilities.",
  },
  {
    value: "Student | On-the-Job Training",
    label: "Student | On-the-Job Training",
    description: "For students undergoing practical training or internship programs as part of their academic curriculum requirements.",
  },
  {
    value: "Office/Center/College/Institute/Organization | Event",
    label: "Office/Center/College/Institute/Organization | Event",
    description: "For official events, activities, or functions organized by academic departments, administrative offices, or institutional units.",
  },
  {
    value: "College/Organization Shirt exemption approval",
    label: "College/Organization Shirt exemption approval",
    description: "For requests related to the authorized use of an official organization, college, or institute shirt in lieu of the prescribed uniform.",
  },
  {
    value: "Other",
    label: "Other/s",
    description: "For requests that do not fall under the specified categories; please provide additional details.",
  },
];

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

export default function UERRequestPage() {
  const router = useRouter();
  const [page, setPage] = useState<"process" | "form" | "details" | "summary" | "success">("process");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [controlNumber, setControlNumber] = useState("");

  const [formData, setFormData] = useState({
    typeOfRequest: "",
    otherSpecify: "",
    givenName: "",
    surname: "",
    middleName: "",
    extensionName: "",
    sex: "",
    studentNumber: "",
    college: "",
    course: "",
    yearLevel: "",
    email: "",
    phone: "",
    // For working student
    companyName: "",
    companyAddress: "",
    position: "",
    workSchedule: "",
    // For OJT
    ojtCompany: "",
    ojtAddress: "",
    ojtPosition: "",
    ojtSchedule: "",
    ojtStartDate: "",
    ojtEndDate: "",
    // For event
    eventName: "",
    eventDate: "",
    eventVenue: "",
    eventDescription: "",
    // For shirt
    shirtType: "",
    shirtReason: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.typeOfRequest) newErrors.typeOfRequest = "Type of request is required";
    if (formData.typeOfRequest === "Other" && !formData.otherSpecify.trim()) {
      newErrors.otherSpecify = "Please specify the type of request";
    }
    if (!formData.givenName.trim()) newErrors.givenName = "Given name is required";
    if (!formData.surname.trim()) newErrors.surname = "Surname is required";
    if (!formData.studentNumber.trim()) newErrors.studentNumber = "Student number is required";
    if (!formData.college) newErrors.college = "College/Institute is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "UER",
          requestorFirstName: formData.givenName,
          requestorMiddleName: formData.middleName,
          requestorLastName: formData.surname,
          requestorExtensionName: formData.extensionName,
          requestorEmail: formData.email,
          requestorPhone: formData.phone,
          requestorStudentNo: formData.studentNumber,
          requestorCollege: formData.college,
          requestorSex: formData.sex,
          purpose: formData.typeOfRequest,
          additionalData: JSON.stringify({
            typeOfRequest: formData.typeOfRequest,
            otherSpecify: formData.otherSpecify,
            course: formData.course,
            yearLevel: formData.yearLevel,
            companyName: formData.companyName,
            companyAddress: formData.companyAddress,
            position: formData.position,
            workSchedule: formData.workSchedule,
            ojtCompany: formData.ojtCompany,
            ojtAddress: formData.ojtAddress,
            ojtPosition: formData.ojtPosition,
            ojtSchedule: formData.ojtSchedule,
            ojtStartDate: formData.ojtStartDate,
            ojtEndDate: formData.ojtEndDate,
            eventName: formData.eventName,
            eventDate: formData.eventDate,
            eventVenue: formData.eventVenue,
            eventDescription: formData.eventDescription,
            shirtType: formData.shirtType,
            shirtReason: formData.shirtReason,
          }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setControlNumber(data.data.controlNumber);
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
              Your Uniform Exemption Request has been submitted successfully.
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
    const steps = [
      { title: "Step 1", description: "Accomplish this Uniform Exemption Form." },
      { title: "Step 2", description: "Wait for the validation of your request. Once validated, an email will be sent through your email for certification." },
      { title: "Step 3", description: "Print the emailed certificate." },
      { title: "Step 4", description: "Proceed to the Center for Student Formation and Discipline (CSFD) to have your Uniform Exemption request certified with the official University seal." },
    ];

    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <PublicNavbar />
        <section className="px-6 md:px-12 py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "#111c4e" }}>
                UNIFORM EXEMPTION
              </h1>
              <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#ffc400" }}>
                FORM
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-green-600"></div>

              <div className="space-y-6">
                {steps.map((item, index) => (
                  <div key={index} className="flex items-start gap-6 relative">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 z-10"
                      style={{ backgroundColor: "#28a745" }}
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: "#111c4e" }}>
                        {item.title}
                      </h3>
                      <p className="text-gray-700 text-sm md:text-base">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-12">
              <button
                className="px-8 py-3 rounded-lg font-bold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#dc2626" }}
                onClick={() => router.push("/services")}
              >
                CANCEL
              </button>
              <button
                className="px-8 py-3 rounded-lg font-bold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#28a745" }}
                onClick={() => setPage("form")}
              >
                PROCEED
              </button>
            </div>
          </div>
        </section>
        <PublicFooter />
      </div>
    );
  }

  // Form Pages
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
              UNIFORM EXEMPTION
            </h1>
            <h2
              className="text-xl md:text-3xl font-black"
              style={{ color: "#ffc400", fontFamily: "Metropolis, sans-serif" }}
            >
              {currentStep === 1 ? "TYPE OF REQUEST" : currentStep === 2 ? "STUDENT INFORMATION" : "SUMMARY"}
            </h2>
          </div>

          {/* Step 1: Type of Request */}
          {currentStep === 1 && (
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
              <div className="flex-1">
                <div className="mb-6">
                  <label className="block font-bold text-base md:text-lg mb-2" style={{ color: "#111c4e" }}>
                    TYPE OF REQUEST<span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <div className="relative">
                    <button
                      className="w-full px-4 py-3 border-2 rounded-lg text-left flex justify-between items-center bg-white"
                      style={{ borderColor: errors.typeOfRequest ? "#dc2626" : "#111c4e" }}
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    >
                      <span style={{ color: formData.typeOfRequest ? "#111c4e" : "#9ca3af" }}>
                        {formData.typeOfRequest || "Select type of request"}
                      </span>
                      <svg
                        className={`w-5 h-5 transition-transform ${showTypeDropdown ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showTypeDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 mt-1 bg-white border-2 rounded-lg shadow-lg z-20"
                        style={{ borderColor: "#111c4e" }}
                      >
                        {requestTypes.map((type) => (
                          <div
                            key={type.value}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                            onClick={() => {
                              handleInputChange("typeOfRequest", type.value);
                              setShowTypeDropdown(false);
                            }}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                formData.typeOfRequest === type.value ? "border-green-600" : "border-gray-400"
                              }`}
                            >
                              {formData.typeOfRequest === type.value && (
                                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                              )}
                            </div>
                            <span style={{ color: "#111c4e" }}>{type.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.typeOfRequest && (
                    <p className="text-sm mt-1" style={{ color: "#dc2626" }}>
                      {errors.typeOfRequest}
                    </p>
                  )}

                  {formData.typeOfRequest === "Other" && (
                    <div className="mt-4">
                      <input
                        type="text"
                        className="w-full px-4 py-2 border-b-2 bg-transparent focus:outline-none"
                        style={{ borderColor: errors.otherSpecify ? "#dc2626" : "#111c4e" }}
                        placeholder="Please specify..."
                        value={formData.otherSpecify}
                        onChange={(e) => handleInputChange("otherSpecify", e.target.value)}
                      />
                      {errors.otherSpecify && (
                        <p className="text-sm mt-1" style={{ color: "#dc2626" }}>{errors.otherSpecify}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-lg p-6 border-2" style={{ borderColor: "#111c4e" }}>
                  <h3 className="text-lg md:text-xl font-bold mb-4" style={{ color: "#ffc400" }}>
                    TYPE OF REQUEST DESCRIPTION
                  </h3>
                  <div className="space-y-3">
                    {requestTypes.map((type) => (
                      <div key={type.value}>
                        <h4 className="font-bold text-sm mb-1" style={{ color: "#111c4e" }}>
                          {type.label}
                        </h4>
                        <p className="text-xs text-gray-600">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Student Information */}
          {currentStep === 2 && (
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
                    SEX
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.sex}
                    onChange={(e) => handleInputChange("sex", e.target.value)}
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    STUDENT NUMBER<span className="text-red-500">*</span>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    COURSE/PROGRAM
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., BS Computer Science"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.course}
                    onChange={(e) => handleInputChange("course", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    YEAR LEVEL
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.yearLevel}
                    onChange={(e) => handleInputChange("yearLevel", e.target.value)}
                  >
                    <option value="">Select year level</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                    <option value="Fifth Year">Fifth Year</option>
                  </select>
                </div>
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
              </div>

              {/* Dynamic Fields based on Request Type */}
              {formData.typeOfRequest === "Student | Working Student" && (
                <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                  <h3 className="font-bold mb-4" style={{ color: "#111c4e" }}>Employment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>Company Name</label>
                      <input
                        type="text"
                        placeholder="Enter company name"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: "#111c4e" }}
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>Company Address</label>
                      <input
                        type="text"
                        placeholder="Enter company address"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: "#111c4e" }}
                        value={formData.companyAddress}
                        onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>Position</label>
                      <input
                        type="text"
                        placeholder="Enter your position"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: "#111c4e" }}
                        value={formData.position}
                        onChange={(e) => handleInputChange("position", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>Work Schedule</label>
                      <input
                        type="text"
                        placeholder="e.g., Mon-Fri 6PM-10PM"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: "#111c4e" }}
                        value={formData.workSchedule}
                        onChange={(e) => handleInputChange("workSchedule", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.typeOfRequest === "Student | On-the-Job Training" && (
                <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                  <h3 className="font-bold mb-4" style={{ color: "#111c4e" }}>OJT Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>Company Name</label>
                      <input
                        type="text"
                        placeholder="Enter company name"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: "#111c4e" }}
                        value={formData.ojtCompany}
                        onChange={(e) => handleInputChange("ojtCompany", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>Company Address</label>
                      <input
                        type="text"
                        placeholder="Enter company address"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: "#111c4e" }}
                        value={formData.ojtAddress}
                        onChange={(e) => handleInputChange("ojtAddress", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>Position</label>
                      <input
                        type="text"
                        placeholder="Enter your position"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: "#111c4e" }}
                        value={formData.ojtPosition}
                        onChange={(e) => handleInputChange("ojtPosition", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>Schedule</label>
                      <input
                        type="text"
                        placeholder="e.g., Mon-Fri 8AM-5PM"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: "#111c4e" }}
                        value={formData.ojtSchedule}
                        onChange={(e) => handleInputChange("ojtSchedule", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>Start Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: "#111c4e" }}
                        value={formData.ojtStartDate}
                        onChange={(e) => handleInputChange("ojtStartDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>End Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                        style={{ borderColor: "#111c4e" }}
                        value={formData.ojtEndDate}
                        onChange={(e) => handleInputChange("ojtEndDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
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
                  <p className="text-sm text-gray-600">Type of Request</p>
                  <p className="font-medium">{formData.typeOfRequest === "Other" ? formData.otherSpecify : formData.typeOfRequest}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{formData.givenName} {formData.middleName} {formData.surname} {formData.extensionName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Student Number</p>
                  <p className="font-medium">{formData.studentNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">College/Institute</p>
                  <p className="font-medium">{formData.college}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium">{formData.course || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year Level</p>
                  <p className="font-medium">{formData.yearLevel || "-"}</p>
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
                onClick={() => setCurrentStep(currentStep + 1)}
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
          <div className="rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full" style={{ backgroundColor: "#000B3C" }}>
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
              <h3 className="text-xl md:text-2xl font-black text-white" style={{ fontFamily: "Metropolis, sans-serif" }}>
                Are you sure you want to cancel?
              </h3>
            </div>
            <div className="text-center mb-8">
              <p className="text-white text-sm md:text-base">Upon cancelling, the request will not be saved.</p>
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
