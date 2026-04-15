"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { toast } from "sonner";
import { 
  Check, User, FileText, ClipboardCheck, Baby, Users, Save, Upload, 
  X, Plus, Trash2, AlertTriangle, ImageIcon, FileCheck
} from "lucide-react";
import { WizardForm, WizardStep, FloatingLabelInput, FloatingLabelSelect, ValidationFeedback } from "@/components/ui/wizard-form";
import { motion, AnimatePresence } from "framer-motion";

// Local storage key for auto-save
const CAC_FORM_STORAGE_KEY = "cac_form_draft";

// Maximum number of children allowed
const MAX_CHILDREN = 5;

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

const yearLevelOptions = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
  { value: "5th Year", label: "5th Year" },
  { value: "Irregular", label: "Irregular" },
];

// File upload interface
interface UploadedFile {
  file: File | null;
  preview: string | null;
  url: string | null;
  name: string;
}

// Child data interface
interface ChildData {
  id: string;
  surname: string;
  givenName: string;
  middleName: string;
  extensionName: string;
  sex: string;
  age: string;
  photo: UploadedFile;
}

// Default child data
const createDefaultChild = (): ChildData => ({
  id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  surname: "",
  givenName: "",
  middleName: "",
  extensionName: "",
  sex: "",
  age: "",
  photo: { file: null, preview: null, url: null, name: "" },
});

// Default form data
const defaultFormData = {
  // Student Information
  givenName: "",
  surname: "",
  middleName: "",
  extensionName: "",
  sex: "",
  studentNumber: "",
  college: "",
  otherCollege: "",
  yearLevel: "",
  email: "",
  phone: "",
};

// Default student documents
const defaultStudentDocs = {
  cor: { file: null, preview: null, url: null, name: "" } as UploadedFile,
  schoolId: { file: null, preview: null, url: null, name: "" } as UploadedFile,
};

