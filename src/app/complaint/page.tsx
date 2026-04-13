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
import { Badge } from "@/components/ui/badge";
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
  UserPlus,
  UserMinus,
  AlertTriangle,
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

const steps = [
  { id: 1, title: "Complainant Information" },
  { id: 2, title: "Respondent Information" },
  { id: 3, title: "Incident Details" },
  { id: 4, title: "Review & Submit" },
];

interface Person {
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  sex: string;
  studentNumber: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  yearLevel: string;
}

const emptyPerson: Person = {
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
};

export default function ComplaintPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [controlNumber, setControlNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");

  const [complainants, setComplainants] = useState<Person[]>([{ ...emptyPerson }]);
  const [respondents, setRespondents] = useState<Person[]>([{ ...emptyPerson }]);

  const [formData, setFormData] = useState({
    complaintType: "",
    subject: "",
    description: "",
    dateOfIncident: "",
    location: "",
    isOngoing: false,
    howOften: "",
    witnesses: "",
    previousReports: "",
  });

  const [documents, setDocuments] = useState<File[]>([]);

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePersonChange = (
    type: "complainant" | "respondent",
    index: number,
    field: string,
    value: string
  ) => {
    const setter = type === "complainant" ? setComplainants : setRespondents;
    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addPerson = (type: "complainant" | "respondent") => {
    const setter = type === "complainant" ? setComplainants : setRespondents;
    setter((prev) => [...prev, { ...emptyPerson }]);
  };

  const removePerson = (type: "complainant" | "respondent", index: number) => {
    const setter = type === "complainant" ? setComplainants : setRespondents;
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => file.size <= 100 * 1024 * 1024); // 100MB for complaints
      if (validFiles.length !== files.length) {
        toast.error("Some files were skipped (max 100MB per file)");
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
        return complainants[0].firstName && complainants[0].lastName && complainants[0].email;
      case 2:
        return respondents[0].firstName && respondents[0].lastName;
      case 3:
        return formData.complaintType && formData.subject && formData.description;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complainants,
          respondents,
          ...formData,
          documents: documents.map((d) => d.name),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setControlNumber(data.data.controlNumber);
        setTrackingToken(data.data.trackingToken);
        setSubmitted(true);
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

  const PersonForm = ({
    type,
    person,
    index,
    canRemove,
  }: {
    type: "complainant" | "respondent";
    person: Person;
    index: number;
    canRemove: boolean;
  }) => (
    <Card className={index > 0 ? "mt-4 border-l-4 border-l-orange-500" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            {index === 0 ? `Main ${type === "complainant" ? "Complainant" : "Respondent"}` : `Co-${type === "complainant" ? "Complainant" : "Respondent"} ${index}`}
          </CardTitle>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={() => removePerson(type, index)}
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name *</Label>
          <Input
            value={person.firstName}
            onChange={(e) => handlePersonChange(type, index, "firstName", e.target.value)}
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <Label>Middle Name</Label>
          <Input
            value={person.middleName}
            onChange={(e) => handlePersonChange(type, index, "middleName", e.target.value)}
            placeholder="Middle name"
          />
        </div>
        <div className="space-y-2">
          <Label>Last Name *</Label>
          <Input
            value={person.lastName}
            onChange={(e) => handlePersonChange(type, index, "lastName", e.target.value)}
            placeholder="Last name"
          />
        </div>
        <div className="space-y-2">
          <Label>Extension Name</Label>
          <Input
            value={person.extensionName}
            onChange={(e) => handlePersonChange(type, index, "extensionName", e.target.value)}
            placeholder="Jr., Sr., III"
          />
        </div>
        <div className="space-y-2">
          <Label>Sex</Label>
          <Select
            value={person.sex}
            onValueChange={(v) => handlePersonChange(type, index, "sex", v)}
          >
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
          <Label>Student Number</Label>
          <Input
            value={person.studentNumber}
            onChange={(e) => handlePersonChange(type, index, "studentNumber", e.target.value)}
            placeholder="e.g., 2020-00000"
          />
        </div>
        <div className="space-y-2">
          <Label>Email {type === "complainant" && index === 0 ? "*" : ""}</Label>
          <Input
            type="email"
            value={person.email}
            onChange={(e) => handlePersonChange(type, index, "email", e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={person.phone}
            onChange={(e) => handlePersonChange(type, index, "phone", e.target.value)}
            placeholder="09XX XXX XXXX"
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label>College/Institute</Label>
          <Select
            value={person.college}
            onValueChange={(v) => handlePersonChange(type, index, "college", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select college/institute" />
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
        <div className="space-y-2">
          <Label>Course/Program</Label>
          <Input
            value={person.course}
            onChange={(e) => handlePersonChange(type, index, "course", e.target.value)}
            placeholder="e.g., BS Computer Science"
          />
        </div>
        <div className="space-y-2">
          <Label>Year Level</Label>
          <Select
            value={person.yearLevel}
            onValueChange={(v) => handlePersonChange(type, index, "yearLevel", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Grade 11">Grade 11</SelectItem>
              <SelectItem value="Grade 12">Grade 12</SelectItem>
              <SelectItem value="First Year">First Year</SelectItem>
              <SelectItem value="Second Year">Second Year</SelectItem>
              <SelectItem value="Third Year">Third Year</SelectItem>
              <SelectItem value="Fourth Year">Fourth Year</SelectItem>
              <SelectItem value="Fifth Year">Fifth Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

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
              <h1 className="text-2xl font-bold mb-2">Complaint Filed!</h1>
              <p className="text-muted-foreground mb-6">
                Please wait for CSFD Staff to evaluate your complaint.
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
                  Please save your control number to track your complaint status.
                  A confirmation email has been sent.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push("/track")}>
                  Track Complaint
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">File a Complaint</h1>
              <p className="text-muted-foreground">
                Report incidents or file complaints related to student conduct
              </p>
            </div>
          </div>

          {/* Office Hours Banner */}
          <Alert className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Note:</span> Complaint submissions are accepted 24/7.
              Processing is done during office hours (Mon-Fri, 8AM-5PM).
            </AlertDescription>
          </Alert>

          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-red-500 text-white"
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

          {/* Form Card */}
          <Card>
            <CardContent className="p-6">
              {/* Step 1: Complainant Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Complainant Information</h2>
                  {complainants.map((person, index) => (
                    <PersonForm
                      key={index}
                      type="complainant"
                      person={person}
                      index={index}
                      canRemove={complainants.length > 1}
                    />
                  ))}
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => addPerson("complainant")}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Co-Complainant
                  </Button>
                </div>
              )}

              {/* Step 2: Respondent Information */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Respondent Information</h2>
                  {respondents.map((person, index) => (
                    <PersonForm
                      key={index}
                      type="respondent"
                      person={person}
                      index={index}
                      canRemove={respondents.length > 1}
                    />
                  ))}
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => addPerson("respondent")}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Co-Respondent
                  </Button>
                </div>
              )}

              {/* Step 3: Incident Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Incident Details</h2>

                  <div className="space-y-2">
                    <Label>Complaint Type *</Label>
                    <Select
                      value={formData.complaintType}
                      onValueChange={(v) => handleFormChange("complaintType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select complaint type" />
                      </SelectTrigger>
                      <SelectContent>
                        {complaintTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleFormChange("subject", e.target.value)}
                      placeholder="Brief subject/title of the complaint"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Detailed Description *</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      placeholder="Provide a detailed description of the incident..."
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date of Incident</Label>
                      <Input
                        type="date"
                        value={formData.dateOfIncident}
                        onChange={(e) => handleFormChange("dateOfIncident", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleFormChange("location", e.target.value)}
                        placeholder="Where did the incident occur?"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <Label>Is this an ongoing issue?</Label>
                      <p className="text-sm text-muted-foreground">
                        Check if the incident is still happening
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isOngoing}
                      onChange={(e) => handleFormChange("isOngoing", e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                  </div>

                  {formData.isOngoing && (
                    <div className="space-y-2">
                      <Label>How often does this occur?</Label>
                      <Input
                        value={formData.howOften}
                        onChange={(e) => handleFormChange("howOften", e.target.value)}
                        placeholder="e.g., Daily, Weekly, Occasionally"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Witnesses</Label>
                    <Textarea
                      value={formData.witnesses}
                      onChange={(e) => handleFormChange("witnesses", e.target.value)}
                      placeholder="List any witnesses (names, contact info if available)"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Previous Reports</Label>
                    <Textarea
                      value={formData.previousReports}
                      onChange={(e) => handleFormChange("previousReports", e.target.value)}
                      placeholder="Has this been reported before? If yes, provide details..."
                      rows={2}
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label className="mb-2 block">Supporting Documents</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload evidence (PDF, images, videos - max 100MB each)
                      </p>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov,.mp3,.wav,.doc,.docx"
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

                    {documents.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{doc.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => removeDocument(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Review Your Complaint</h2>

                  {/* Complainants Summary */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Complainants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {complainants.map((person, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{index === 0 ? "Main" : `Co-${index}`}</Badge>
                          <span>
                            {person.firstName} {person.lastName}
                            {person.studentNumber && ` (${person.studentNumber})`}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Respondents Summary */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Respondents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {respondents.map((person, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{index === 0 ? "Main" : `Co-${index}`}</Badge>
                          <span>
                            {person.firstName} {person.lastName}
                            {person.studentNumber && ` (${person.studentNumber})`}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Complaint Details */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Complaint Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">{formData.complaintType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <span className="ml-2 font-medium">{formData.dateOfIncident || "Not specified"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <span className="ml-2 font-medium">{formData.location || "Not specified"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ongoing:</span>
                        <span className="ml-2 font-medium">{formData.isOngoing ? "Yes" : "No"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Subject:</span>
                        <span className="ml-2 font-medium">{formData.subject}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Description:</span>
                        <p className="mt-1 text-muted-foreground">{formData.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  {documents.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Attached Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {doc.name}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-4 border-t">
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
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Complaint
                        <Check className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
