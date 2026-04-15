"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface DisciplinaryRecord {
  id: string;
  studentNumber: string;
  studentName: string;
  college: string | null;
  minorCount: number;
  majorCount: number;
  lateFacultyCount: number;
  lateRogCount: number;
  latePaymentCount: number;
  otherCount: number;
  hasActiveOffenses: boolean;
  isEndorsed: boolean;
}

interface ClearOffensesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DisciplinaryRecord | null;
  onSuccess: () => void;
}

export function ClearOffensesModal({
  open,
  onOpenChange,
  record,
  onSuccess,
}: ClearOffensesModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalOffenses = record
    ? record.minorCount +
      record.majorCount +
      record.lateFacultyCount +
      record.lateRogCount +
      record.latePaymentCount +
      record.otherCount
    : 0;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for clearing offenses");
      return;
    }

    if (!record) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/disciplinary", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: record.id,
          reason: reason.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setReason("");
          onOpenChange(false);
          onSuccess();
        }, 2000);
      } else {
        toast.error(result.error || "Failed to clear offenses");
      }
    } catch (error) {
      console.error("Error clearing offenses:", error);
      toast.error("Failed to clear offenses");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setShowSuccess(false);
    onOpenChange(false);
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showSuccess ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Offenses Cleared
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Clear All Offenses
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {showSuccess
              ? "The student's offense history has been cleared."
              : "Clear all active offenses for this student"}
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-muted-foreground">
              Offenses cleared for {record.studentName}
            </p>
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
              Record will continue counting future offenses
            </Badge>
          </div>
        ) : (
          <>
            {/* Student Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Student:</span>
                <span className="font-medium">{record.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Student No:</span>
                <span className="font-mono">{record.studentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Offenses:</span>
                <Badge variant="secondary">{totalOffenses} offense(s)</Badge>
              </div>
              {record.isEndorsed && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Endorsement:</span>
                  <Badge className="bg-purple-500 text-white">Active</Badge>
                </div>
              )}
            </div>

            {/* Warning */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This will mark all offenses as cleared and cancel any pending endorsements.
                The offense counts will be reset, but the history will be preserved.
                Future offenses will continue to be counted.
              </AlertDescription>
            </Alert>

            {/* Reason Input */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for Clearing <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Provide a detailed reason for clearing these offenses..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={isSubmitting || !reason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  "Clear All Offenses"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
