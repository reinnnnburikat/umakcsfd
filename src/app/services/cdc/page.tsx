"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { toast } from "sonner";
import { Check, User, FileText, ClipboardCheck, Calendar, MapPin } from "lucide-react";
import { WizardForm, WizardStep, FloatingLabelInput, FloatingLabelSelect, ValidationFeedback } from "@/components/ui/wizard-form";
import { motion, AnimatePresence } from "framer-motion";

const colleges = [
  { value: "College of Business and Financial Management", label: "College of Business and Financial Management" },
  { value: "College of Continuing Advanced and Professional Studies", label: "College of Continuing Advanced and Professional Studies" },
  { value: "College of Construction Sciences and Engineering", label: "College of Construction Sciences and Engineering" },
  { value: "College of Computing and Information Sciences", label: "College of Computing and Information Sciences" },
  { value: "College of Engineering Technology", label: "College of Engineering Technology" },
  { value: "College of Governance and Public Policy", label: "College of Governance and Public Policy" },
  { value: "College of Human Kinetics", label: "College of Human Kinetics" },
  { value: "College of Innovative Teacher Education", label: "College of Innovative Teacher Education" },
  { value: "CITE-Higher School ng UMak", label: "CITE-Higher School ng UMak" },
  { value: "College of Tourism and Hospitality Management", label: "College of Tourism and Hospitality Management" },
  { value: "Institute of Arts and Design", label: "Institute of Arts and Design" },
  { value: "Institute of Disaster and Emergency Management", label: "Institute of Disaster and Emergency Management" },
  { value: "Institutes of Imaging Health Sciences", label: "Institutes of Imaging Health Sciences" },
  { value: "Institute of Accountancy", label: "Institute of Accountancy" },
  { value: "Institutes of Nursing", label: "Institutes of Nursing" },
  { value: "Institutes of Pharmacy", label: "Institutes of Pharmacy" },
  { value: "Institute of Psychology", label: "Institute of Psychology" },
  { value: "Institute of Social Works", label: "Institute of Social Works" },
  { value: "School of Law", label: "School of Law" },
  { value: "Other", label: "Other" },
];

const sexOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const purposeOptions = [
  { value: "Academic Event", label: "Academic Event" },
  { value: "Cultural Presentation", label: "Cultural Presentation" },
  { value: "Theatrical Performance", label: "Theatrical Performance" },
  { value: "Pageant/Competition", label: "Pageant/Competition" },
  { value: "Organization Activity", label: "Organization Activity" },
  { value: "University Event", label: "University Event" },
  { value: "Other", label: "Other" },
];

