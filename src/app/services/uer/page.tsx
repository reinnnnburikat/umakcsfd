"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { toast } from "sonner";
import { Check, User, FileText, ClipboardCheck, Briefcase, Calendar, Save, Upload, X, AlertTriangle, Building2, Users } from "lucide-react";
import { WizardForm, WizardStep, FloatingLabelInput, FloatingLabelSelect, ValidationFeedback } from "@/components/ui/wizard-form";
import { motion, AnimatePresence } from "framer-motion";

// Local storage key for auto-save
const UER_FORM_STORAGE_KEY = "uer_form_draft";

// Allowed file types and max size
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Category configuration with documents and questions
const categoryConfig = {
  "Working Student": {
    label: "Working Student",
    documents: [
      { id: "cor", label: "Certificate of Registration (COR)", required: true },
      { id: "schoolId", label: "School ID", required: true },
      { id: "employmentCert", label: "Certificate of Employment and ID", required: true },
    ],
    questions: [
      { id: "employerName", label: "Name of Employer", type: "text", required: true },
      { id: "position", label: "Position/Job Title", type: "text", required: true },
      { id: "natureOfWork", label: "Nature of Work", type: "text", required: true },
      { id: "workingHours", label: "Working Hours/Schedule", type: "text", required: true },
      { id: "reason", label: "Reason for Uniform Exemption", type: "textarea", required: true },
    ],
    color: "#000B3C",
    icon: Briefcase,
    description: "For currently enrolled students who are also employed",
    textColor: "white",
  },
  "Office/Org Event": {
    label: "Office/Org Event",
    documents: [
      { id: "facultyId", label: "Faculty/Administrative ID", required: true },
      { id: "projectProfile", label: "Project Profile", required: true },
    ],
    questions: [
      { id: "orgName", label: "Name of Office/Organization", type: "text", required: true },
      { id: "eventName", label: "Name of Event", type: "text", required: true },
      { id: "eventDate", label: "Date of Event", type: "date", required: true },
      { id: "venue", label: "Venue", type: "text", required: true },
      { id: "role", label: "Role in the Event", type: "text", required: true },
      { id: "reason", label: "Reason for Uniform Exemption", type: "textarea", required: true },
    ],
    color: "#ffc400",
    textColor: "#111c4e",
    icon: Calendar,
    description: "For official events organized by offices or organizations",
  },
  "OJT": {
    label: "OJT (On-the-Job Training)",
    documents: [
      { id: "cor", label: "Certificate of Registration (COR)", required: true },
      { id: "schoolId", label: "School ID", required: true },
      { id: "moa", label: "Copy of Approved MOA and Deployment Letter (PDF)", required: true, accept: ".pdf" },
    ],
    questions: [
      { id: "companyName", label: "Company Name", type: "text", required: true },
      { id: "companyAddress", label: "Company Address", type: "text", required: true },
      { id: "position", label: "Position/Role", type: "text", required: true },
      { id: "ojtStartDate", label: "OJT Start Date", type: "date", required: true },
      { id: "ojtEndDate", label: "OJT End Date", type: "date", required: true },
      { id: "supervisorName", label: "Supervisor Name", type: "text", required: true },
      { id: "reason", label: "Reason for Uniform Exemption", type: "textarea", required: true },
    ],
    color: "#f97316",
    icon: Calendar,
    description: "For students undergoing internship/OJT programs",
    textColor: "white",
  },
  "College/Org Shirt": {
    label: "College/Org Shirt",
    documents: [
      { id: "adviserId", label: "Organization/Council Adviser Administrative/Faculty ID", required: true },
      { id: "intentLetter", label: "Approved Intent Letter for Design/Layout Approval", required: true },
    ],
    questions: [
      { id: "orgName", label: "Organization/College Name", type: "text", required: true },
      { id: "purpose", label: "Purpose of the Shirt", type: "text", required: true },
      { id: "designDesc", label: "Design Description", type: "textarea", required: true },
      { id: "targetDate", label: "Target Date of Use", type: "date", required: true },
      { id: "adviserName", label: "Adviser Name", type: "text", required: true },
      { id: "reason", label: "Reason for Uniform Exemption", type: "textarea", required: true },
    ],
    color: "#1F9E55",
    icon: FileText,
    description: "For authorized use of official organization shirt",
    textColor: "white",
  },
  "Other": {
    label: "Other",
    documents: [
      { id: "cor", label: "Certificate of Registration (COR)", required: true },
      { id: "schoolId", label: "School ID", required: true },
      { id: "otherDoc", label: "Other Supporting Document", required: false },
    ],
    questions: [
      { id: "reason", label: "Specify Reason for Uniform Exemption", type: "textarea", required: true },
      { id: "additionalDetails", label: "Additional Details", type: "textarea", required: false },
    ],
    color: "#6b7280",
    icon: FileText,
    description: "For requests not covered by other categories",
    textColor: "white",
  },
};

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

