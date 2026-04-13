"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FileCheck,
  Shirt,
  Users,
  BadgeCheck,
  MessageSquareWarning,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  Loader2,
  Megaphone,
  TrendingUp,
} from "lucide-react";

interface Request {
  id: string;
  controlNumber: string;
  requestType: string;
  status: string;
  requestorFirstName: string;
  requestorLastName: string;
  requestorEmail: string;
  requestorStudentNo: string;
  requestorCollege: string;
  purpose: string;
  createdAt: string;
  remarks?: string;
  processor?: {
    id: string;
    name: string;
    email: string;
  };
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500",
  PROCESSING: "bg-yellow-500",
  ISSUED: "bg-green-500",
  HOLD: "bg-gray-500",
  REJECTED: "bg-red-500",
};

const requestTypes: Record<string, string> = {
  GMC: "Good Moral Certificate",
  UER: "Uniform Exemption",
  CDC: "Cross-Dressing Clearance",
  CAC: "Child Admission",
};

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    processing: 0,
    issued: 0,
    hold: 0,
    rejected: 0,
    gmc: 0,
    uer: 0,
    cdc: 0,
    cac: 0,
  });

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (search) params.append("search", search);

      const response = await fetch(`/api/requests?${params.toString()}`);
      const data = await response.json();
      
      if (data.data) {
        setRequests(data.data);
        
        // Calculate stats
        const allRequests = data.data;
        setStats({
          total: allRequests.length,
          new: allRequests.filter((r: Request) => r.status === "NEW").length,
          processing: allRequests.filter((r: Request) => r.status === "PROCESSING").length,
          issued: allRequests.filter((r: Request) => r.status === "ISSUED").length,
          hold: allRequests.filter((r: Request) => r.status === "HOLD").length,
          rejected: allRequests.filter((r: Request) => r.status === "REJECTED").length,
          gmc: allRequests.filter((r: Request) => r.requestType === "GMC").length,
          uer: allRequests.filter((r: Request) => r.requestType === "UER").length,
          cdc: allRequests.filter((r: Request) => r.requestType === "CDC").length,
          cac: allRequests.filter((r: Request) => r.requestType === "CAC").length,
        });
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter]);

  const handleSearch = () => {
    fetchRequests();
  };

  const openActionModal = (request: Request, action: string) => {
    setSelectedRequest(request);
    setActionType(action);
    setRemarks("");
    setModalOpen(true);
  };

  const handleAction = async () => {
    if (!selectedRequest) return;

    if ((actionType === "HOLD" || actionType === "REJECTED") && !remarks.trim()) {
      toast.error("Remarks are required for Hold and Reject actions");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType,
          remarks,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Request ${actionType.toLowerCase()} successfully`);
        setModalOpen(false);
        fetchRequests();
      } else {
        toast.error(data.error || "Failed to update request");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Staff Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/announcements">
                <Megaphone className="h-4 w-4 mr-2" />
                Announcements
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Good Moral</p>
                  <p className="text-2xl font-bold">{stats.gmc}</p>
                </div>
                <FileCheck className="h-8 w-8 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Uniform Exemption</p>
                  <p className="text-2xl font-bold">{stats.uer}</p>
                </div>
                <Shirt className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cross-Dressing</p>
                  <p className="text-2xl font-bold">{stats.cdc}</p>
                </div>
                <BadgeCheck className="h-8 w-8 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Child Admission</p>
                  <p className="text-2xl font-bold">{stats.cac}</p>
                </div>
                <Users className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.new + stats.processing}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by control number, name, email, or student number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="ISSUED">Issued</SelectItem>
                  <SelectItem value="HOLD">Hold</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="GMC">Good Moral Certificate</SelectItem>
                  <SelectItem value="UER">Uniform Exemption</SelectItem>
                  <SelectItem value="CDC">Cross-Dressing Clearance</SelectItem>
                  <SelectItem value="CAC">Child Admission</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No requests found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Control No.</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono font-medium">
                          {req.controlNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {req.requestorFirstName} {req.requestorLastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {req.requestorStudentNo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {requestTypes[req.requestType] || req.requestType}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {req.purpose}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(req.createdAt).toLocaleDateString("en-PH")}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[req.status]} text-white`}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {req.status === "NEW" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-yellow-500 hover:bg-yellow-600 h-8"
                                  onClick={() => openActionModal(req, "PROCESSING")}
                                >
                                  Process
                                </Button>
                              </>
                            )}
                            {req.status === "PROCESSING" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-500 hover:bg-green-600 h-8"
                                  onClick={() => openActionModal(req, "ISSUED")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Issue
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={() => openActionModal(req, "HOLD")}
                                >
                                  <PauseCircle className="h-4 w-4 mr-1" />
                                  Hold
                                </Button>
                              </>
                            )}
                            {req.status === "HOLD" && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-500 hover:bg-green-600 h-8"
                                onClick={() => openActionModal(req, "ISSUED")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Issue
                              </Button>
                            )}
                            {req.status !== "REJECTED" && req.status !== "ISSUED" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                                onClick={() => openActionModal(req, "REJECTED")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "PROCESSING" && "Process Request"}
              {actionType === "ISSUED" && "Issue Certificate"}
              {actionType === "HOLD" && "Put On Hold"}
              {actionType === "REJECTED" && "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="mt-2">
                  <div className="font-medium">
                    {selectedRequest.requestorFirstName} {selectedRequest.requestorLastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRequest.controlNumber} • {requestTypes[selectedRequest.requestType]}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Remarks {(actionType === "HOLD" || actionType === "REJECTED") && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                placeholder={
                  actionType === "HOLD"
                    ? "Please provide a reason for putting this request on hold..."
                    : actionType === "REJECTED"
                    ? "Please provide a reason for rejecting this request..."
                    : "Add any notes or remarks (optional)..."
                }
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
                actionType === "ISSUED"
                  ? "bg-green-500 hover:bg-green-600"
                  : actionType === "HOLD"
                  ? "bg-gray-500 hover:bg-gray-600"
                  : actionType === "REJECTED"
                  ? "bg-red-500 hover:bg-red-600"
                  : ""
              }
              onClick={handleAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === "PROCESSING" && "Start Processing"}
                  {actionType === "ISSUED" && "Issue Certificate"}
                  {actionType === "HOLD" && "Put On Hold"}
                  {actionType === "REJECTED" && "Reject Request"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
