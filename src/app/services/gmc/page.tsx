"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { toast } from "sonner";
import { Loader2, Check, User, FileText, ClipboardCheck, AlertCircle, Upload, X, Save } from "lucide-react";
import { WizardForm, WizardStep, FloatingLabelInput, FloatingLabelSelect, ValidationFeedback } from "@/components/ui/wizard-form";
import { motion, AnimatePresence } from "framer-motion";

// Auto-format student number: first letter uppercase, rest alphanumeric
function formatStudentNumber(value: string): string {
  // Remove any non-alphanumeric characters except letters and numbers
  let cleaned = value.replace(/[^a-zA-Z0-9]/g, '');
  
  // Ensure first character is uppercase
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
}

// Local storage key for auto-save
const GMC_FORM_STORAGE_KEY = "gmc_form_draft";

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
  { value: "Other", label: "Other (Please specify)" },
];

const purposes = [
  { value: "Employment", label: "Employment" },
  { value: "Graduate School", label: "Graduate School" },
  { value: "Scholarship", label: "Scholarship" },
  { value: "Transfer", label: "Transfer" },
  { value: "Board Exam", label: "Board Exam" },
  { value: "Agency", label: "Agency" },
  { value: "Other", label: "Other (Please specify)" },
];

// Classification options with requirements (based on official CSFD Google Form)
// Each classification requires only ONE document
const classificationOptions = [
  {
    label: "Currently Enrolled",
    value: "Currently Enrolled",
    description: "Currently enrolled at UMAK (HSU or Undergraduate)",
    color: "#000B3C",
    requirementLabel: "Certificate of Registration (COR) or Report Card (Form 138)",
    requirementDescription: "Please upload a latest complete and clear copy of either your Certificate of Registration (COR) or Report Card (Form 138)",
    questions: [
      { id: "yearLevel", label: "Year/Grade Level", type: "select", options: ["Grade 11", "Grade 12", "First year level", "Second year level", "Third year level", "Fourth year level", "Fifth year level"], required: true },
    ],
  },
  {
    label: "Graduate",
    value: "Graduate",
    description: "Graduate at UMAK (HSU/College/Graduate Studies Program)",
    color: "#1F9E55",
    requirementLabel: "Diploma or Transcript of Records (TOR)",
    requirementDescription: "Please upload a complete and clear copy of either your Diploma or Transcript of Records (TOR)",
    questions: [
      { id: "yearGraduated", label: "Year Graduated", type: "text", placeholder: "e.g., 2023", required: true },
      { id: "programCompleted", label: "Degree Name/Title", type: "text", placeholder: "e.g., Bachelor of Science in Computer Science", required: true },
    ],
  },
  {
    label: "Former Student",
    value: "Former Student",
    description: "Former/Previous student of the University of Makati",
    color: "#ffc400",
    textColor: "#111c4e",
    requirementLabel: "COR, Form 138, TOR, or Certificate of Honorable Dismissal",
    requirementDescription: "Please upload a latest complete and clear copy of either your COR, Report Card (Form 138), TOR, Certificate of Honorable Dismissal or any official academic record/proof of previous enrolment at UMak",
    questions: [
      { id: "lastYearAttended", label: "Last Level/Year Attended", type: "text", placeholder: "e.g., 3rd year or 2023", required: true },
    ],
  },
];

const sexOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

// Default form data
const defaultFormData = {
  givenName: "",
  surname: "",
  middleName: "",
  extensionName: "",
  sex: "",
  studentNumber: "",
  college: "",
  otherCollege: "",
  classification: "",
  yearGraduated: "",
  programCompleted: "",
  yearLevel: "",
  semester: "",
  lastYearAttended: "",
  lastSemester: "",
  reasonForLeaving: "",
  purpose: "",
  otherPurpose: "",
  email: "",
  phone: "",
};

// Document upload interface
interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  preview?: string;
  url?: string; // Server URL after upload
  uploaded?: boolean;
}

