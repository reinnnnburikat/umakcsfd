"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Upload,
  FileText,
  Clock,
  Info,
} from "lucide-react";

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

const purposes = [
  "Employment",
  "Graduate School",
  "Scholarship",
  "Transfer",
  "Board Exam",
  "Agency",
  "Other",
];

const yearLevels = [
  "Grade 11",
  "Grade 12",
  "First Year Level",
  "Second Year Level",
  "Third Year Level",
  "Fourth Year Level",
  "Fifth Year Level",
];

const steps = [
  { id: 1, title: "Personal Information" },
  { id: 2, title: "Request Details" },
  { id: 3, title: "Upload Documents" },
  { id: 4, title: "Review & Submit" },
];

export default function GMCRequestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [controlNumber, setControlNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    extensionName: "",
    sex: "",
    studentNumber: "",
    email: "",
    phone: "",
    college: "",
    course: "",
    yearLevel: "",
    classification: "",
    yearGraduated: "",
    purpose: "",
    otherPurpose: "",
  });

  const [documents, setDocuments] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Check file size (max 10MB each)
      const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024);
      if (validFiles.length !== files.length) {
        toast.error("Some files were skipped (max 10MB per file)");
      }
      setDocuments((prev) => [...prev, ...validFiles]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.sex &&
          formData.studentNumber &&
          formData.email &&
          formData.college
        );
      case 2:
        return formData.classification && formData.purpose;
      case 3:
        return true; // Documents are optional for now
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "GMC",
          ...formData,
          documents: documents.map((d) => d.name), // In real app, upload to storage first
        }),
      });

      const data = await response.json();

      if (data.success) {
        setControlNumber(data.data.controlNumber);
        setTrackingToken(data.data.trackingToken);
        setSubmitted(true);
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

  const getRequirements = () => {
    switch (formData.classification) {
      case "Currently Enrolled":
        return [
          { text: "Valid School ID (front and back)", required: true },
          { text: "Certificate of Registration (COR) for current semester", required: true },
        ];
      case "Graduate":
        return [
          { text: "Valid government-issued ID or old School ID", required: true },
          { text: "Transcript of Records (TOR) or Diploma", required: true },
        ];
      case "Non-Completer":
        return [
          { text: "Last COR or any proof of last enrollment", required: true },
          { text: "Any academic record", required: false },
        ];
      default:
        return [];
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNavbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Request Submitted!</h1>
              <p className="text-muted-foreground mb-6">
                Your Good Moral Certificate request has been submitted successfully.
              </p>
              <div className="bg-muted rounded-lg p-6 mb-6">
                <div className="text-sm text-muted-foreground mb-1">Control Number</div>
                <div className="text-2xl font-mono font-bold text-orange-500">
                  {controlNumber}
                </div>
              </div>
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Please save your control number. You can use it to track your request status.
                  A confirmation email has been sent to {formData.email}.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push("/track")}>
                  Track Request
                </Button>
                <Button onClick={() => router.push("/")}>Back to Home</Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-2xl font-bold mb-2">Good Moral Certificate Request</h1>
          <p className="text-muted-foreground">
            Complete the form below to request a Good Moral Certificate from CSFD.
          </p>
        </div>

        {/* Office Hours Banner */}
        <div className="max-w-3xl mx-auto mb-6">
          <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Office Hours:</span> Monday–Friday, 8:00 AM – 5:00 PM.
              You may submit requests anytime. Processing will be done during office hours.
            </AlertDescription>
          </Alert>
        </div>

        {/* Stepper */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-orange-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <span className="text-xs mt-1 text-center hidden sm:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-12 sm:w-24 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Personal Information</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange("middleName", e.target.value)}
                      placeholder="Enter your middle name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extensionName">Extension Name</Label>
                    <Input
                      id="extensionName"
                      value={formData.extensionName}
                      onChange={(e) => handleInputChange("extensionName", e.target.value)}
                      placeholder="e.g., Jr., Sr., III"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex *</Label>
                    <Select value={formData.sex} onValueChange={(v) => handleInputChange("sex", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentNumber">Student Number *</Label>
                    <Input
                      id="studentNumber"
                      value={formData.studentNumber}
                      onChange={(e) => handleInputChange("studentNumber", e.target.value)}
                      placeholder="e.g., 2020-00000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="09XX XXX XXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College/Institute *</Label>
                  <Select value={formData.college} onValueChange={(v) => handleInputChange("college", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your college/institute" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college} value={college}>
                          {college}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course/Program</Label>
                    <Input
                      id="course"
                      value={formData.course}
                      onChange={(e) => handleInputChange("course", e.target.value)}
                      placeholder="e.g., BS Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearLevel">Year/Grade Level</Label>
                    <Select value={formData.yearLevel} onValueChange={(v) => handleInputChange("yearLevel", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year level" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Request Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Request Details</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="classification">Classification *</Label>
                  <Select
                    value={formData.classification}
                    onValueChange={(v) => handleInputChange("classification", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Currently Enrolled">Currently Enrolled Student</SelectItem>
                      <SelectItem value="Graduate">Graduate / Alumni</SelectItem>
                      <SelectItem value="Non-Completer">Non-Completer (Left without graduating)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.classification === "Graduate" && (
                  <div className="space-y-2">
                    <Label htmlFor="yearGraduated">Year Graduated</Label>
                    <Input
                      id="yearGraduated"
                      value={formData.yearGraduated}
                      onChange={(e) => handleInputChange("yearGraduated", e.target.value)}
                      placeholder="e.g., 2023"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Select value={formData.purpose} onValueChange={(v) => handleInputChange("purpose", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {purposes.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.purpose === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherPurpose">Please specify *</Label>
                    <Input
                      id="otherPurpose"
                      value={formData.otherPurpose}
                      onChange={(e) => handleInputChange("otherPurpose", e.target.value)}
                      placeholder="Enter your purpose"
                    />
                  </div>
                )}

                {/* Requirements */}
                {formData.classification && (
                  <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Required Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {getRequirements().map((req, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                req.required ? "bg-orange-500" : "bg-gray-400"
                              }`}
                            />
                            <span>{req.text}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                req.required
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {req.required ? "Required" : "If Applicable"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: Upload Documents */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Upload Documents</h2>
                
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Drag and drop files here, or click to select
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted: PDF, JPG, PNG, DOC, DOCX (max 10MB each)
                  </p>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files</Label>
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => removeDocument(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Review Your Information</h2>
                
                <div className="grid gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <span className="ml-2 font-medium">
                          {formData.firstName} {formData.middleName} {formData.lastName}{" "}
                          {formData.extensionName}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sex:</span>
                        <span className="ml-2 font-medium">{formData.sex}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Student No:</span>
                        <span className="ml-2 font-medium">{formData.studentNumber}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <span className="ml-2 font-medium">{formData.email}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">College:</span>
                        <span className="ml-2 font-medium">{formData.college}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Request Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Classification:</span>
                        <span className="ml-2 font-medium">{formData.classification}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Purpose:</span>
                        <span className="ml-2 font-medium">
                          {formData.purpose === "Other" ? formData.otherPurpose : formData.purpose}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {documents.length > 0 ? (
                        <ul className="text-sm space-y-1">
                          {documents.map((doc, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {doc.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No documents uploaded</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={!canProceed()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <Check className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <PublicFooter />
    </div>
  );
}
