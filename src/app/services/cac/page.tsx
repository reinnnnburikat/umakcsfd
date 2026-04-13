"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Check,
  Loader2,
  Upload,
  FileText,
  Clock,
  Info,
  Users,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [controlNumber, setControlNumber] = useState("");
  const [children, setChildren] = useState([{ name: "", age: "" }]);

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
    purposeOfVisit: "",
    scheduledDate: "",
    relationship: "",
    guardianName: "",
    guardianId: "",
  });

  const [documents, setDocuments] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChildChange = (index: number, field: string, value: string) => {
    setChildren((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addChild = () => {
    setChildren((prev) => [...prev, { name: "", age: "" }]);
  };

  const removeChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024);
      if (validFiles.length !== files.length) {
        toast.error("Some files were skipped (max 10MB per file)");
      }
      setDocuments((prev) => [...prev, ...validFiles]);
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
          ...formData,
          children,
          documents: documents.map((d) => d.name),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setControlNumber(data.data.controlNumber);
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

  const requirements = [
    { text: "Valid School ID of the student/parent requestor", required: true },
    { text: "Valid ID of the child's guardian (if different from requestor)", required: false },
    { text: "Birth certificate of the child (PSA copy preferred)", required: true },
    { text: "Letter of request stating purpose of child's visit", required: true },
    { text: "Endorsement from the requesting college/department (if for academic purposes)", required: false },
  ];

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
                Your Child Admission Clearance Request has been submitted successfully.
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
                  Please save your control number to track your request status.
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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Child Admission Clearance</h1>
              <p className="text-muted-foreground">
                Request clearance for bringing children to the university campus
              </p>
            </div>
          </div>

          {/* Office Hours Banner */}
          <Alert className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Office Hours:</span> Monday–Friday, 8:00 AM – 5:00 PM.
            </AlertDescription>
          </Alert>

          {/* Form */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Requestor Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Requestor Information</h2>
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
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                    />
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
                  <div className="sm:col-span-2 space-y-2">
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
                </div>
              </div>

              {/* Children Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Children Information</h2>
                  <Button variant="outline" size="sm" onClick={addChild}>
                    + Add Child
                  </Button>
                </div>
                <div className="space-y-4">
                  {children.map((child, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Child's Name</Label>
                          <Input
                            value={child.name}
                            onChange={(e) => handleChildChange(index, "name", e.target.value)}
                            placeholder="Child's full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Age</Label>
                          <Input
                            type="number"
                            value={child.age}
                            onChange={(e) => handleChildChange(index, "age", e.target.value)}
                            placeholder="Age"
                          />
                        </div>
                      </div>
                      {children.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 mt-8"
                          onClick={() => removeChild(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Visit Details */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Visit Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship to Child *</Label>
                    <Select value={formData.relationship} onValueChange={(v) => handleInputChange("relationship", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((rel) => (
                          <SelectItem key={rel} value={rel}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Date of Visit</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="purposeOfVisit">Purpose of Visit *</Label>
                    <Textarea
                      id="purposeOfVisit"
                      value={formData.purposeOfVisit}
                      onChange={(e) => handleInputChange("purposeOfVisit", e.target.value)}
                      placeholder="Explain why you need to bring the child to campus..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian Name (if different from requestor)</Label>
                    <Input
                      id="guardianName"
                      value={formData.guardianName}
                      onChange={(e) => handleInputChange("guardianName", e.target.value)}
                      placeholder="Guardian's full name"
                    />
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Required Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            req.required ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                        <span>{req.text}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            req.required
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
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

              {/* File Upload */}
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
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => router.push("/")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.studentNumber || !formData.email}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
