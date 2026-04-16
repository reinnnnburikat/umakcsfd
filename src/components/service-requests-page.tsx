"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  CalendarIcon,
  RefreshCw,
  Eye,
  Printer,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  CalendarDays,
  FileCheck,
  History,
  Check,
  Ban,
  Pause,
  Play,
  Loader2,
  AlertTriangle,
  Award,
} from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Types
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
  colors: Record<string, string>;
}

interface Request {
  id: string;
  controlNumber: string;
  requestType: "GMC" | "UER" | "CDC" | "CAC";
  status: "NEW" | "PROCESSING" | "ISSUED" | "HOLD" | "REJECTED";
  requestorFirstName: string;
  requestorMiddleName?: string;
  requestorLastName: string;
  requestorExtensionName?: string;
  requestorEmail: string;
  requestorPhone?: string;
  requestorStudentNo: string;
  requestorCollege: string;
  requestorCourse?: string;
  requestorYearLevel?: string;
  requestorSex?: string;
  classification?: string;
  yearGraduated?: string;
  purpose: string;
  otherPurpose?: string;
  additionalData?: string;
  documents?: string;
  remarks?: string;
  processedBy?: string;
  processedAt?: string;
  processorName?: string;
  certificateUrl?: string;
  certificateIssuedAt?: string;
  certificateExpiresAt?: string;
  trackingToken: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
  processor?: {
    id: string;
    name: string;
    email: string;
  };
  disciplinaryRecord?: DisciplinaryRecord | null;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
  remarks?: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Status configuration
const statusConfig = {
  NEW: {
    label: "New",
    color: "#3b82f6",
    bgColor: "bg-blue-500",
    lightBg: "bg-blue-100 dark:bg-blue-900/30",
    icon: FileText,
  },
  PROCESSING: {
    label: "Processing",
    color: "#ffc400",
    bgColor: "bg-yellow-500",
    lightBg: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: Clock,
  },
  ISSUED: {
    label: "Issued",
    color: "#10b981",
    bgColor: "bg-green-500",
    lightBg: "bg-green-100 dark:bg-green-900/30",
    icon: CheckCircle,
  },
  HOLD: {
    label: "On Hold",
    color: "#6b7280",
    bgColor: "bg-gray-500",
    lightBg: "bg-gray-100 dark:bg-gray-900/30",
    icon: Pause,
  },
  REJECTED: {
    label: "Rejected",
    color: "#ef4444",
    bgColor: "bg-red-500",
    lightBg: "bg-red-100 dark:bg-red-900/30",
    icon: XCircle,
  },
};

// Request type configuration
const requestTypeConfig = {
  GMC: { label: "Good Moral Certificate", color: "#111c4e", shortLabel: "GMC" },
  UER: { label: "Uniform Exemption Request", color: "#ffc400", shortLabel: "UER" },
  CDC: { label: "Cross-Dressing Clearance", color: "#10b981", shortLabel: "CDC" },
  CAC: { label: "Child Admission Clearance", color: "#6366f1", shortLabel: "CAC" },
};

// Offense indicator component for color coding
function OffenseIndicator({ disciplinary }: { disciplinary: DisciplinaryRecord | null | undefined }) {
  if (!disciplinary || !disciplinary.hasActiveOffenses) return null;

  const offenses = [];
  if (disciplinary.minorCount > 0) {
    offenses.push({ category: "Minor", count: disciplinary.minorCount, color: disciplinary.colors.MINOR });
  }
  if (disciplinary.majorCount > 0) {
    offenses.push({ category: "Major", count: disciplinary.majorCount, color: disciplinary.colors.MAJOR });
  }
  if (disciplinary.lateFacultyCount > 0) {
    offenses.push({ category: "Late Fac", count: disciplinary.lateFacultyCount, color: disciplinary.colors.LATE_FACULTY_EVALUATION });
  }
  if (disciplinary.lateRogCount > 0) {
    offenses.push({ category: "Late ROG", count: disciplinary.lateRogCount, color: disciplinary.colors.LATE_ACCESS_ROG });
  }
  if (disciplinary.latePaymentCount > 0) {
    offenses.push({ category: "Late Pay", count: disciplinary.latePaymentCount, color: disciplinary.colors.LATE_PAYMENT });
  }

  if (offenses.length === 0) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {offenses.map((offense, i) => (
        <span
          key={i}
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: offense.color,
            color: offense.color === "#ffc400" || offense.color === "#ff9500" ? "#111c4e" : "white",
          }}
        >
          {offense.category}: {offense.count}
        </span>
      ))}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NEW;
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "gap-1 font-medium",
        config.bgColor,
        "text-white"
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// Request Detail Modal
interface RequestDetailModalProps {
  request: Request | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, status: string, remarks: string) => Promise<void>;
  requestType: string;
}

