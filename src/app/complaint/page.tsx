"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { toast } from "sonner";
import { Loader2, Upload, X, FileText, Check, Image as ImageIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

const complaintTypes = [
  "Academic Dishonesty",
  "Harassment",
  "Uniform Violation",
  "Disrespect to Faculty/Staff",
  "Vandalism",
  "Theft",
  "Physical Altercation",
  "Verbal Abuse",
  "Cyberbullying",
  "Substance Abuse",
  "Other",
];

const categoryOptions = [
  {
    label: "Major Offense",
    value: "Major",
    description: "Serious violations that may result in suspension or expulsion.",
    color: "#dc2626",
  },
  {
    label: "Minor Offense",
    value: "Minor",
    description: "Less serious violations that may result in warning or community service.",
    color: "#f97316",
  },
];

export default function ComplaintPage() {
  const router = useRouter();
  const [page, setPage] = useState<"process" | "form" | "success">("process");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [controlNumber, setControlNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");

  const [formData, setFormData] = useState({
    // Complainant Information
    givenName: "",
    surname: "",
    middleName: "",
    extensionName: "",
    sex: "",
    studentNumber: "",
    college: "",
    email: "",
    phone: "",
    // Complaint Details
    complaintType: "",
    category: "",
    subject: "",
    description: "",
    dateOfIncident: "",
    location: "",
    // Respondent Information
    respondentName: "",
    respondentStudentNumber: "",
    respondentCollege: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Supporting Evidences Upload State
  const [uploadedEvidences, setUploadedEvidences] = useState<UploadedEvidence[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Uploaded Evidence interface
  interface UploadedEvidence {
    id: string;
    name: string;
    type: string;
    size: number;
    file: File;
    preview?: string;
    url?: string;
    uploaded: boolean;
    uploadProgress: number;
  }

  // Calculate form completion percentage
  const formCompletion = useMemo(() => {
    const requiredFields = [
      "givenName",
      "surname",
      "sex",
      "studentNumber",
      "college",
      "email",
      "complaintType",
      "category",
      "subject",
      "description",
    ];
    const filledFields = requiredFields.filter(
      (field) => formData[field as keyof typeof formData]?.trim()
    );
    return Math.round((filledFields.length / requiredFields.length) * 100);
  }, [formData]);

  // Handle evidence file upload
  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of Array.from(files)) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPG, PNG, GIF, and PDF are allowed.`);
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
        continue;
      }

      // Check if file already exists
      if (uploadedEvidences.some((e) => e.name === file.name)) {
        toast.error(`File already added: ${file.name}`);
        continue;
      }

      const newEvidence: UploadedEvidence = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
        uploaded: false,
        uploadProgress: 0,
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          newEvidence.preview = event.target?.result as string;
          setUploadedEvidences((prev) => [...prev, newEvidence]);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedEvidences((prev) => [...prev, newEvidence]);
      }

      // Upload file to server
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
          setUploadedEvidences((prev) =>
            prev.map((e) =>
              e.id === newEvidence.id
                ? { ...e, url: uploadResult.data.url, uploaded: true, uploadProgress: 100 }
                : e
            )
          );
          toast.success(`${file.name} uploaded successfully`);
        } else {
          setUploadedEvidences((prev) => prev.filter((e) => e.id !== newEvidence.id));
          toast.error(`Failed to upload ${file.name}: ${uploadResult.error}`);
        }
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        setUploadedEvidences((prev) => prev.filter((e) => e.id !== newEvidence.id));
        toast.error(`Failed to upload ${file.name}. Please try again.`);
      }
    }

    setIsUploading(false);
    e.target.value = "";
  };

  // Remove evidence file
  const removeEvidence = (id: string) => {
    setUploadedEvidences((prev) => prev.filter((e) => e.id !== id));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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
    if (!formData.complaintType) newErrors.complaintType = "Complaint type is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    // Check if files are still uploading
    if (isUploading) {
      toast.error("Please wait for file uploads to complete");
      return;
    }

    setIsSubmitting(true);
    try {
      // Collect uploaded evidence URLs
      const documents = uploadedEvidences
        .filter((e) => e.uploaded && e.url)
        .map((e) => ({
          name: e.name,
          url: e.url,
          type: e.type,
          size: e.size,
        }));

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          documents,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setControlNumber(data.data.controlNumber);
        setTrackingToken(data.data.trackingToken);
        setPage("success");
        toast.success("Complaint submitted successfully!");
      } else {
        toast.error(data.error || "Failed to submit complaint");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint");
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
              Your complaint has been submitted successfully.
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
              Please save your control number. You can use it to track your complaint status.
              A confirmation email has been sent to {formData.email}.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#111c4e", color: "white" }}
                onClick={() => router.push("/track")}
              >
                Track Complaint
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
                PROCESS FOR FILING
              </h1>
              <h2
                className="text-2xl md:text-3xl font-black"
                style={{ color: "#ffc400", fontFamily: "Metropolis, sans-serif" }}
              >
                STUDENT COMPLAINT
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-green-600"></div>

              {[
                {
                  title: "Accomplish Form",
                  description: "Fill out the complaint form with accurate and complete information about the incident.",
                },
                {
                  title: "Wait for Validation",
                  description: "CSFD staff will review and validate your complaint submission.",
                },
                {
                  title: "Proceed to CSFD",
                  description: "Once validated, you will be notified to proceed to the CSFD office for further processing.",
                },
                {
                  title: "Wait for Case Hearing",
                  description: "Your case will be scheduled for hearing. You will be notified of the schedule.",
                },
              ].map((step, index) => (
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
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className="text-gray-700 text-sm md:text-base">{step.description}</p>
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
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold" style={{ color: "#111c4e" }}>
                Form Completion
              </span>
              <span className="text-sm font-bold" style={{ color: "#1F9E55" }}>
                {formCompletion}%
              </span>
            </div>
            <Progress
              value={formCompletion}
              className="h-3 bg-gray-200"
              style={{
                // @ts-expect-error CSS custom property
                "--progress-background": formCompletion === 100 ? "#1F9E55" : "#ffc400",
              }}
            />
            <div className="flex justify-between mt-2">
              {["Complainant", "Complaint", "Respondent", "Review"].map((step, index) => (
                <div
                  key={step}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      currentStep > index + 1
                        ? "bg-green-500 text-white"
                        : currentStep === index + 1
                        ? "text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    style={
                      currentStep === index + 1
                        ? { backgroundColor: "#111c4e" }
                        : {}
                    }
                  >
                    {currentStep > index + 1 ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 hidden md:block ${
                      currentStep === index + 1 ? "font-bold" : ""
                    }`}
                    style={{ color: currentStep === index + 1 ? "#111c4e" : "#6b7280" }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-8 md:mb-12">
            <h1
              className="text-2xl md:text-4xl font-black mb-2"
              style={{ color: "#3d3d3d", fontFamily: "Metropolis, sans-serif" }}
            >
              {currentStep === 1 ? "COMPLAINANT" : currentStep === 2 ? "COMPLAINT" : currentStep === 3 ? "RESPONDENT" : "SUMMARY"}
            </h1>
            <h2
              className="text-xl md:text-3xl font-black"
              style={{ color: "#ffc400", fontFamily: "Metropolis, sans-serif" }}
            >
              {currentStep === 1 ? "INFORMATION" : currentStep === 2 ? "DETAILS" : currentStep === 3 ? "INFORMATION" : "REVIEW"}
            </h2>
          </div>

          {/* Step 1: Complainant Information */}
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

          {/* Step 2: Complaint Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    COMPLAINT TYPE<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                    style={{ borderColor: errors.complaintType ? "#dc2626" : "#111c4e" }}
                    value={formData.complaintType}
                    onChange={(e) => handleInputChange("complaintType", e.target.value)}
                  >
                    <option value="">Select complaint type</option>
                    {complaintTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.complaintType && <p className="text-red-500 text-sm mt-1">{errors.complaintType}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    CATEGORY<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                    style={{ borderColor: errors.category ? "#dc2626" : "#111c4e" }}
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                  >
                    <option value="">Select category</option>
                    <option value="Major">Major Offense</option>
                    <option value="Minor">Minor Offense</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
              </div>

              {/* Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex items-start gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl md:text-2xl font-bold">!</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs md:text-sm mb-1" style={{ color: "#111c4e" }}>REMINDER</h3>
                    <p className="text-xs text-gray-600">Please select the appropriate category for your complaint.</p>
                  </div>
                </div>
                {categoryOptions.map((option) => (
                  <div
                    key={option.value}
                    className="rounded-xl shadow-lg p-4 md:p-6 text-white cursor-pointer transition-all hover:scale-105"
                    style={{ backgroundColor: option.color }}
                    onClick={() => handleInputChange("category", option.value)}
                  >
                    <h3 className="font-bold text-xs md:text-sm mb-2">{option.label}</h3>
                    <p className="text-xs opacity-80">{option.description}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                  SUBJECT<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Brief subject/title of the complaint"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                  style={{ borderColor: errors.subject ? "#dc2626" : "#111c4e" }}
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                />
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                  DESCRIPTION<span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Provide a detailed description of the incident..."
                  rows={5}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none resize-none"
                  style={{ borderColor: errors.description ? "#dc2626" : "#111c4e" }}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    DATE OF INCIDENT
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.dateOfIncident}
                    onChange={(e) => handleInputChange("dateOfIncident", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    LOCATION
                  </label>
                  <input
                    type="text"
                    placeholder="Where did the incident occur?"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>
              </div>

              {/* Supporting Evidences Upload Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#111c4e] flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "#111c4e" }}>
                      SUPPORTING EVIDENCES
                    </h3>
                    <p className="text-sm text-gray-500">
                      Upload supporting documents or images (JPG, PNG, GIF, PDF - max 5MB each)
                    </p>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#ffc400] transition-colors">
                  <input
                    type="file"
                    id="evidence-upload"
                    multiple
                    accept="image/jpeg,image/png,image/gif,application/pdf"
                    onChange={handleEvidenceUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="evidence-upload"
                    className={`cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {isUploading ? (
                      <Loader2 className="w-12 h-12 mx-auto text-[#111c4e] mb-4 animate-spin" />
                    ) : (
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    )}
                    <p className="text-gray-600 font-medium mb-2">
                      {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-gray-400">
                      JPG, PNG, GIF, or PDF (max 5MB per file)
                    </p>
                  </label>
                </div>

                {/* Uploaded Evidences List */}
                {uploadedEvidences.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700">
                      Uploaded Files ({uploadedEvidences.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {uploadedEvidences.map((evidence) => (
                        <div
                          key={evidence.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          {/* Preview or Icon */}
                          {evidence.preview ? (
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <img
                                src={evidence.preview}
                                alt={evidence.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                              {evidence.type === "application/pdf" ? (
                                <FileText className="w-6 h-6 text-red-500" />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-red-500" />
                              )}
                            </div>
                          )}

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{evidence.name}</p>
                              {evidence.uploaded && (
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Uploaded
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(evidence.size)}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeEvidence(evidence.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Respondent Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex items-start gap-4 mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xs md:text-sm mb-1" style={{ color: "#111c4e" }}>NOTE</h3>
                  <p className="text-xs text-gray-600">Respondent information is optional. If you don't know the respondent's details, you may leave this section blank.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    RESPONDENT NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Enter respondent's full name"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.respondentName}
                    onChange={(e) => handleInputChange("respondentName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                    RESPONDENT STUDENT NUMBER
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2020-00000"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
                    style={{ borderColor: "#111c4e" }}
                    value={formData.respondentStudentNumber}
                    onChange={(e) => handleInputChange("respondentStudentNumber", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                  RESPONDENT COLLEGE/INSTITUTE
                </label>
                <select
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-white"
                  style={{ borderColor: "#111c4e" }}
                  value={formData.respondentCollege}
                  onChange={(e) => handleInputChange("respondentCollege", e.target.value)}
                >
                  <option value="">Select respondent's college/institute</option>
                  {colleges.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && (
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h3 className="text-lg font-bold mb-6" style={{ color: "#111c4e" }}>
                Please review your information before submitting
              </h3>

              {/* Complainant Information */}
              <div className="mb-6">
                <h4 className="text-sm font-bold uppercase mb-3 pb-2 border-b" style={{ color: "#111c4e" }}>
                  Complainant Information
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

              {/* Complaint Details */}
              <div className="mb-6">
                <h4 className="text-sm font-bold uppercase mb-3 pb-2 border-b" style={{ color: "#111c4e" }}>
                  Complaint Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Complaint Type</p>
                    <p className="font-medium">{formData.complaintType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{formData.category}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-medium">{formData.subject}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-medium text-sm bg-gray-50 p-3 rounded-lg">{formData.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Incident</p>
                    <p className="font-medium">{formData.dateOfIncident || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{formData.location || "Not specified"}</p>
                  </div>
                </div>

                {/* Supporting Evidences in Summary */}
                {uploadedEvidences.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Supporting Evidences</h5>
                    <div className="flex flex-wrap gap-2">
                      {uploadedEvidences.map((evidence) => (
                        <div
                          key={evidence.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200"
                        >
                          {evidence.preview ? (
                            <img
                              src={evidence.preview}
                              alt={evidence.name}
                              className="w-6 h-6 object-cover rounded"
                            />
                          ) : (
                            <FileText className="w-4 h-4 text-green-600" />
                          )}
                          <span className="text-sm text-green-700">{evidence.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Respondent Information */}
              <div>
                <h4 className="text-sm font-bold uppercase mb-3 pb-2 border-b" style={{ color: "#111c4e" }}>
                  Respondent Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Respondent Name</p>
                    <p className="font-medium">{formData.respondentName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Respondent Student Number</p>
                    <p className="font-medium">{formData.respondentStudentNumber || "-"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Respondent College/Institute</p>
                    <p className="font-medium">{formData.respondentCollege || "-"}</p>
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
            {currentStep < 4 ? (
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
                  "SUBMIT COMPLAINT"
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
                Upon cancelling, the complaint will not be saved.
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
