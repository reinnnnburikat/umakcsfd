"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Loader2,
  User,
  Mail,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface Complaint {
  id: string;
  controlNumber: string;
  complainants: string;
  respondents: string;
  category: "MAJOR" | "MINOR" | "OTHER" | null;
  complaintType: string | null;
  specifyOther: string | null;
  status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED" | "REOPENED";
  subject: string;
  description: string;
  dateOfIncident: string | null;
  location: string | null;
  isOngoing: boolean;
  howOften: string | null;
  witnesses: string | null;
  previousReports: string | null;
  documents: string | null;
  remarks: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  PENDING: {
    label: "Pending",
    color: "#f59e0b",
    bgColor: "bg-amber-500",
    lightBg: "bg-amber-100 dark:bg-amber-900/30",
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "#3b82f6",
    bgColor: "bg-blue-500",
    lightBg: "bg-blue-100 dark:bg-blue-900/30",
    icon: Eye,
  },
  RESOLVED: {
    label: "Resolved",
    color: "#10b981",
    bgColor: "bg-green-500",
    lightBg: "bg-green-100 dark:bg-green-900/30",
    icon: CheckCircle,
  },
  DISMISSED: {
    label: "Dismissed",
    color: "#6b7280",
    bgColor: "bg-gray-500",
    lightBg: "bg-gray-100 dark:bg-gray-900/30",
    icon: XCircle,
  },
  REOPENED: {
    label: "Reopened",
    color: "#ef4444",
    bgColor: "bg-red-500",
    lightBg: "bg-red-100 dark:bg-red-900/30",
    icon: AlertTriangle,
  },
};

// Category configuration
const categoryConfig = {
  MAJOR: { label: "Major", color: "#ef4444" },
  MINOR: { label: "Minor", color: "#f59e0b" },
  OTHER: { label: "Other", color: "#6b7280" },
};

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge className={cn("gap-1 font-medium", config.bgColor, "text-white")}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// Complaint Detail Modal
interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, status: string, remarks: string) => Promise<void>;
}

function ComplaintDetailModal({ complaint, open, onOpenChange, onUpdate }: ComplaintDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (complaint) {
      setSelectedStatus(complaint.status);
      setRemarks(complaint.remarks || "");
    }
  }, [complaint]);

  const handleUpdate = async () => {
    if (!complaint) return;
    setLoading(true);
    try {
      await onUpdate(complaint.id, selectedStatus, remarks);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  if (!complaint) return null;

  const complainants = JSON.parse(complaint.complainants || "[]");
  const respondents = JSON.parse(complaint.respondents || "[]");
  const witnesses = complaint.witnesses ? JSON.parse(complaint.witnesses) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Complaint Details
          </DialogTitle>
          <DialogDescription className="font-mono" style={{ color: "#ffc400" }}>
            {complaint.controlNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Complainants */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Complainants
            </h4>
            <div className="space-y-2">
              {complainants.map((c: { name: string; email: string }, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Respondents */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Respondents
            </h4>
            <div className="space-y-2">
              {respondents.map((r: { name: string }, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incident Details */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Incident Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">{complaint.subject}</p>
              <p className="text-xs text-muted-foreground">Subject</p>
            </div>
            <div>
              {complaint.category && (
                <Badge
                  variant="outline"
                  style={{
                    borderColor: categoryConfig[complaint.category as keyof typeof categoryConfig]?.color,
                    color: categoryConfig[complaint.category as keyof typeof categoryConfig]?.color,
                  }}
                >
                  {categoryConfig[complaint.category as keyof typeof categoryConfig]?.label || complaint.category}
                </Badge>
              )}
            </div>
            {complaint.dateOfIncident && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{complaint.dateOfIncident}</p>
                  <p className="text-xs text-muted-foreground">Date of Incident</p>
                </div>
              </div>
            )}
            {complaint.location && (
              <div>
                <p className="text-sm font-medium">{complaint.location}</p>
                <p className="text-xs text-muted-foreground">Location</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm">{complaint.description}</p>
            <p className="text-xs text-muted-foreground mt-1">Description</p>
          </div>
        </div>

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
                      {value.label}
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
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="text-white"
            style={{ backgroundColor: "#111c4e" }}
            onClick={handleUpdate}
            disabled={loading || selectedStatus === complaint.status}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ComplaintsPage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch complaints
  const fetchComplaints = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const response = await fetch(`/api/complaints?${params.toString()}`);
      const data = await response.json();

      if (data.data) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchComplaints();
    }
  }, [status, fetchComplaints]);

  // Update complaint status
  const updateComplaintStatus = async (id: string, newStatus: string, remarks: string) => {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, remarks }),
      });

      if (response.ok) {
        toast.success("Complaint updated successfully");
        fetchComplaints();
      } else {
        toast.error("Failed to update complaint");
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error("Failed to update complaint");
    }
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: "#ffc400" }} />
            <p className="mt-2 text-muted-foreground">Loading complaints...</p>
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
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#111c4e" }}>
              Complaints Management
            </h1>
            <p className="text-muted-foreground">
              Process and manage student complaints
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComplaints}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </motion.div>

        {/* Status Summary */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = complaints.filter(c => c.status === key).length;
              return (
                <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setStatusFilter(statusFilter === key ? "ALL" : key)}
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
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by control number or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Complaints Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Complaints ({complaints.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {complaints.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No complaints found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Control No.</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Filed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((complaint) => (
                        <TableRow key={complaint.id} className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setModalOpen(true);
                          }}
                        >
                          <TableCell className="font-mono text-sm">{complaint.controlNumber}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{complaint.subject}</TableCell>
                          <TableCell>
                            {complaint.category && (
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: categoryConfig[complaint.category as keyof typeof categoryConfig]?.color,
                                  color: categoryConfig[complaint.category as keyof typeof categoryConfig]?.color,
                                }}
                              >
                                {categoryConfig[complaint.category as keyof typeof categoryConfig]?.label || complaint.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell><StatusBadge status={complaint.status} /></TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(complaint.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComplaint(complaint);
                                setModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpdate={updateComplaintStatus}
      />
    </DashboardLayout>
  );
}
