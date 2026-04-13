"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
} from "lucide-react";

interface Complaint {
  id: string;
  controlNumber: string;
  complainants: string;
  respondents: string;
  complaintType: string;
  category: string | null;
  subject: string;
  description: string;
  status: string;
  dateOfIncident: string | null;
  location: string | null;
  isOngoing: boolean;
  remarks: string | null;
  createdAt: string;
  processor?: {
    name: string;
    email: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-blue-500",
  UNDER_REVIEW: "bg-yellow-500",
  RESOLVED: "bg-green-500",
  DISMISSED: "bg-gray-500",
  REOPENED: "bg-orange-500",
};

const categoryColors: Record<string, string> = {
  MAJOR: "bg-red-500",
  MINOR: "bg-orange-500",
  OTHER: "bg-yellow-500",
};

export default function ComplaintManagementPage() {
  const { status } = useSession();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [actionType, setActionType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (search) params.append("search", search);

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
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const openActionModal = (complaint: Complaint, action: string) => {
    setSelectedComplaint(complaint);
    setActionType(action);
    setRemarks("");
    setNewCategory(complaint.category || "");
    setModalOpen(true);
  };

  const openDetailsModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setDetailsModalOpen(true);
  };

  const handleAction = async () => {
    if (!selectedComplaint) return;

    if ((actionType === "UNDER_REVIEW" || actionType === "RESOLVED") && !remarks.trim()) {
      toast.error("Remarks are required for this action");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType,
          category: newCategory,
          remarks,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Complaint ${actionType.toLowerCase().replace("_", " ")} successfully`);
        setModalOpen(false);
        fetchComplaints();
      } else {
        toast.error(data.error || "Failed to update complaint");
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error("Failed to update complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseJSON = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const renderComplaintCard = (complaint: Complaint) => {
    const complainants = parseJSON(complaint.complainants);
    const mainComplainant = complainants[0];

    return (
      <Card key={complaint.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono font-bold text-orange-500">
                  {complaint.controlNumber}
                </span>
                <Badge className={`${statusColors[complaint.status]} text-white`}>
                  {complaint.status.replace("_", " ")}
                </Badge>
                {complaint.category && (
                  <Badge className={`${categoryColors[complaint.category]} text-white`}>
                    {complaint.category}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold mb-1">{complaint.subject}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {complaint.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>
                  <strong>Complainant:</strong> {mainComplainant?.firstName} {mainComplainant?.lastName}
                </span>
                <span>
                  <strong>Type:</strong> {complaint.complaintType}
                </span>
                <span>
                  {new Date(complaint.createdAt).toLocaleDateString("en-PH")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => openDetailsModal(complaint)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              {complaint.status === "PENDING" && (
                <Button
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600"
                  onClick={() => openActionModal(complaint, "UNDER_REVIEW")}
                >
                  Review
                </Button>
              )}
              {complaint.status === "UNDER_REVIEW" && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => openActionModal(complaint, "RESOLVED")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openActionModal(complaint, "DISMISSED")}
                  >
                    Dismiss
                  </Button>
                </>
              )}
              {(complaint.status === "RESOLVED" || complaint.status === "DISMISSED") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openActionModal(complaint, "REOPENED")}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Re-open
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const filteredComplaints = {
    all: complaints,
    pending: complaints.filter((c) => c.status === "PENDING" || c.status === "UNDER_REVIEW"),
    resolved: complaints.filter((c) => c.status === "RESOLVED" || c.status === "DISMISSED"),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Complaint Management</h1>
          <p className="text-muted-foreground">
            Review and manage student complaints
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchComplaints()}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="MAJOR">Major</SelectItem>
                  <SelectItem value="MINOR">Minor</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchComplaints}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All ({filteredComplaints.all.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filteredComplaints.pending.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({filteredComplaints.resolved.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : filteredComplaints.all.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No complaints found
              </div>
            ) : (
              filteredComplaints.all.map(renderComplaintCard)
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            {filteredComplaints.pending.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending complaints
              </div>
            ) : (
              filteredComplaints.pending.map(renderComplaintCard)
            )}
          </TabsContent>

          <TabsContent value="resolved" className="mt-4">
            {filteredComplaints.resolved.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No resolved complaints
              </div>
            ) : (
              filteredComplaints.resolved.map(renderComplaintCard)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              {selectedComplaint?.controlNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`${statusColors[selectedComplaint.status]} text-white`}>
                  {selectedComplaint.status.replace("_", " ")}
                </Badge>
                {selectedComplaint.category && (
                  <Badge className={`${categoryColors[selectedComplaint.category]} text-white`}>
                    {selectedComplaint.category}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium">{selectedComplaint.complaintType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date Filed:</span>
                  <span className="ml-2">
                    {new Date(selectedComplaint.createdAt).toLocaleDateString("en-PH")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Incident Date:</span>
                  <span className="ml-2">{selectedComplaint.dateOfIncident || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2">{selectedComplaint.location || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ongoing:</span>
                  <span className="ml-2">{selectedComplaint.isOngoing ? "Yes" : "No"}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Subject</h4>
                <p>{selectedComplaint.subject}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Description</h4>
                <p className="text-muted-foreground">{selectedComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Complainants</h4>
                  {parseJSON(selectedComplaint.complainants).map((p: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-muted rounded mb-1">
                      {p.firstName} {p.lastName}
                      {p.studentNumber && <span className="text-muted-foreground"> ({p.studentNumber})</span>}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Respondents</h4>
                  {parseJSON(selectedComplaint.respondents).map((p: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-muted rounded mb-1">
                      {p.firstName} {p.lastName}
                      {p.studentNumber && <span className="text-muted-foreground"> ({p.studentNumber})</span>}
                    </div>
                  ))}
                </div>
              </div>

              {selectedComplaint.remarks && (
                <div>
                  <h4 className="font-semibold mb-1">Remarks</h4>
                  <p className="text-muted-foreground">{selectedComplaint.remarks}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "UNDER_REVIEW" && "Review Complaint"}
              {actionType === "RESOLVED" && "Resolve Complaint"}
              {actionType === "DISMISSED" && "Dismiss Complaint"}
              {actionType === "REOPENED" && "Re-open Case"}
            </DialogTitle>
            <DialogDescription>
              {selectedComplaint?.controlNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAJOR">Major</SelectItem>
                  <SelectItem value="MINOR">Minor</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Remarks *</Label>
              <Textarea
                placeholder="Enter your remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className={
                actionType === "RESOLVED"
                  ? "bg-green-500 hover:bg-green-600"
                  : actionType === "DISMISSED"
                  ? "bg-red-500 hover:bg-red-600"
                  : ""
              }
              onClick={handleAction}
              disabled={isSubmitting || !remarks.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
