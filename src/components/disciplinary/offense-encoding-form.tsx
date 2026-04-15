"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { OffenseCategory } from "@prisma/client";
import { getOffenseLabel, offenseColorConfig } from "./offense-color-badge";

const offenseSchema = z.object({
  studentNumber: z.string().min(1, "Student number is required"),
  studentName: z.string().min(1, "Student name is required"),
  college: z.string().min(1, "College is required"),
  course: z.string().optional(),
  yearLevel: z.string().optional(),
  offenseCategory: z.enum([
    "MINOR",
    "MAJOR",
    "LATE_FACULTY_EVALUATION",
    "LATE_ACCESS_ROG",
    "LATE_PAYMENT",
    "OTHER",
  ]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  controlNumber: z.string().optional(),
  specifyOther: z.string().optional(),
});

type OffenseFormData = z.infer<typeof offenseSchema>;

interface OffenseEncodingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: {
    studentNumber?: string;
    studentName?: string;
    college?: string;
  };
  existingCounts?: {
    MINOR: number;
    MAJOR: number;
    LATE_FACULTY_EVALUATION: number;
    LATE_ACCESS_ROG: number;
    LATE_PAYMENT: number;
    OTHER: number;
  };
}

export function OffenseEncodingForm({
  open,
  onOpenChange,
  onSuccess,
  initialData,
  existingCounts = {
    MINOR: 0,
    MAJOR: 0,
    LATE_FACULTY_EVALUATION: 0,
    LATE_ACCESS_ROG: 0,
    LATE_PAYMENT: 0,
    OTHER: 0,
  },
}: OffenseEncodingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OffenseFormData>({
    resolver: zodResolver(offenseSchema),
    defaultValues: {
      studentNumber: initialData?.studentNumber || "",
      studentName: initialData?.studentName || "",
      college: initialData?.college || "",
      course: "",
      yearLevel: "",
      offenseCategory: "MINOR",
      description: "",
      controlNumber: "",
      specifyOther: "",
    },
  });

  const watchCategory = form.watch("offenseCategory");

  const onSubmit = async (data: OffenseFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/disciplinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Offense recorded successfully");
        form.reset();
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error || "Failed to record offense");
      }
    } catch (error) {
      console.error("Error recording offense:", error);
      toast.error("Failed to record offense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNewOffenseLevel = (category: OffenseCategory) => {
    const currentCount = existingCounts[category] || 0;
    return currentCount + 1;
  };

  const getCategoryDisplayName = (cat: string): string => {
    switch (cat) {
      case "MINOR": return "Minor";
      case "MAJOR": return "Major";
      case "LATE_FACULTY_EVALUATION": return "Late Faculty Evaluation";
      case "LATE_ACCESS_ROG": return "Late Access of ROG";
      case "LATE_PAYMENT": return "Late Payment";
      case "OTHER": return "Other";
      default: return cat;
    }
  };

  const newLevel = getNewOffenseLevel(watchCategory as OffenseCategory);
  const config = offenseColorConfig[watchCategory as OffenseCategory];
  const nextLabel = config?.labels[Math.min(newLevel - 1, 4)] || "";
  const nextColor = config?.colors[Math.min(newLevel - 1, 4)] || "#6b7280";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Encode Offense</DialogTitle>
          <DialogDescription>
            Record a new disciplinary offense for a student
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Student Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2023-00001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College/Institute *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CCS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1st">1st Year</SelectItem>
                        <SelectItem value="2nd">2nd Year</SelectItem>
                        <SelectItem value="3rd">3rd Year</SelectItem>
                        <SelectItem value="4th">4th Year</SelectItem>
                        <SelectItem value="5th">5th Year</SelectItem>
                        <SelectItem value="irregular">Irregular</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Offense Category */}
            <FormField
              control={form.control}
              name="offenseCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offense Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MINOR">Minor</SelectItem>
                      <SelectItem value="MAJOR">Major</SelectItem>
                      <SelectItem value="LATE_FACULTY_EVALUATION">Late Faculty Evaluation</SelectItem>
                      <SelectItem value="LATE_ACCESS_ROG">Late Access of ROG</SelectItem>
                      <SelectItem value="LATE_PAYMENT">Late Payment</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Current: {existingCounts[field.value as OffenseCategory] || 0} offense(s) • 
                    New: <span style={{ color: nextColor, fontWeight: "bold" }}>{nextLabel}</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Specify Other - only shown for OTHER category */}
            {watchCategory === "OTHER" && (
              <FormField
                control={form.control}
                name="specifyOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Offense *</FormLabel>
                    <FormControl>
                      <Input placeholder="Specify the offense type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details about the offense..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Related Complaint/Control Number */}
            <FormField
              control={form.control}
              name="controlNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Complaint/Control Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CMP-2024-00001 (optional)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to a related complaint or case if applicable
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Offense"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