// Allowed file types
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CACRequestPage() {
  const router = useRouter();
  const [page, setPage] = useState<"process" | "form" | "success">("process");
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [controlNumber, setControlNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  const [formData, setFormData] = useState(defaultFormData);
  const [studentDocs, setStudentDocs] = useState(defaultStudentDocs);
  const [children, setChildren] = useState<ChildData[]>([createDefaultChild()]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    let totalFields = 0;
    let filledFields = 0;

    // Student info fields (required ones)
    const studentRequiredFields = ["givenName", "surname", "sex", "studentNumber", "college", "yearLevel", "email"];
    totalFields += studentRequiredFields.length;
    studentRequiredFields.forEach(field => {
      if (field === "college") {
        if (formData.college === "Other") {
          totalFields += 1;
          if (formData.otherCollege.trim()) filledFields += 1;
        }
        if (formData.college) filledFields += 1;
      } else if (formData[field as keyof typeof formData]?.toString().trim()) {
        filledFields += 1;
      }
    });

    // Student documents
    totalFields += 2; // COR and School ID
    if (studentDocs.cor.file) filledFields += 1;
    if (studentDocs.schoolId.file) filledFields += 1;

    // Children fields
    children.forEach(child => {
      const childRequiredFields = ["surname", "givenName", "sex", "age"];
      totalFields += childRequiredFields.length + 1; // +1 for photo
      childRequiredFields.forEach(field => {
        if (child[field as keyof ChildData]?.toString().trim()) filledFields += 1;
      });
      if (child.photo.file) filledFields += 1;
    });

    // Confirmation checkbox
    totalFields += 1;
    if (confirmCheckbox) filledFields += 1;

    return Math.round((filledFields / totalFields) * 100);
  }, [formData, studentDocs, children, confirmCheckbox]);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(CAC_FORM_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData && Object.keys(parsed.formData).length > 0) {
          setFormData(parsed.formData);
          if (parsed.studentDocs) {
            setStudentDocs(parsed.studentDocs);
          }
          if (parsed.children && parsed.children.length > 0) {
            setChildren(parsed.children);
          }
          if (parsed.confirmCheckbox) {
            setConfirmCheckbox(parsed.confirmCheckbox);
          }
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
        studentDocs,
        children,
        confirmCheckbox,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(CAC_FORM_STORAGE_KEY, JSON.stringify(draftData));
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  }, [formData, studentDocs, children, confirmCheckbox]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.values(formData).some(v => v.trim()) || studentDocs.cor.file || studentDocs.schoolId.file || children.some(c => c.givenName)) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, studentDocs, children, saveDraft]);

  // Clear draft after successful submission
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(CAC_FORM_STORAGE_KEY);
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

  // Validate file
  const validateFile = (file: File): string => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Invalid file type. Only JPG, PNG, GIF, and PDF files are allowed.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 5MB limit.";
    }
    return "";
  };

  // Handle file upload
  const handleFileUpload = async (
    file: File,
    setter: (doc: UploadedFile) => void,
    currentDoc: UploadedFile
  ): Promise<boolean> => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return false;
    }

    // Create preview for images
    let preview: string | null = null;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }

    // Revoke previous preview URL if exists
    if (currentDoc.preview) {
      URL.revokeObjectURL(currentDoc.preview);
    }

    // Upload to server
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setter({
          file,
          preview,
          url: data.data.url,
          name: file.name,
        });
        return true;
      } else {
        toast.error(data.error || "Failed to upload file");
        return false;
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      return false;
    }
  };

  // Handle student document upload
  const handleStudentDocUpload = async (docType: "cor" | "schoolId", file: File) => {
    await handleFileUpload(
      file,
      (doc) => setStudentDocs((prev) => ({ ...prev, [docType]: doc })),
      studentDocs[docType]
    );
  };

  // Remove student document
  const removeStudentDoc = (docType: "cor" | "schoolId") => {
    const doc = studentDocs[docType];
    if (doc.preview) {
      URL.revokeObjectURL(doc.preview);
    }
    setStudentDocs((prev) => ({
      ...prev,
      [docType]: { file: null, preview: null, url: null, name: "" },
    }));
  };

  // Handle child photo upload
  const handleChildPhotoUpload = async (childId: string, file: File) => {
    const child = children.find((c) => c.id === childId);
    if (!child) return;

    await handleFileUpload(
      file,
      (doc) => {
        setChildren((prev) =>
          prev.map((c) => (c.id === childId ? { ...c, photo: doc } : c))
        );
      },
      child.photo
    );
  };

  // Remove child photo
  const removeChildPhoto = (childId: string) => {
    setChildren((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          if (c.photo.preview) {
            URL.revokeObjectURL(c.photo.preview);
          }
          return { ...c, photo: { file: null, preview: null, url: null, name: "" } };
        }
        return c;
      })
    );
  };

  // Add new child
  const addChild = () => {
    if (children.length < MAX_CHILDREN) {
      setChildren((prev) => [...prev, createDefaultChild()]);
    }
  };

  // Remove child
  const removeChild = (childId: string) => {
    if (children.length > 1) {
      const child = children.find((c) => c.id === childId);
      if (child?.photo.preview) {
        URL.revokeObjectURL(child.photo.preview);
      }
      setChildren((prev) => prev.filter((c) => c.id !== childId));
    }
  };

  // Update child field
  const updateChildField = (childId: string, field: keyof ChildData, value: string) => {
    setChildren((prev) =>
      prev.map((c) => (c.id === childId ? { ...c, [field]: value } : c))
    );
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
      case "yearLevel":
        return !value ? "Year level is required" : "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email";
        }
        return "";
      default:
        return "";
    }
  };

  // Validate child field
  const validateChildField = (field: keyof ChildData, value: string): string => {
    switch (field) {
      case "surname":
        return !value.trim() ? "Surname is required" : "";
      case "givenName":
        return !value.trim() ? "Given name is required" : "";
      case "sex":
        return !value ? "Sex is required" : "";
      case "age":
        if (!value.trim()) return "Age is required";
        if (isNaN(parseInt(value)) || parseInt(value) < 0 || parseInt(value) > 18) {
          return "Please enter a valid age (0-18)";
        }
        return "";
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

  // Validate step 1 (Student Information)
  const validateStep1 = (): boolean => {
    const fields = ["givenName", "surname", "sex", "studentNumber", "college", "yearLevel", "email"];
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

    // Check for student documents
    if (!studentDocs.cor.file) {
      toast.error("Certificate of Registration (COR) is required");
      isValid = false;
    }
    if (!studentDocs.schoolId.file) {
      toast.error("School ID is required");
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  // Validate step 2 (Children Information)
  const validateStep2 = (): boolean => {
    let isValid = true;

    for (const child of children) {
      const requiredFields: (keyof ChildData)[] = ["surname", "givenName", "sex", "age"];
      for (const field of requiredFields) {
        const error = validateChildField(field, child[field] as string);
        if (error) {
          toast.error(`Child ${children.indexOf(child) + 1}: ${error}`);
          isValid = false;
        }
      }
      if (!child.photo.file) {
        toast.error(`Child ${children.indexOf(child) + 1}: Photo is required`);
        isValid = false;
      }
    }

    return isValid;
  };

  // Validate step 3 (Review & Confirm)
  const validateStep3 = (): boolean => {
    if (!confirmCheckbox) {
      toast.error("Please confirm that all information is true and correct");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare children data
      const childrenData = children.map((child) => ({
        surname: child.surname,
        givenName: child.givenName,
        middleName: child.middleName,
        extensionName: child.extensionName,
        sex: child.sex,
        age: child.age,
        photoUrl: child.photo.url,
      }));

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
          requestorCollege: formData.college === "Other" ? formData.otherCollege : formData.college,
          requestorSex: formData.sex,
          yearLevel: formData.yearLevel,
          corUrl: studentDocs.cor.url,
          schoolIdUrl: studentDocs.schoolId.url,
          children: JSON.stringify(childrenData),
          additionalData: JSON.stringify({
            yearLevel: formData.yearLevel,
            corFileName: studentDocs.cor.name,
            schoolIdFileName: studentDocs.schoolId.name,
            childrenCount: children.length,
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

  // Check if step 1 is complete
  const isStep1Complete = useMemo(() => {
    const hasOtherCollege = formData.college !== "Other" || formData.otherCollege.trim();
    return !!(
      formData.givenName.trim() &&
      formData.surname.trim() &&
      formData.sex &&
      formData.studentNumber.trim() &&
      formData.college &&
      formData.yearLevel &&
      hasOtherCollege &&
      formData.email.trim() &&
      studentDocs.cor.file &&
      studentDocs.schoolId.file &&
      !errors.givenName &&
      !errors.surname &&
      !errors.sex &&
      !errors.studentNumber &&
      !errors.college &&
      !errors.yearLevel &&
      !errors.email
    );
  }, [formData, studentDocs, errors]);

  // Check if step 2 is complete
  const isStep2Complete = useMemo(() => {
    return children.every((child) => (
      child.surname.trim() &&
      child.givenName.trim() &&
      child.sex &&
      child.age.trim() &&
      child.photo.file
    ));
  }, [children]);

  // Check if step 3 is complete
  const isStep3Complete = useMemo(() => {
    return confirmCheckbox;
  }, [confirmCheckbox]);

  // File upload component
  const FileUploadField = ({ 
    label, 
    doc, 
    onUpload, 
    onRemove, 
    required = false,
    accept = "image/jpeg,image/png,image/gif,application/pdf"
  }: { 
    label: string; 
    doc: UploadedFile; 
    onUpload: (file: File) => void; 
    onRemove: () => void;
    required?: boolean;
    accept?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold" style={{ color: "#111c4e" }}>
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      
      {!doc.file ? (
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-[#111c4e] transition-colors"
          style={{ borderColor: "#d1d5db" }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = accept;
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) onUpload(file);
            };
            input.click();
          }}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, PDF (max 5MB)</p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 flex items-center gap-4">
          {doc.preview ? (
            <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
              <img src={doc.preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "#111c4e" }}>{doc.name}</p>
            <p className="text-xs text-gray-500">{doc.file ? `${(doc.file.size / 1024).toFixed(1)} KB` : ""}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );

  // Step 1 Content: Student Information
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
          Student Information
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
          <div>
            <FloatingLabelSelect
              label="Year Level"
              required
              options={yearLevelOptions}
              value={formData.yearLevel}
              onChange={(e) => handleInputChange("yearLevel", e.target.value)}
              onBlur={() => handleBlur("yearLevel")}
              error={touched.yearLevel ? errors.yearLevel : ""}
            />
            {touched.yearLevel && formData.yearLevel && !errors.yearLevel && (
              <ValidationFeedback isValid message="Selected" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {formData.college === "Other" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
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

      {/* Student Documents */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#111c4e" }}>
          <FileCheck className="w-5 h-5" />
          Required Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploadField
            label="Certificate of Registration (COR)"
            doc={studentDocs.cor}
            onUpload={(file) => handleStudentDocUpload("cor", file)}
            onRemove={() => removeStudentDoc("cor")}
            required
          />
          <FileUploadField
            label="Copy of School ID"
            doc={studentDocs.schoolId}
            onUpload={(file) => handleStudentDocUpload("schoolId", file)}
            onRemove={() => removeStudentDoc("schoolId")}
            required
          />
        </div>
      </div>
    </motion.div>
  );

  // Step 2 Content: Children Information
  const Step2Content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "#111c4e" }}>
          <Baby className="w-5 h-5" />
          Child Information
        </h3>
        {children.length < MAX_CHILDREN && (
          <button
            type="button"
            onClick={addChild}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: "#111c4e", color: "white" }}
          >
            <Plus className="w-4 h-4" />
            Add Child
          </button>
        )}
      </div>

      <AnimatePresence>
        {children.map((child, index) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-md font-semibold" style={{ color: "#111c4e" }}>
                Child {index + 1}
              </h4>
              {children.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChild(child.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: "#111c4e" }}>
                  Child's Photo<span className="text-red-500">*</span>
                </label>
                {!child.photo.file ? (
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-[#111c4e] transition-colors"
                    style={{ borderColor: "#d1d5db" }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/jpeg,image/png,image/gif";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleChildPhotoUpload(child.id, file);
                      };
                      input.click();
                    }}
                  >
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload child's photo</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (max 5MB)</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2" style={{ borderColor: "#111c4e" }}>
                      {child.photo.preview && (
                        <img src={child.photo.preview} alt="Child photo" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: "#111c4e" }}>{child.photo.name}</p>
                      <p className="text-xs text-gray-500">{child.photo.file ? `${(child.photo.file.size / 1024).toFixed(1)} KB` : ""}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeChildPhoto(child.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Child Fields */}
              <FloatingLabelInput
                label="Surname"
                required
                value={child.surname}
                onChange={(e) => updateChildField(child.id, "surname", e.target.value)}
              />
              <FloatingLabelInput
                label="Given Name"
                required
                value={child.givenName}
                onChange={(e) => updateChildField(child.id, "givenName", e.target.value)}
              />
              <FloatingLabelInput
                label="Middle Name"
                value={child.middleName}
                onChange={(e) => updateChildField(child.id, "middleName", e.target.value)}
              />
              <FloatingLabelInput
                label="Extension Name"
                value={child.extensionName}
                onChange={(e) => updateChildField(child.id, "extensionName", e.target.value)}
              />
              <FloatingLabelSelect
                label="Sex"
                required
                options={sexOptions}
                value={child.sex}
                onChange={(e) => updateChildField(child.id, "sex", e.target.value)}
              />
              <FloatingLabelInput
                label="Age"
                required
                type="number"
                min="0"
                max="18"
                value={child.age}
                onChange={(e) => updateChildField(child.id, "age", e.target.value)}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  // Step 3 Content: Review & Confirm
  const Step3Content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
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
        
        {/* Student Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-4 pb-2 border-b" style={{ color: "#111c4e" }}>
            <User className="w-4 h-4 inline mr-2" />
            Student Information
          </h4>
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
              <p className="text-sm text-gray-500">Year Level</p>
              <p className="font-medium text-[var(--csfd-navy)]">{formData.yearLevel}</p>
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
        </div>

        {/* Student Documents Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-4 pb-2 border-b" style={{ color: "#111c4e" }}>
            <FileCheck className="w-4 h-4 inline mr-2" />
            Student Documents
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Certificate of Registration (COR)</p>
              {studentDocs.cor.preview ? (
                <img src={studentDocs.cor.preview} alt="COR Preview" className="w-full h-32 object-cover rounded" />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-5 h-5" />
                  <span>{studentDocs.cor.name}</span>
                </div>
              )}
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">School ID</p>
              {studentDocs.schoolId.preview ? (
                <img src={studentDocs.schoolId.preview} alt="School ID Preview" className="w-full h-32 object-cover rounded" />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-5 h-5" />
                  <span>{studentDocs.schoolId.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Children Section */}
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-4 pb-2 border-b" style={{ color: "#111c4e" }}>
            <Baby className="w-4 h-4 inline mr-2" />
            Child Information ({children.length} {children.length === 1 ? 'child' : 'children'})
          </h4>
          {children.map((child, index) => (
            <div key={child.id} className="mb-4 last:mb-0 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-4">
                {child.photo.preview && (
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <img src={child.photo.preview} alt={`Child ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium mb-2" style={{ color: "#111c4e" }}>Child {index + 1}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name: </span>
                      <span className="text-[var(--csfd-navy)]">{child.givenName} {child.middleName ? child.middleName + ' ' : ''}{child.surname}{child.extensionName ? ' ' + child.extensionName : ''}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sex: </span>
                      <span className="text-[var(--csfd-navy)]">{child.sex}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Age: </span>
                      <span className="text-[var(--csfd-navy)]">{child.age}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Confirmation Checkbox */}
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmCheckbox}
              onChange={(e) => setConfirmCheckbox(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-red-800 font-semibold mb-1">
                <AlertTriangle className="w-5 h-5" />
                <span>Important Declaration</span>
              </div>
              <p className="text-sm text-red-700">
                I confirm that all information provided is true and correct. Any forgery and falsified document will result to a disciplinary sanction.
              </p>
            </div>
          </label>
        </div>
      </div>
    </motion.div>
  );

  // Define wizard steps
  const wizardSteps: WizardStep[] = [
    {
      id: "student-info",
      title: "Student Info",
      description: "Personal & Documents",
      content: Step1Content,
      isComplete: isStep1Complete,
      canProceed: isStep1Complete,
    },
    {
      id: "children-info",
      title: "Children",
      description: "Child Information",
      content: Step2Content,
      isComplete: isStep2Complete,
      canProceed: isStep2Complete,
    },
    {
      id: "review",
      title: "Review",
      description: "Verify & Submit",
      content: Step3Content,
      isComplete: isStep3Complete,
      canProceed: isStep3Complete,
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
              Your Child Admission Clearance request has been submitted successfully.
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
                CHILD ADMISSION CLEARANCE
              </h2>
            </motion.div>

            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-green-600"></div>

              {[
                "Fill out the Child Admission Clearance request form with your student information and upload the required documents (COR and School ID).",
                "Provide information for each child you wish to bring to campus, including their photo.",
                "Review all information and confirm that everything is true and correct before submission.",
                "Wait for approval from the CSFD office. Processing typically takes 1-2 business days.",
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
            className="text-center mb-4"
          >
            <h1
              className="text-2xl md:text-4xl font-black mb-2"
              style={{ color: "#3d3d3d", fontFamily: "Metropolis, sans-serif" }}
            >
              CHILD ADMISSION CLEARANCE
            </h1>
            <h2
              className="text-xl md:text-2xl font-black"
              style={{ color: "#ffc400", fontFamily: "Metropolis, sans-serif" }}
            >
              REQUEST FORM
            </h2>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: "#111c4e" }}>Form Completion</span>
              <span className="text-sm font-bold" style={{ color: "#111c4e" }}>{progressPercentage}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: progressPercentage === 100 ? "#1F9E55" : "#ffc400",
                }}
              />
            </div>
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
                  Yes, Cancel
                </button>
                <button
                  className="px-8 md:px-12 py-3 rounded-lg font-bold text-base md:text-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#1F9E55", color: "white" }}
                  onClick={() => setShowCancelModal(false)}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