const yearLevels = [
  { value: "Grade 11", label: "Grade 11" },
  { value: "Grade 12", label: "Grade 12" },
  { value: "First Year", label: "First Year" },
  { value: "Second Year", label: "Second Year" },
  { value: "Third Year", label: "Third Year" },
  { value: "Fourth Year", label: "Fourth Year" },
  { value: "Fifth Year", label: "Fifth Year" },
];

// Document file interface
interface DocumentFile {
  file: File | null;
  url: string | null;
  uploading: boolean;
  error: string | null;
}

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
  course: "",
  yearLevel: "",
  email: "",
  phone: "",
  category: "",
  // Category-specific fields - Working Student
  employerName: "",
  position: "",
  natureOfWork: "",
  workingHours: "",
  // Category-specific fields - OJT
  companyName: "",
  companyAddress: "",
  ojtStartDate: "",
  ojtEndDate: "",
  supervisorName: "",
  // Category-specific fields - Event
  orgName: "",
  eventName: "",
  eventDate: "",
  venue: "",
  role: "",
  // Category-specific fields - Shirt
  purpose: "",
  designDesc: "",
  targetDate: "",
  adviserName: "",
  // Common fields
  reason: "",
  additionalDetails: "",
};

// Progress Bar Component
function ProgressBar({ percentage, className = "" }: { percentage: number; className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium" style={{ color: "#111c4e" }}>Form Completion</span>
        <span className="text-sm font-bold" style={{ color: percentage >= 100 ? "#1F9E55" : "#ffc400" }}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full transition-all duration-500"
          style={{ backgroundColor: percentage >= 100 ? "#1F9E55" : "#ffc400" }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Document Upload Field Component
function DocumentUploadField({
  label,
  required,
  document,
  onUpload,
  onRemove,
  accept,
}: {
  label: string;
  required: boolean;
  document: DocumentFile;
  onUpload: (file: File) => void;
  onRemove: () => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const isImage = document.file?.type.startsWith("image/");
  const isPdf = document.file?.type === "application/pdf";

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!document.file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            dragOver ? "border-[#ffc400] bg-amber-50" : "border-gray-300 hover:border-[#ffc400]"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Drag & drop or click to upload</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, PDF (max 5MB)</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept || ".jpg,.jpeg,.png,.gif,.pdf"}
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="border-2 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isImage && document.url ? (
                <div className="w-12 h-12 rounded overflow-hidden">
                  <img src={document.url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : isPdf ? (
                <div className="w-12 h-12 rounded bg-red-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                  {document.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(document.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {document.uploading && (
                <div className="animate-spin w-5 h-5 border-2 border-[#ffc400] border-t-transparent rounded-full" />
              )}
              {document.error && (
                <span className="text-xs text-red-500">{document.error}</span>
              )}
              <button
                type="button"
                onClick={onRemove}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Confirmation Dialog Component
function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: "#111c4e" }}>
            {title}
          </h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            Change Category
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function UERRequestPage() {
  const router = useRouter();
  const [page, setPage] = useState<"process" | "form" | "success">("process");
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [controlNumber, setControlNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [formData, setFormData] = useState(defaultFormData);
  const [documents, setDocuments] = useState<Record<string, DocumentFile>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCategoryConfirm, setShowCategoryConfirm] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string>("");

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(UER_FORM_STORAGE_KEY);
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
      localStorage.setItem(UER_FORM_STORAGE_KEY, JSON.stringify(draftData));
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
      localStorage.removeItem(UER_FORM_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }, []);

  // Auto-format student number: first letter uppercase, rest alphanumeric
  const formatStudentNumber = (value: string): string => {
    let cleaned = value.replace(/[^a-zA-Z0-9]/g, '');
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return cleaned;
  };

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
      case "category":
        return !value ? "Category is required" : "";
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

  // Handle category change with confirmation
  const handleCategoryChange = (newCategory: string) => {
    const currentCategory = formData.category;
    const hasUploadedDocs = Object.keys(documents).some(key => documents[key]?.file);

    if (currentCategory && hasUploadedDocs && currentCategory !== newCategory) {
      setPendingCategory(newCategory);
      setShowCategoryConfirm(true);
    } else {
      setFormData((prev) => ({ ...prev, category: newCategory }));
      setDocuments({});
    }
  };

  const confirmCategoryChange = () => {
    setFormData((prev) => ({ ...prev, category: pendingCategory }));
    setDocuments({});
    setShowCategoryConfirm(false);
    setPendingCategory("");
  };

  const cancelCategoryChange = () => {
    setShowCategoryConfirm(false);
    setPendingCategory("");
  };

  // File upload handling
  const handleFileUpload = async (docId: string, file: File) => {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Only JPG, PNG, GIF, and PDF files are allowed.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    // Set uploading state
    setDocuments((prev) => ({
      ...prev,
      [docId]: { file, url: null, uploading: true, error: null },
    }));

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setDocuments((prev) => ({
          ...prev,
          [docId]: { file, url: data.data.url, uploading: false, error: null },
        }));
        toast.success("File uploaded successfully!");
      } else {
        setDocuments((prev) => ({
          ...prev,
          [docId]: { file, url: null, uploading: false, error: data.error || "Upload failed" },
        }));
        toast.error(data.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setDocuments((prev) => ({
        ...prev,
        [docId]: { file, url: null, uploading: false, error: "Upload failed" },
      }));
      toast.error("Failed to upload file");
    }
  };

  const handleFileRemove = (docId: string) => {
    setDocuments((prev) => {
      const newDocs = { ...prev };
      delete newDocs[docId];
      return newDocs;
    });
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

  // Validate step 2 (Category & Questions)
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate category
    const categoryError = validateField("category", formData.category);
    if (categoryError) {
      newErrors.category = categoryError;
      isValid = false;
    }

    // Validate category-specific required fields
    const config = categoryConfig[formData.category as keyof typeof categoryConfig];
    if (config) {
      config.questions.forEach((q) => {
        if (q.required && !formData[q.id as keyof typeof formData]?.toString().trim()) {
          newErrors[q.id] = `${q.label} is required`;
          isValid = false;
        }
      });
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  // Validate step 3 (Documents)
  const validateStep3 = (): boolean => {
    const config = categoryConfig[formData.category as keyof typeof categoryConfig];
    if (!config) return true;

    let isValid = true;
    const missingDocs: string[] = [];

    config.documents.forEach((doc) => {
      if (doc.required && !documents[doc.id]?.url) {
        missingDocs.push(doc.label);
        isValid = false;
      }
    });

    if (missingDocs.length > 0) {
      toast.error(`Please upload required documents: ${missingDocs.join(", ")}`);
    }

    return isValid;
  };

  // Calculate progress
  const calculateProgress = useMemo(() => {
    let completed = 0;
    let total = 0;

    // Step 1 fields
    const step1Fields = ["givenName", "surname", "sex", "studentNumber", "college", "email"];
    total += step1Fields.length + 1; // +1 for otherCollege if needed
    step1Fields.forEach((field) => {
      if (formData[field as keyof typeof formData] && !errors[field]) {
        completed++;
      }
    });
    if (formData.college !== "Other") {
      completed++; // otherCollege not needed
    } else if (formData.otherCollege && !errors.otherCollege) {
      completed++;
    }

    // Step 2: Category and questions
    total += 1; // category
    if (formData.category && !errors.category) {
      completed++;
      // Count category questions
      const config = categoryConfig[formData.category as keyof typeof categoryConfig];
      if (config) {
        total += config.questions.filter(q => q.required).length;
        config.questions.forEach((q) => {
          if (q.required && formData[q.id as keyof typeof formData]?.toString().trim()) {
            completed++;
          }
        });
      }
    }

    // Step 3: Documents
    const config = categoryConfig[formData.category as keyof typeof categoryConfig];
    if (config) {
      total += config.documents.filter(d => d.required).length;
      config.documents.forEach((doc) => {
        if (doc.required && documents[doc.id]?.url) {
          completed++;
        }
      });
    }

    return total > 0 ? (completed / total) * 100 : 0;
  }, [formData, documents, errors]);

  // Check if step 1 is complete
  const isStep1Complete = useMemo(() => {
    const hasOtherCollege = formData.college !== "Other" || formData.otherCollege.trim();
    return Boolean(
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
    if (!formData.category) return false;

    const config = categoryConfig[formData.category as keyof typeof categoryConfig];
    if (!config) return false;

    // Check all required questions are filled
    return config.questions.every((q) => {
      if (!q.required) return true;
      return formData[q.id as keyof typeof formData]?.toString().trim();
    });
  }, [formData]);

  // Check if step 3 is complete
  const isStep3Complete = useMemo(() => {
    const config = categoryConfig[formData.category as keyof typeof categoryConfig];
    if (!config) return false;

    return config.documents.every((doc) => {
      if (!doc.required) return true;
      return documents[doc.id]?.url;
    });
  }, [formData.category, documents]);

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      toast.error("Please complete all required fields and upload all required documents");
      return;
    }

    setIsSubmitting(true);
    try {
      // Collect document URLs
      const documentUrls: Record<string, string> = {};
      Object.keys(documents).forEach((key) => {
        if (documents[key]?.url) {
          documentUrls[key] = documents[key].url!;
        }
      });

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
          requestorCollege: formData.college === "Other" ? formData.otherCollege : formData.college,
          requestorSex: formData.sex,
          purpose: formData.category,
          documents: documentUrls,
          additionalData: JSON.stringify({
            category: formData.category,
            course: formData.course,
            yearLevel: formData.yearLevel,
            // Working Student
            employerName: formData.employerName,
            position: formData.position,
            natureOfWork: formData.natureOfWork,
            workingHours: formData.workingHours,
            // OJT
            companyName: formData.companyName,
            companyAddress: formData.companyAddress,
            ojtStartDate: formData.ojtStartDate,
            ojtEndDate: formData.ojtEndDate,
            supervisorName: formData.supervisorName,
            // Event
            orgName: formData.orgName,
            eventName: formData.eventName,
            eventDate: formData.eventDate,
            venue: formData.venue,
            role: formData.role,
            // Shirt
            purpose: formData.purpose,
            designDesc: formData.designDesc,
            targetDate: formData.targetDate,
            adviserName: formData.adviserName,
            // Common
            reason: formData.reason,
            additionalDetails: formData.additionalDetails,
          }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        clearDraft();
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

  // Step 1 Content: Personal Information
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
              placeholder="A12345678"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FloatingLabelInput
              label="Course/Program"
              value={formData.course}
              onChange={(e) => handleInputChange("course", e.target.value)}
            />
            <FloatingLabelSelect
              label="Year Level"
              options={yearLevels}
              value={formData.yearLevel}
              onChange={(e) => handleInputChange("yearLevel", e.target.value)}
            />
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

  // Step 2 Content: Category & Questions
  const Step2Content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Category Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#111c4e" }}>
          <FileText className="w-5 h-5" />
          Select Category
        </h3>
        
        <div className="space-y-4">
          <label className="block text-sm font-semibold" style={{ color: "#111c4e" }}>
            Select Exemption Category<span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <motion.div
                  key={key}
                  className={`rounded-xl shadow-lg p-4 cursor-pointer transition-all border-2 ${
                    formData.category === key
                      ? "ring-2 ring-offset-2 ring-[var(--csfd-gold)]"
                      : ""
                  }`}
                  style={{
                    backgroundColor: config.color,
                    color: config.textColor || "white",
                    borderColor: formData.category === key ? "#ffc400" : "transparent",
                  }}
                  onClick={() => handleCategoryChange(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-bold text-sm">{config.label}</h3>
                    </div>
                    {formData.category === key && (
                      <Check className="w-5 h-5 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs opacity-80 mt-2">{config.description}</p>
                </motion.div>
              );
            })}
          </div>
          
          {touched.category && errors.category && (
            <p className="text-red-500 text-sm">{errors.category}</p>
          )}
        </div>
      </div>

      {/* Dynamic Questions based on Category */}
      <AnimatePresence mode="wait">
        {formData.category && categoryConfig[formData.category as keyof typeof categoryConfig] && (
          <motion.div
            key={formData.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#111c4e" }}>
              {(() => {
                const Icon = categoryConfig[formData.category as keyof typeof categoryConfig].icon;
                return <Icon className="w-5 h-5" />;
              })()}
              {categoryConfig[formData.category as keyof typeof categoryConfig].label} Details
            </h3>
            
            <div className="space-y-6">
              {categoryConfig[formData.category as keyof typeof categoryConfig].questions.map((q) => (
                <div key={q.id}>
                  {q.type === "textarea" ? (
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                        {q.label}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none min-h-[100px] resize-y"
                        style={{ borderColor: errors[q.id] ? "#ef4444" : "#111c4e" }}
                        placeholder={`Enter ${q.label.toLowerCase()}`}
                        value={formData[q.id as keyof typeof formData] || ""}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                      />
                      {errors[q.id] && (
                        <p className="text-red-500 text-sm mt-1">{errors[q.id]}</p>
                      )}
                    </div>
                  ) : (
                    <FloatingLabelInput
                      label={q.label}
                      required={q.required}
                      type={q.type}
                      value={formData[q.id as keyof typeof formData] || ""}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      error={errors[q.id] || ""}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Step 3 Content: Documents Upload
  const Step3Content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {formData.category && categoryConfig[formData.category as keyof typeof categoryConfig] && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#111c4e" }}>
            <Upload className="w-5 h-5" />
            Required Documents
          </h3>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> Please upload the following documents. 
              Each file should be in JPG, PNG, GIF, or PDF format, maximum 5MB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryConfig[formData.category as keyof typeof categoryConfig].documents.map((doc) => (
              <DocumentUploadField
                key={doc.id}
                label={doc.label}
                required={doc.required}
                document={documents[doc.id] || { file: null, url: null, uploading: false, error: null }}
                onUpload={(file) => handleFileUpload(doc.id, file)}
                onRemove={() => handleFileRemove(doc.id)}
                accept={doc.accept}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  // Step 4 Content: Summary
  const Step4Content = (
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
        
        {/* Personal Info Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
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
            <p className="text-sm text-gray-500">Course</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.course || "-"}</p>
          </div>
          <div className="border-b border-gray-100 pb-3">
            <p className="text-sm text-gray-500">Year Level</p>
            <p className="font-medium text-[var(--csfd-navy)]">{formData.yearLevel || "-"}</p>
          </div>
          <div className="border-b border-gray-100 pb-3 md:col-span-2">
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium text-[var(--csfd-navy)]">
              {categoryConfig[formData.category as keyof typeof categoryConfig]?.label || formData.category}
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

        {/* Category-specific details */}
        {formData.category && categoryConfig[formData.category as keyof typeof categoryConfig] && (
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h4 className="text-md font-bold mb-4" style={{ color: "#111c4e" }}>
              {categoryConfig[formData.category as keyof typeof categoryConfig].label} Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {categoryConfig[formData.category as keyof typeof categoryConfig].questions.map((q) => {
                const value = formData[q.id as keyof typeof formData];
                if (!value) return null;
                return (
                  <div key={q.id} className="border-b border-gray-100 pb-2">
                    <p className="text-sm text-gray-500">{q.label}</p>
                    <p className="font-medium text-[var(--csfd-navy)] text-sm">
                      {q.type === "date" ? new Date(value).toLocaleDateString() : value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Uploaded Documents Summary */}
        {Object.keys(documents).length > 0 && (
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h4 className="text-md font-bold mb-4" style={{ color: "#111c4e" }}>
              Uploaded Documents
            </h4>
            <div className="space-y-2">
              {Object.entries(documents).map(([key, doc]) => {
                if (!doc.file) return null;
                const config = categoryConfig[formData.category as keyof typeof categoryConfig];
                const docConfig = config?.documents.find(d => d.id === key);
                return (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-[var(--csfd-navy)]">{docConfig?.label || key}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
      id: "category-details",
      title: "Details",
      description: "Category & Details",
      content: Step2Content,
      isComplete: isStep2Complete,
      canProceed: isStep2Complete,
    },
    {
      id: "documents",
      title: "Documents",
      description: "Upload Documents",
      content: Step3Content,
      isComplete: isStep3Complete,
      canProceed: isStep3Complete,
    },
    {
      id: "summary",
      title: "Review",
      description: "Verify Information",
      content: Step4Content,
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
      if (currentStep === 2 && !validateStep3()) {
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
              Your Uniform Exemption Request has been submitted successfully.
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
                onClick={() => router.push(`/track?token=${trackingToken}`)}
              >
                Track Request
              </button>
              <button
                className="px-8 py-3 rounded-lg font-medium border-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: "#111c4e", color: "#111c4e" }}
                onClick={() => router.push("/services")}
              >
                Back to Services
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
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-2" style={{ color: "#111c4e", fontFamily: "Metropolis, sans-serif" }}>
                UNIFORM EXEMPTION REQUEST
              </h1>
              <p className="text-gray-600">
                Submit your request for uniform exemption
              </p>
            </div>

            {/* Process Steps */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "#111c4e" }}>
                How to Request
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: 1, title: "Fill Out Form", desc: "Complete the request form with your personal details" },
                  { step: 2, title: "Select Category", desc: "Choose your exemption category and provide details" },
                  { step: 3, title: "Upload Documents", desc: "Upload required supporting documents" },
                  { step: 4, title: "Submit", desc: "Review and submit your request" },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: "#ffc400" }}
                    >
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-1" style={{ color: "#111c4e" }}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-xl font-bold mb-6" style={{ color: "#111c4e" }}>
                Categories & Requirements
              </h2>
              <div className="space-y-4">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <div
                      key={key}
                      className="border rounded-lg p-4"
                      style={{ borderColor: config.color }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                        <h3 className="font-semibold" style={{ color: config.color }}>
                          {config.label}
                        </h3>
                      </div>
                      <div className="ml-7">
                        <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                        <div className="text-sm">
                          <span className="font-medium">Required Documents: </span>
                          <span className="text-gray-600">
                            {config.documents.map(d => d.label).join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={() => setPage("form")}
                className="px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#ffc400", color: "#111c4e" }}
              >
                Start Request
              </button>
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Form Page
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <PublicNavbar />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCategoryConfirm}
        title="Change Category?"
        message="Changing the category will clear your uploaded documents. Are you sure you want to continue?"
        onConfirm={confirmCategoryChange}
        onCancel={cancelCategoryChange}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-black" style={{ color: "#111c4e", fontFamily: "Metropolis, sans-serif" }}>
                UNIFORM EXEMPTION REQUEST
              </h1>
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            
            {/* Progress Bar */}
            <ProgressBar percentage={calculateProgress} />
          </div>

          {/* Form Steps */}
          <WizardForm
            steps={wizardSteps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Submit Request"
          />
        </div>
      </main>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: "#111c4e" }}>
              Cancel Request?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel? Your progress will be saved as a draft.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={() => {
                  saveDraft();
                  router.push("/services");
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Cancel Request
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