export default function CDCRequestPage() {
  const router = useRouter();
  const [page, setPage] = useState<"process" | "form" | "success">("process");
  const [currentStep, setCurrentStep] = useState(0);
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
    otherCollege: "",
    email: "",
    phone: "",
    purpose: "",
    otherPurpose: "",
    eventName: "",
    eventDate: "",
    eventLocation: "",
    duration: "",
    additionalDetails: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time validation
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "givenName":
        return !value.trim() ? "Given name is required" : "";
      case "surname":
        return !value.trim() ? "Surname is required" : "";
      case "sex":
        return !value ? "Sex is required" : "";
      case "studentNumber":
        if (!value.trim()) return "Student number is required";
        if (!/^[A-Z][A-Za-z0-9]*$/.test(value.trim())) {
          return "Student number must start with a capital letter followed by alphanumeric characters";
        }
        return "";
      case "college":
        return !value ? "College/Institute is required" : "";
      case "otherCollege":
        return formData.college === "Other" && !value.trim() ? "Please specify your college/institute" : "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email";
        }
        return "";
      case "purpose":
        return !value ? "Purpose is required" : "";
      case "otherPurpose":
        return formData.purpose === "Other" && !value.trim() ? "Please specify the purpose" : "";
      default:
        return "";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // Real-time validation
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Validate step 1
  const validateStep1 = (): boolean => {
    const fields = ["givenName", "surname", "sex", "studentNumber", "college", "email"];
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Check for other college
    if (formData.college === "Other") {
      const otherCollegeError = validateField("otherCollege", formData.otherCollege);
      if (otherCollegeError) {
        newErrors.otherCollege = otherCollegeError;
        isValid = false;
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  // Validate step 2
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const purposeError = validateField("purpose", formData.purpose);
    if (purposeError) {
      newErrors.purpose = purposeError;
      isValid = false;
    }

    if (formData.purpose === "Other") {
      const otherError = validateField("otherPurpose", formData.otherPurpose);
      if (otherError) {
        newErrors.otherPurpose = otherError;
        isValid = false;
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      toast.error("Please fill in all required fields");
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
          requestorCollege: formData.college === "Other" ? formData.otherCollege : formData.college,
          requestorSex: formData.sex,
          purpose: formData.purpose === "Other" ? formData.otherPurpose : formData.purpose,
          eventName: formData.eventName,
          eventDate: formData.eventDate,
          additionalData: JSON.stringify({
            eventLocation: formData.eventLocation,
            duration: formData.duration,
            additionalDetails: formData.additionalDetails,
            otherPurpose: formData.otherPurpose,
          }),
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

  // Check if step 1 is complete
  const isStep1Complete = useMemo(() => {
    const hasOtherCollege = formData.college !== "Other" || formData.otherCollege.trim();
    return (
      formData.givenName.trim() &&
      formData.surname.trim() &&
      formData.sex &&
      formData.studentNumber.trim() &&
      formData.college &&
      hasOtherCollege &&
      formData.email.trim() &&
      !errors.givenName &&
      !errors.surname &&
      !errors.sex &&
      !errors.studentNumber &&
      !errors.college &&
      !errors.otherCollege &&
      !errors.email
    );
  }, [formData, errors]);

  // Check if step 2 is complete
  const isStep2Complete = useMemo(() => {
    const hasPurpose = formData.purpose;
    const hasOther = formData.purpose !== "Other" || formData.otherPurpose.trim();
    return hasPurpose && hasOther && !errors.purpose && !errors.otherPurpose;
  }, [formData, errors]);

  // Step 1 Content: Personal Information
  const Step1Content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#111c4e" }}>
          <User className="w-5 h-5" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <FloatingLabelInput
              label="Given Name"
              required
              value={formData.givenName}
              onChange={(e) => handleInputChange("givenName", e.target.value)}
              onBlur={() => handleBlur("givenName")}
              error={touched.givenName ? errors.givenName : ""}
            />
            {touched.givenName && formData.givenName && !errors.givenName && (
              <ValidationFeedback isValid message="Looks good!" />
            )}
          </div>
          <div>
            <FloatingLabelInput
              label="Surname"
              required
              value={formData.surname}
              onChange={(e) => handleInputChange("surname", e.target.value)}
              onBlur={() => handleBlur("surname")}
              error={touched.surname ? errors.surname : ""}
            />
            {touched.surname && formData.surname && !errors.surname && (
              <ValidationFeedback isValid message="Looks good!" />
            )}
          </div>
          <FloatingLabelInput
            label="Middle Name"
            value={formData.middleName}
            onChange={(e) => handleInputChange("middleName", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
          <FloatingLabelInput
            label="Extension Name (e.g., Jr., Sr., III)"
            value={formData.extensionName}
            onChange={(e) => handleInputChange("extensionName", e.target.value)}
          />
          <div>
            <FloatingLabelSelect
              label="Sex"
              required
              options={sexOptions}
              value={formData.sex}
              onChange={(e) => handleInputChange("sex", e.target.value)}
              onBlur={() => handleBlur("sex")}
              error={touched.sex ? errors.sex : ""}
            />
            {touched.sex && formData.sex && !errors.sex && (
              <ValidationFeedback isValid message="Selected" />
            )}
          </div>
          <div>
            <FloatingLabelInput
              label="UMak Student Number"
              placeholder="K12042427"
              required
              value={formData.studentNumber}
              onChange={(e) => handleInputChange("studentNumber", e.target.value)}
              onBlur={() => handleBlur("studentNumber")}
              error={touched.studentNumber ? errors.studentNumber : ""}
            />
            {touched.studentNumber && formData.studentNumber && !errors.studentNumber && (
              <ValidationFeedback isValid message="Valid format" />
            )}
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#111c4e" }}>
          <FileText className="w-5 h-5" />
          Academic Information
        </h3>
        <div className="space-y-6">
          <div>
            <FloatingLabelSelect
              label="College/Institute"
              required
              options={colleges}
              value={formData.college}
              onChange={(e) => handleInputChange("college", e.target.value)}
              onBlur={() => handleBlur("college")}
              error={touched.college ? errors.college : ""}
            />
            {touched.college && formData.college && !errors.college && (
              <ValidationFeedback isValid message="Selected" />
            )}
          </div>

          <AnimatePresence>
            {formData.college === "Other" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FloatingLabelInput
                  label="Please specify your College/Institute"
                  required
                  value={formData.otherCollege}
                  onChange={(e) => handleInputChange("otherCollege", e.target.value)}
                  onBlur={() => handleBlur("otherCollege")}
                  error={touched.otherCollege ? errors.otherCollege : ""}
                />
                {touched.otherCollege && formData.otherCollege && !errors.otherCollege && (
                  <ValidationFeedback isValid message="Looks good!" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#111c4e" }}>
          <ClipboardCheck className="w-5 h-5" />
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <FloatingLabelInput
              label="Email Address"
              required
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              error={touched.email ? errors.email : ""}
            />
            {touched.email && formData.email && !errors.email && (
              <ValidationFeedback isValid message="Valid email" />
            )}
          </div>
          <FloatingLabelInput
            label="Phone Number (09XX XXX XXXX)"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>
      </div>
    </motion.div>
  );

  // Step 2 Content: Request Details
  const Step2Content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#111c4e" }}>
          <FileText className="w-5 h-5" />
          Purpose of Request
        </h3>
        
        <div className="space-y-6">
          <div>
            <FloatingLabelSelect
              label="Purpose"
              required
              options={purposeOptions}
              value={formData.purpose}
              onChange={(e) => handleInputChange("purpose", e.target.value)}
              onBlur={() => handleBlur("purpose")}
              error={touched.purpose ? errors.purpose : ""}
            />
            {touched.purpose && formData.purpose && !errors.purpose && (
              <ValidationFeedback isValid message="Selected" />
            )}
          </div>

          <AnimatePresence>
            {formData.purpose === "Other" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FloatingLabelInput
                  label="Please specify the purpose"
                  required
                  value={formData.otherPurpose}
                  onChange={(e) => handleInputChange("otherPurpose", e.target.value)}
                  onBlur={() => handleBlur("otherPurpose")}
                  error={touched.otherPurpose ? errors.otherPurpose : ""}
                />
                {touched.otherPurpose && formData.otherPurpose && !errors.otherPurpose && (
                  <ValidationFeedback isValid message="Looks good!" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#111c4e" }}>
          <Calendar className="w-5 h-5" />
          Event Details
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <FloatingLabelInput
                label="Event Name"
                value={formData.eventName}
                onChange={(e) => handleInputChange("eventName", e.target.value)}
              />
            </div>
            <div>
              <FloatingLabelInput
                label="Event Date"
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleInputChange("eventDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <FloatingLabelInput
                label="Event Location"
                value={formData.eventLocation}
                onChange={(e) => handleInputChange("eventLocation", e.target.value)}
              />
            </div>
            <div>
              <FloatingLabelInput
                label="Duration (e.g., 1 day, 1 week)"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
              Additional Details
            </label>
            <textarea
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none min-h-[100px] resize-y"
              style={{ borderColor: "#111c4e" }}
              placeholder="Provide any additional details about the cross-dressing request..."
              value={formData.additionalDetails}
              onChange={(e) => handleInputChange("additionalDetails", e.target.value)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Step 3 Content: Summary
  const Step3Content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--csfd-navy)] flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: "#111c4e" }}>
            Please review your information before submitting
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Given Name</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.givenName}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Surname</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.surname}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Middle Name</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.middleName || "-"}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Extension Name</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.extensionName || "-"}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Sex</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.sex}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Student Number</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.studentNumber}</p>
          </div>
          <div className="border-b border-gray-100 pb-3 md:col-span-2">
            <p className="text-sm text-gray-500">College/Institute</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.college === "Other" ? formData.otherCollege : formData.college}</p>
          </div>
          <div className="border-b border-gray-100 pb-3 md:col-span-2">
            <p className="text-sm text-gray-500">Purpose</p>
            <p className="font-medium text-[var(--csfd-navy)]">
              {formData.purpose === "Other" ? formData.otherPurpose : formData.purpose}
            </p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Event Name</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.eventName || "-"}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Event Date</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.eventDate || "-"}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Event Location</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.eventLocation || "-"}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.duration || "-"}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.email}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.phone || "-"}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> Please ensure all information is correct before submitting.
            A confirmation email will be sent to {formData.email || "your email address"}.
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Define wizard steps
  const wizardSteps: WizardStep[] = [
    {
      id: "personal-info",
      title: "Personal",
      description: "Personal Information",
      content: Step1Content,
      isComplete: isStep1Complete,
      canProceed: isStep1Complete,
    },
    {
      id: "request-details",
      title: "Details",
      description: "Request Details",
      content: Step2Content,
      isComplete: isStep2Complete,
      canProceed: isStep2Complete,
    },
    {
      id: "summary",
      title: "Review",
      description: "Verify Information",
      content: Step3Content,
      isComplete: true,
      canProceed: true,
    },
  ];

  // Handle step change with validation
  const handleStepChange = (step: number) => {
    if (step > currentStep) {
      // Moving forward - validate current step
      if (currentStep === 0 && !validateStep1()) {
        return;
      }
      if (currentStep === 1 && !validateStep2()) {
        return;
      }
    }
    setCurrentStep(step);
  };

  // Success Page
  if (page === "success") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <PublicNavbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mb-8"
            >
              <Image
                src="/icons/thankyoucheck.png"
                alt="Success"
                width={120}
                height={120}
                className="mx-auto"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black mb-4"
              style={{ color: "#111c4e", fontFamily: "Metropolis, sans-serif" }}
            >
              THANK YOU!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 mb-6"
            >
              Your Cross-Dressing Clearance request has been submitted successfully.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-600 mb-8"
            >
              Please save your control number. You can use it to track your request status.
              A confirmation email has been sent to {formData.email}.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-4 flex-wrap"
            >
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
            </motion.div>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
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
            </motion.div>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-green-600"></div>

              {[
                "Prepare a letter of request for Cross-Dressing Clearance addressed to the CSFD office, stating the purpose and event details.",
                "Submit the request letter along with your valid ID, COR, and endorsement letter from Dean/Department Head to the CSFD office.",
                "Wait for the processing of your request. The CSFD office will review your justification and supporting documents.",
                "Claim your Cross-Dressing Clearance from the CSFD office once approved.",
              ].map((text, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 mb-8 relative items-center last:mb-0"
                >
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
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-6 mt-12"
            >
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
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    );
  }

  // Form Page with Wizard
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <PublicNavbar />

      <section className="px-4 md:px-6 lg:px-12 py-6 md:py-8 flex-1">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 md:mb-8"
          >
            <h1
              className="text-2xl md:text-4xl font-black mb-2"
              style={{ color: "#3d3d3d", fontFamily: "Metropolis, sans-serif" }}
            >
              CROSS-DRESSING CLEARANCE
            </h1>
            <h2
              className="text-xl md:text-2xl font-black"
              style={{ color: "#ffc400", fontFamily: "Metropolis, sans-serif" }}
            >
              REQUEST FORM
            </h2>
          </motion.div>

          {/* Wizard Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8"
          >
            <WizardForm
              steps={wizardSteps}
              currentStep={currentStep}
              onStepChange={handleStepChange}
              onSubmit={handleSubmit}
              onCancel={() => setShowCancelModal(true)}
              isSubmitting={isSubmitting}
              submitLabel="Submit Request"
              nextLabel="Proceed"
              previousLabel="Back"
              showProgress={true}
              showStepIndicators={true}
              allowStepNavigation={true}
            />
          </motion.div>
        </div>
      </section>

      <PublicFooter />

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