function RequestDetailModal({ request, open, onOpenChange, onUpdate, requestType }: RequestDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (request) {
      setSelectedStatus(request.status);
      setRemarks(request.remarks || "");
      setActivityLog([
        {
          id: "1",
          action: "Request Created",
          timestamp: request.createdAt,
          user: `${request.requestorFirstName} ${request.requestorLastName}`,
        },
        ...(request.processedAt ? [{
          id: "2",
          action: `Status changed to ${request.status}`,
          timestamp: request.processedAt,
          user: request.processorName || request.processor?.name || "System",
          remarks: request.remarks,
        }] : []),
      ]);
    }
  }, [request]);

  const handleUpdate = async () => {
    if (!request) return;
    setLoading(true);
    try {
      await onUpdate(request.id, selectedStatus, remarks);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.NEW;
  const typeConfig = requestTypeConfig[request.requestType as keyof typeof requestTypeConfig] || { label: request.requestType, color: "#6b7280" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {typeConfig.label} Request
              </DialogTitle>
              <DialogDescription className="font-mono" style={{ color: "#ffc400" }}>
                {request.controlNumber}
              </DialogDescription>
              {/* Disciplinary Status Warning */}
              {request.disciplinaryRecord?.hasActiveOffenses && (
                <div className="mt-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500 font-medium">
                    Student has active offense(s)
                  </span>
                  {request.disciplinaryRecord.isEndorsed && (
                    <span className="px-2 py-0.5 rounded text-xs bg-purple-500 text-white">
                      Endorsed
                    </span>
                  )}
                </div>
              )}
            </div>
            <Badge
              variant="outline"
              className="font-medium"
              style={{ borderColor: typeConfig.color, color: typeConfig.color }}
            >
              {typeConfig.shortLabel}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Requestor Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Requestor Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {request.requestorFirstName} {request.requestorMiddleName} {request.requestorLastName}
                    {request.requestorExtensionName && ` ${request.requestorExtensionName}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{request.requestorEmail}</p>
                  <p className="text-xs text-muted-foreground">Email</p>
                </div>
              </div>
              {request.requestorPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{request.requestorPhone}</p>
                    <p className="text-xs text-muted-foreground">Phone</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{request.requestorStudentNo}</p>
                  <p className="text-xs text-muted-foreground">Student Number</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{request.requestorCollege}</p>
                  <p className="text-xs text-muted-foreground">College/Institute</p>
                </div>
              </div>
              {request.requestorCourse && (
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{request.requestorCourse}</p>
                    <p className="text-xs text-muted-foreground">Course</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Disciplinary Record Section */}
          {request.disciplinaryRecord && (
            <div className="col-span-1 md:col-span-2 space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Disciplinary Record
              </h4>
              <div className={`p-4 rounded-lg border ${request.disciplinaryRecord.hasActiveOffenses ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:bg-green-900/20'}`}>
                {request.disciplinaryRecord.hasActiveOffenses ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-red-700 dark:text-red-400">Active Offenses Found</span>
                      {request.disciplinaryRecord.isEndorsed && (
                        <span className="px-2 py-1 rounded text-xs bg-purple-500 text-white flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Endorsed for Service
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {request.disciplinaryRecord.minorCount > 0 && (
                        <div className="p-2 rounded" style={{ backgroundColor: request.disciplinaryRecord.colors.MINOR + '20' }}>
                          <span className="text-xs font-medium" style={{ color: request.disciplinaryRecord.colors.MINOR }}>Minor: {request.disciplinaryRecord.minorCount}</span>
                        </div>
                      )}
                      {request.disciplinaryRecord.majorCount > 0 && (
                        <div className="p-2 rounded" style={{ backgroundColor: request.disciplinaryRecord.colors.MAJOR + '20' }}>
                          <span className="text-xs font-medium text-white" style={{ color: request.disciplinaryRecord.colors.MAJOR }}>Major: {request.disciplinaryRecord.majorCount}</span>
                        </div>
                      )}
                      {request.disciplinaryRecord.lateFacultyCount > 0 && (
                        <div className="p-2 rounded" style={{ backgroundColor: request.disciplinaryRecord.colors.LATE_FACULTY_EVALUATION + '20' }}>
                          <span className="text-xs font-medium" style={{ color: request.disciplinaryRecord.colors.LATE_FACULTY_EVALUATION }}>Late Faculty Eval: {request.disciplinaryRecord.lateFacultyCount}</span>
                        </div>
                      )}
                      {request.disciplinaryRecord.lateRogCount > 0 && (
                        <div className="p-2 rounded" style={{ backgroundColor: request.disciplinaryRecord.colors.LATE_ACCESS_ROG + '20' }}>
                          <span className="text-xs font-medium" style={{ color: request.disciplinaryRecord.colors.LATE_ACCESS_ROG }}>Late ROG: {request.disciplinaryRecord.lateRogCount}</span>
                        </div>
                      )}
                      {request.disciplinaryRecord.latePaymentCount > 0 && (
                        <div className="p-2 rounded" style={{ backgroundColor: request.disciplinaryRecord.colors.LATE_PAYMENT + '20' }}>
                          <span className="text-xs font-medium" style={{ color: request.disciplinaryRecord.colors.LATE_PAYMENT }}>Late Payment: {request.disciplinaryRecord.latePaymentCount}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Please verify with the disciplinary records before issuing the certificate.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">No Active Offenses - Clear Record</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Request Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Request Details
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(request.createdAt), "MMMM dd, yyyy hh:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground">Date Submitted</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{typeConfig.label}</p>
                  <p className="text-xs text-muted-foreground">Request Type</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{request.purpose}</p>
                  <p className="text-xs text-muted-foreground">Purpose</p>
                </div>
              </div>
              {request.processedAt && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(request.processedAt), "MMMM dd, yyyy hh:mm a")}
                    </p>
                    <p className="text-xs text-muted-foreground">Processed At</p>
                  </div>
                </div>
              )}
              {(request.processorName || request.processor?.name) && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{request.processorName || request.processor?.name}</p>
                    <p className="text-xs text-muted-foreground">Processed By</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Data Section */}
        {request.additionalData && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Additional Information
            </h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(JSON.parse(request.additionalData), null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Status Update Section */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Update Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <value.icon className="h-4 w-4" style={{ color: value.color }} />
                        {value.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add remarks..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              onClick={() => {
                setSelectedStatus("PROCESSING");
                setRemarks("Processing request...");
              }}
            >
              <Play className="h-4 w-4" />
              Process
            </Button>
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => {
                setSelectedStatus("ISSUED");
                setRemarks("Certificate issued successfully.");
              }}
            >
              <Check className="h-4 w-4" />
              Issue
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-gray-500 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setSelectedStatus("HOLD");
                setRemarks("Request placed on hold.");
              }}
            >
              <Pause className="h-4 w-4" />
              Hold
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => {
                setSelectedStatus("REJECTED");
                setRemarks("Request rejected.");
              }}
            >
              <Ban className="h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>

        {/* Activity Log */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <History className="h-4 w-4" />
            Activity Log
          </h4>
          <div className="space-y-3">
            {activityLog.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="h-2 w-2 rounded-full mt-2" style={{ backgroundColor: "#ffc400" }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), "MMM dd, hh:mm a")}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">by {log.user}</p>
                  {log.remarks && (
                    <p className="text-sm mt-1 text-muted-foreground">{log.remarks}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="text-white"
            style={{ backgroundColor: "#111c4e" }}
            onClick={handleUpdate}
            disabled={loading || selectedStatus === request.status}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Props for the service requests page
interface ServiceRequestsPageProps {
  requestType: "GMC" | "UER" | "CDC" | "CAC";
}

export default function ServiceRequestsPage({ requestType }: ServiceRequestsPageProps) {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    status: "ALL",
    search: "",
    dateRange: undefined,
  });

  // Sorting
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const typeConfig = requestTypeConfig[requestType];

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", "1000");
      params.append("type", requestType);
      if (filters.status !== "ALL") params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/requests?${params.toString()}`);
      const data = await response.json();

      if (data.data) {
        let filtered = data.data;

        // Apply date range filter
        if (filters.dateRange?.from) {
          filtered = filtered.filter((r: Request) => {
            const createdAt = new Date(r.createdAt);
            const from = filters.dateRange!.from!;
            const to = filters.dateRange!.to || from;
            return isWithinInterval(createdAt, { start: from, end: new Date(to.getTime() + 86400000) });
          });
        }

        setRequests(filtered);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestType, filters]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRequests();
    }
  }, [status, fetchRequests]);

  // Update request status
  const updateRequestStatus = async (id: string, newStatus: string, remarks: string) => {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, remarks }),
      });

      if (response.ok) {
        toast.success("Request updated successfully");
        fetchRequests();
      } else {
        toast.error("Failed to update request");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
    }
  };

  // Sorted data for table view
  const sortedRequests = useMemo(() => {
    const sorted = [...requests].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "controlNumber":
          aVal = a.controlNumber;
          bVal = b.controlNumber;
          break;
        case "requestorName":
          aVal = `${a.requestorFirstName} ${a.requestorLastName}`;
          bVal = `${b.requestorFirstName} ${b.requestorLastName}`;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "createdAt":
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortDirection === "asc" ? aVal - (bVal as number) : (bVal as number) - aVal;
    });

    return sorted;
  }, [requests, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort indicator
  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      NEW: 0,
      PROCESSING: 0,
      ISSUED: 0,
      HOLD: 0,
      REJECTED: 0,
    };
    requests.forEach((r) => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      }
    });
    return counts;
  }, [requests]);

  // Loading state
  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: "#ffc400" }} />
            <p className="mt-2 text-muted-foreground">Loading {typeConfig.label} requests...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/requests">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#111c4e" }}>
                {typeConfig.label}
              </h1>
              <p className="text-muted-foreground">
                Process and manage {typeConfig.label.toLowerCase()} requests
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Status Summary */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = statusCounts[key] || 0;
              return (
                <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setFilters(prev => ({ ...prev, status: prev.status === key ? "ALL" : key }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg", config.lightBg)}>
                          <Icon className="h-4 w-4" style={{ color: config.color }} />
                        </div>
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <span className="text-2xl font-bold" style={{ color: config.color }}>
                        {count}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by control number, name, or email..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-9"
                  />
                </div>

                {/* Status Filter */}
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    {Object.entries(statusConfig).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date Range */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "MMM dd")} - {format(filters.dateRange.to, "MMM dd")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "MMM dd, yyyy")
                        )
                      ) : (
                        "Date Range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={filters.dateRange}
                      onSelect={(range) => setFilters((prev) => ({ ...prev, dateRange: range }))}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                {/* Clear Filters */}
                {(filters.status !== "ALL" || filters.search || filters.dateRange) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({ status: "ALL", search: "", dateRange: undefined })}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Requests Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Requests ({sortedRequests.length})</span>
                <Badge variant="outline" style={{ borderColor: typeConfig.color, color: typeConfig.color }}>
                  {typeConfig.shortLabel}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {typeConfig.label.toLowerCase()} requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button variant="ghost" size="sm" onClick={() => handleSort("controlNumber")} className="gap-1 -ml-3">
                            Control No. <SortIndicator field="controlNumber" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" onClick={() => handleSort("requestorName")} className="gap-1 -ml-3">
                            Requestor <SortIndicator field="requestorName" />
                          </Button>
                        </TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" onClick={() => handleSort("status")} className="gap-1 -ml-3">
                            Status <SortIndicator field="status" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" onClick={() => handleSort("createdAt")} className="gap-1 -ml-3">
                            Date <SortIndicator field="createdAt" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedRequests.map((request) => (
                        <TableRow 
                          key={request.id} 
                          className={`cursor-pointer hover:bg-muted/50 ${request.disciplinaryRecord?.hasActiveOffenses ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                          onClick={() => {
                            setSelectedRequest(request);
                            setModalOpen(true);
                          }}
                        >
                          <TableCell className="font-mono text-sm">{request.controlNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {request.requestorFirstName} {request.requestorLastName}
                                  {request.requestorExtensionName && ` ${request.requestorExtensionName}`}
                                </p>
                                {request.disciplinaryRecord?.hasActiveOffenses && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{request.requestorStudentNo}</p>
                              <OffenseIndicator disciplinary={request.disciplinaryRecord} />
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{request.purpose}</TableCell>
                          <TableCell><StatusBadge status={request.status} /></TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(request.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedRequest(request);
                                  setModalOpen(true);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {request.status === "ISSUED" && request.certificateUrl && (
                                  <DropdownMenuItem onClick={() => window.open(request.certificateUrl!, "_blank")}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Certificate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Request Detail Modal */}
      <RequestDetailModal
        request={selectedRequest}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpdate={updateRequestStatus}
        requestType={requestType}
      />
    </DashboardLayout>
  );
}

// Filter state interface
interface FilterState {
  status: string;
  search: string;
  dateRange: DateRange | undefined;
}