export default function GMCRequestPage() {
  const router = useRouter();
  const [page, setPage] = useState<"process" | "form" | "success">("process");
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [controlNumber, setControlNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const [formData, setFormData] = useState(defaultFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(GMC_FORM_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData && Object.keys(parsed.formData).length > 0) {
          setFormData(parsed.formData);
          setLastSaved(new Date(parsed.timestamp));
          setHasRestoredDraft(true);
          toast.success("Draft restored! Your previous form data has been loaded.", {
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  }, []);

  // Auto-save to localStorage
  const saveDraft = useCallback(() => {
    try {
      const draftData = {
        formData,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(GMC_FORM_STORAGE_KEY, JSON.stringify(draftData));
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  }, [formData]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.values(formData).some(v => v.trim())) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, saveDraft]);

  // Clear draft after successful submission
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(GMC_FORM_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }, []);

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
        // Just check if it has content - formatting is automatic
        return "";
      case "college":
        return !value ? "College/Institute is required" : "";
      case "otherCollege":
        return formData.college === "Other" && !value.trim() ? "Please specify your college/institute" : "";
      case "classification":
        return !value ? "Classification is required" : "";
      case "purpose":
        return !value ? "Purpose is required" : "";
      case "otherPurpose":
        return formData.purpose === "Other" && !value.trim() ? "Please specify your purpose" : "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email";
        }
        return "";
      case "yearGraduated":
        return formData.classification === "Graduate" && !value.trim() ? "Year graduated is required" : "";
      case "programCompleted":
        return formData.classification === "Graduate" && !value.trim() ? "Program completed is required" : "";
      case "yearLevel":
        return formData.classification === "Currently Enrolled" && !value.trim() ? "Year level is required" : "";
      case "semester":
        return formData.classification === "Currently Enrolled" && !value.trim() ? "Semester is required" : "";
      case "lastYearAttended":
        return formData.classification === "Former Student" && !value.trim() ? "Last year/level attended is required" : "";
      default:
        return "";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    // Auto-format student number
    if (field === "studentNumber") {
      processedValue = formatStudentNumber(value);
    }
    
    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // Real-time validation
    const error = validateField(field, processedValue);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Document upload handlers - Only ONE file allowed
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // If there's already a document, replace it
    if (uploadedDocuments.length >= 1) {
      toast.info("Replacing previous document...");
      setUploadedDocuments([]);
    }

    setIsUploading(true);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type: ${file.name}. Only JPG, PNG, GIF, and PDF are allowed.`);
      setIsUploading(false);
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
      setIsUploading(false);
      e.target.value = '';
      return;
    }

    const newDoc: UploadedDocument = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      uploaded: false,
    };

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newDoc.preview = e.target?.result as string;
        setUploadedDocuments([newDoc]);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedDocuments([newDoc]);
    }

    // Upload file to server immediately
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success) {
        // Update document with server URL
        setUploadedDocuments(prev =>
          prev.map(doc =>
            doc.id === newDoc.id
              ? { ...doc, url: uploadResult.data.url, uploaded: true }
              : doc
          )
        );
        toast.success(`${file.name} uploaded successfully`);
      } else {
        toast.error(`Failed to upload ${file.name}: ${uploadResult.error}`);
      }
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error(`Failed to upload ${file.name}. Please try again.`);
    }

    setIsUploading(false);
    // Reset input
    e.target.value = '';
  };

  const removeDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Validate step 1
  const validateStep1 = (): boolean => {
    const fields = ["givenName", "surname", "sex", "studentNumber", "college", "classification", "email"];
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

  // Validate step 2 - classification-specific questions
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate classification-specific fields
    const classification = classificationOptions.find(c => c.value === formData.classification);
    if (classification?.questions) {
      classification.questions.forEach(q => {
        const error = validateField(q.id, formData[q.id as keyof typeof formData]);
        if (error) {
          newErrors[q.id] = error;
          isValid = false;
        }
      });
    }

    const purposeError = validateField("purpose", formData.purpose);
    if (purposeError) {
      newErrors.purpose = purposeError;
      isValid = false;
    }

    if (formData.purpose === "Other") {
      const otherPurposeError = validateField("otherPurpose", formData.otherPurpose);
      if (otherPurposeError) {
        newErrors.otherPurpose = otherPurposeError;
        isValid = false;
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSubmit = async () => {
    // Validate all steps
    const step1Valid = validateStep1();
    const step2Valid = validateStep2();

    if (!step1Valid || !step2Valid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    // Final check for purpose
    const finalPurpose = formData.purpose === "Other" ? formData.otherPurpose : formData.purpose;
    if (!finalPurpose || !finalPurpose.trim()) {
      toast.error("Please select or specify a purpose");
      return;
    }

    // Check if documents are still uploading
    if (isUploading) {
      toast.error("Please wait for document uploads to complete");
      return;
    }

    // Collect uploaded document URLs
    const documentUrls = uploadedDocuments
      .filter(doc => doc.uploaded && doc.url)
      .map(doc => ({
        name: doc.name,
        url: doc.url,
        type: doc.type,
        size: doc.size,
      }));

    setIsSubmitting(true);
    console.log("Submitting GMC request with data:", {
      requestType: "GMC",
      purpose: finalPurpose,
      classification: formData.classification,
      documents: documentUrls,
    });

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "GMC",
          requestorFirstName: formData.givenName,
          requestorMiddleName: formData.middleName,
          requestorLastName: formData.surname,
          requestorExtensionName: formData.extensionName,
          requestorEmail: formData.email,
          requestorPhone: formData.phone,
          requestorStudentNo: formData.studentNumber,
          requestorCollege: formData.college === "Other" ? formData.otherCollege : formData.college,
          requestorSex: formData.sex,
          classification: formData.classification,
          yearGraduated: formData.yearGraduated || formData.lastYearAttended,
          purpose: formData.purpose === "Other" ? formData.otherPurpose : formData.purpose,
          otherPurpose: formData.purpose === "Other" ? formData.otherPurpose : "",
          additionalData: {
            programCompleted: formData.programCompleted,
            yearLevel: formData.yearLevel,
            semester: formData.semester,
            lastSemester: formData.lastSemester,
            reasonForLeaving: formData.reasonForLeaving,
          },
          documents: documentUrls,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.success) {
        // Clear draft on success
        clearDraft();
        setControlNumber(data.data.controlNumber);
        setTrackingToken(data.data.trackingToken);
        setPage("success");
        toast.success("Request submitted successfully!");
      } else {
        console.error("API Error:", data.error);
        // Show more specific error message
        const errorMessage = data.error || (response.status === 500 ? "Server error. Please try again later." : "Failed to submit request. Please check your information and try again.");
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("Unable to connect to server. Please check your internet connection.");
      } else {
        toast.error("Failed to submit request. Please try again.");
      }
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
      formData.classification &&
      formData.email.trim() &&
      !errors.givenName &&
      !errors.surname &&
      !errors.sex &&
      !errors.studentNumber &&
      !errors.college &&
      !errors.otherCollege &&
      !errors.classification &&
      !errors.email
    );
  }, [formData, errors]);

  // Check if step 2 is complete
  const isStep2Complete = useMemo(() => {
    const hasPurpose = formData.purpose;
    const hasOtherPurpose = formData.purpose !== "Other" || formData.otherPurpose.trim();
    
    // Check classification-specific fields
    const classification = classificationOptions.find(c => c.value === formData.classification);
    let classificationFieldsComplete = true;
    if (classification?.questions) {
      for (const q of classification.questions) {
        if (q.required && !formData[q.id as keyof typeof formData]?.trim()) {
          classificationFieldsComplete = false;
          break;
        }
      }
    }
    
    return hasPurpose && hasOtherPurpose && classificationFieldsComplete && !errors.purpose && !errors.otherPurpose;
  }, [formData, errors]);

  // Get current classification info
  const currentClassification = useMemo(() => {
    return classificationOptions.find(c => c.value === formData.classification);
  }, [formData.classification]);

  // Step 1 Content: Requester Information
  const Step1Content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="flex items-center gap-2 text-sm text-gray-500 justify-end">
          <Save className="w-4 h-4" />
          <span>Draft auto-saved at {lastSaved.toLocaleTimeString()}</span>
        </div>
      )}

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
              placeholder="e.g., A12345678"
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

          {/* Classification Cards */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold" style={{ color: "#111c4e" }}>
              Classification<span className="text-red-500">*</span>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Classification Options */}
              {classificationOptions.map((option) => (
                <motion.div
                  key={option.value}
                  className={`rounded-xl shadow-lg p-4 md:p-6 cursor-pointer transition-all border-2 ${
                    formData.classification === option.value
                      ? "ring-2 ring-offset-2 ring-[var(--csfd-gold)]"
                      : ""
                  }`}
                  style={{
                    backgroundColor: option.color,
                    color: option.textColor || "white",
                    borderColor: formData.classification === option.value ? "#ffc400" : "transparent",
                  }}
                  onClick={() => handleInputChange("classification", option.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-sm md:text-base mb-2">{option.label}</h3>
                    {formData.classification === option.value && (
                      <Check className="w-5 h-5 text-white flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs opacity-80">{option.description}</p>
                </motion.div>
              ))}
            </div>
            
            {touched.classification && errors.classification && (
              <p className="text-red-500 text-sm">{errors.classification}</p>
            )}
          </div>
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

  // Step 2 Content: Classification-specific requirements and purpose
  const Step2Content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Classification Requirements */}
      {currentClassification && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentClassification.color }}
            >
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#111c4e" }}>
                Requirements for {currentClassification.label}
              </h3>
              <p className="text-sm text-gray-500">{currentClassification.description}</p>
            </div>
          </div>

          {/* Requirements List */}
          <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3">Required Documents:</h4>
            <ul className="space-y-2">
              {currentClassification.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Classification-specific Questions */}
          <div className="space-y-4">
            <h4 className="font-semibold" style={{ color: "#111c4e" }}>Additional Information</h4>
            {currentClassification.questions?.map((q) => (
              <div key={q.id}>
                {q.type === "select" ? (
                  <FloatingLabelSelect
                    label={q.label}
                    required={q.required}
                    options={q.options?.map(o => ({ value: o, label: o })) || []}
                    value={formData[q.id as keyof typeof formData] as string}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    onBlur={() => handleBlur(q.id)}
                    error={touched[q.id] ? errors[q.id] : ""}
                  />
                ) : q.type === "textarea" ? (
                  <div className="relative">
                    <textarea
                      id={q.id}
                      placeholder={q.placeholder}
                      required={q.required}
                      value={formData[q.id as keyof typeof formData] as string}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      onBlur={() => handleBlur(q.id)}
                      className="w-full px-4 pt-6 pb-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all min-h-[100px]"
                      style={{
                        borderColor: errors[q.id] ? "#ef4444" : "#111c4e",
                      }}
                    />
                    <label
                      htmlFor={q.id}
                      className="absolute left-4 top-2 text-xs text-gray-500"
                    >
                      {q.label}
                      {q.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {touched[q.id] && errors[q.id] && (
                      <p className="text-red-500 text-sm mt-1">{errors[q.id]}</p>
                    )}
                  </div>
                ) : (
                  <FloatingLabelInput
                    label={q.label}
                    placeholder={q.placeholder}
                    required={q.required}
                    value={formData[q.id as keyof typeof formData] as string}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    onBlur={() => handleBlur(q.id)}
                    error={touched[q.id] ? errors[q.id] : ""}
                  />
                )}
                {touched[q.id] && formData[q.id as keyof typeof formData] && !errors[q.id] && (
                  <ValidationFeedback isValid message="Looks good!" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purpose */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-6" style={{ color: "#111c4e" }}>
          Purpose of Request
        </h3>
        
        <div className="space-y-6">
          <div>
            <FloatingLabelSelect
              label="Purpose"
              required
              options={purposes}
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
                  label="Please specify your purpose"
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

      {/* Document Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#111c4e] flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: "#111c4e" }}>
              REQUIREMENT/S
            </h3>
            <p className="text-sm text-gray-500">
              Upload your supporting document
            </p>
          </div>
        </div>

        {/* Classification-specific Requirements */}
        {currentClassification && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-2">
              {currentClassification.requirementLabel}
            </h4>
            <p className="text-sm text-amber-700">
              {currentClassification.requirementDescription}
            </p>
          </div>
        )}

        {/* Upload Area - Single file only */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#ffc400] transition-colors">
          <input
            type="file"
            id="document-upload"
            accept="image/jpeg,image/png,image/gif,application/pdf"
            onChange={handleDocumentUpload}
            className="hidden"
            disabled={isUploading || uploadedDocuments.length >= 1}
          />
          <label
            htmlFor="document-upload"
            className={`cursor-pointer ${isUploading || uploadedDocuments.length >= 1 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isUploading ? (
              <Loader2 className="w-12 h-12 mx-auto text-[#111c4e] mb-4 animate-spin" />
            ) : uploadedDocuments.length >= 1 ? (
              <Check className="w-12 h-12 mx-auto text-green-500 mb-4" />
            ) : (
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            )}
            <p className="text-gray-600 font-medium mb-2">
              {uploadedDocuments.length >= 1 ? "Document uploaded" : isUploading ? "Uploading..." : "Click to upload"}
            </p>
            <p className="text-sm text-gray-400">
              JPG, PNG, GIF, or PDF (max 5MB)
            </p>
          </label>
        </div>

        {/* Uploaded Document */}
        {uploadedDocuments.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">
              Uploaded Document
            </h4>
            {uploadedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200"
              >
                {/* Preview or Icon */}
                {doc.preview ? (
                  <img
                    src={doc.preview}
                    alt={doc.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-500" />
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    {doc.uploaded ? (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">✓ Uploaded</span>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Uploading...</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeDocument(doc.id)}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
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
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Classification</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.classification}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Purpose</p>
            <p className="font-medium text-[var(--csfd-navy)]">
              {formData.purpose === "Other" ? formData.otherPurpose : formData.purpose}
            </p>
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

        {/* Uploaded Documents Summary */}
        {uploadedDocuments.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3" style={{ color: "#111c4e" }}>
              Uploaded Documents ({uploadedDocuments.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {doc.preview ? (
                    <img src={doc.preview} alt={doc.name} className="w-6 h-6 object-cover rounded" />
                  ) : (
                    <FileText className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> Please ensure all information is correct before submitting.
            A confirmation email will be sent to {formData.email || "your email address"} with a tracking link.
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Define wizard steps
  const wizardSteps: WizardStep[] = [
    {
      id: "requester-info",
      title: "Requester",
      description: "Personal & Academic Info",
      content: Step1Content,
      isComplete: isStep1Complete,
      canProceed: isStep1Complete,
    },
    {
      id: "additional-details",
      title: "Details",
      description: "Requirements & Purpose",
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
    // Save draft when moving between steps
    saveDraft();
    
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
              Your request has been submitted successfully.
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
              Please save your control number. A confirmation email with a tracking link has been sent to {formData.email}.
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
                onClick={() => router.push(`/track?token=${trackingToken}`)}
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
                GOOD MORAL CERTIFICATE
              </h2>
            </motion.div>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-green-600"></div>

              {[
                "Prepare a letter of request for a Good Moral Certificate addressed to the CSFD office.",
                "Submit the request letter along with your valid ID to the CSFD office.",
                "Wait for the processing of your request. This typically takes 1-2 business days.",
                "Claim your Good Moral Certificate from the CSFD office once processed.",
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
              GOOD MORAL CERTIFICATE
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
                  Your progress will be saved. You can continue later.
                </p>
              </div>
              <div className="flex justify-center gap-4 md:gap-6">
                <button
                  className="px-8 md:px-12 py-3 rounded-lg font-bold text-base md:text-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#dc2626", color: "white" }}
                  onClick={() => {
                    saveDraft();
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
