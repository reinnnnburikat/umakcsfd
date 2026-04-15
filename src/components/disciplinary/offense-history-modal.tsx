"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Award,
} from "lucide-react";
import { OffenseColorBadge, getOffenseColor, getOffenseLabel } from "./offense-color-badge";
import { OffenseCategory, EndorsementStatus } from "@prisma/client";

interface Offense {
  id: string;
  offenseCategory: OffenseCategory;
  offenseLevel: string;
  description: string | null;
  controlNumber: string | null;
  specifyOther: string | null;
  isCleared: boolean;
  clearedAt: string | null;
  createdAt: string;
  processor: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface Endorsement {
  id: string;
  type: string;
  status: EndorsementStatus;
  triggeredByCategory: OffenseCategory;
  triggeredByLevel: string;
  details: string | null;
  hoursRequired: number | null;
  hoursCompleted: number | null;
  createdAt: string;
  processor: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface Clearance {
  id: string;
  reason: string;
  minorCleared: number;
  majorCleared: number;
  lateFacultyCleared: number;
  lateRogCleared: number;
  latePaymentCleared: number;
  otherCleared: number;
  createdAt: string;
  clearedByUser: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface DisciplinaryRecord {
  id: string;
  studentNumber: string;
  studentName: string;
  college: string | null;
  course: string | null;
  yearLevel: string | null;
  minorCount: number;
  majorCount: number;
  lateFacultyCount: number;
  lateRogCount: number;
  latePaymentCount: number;
  otherCount: number;
  hasActiveOffenses: boolean;
  isEndorsed: boolean;
  offenses: Offense[];
  endorsements: Endorsement[];
  clearances: Clearance[];
  colors?: Record<string, string>;
}

interface OffenseHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DisciplinaryRecord | null;
  onAddOffense?: () => void;
  onClearOffenses?: () => void;
}

export function OffenseHistoryModal({
  open,
  onOpenChange,
  record,
  onAddOffense,
  onClearOffenses,
}: OffenseHistoryModalProps) {
  if (!record) return null;

  const getStatusBadge = (status: EndorsementStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryDisplayName = (cat: OffenseCategory): string => {
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

  const formatLevel = (level: string): string => {
    switch (level) {
      case "FIRST": return "1st";
      case "SECOND": return "2nd";
      case "THIRD": return "3rd";
      case "FOURTH": return "4th";
      case "FIFTH": return "5th";
      default: return level;
    }
  };

  const activeOffenses = record.offenses.filter((o) => !o.isCleared);
  const clearedOffenses = record.offenses.filter((o) => o.isCleared);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Disciplinary Record</DialogTitle>
          <DialogDescription>
            Complete offense history for {record.studentName}
          </DialogDescription>
        </DialogHeader>

        {/* Student Info Header */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{record.studentName}</h3>
              <p className="text-sm text-muted-foreground">
                {record.studentNumber} • {record.college || "No College"}
              </p>
              {record.course && (
                <p className="text-sm text-muted-foreground">
                  {record.course} • {record.yearLevel || "N/A"} Year
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {record.hasActiveOffenses ? (
                <Badge className="bg-red-500 text-white">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Active Offenses
                </Badge>
              ) : (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Clear Record
                </Badge>
              )}
              {record.isEndorsed && (
                <Badge className="bg-purple-500 text-white">
                  <Award className="h-3 w-3 mr-1" />
                  Endorsed
                </Badge>
              )}
            </div>
          </div>

          {/* Offense Summary */}
          <div className="mt-4 flex flex-wrap gap-2">
            {record.minorCount > 0 && (
              <OffenseColorBadge category={OffenseCategory.MINOR} count={record.minorCount} />
            )}
            {record.majorCount > 0 && (
              <OffenseColorBadge category={OffenseCategory.MAJOR} count={record.majorCount} />
            )}
            {record.lateFacultyCount > 0 && (
              <OffenseColorBadge category={OffenseCategory.LATE_FACULTY_EVALUATION} count={record.lateFacultyCount} />
            )}
            {record.lateRogCount > 0 && (
              <OffenseColorBadge category={OffenseCategory.LATE_ACCESS_ROG} count={record.lateRogCount} />
            )}
            {record.latePaymentCount > 0 && (
              <OffenseColorBadge category={OffenseCategory.LATE_PAYMENT} count={record.latePaymentCount} />
            )}
            {record.otherCount > 0 && (
              <OffenseColorBadge category={OffenseCategory.OTHER} count={record.otherCount} />
            )}
            {record.minorCount === 0 &&
              record.majorCount === 0 &&
              record.lateFacultyCount === 0 &&
              record.lateRogCount === 0 &&
              record.latePaymentCount === 0 &&
              record.otherCount === 0 && (
                <span className="text-sm text-muted-foreground">No offenses recorded</span>
              )}
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {/* Active Endorsements */}
          {record.endorsements.filter((e) => e.status !== "CANCELLED" && e.status !== "COMPLETED").length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                Active Endorsements
              </h4>
              <div className="space-y-3">
                {record.endorsements
                  .filter((e) => e.status !== "CANCELLED" && e.status !== "COMPLETED")
                  .map((endorsement) => (
                    <div
                      key={endorsement.id}
                      className="border rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium">
                            {endorsement.type === "ADMINISTRATIVE_SERVICE"
                              ? "Administrative Service"
                              : "Community Service"}
                          </span>
                          {getStatusBadge(endorsement.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {endorsement.hoursCompleted || 0}/{endorsement.hoursRequired || 0} hours
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Triggered by {getCategoryDisplayName(endorsement.triggeredByCategory)} ({formatLevel(endorsement.triggeredByLevel)} offense)
                      </p>
                      {endorsement.details && (
                        <p className="text-sm mt-1">{endorsement.details}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Active Offenses */}
          {activeOffenses.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Active Offenses ({activeOffenses.length})
              </h4>
              <div className="space-y-3">
                {activeOffenses.map((offense, index) => (
                  <div
                    key={offense.id}
                    className="border rounded-lg p-3"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: getOffenseColor(offense.offenseCategory, index + 1),
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge
                          style={{
                            backgroundColor: getOffenseColor(offense.offenseCategory, index + 1),
                            color: "white",
                          }}
                        >
                          {getCategoryDisplayName(offense.offenseCategory)}
                        </Badge>
                        <span className="ml-2 text-sm">
                          {formatLevel(offense.offenseLevel)} Offense
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(offense.createdAt).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {offense.description && (
                      <p className="text-sm mt-2">{offense.description}</p>
                    )}
                    {offense.offenseCategory === "OTHER" && offense.specifyOther && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Specify: {offense.specifyOther}
                      </p>
                    )}
                    {offense.controlNumber && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Related: {offense.controlNumber}
                      </p>
                    )}
                    {offense.processor && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Processed by {offense.processor.name || offense.processor.email}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clearance History */}
          {record.clearances.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Clearance History
              </h4>
              <div className="space-y-3">
                {record.clearances.map((clearance) => (
                  <div
                    key={clearance.id}
                    className="border rounded-lg p-3 bg-green-50 dark:bg-green-900/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Cleared</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(clearance.createdAt).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{clearance.reason}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Offenses cleared:{" "}
                      {[
                        clearance.minorCleared > 0 && `${clearance.minorCleared} Minor`,
                        clearance.majorCleared > 0 && `${clearance.majorCleared} Major`,
                        clearance.lateFacultyCleared > 0 && `${clearance.lateFacultyCleared} Late Fac`,
                        clearance.lateRogCleared > 0 && `${clearance.lateRogCleared} Late ROG`,
                        clearance.latePaymentCleared > 0 && `${clearance.latePaymentCleared} Late Pay`,
                        clearance.otherCleared > 0 && `${clearance.otherCleared} Other`,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cleared by {clearance.clearedByUser.name || clearance.clearedByUser.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cleared Offenses */}
          {clearedOffenses.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                Historical Offenses ({clearedOffenses.length})
              </h4>
              <div className="space-y-2 opacity-60">
                {clearedOffenses.map((offense) => (
                  <div
                    key={offense.id}
                    className="border rounded-lg p-2 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {getCategoryDisplayName(offense.offenseCategory)} - {formatLevel(offense.offenseLevel)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Cleared
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(offense.createdAt).toLocaleDateString("en-PH")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            {record.hasActiveOffenses && onClearOffenses && (
              <Button variant="destructive" onClick={onClearOffenses}>
                Clear Offenses
              </Button>
            )}
            {onAddOffense && (
              <Button onClick={onAddOffense}>Add Offense</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
