"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/ui/stats-card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  FileCheck,
  Users2,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  FileText,
  Shirt,
  BadgeCheck,
  MessageSquareWarning,
  BarChart3,
  Settings,
  Megaphone,
  Activity,
  RefreshCw,
  ChevronRight,
  Search,
  Plus,
  Eye,
  AlertTriangle,
  Award,
  Loader2,
  XCircle,
  PauseCircle,
} from "lucide-react";
import { DisciplinaryRecordList } from "@/components/disciplinary";
import { OffenseEncodingForm } from "@/components/disciplinary/offense-encoding-form";

// Types
interface RequestStats {
  total: number;
  pending: number;
  processing: number;
  issuedToday: number;
  staffMembers: number;
  new: number;
  hold: number;
  rejected: number;
  complaints: number;
  disciplinaryRecords: number;
  activeOffenses: number;
}

interface RequestData {
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
  processorName?: string;
  processor?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ComplaintData {
  id: string;
  controlNumber: string;
  subject: string;
  status: string;
  createdAt: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { className: string }> = {
    NEW: { className: "bg-blue-500 text-white hover:bg-blue-600" },
    PROCESSING: { className: "bg-yellow-500 text-white hover:bg-yellow-600" },
    ISSUED: { className: "bg-green-500 text-white hover:bg-green-600" },
    HOLD: { className: "bg-gray-500 text-white hover:bg-gray-600" },
    REJECTED: { className: "bg-red-500 text-white hover:bg-red-600" },
  };

  const config = statusConfig[status] || { className: "" };

  return (
    <Badge className={config.className}>
      {status}
    </Badge>
  );
}

// Request type display names
const requestTypes: Record<string, string> = {
  GMC: "Good Moral Certificate",
  UER: "Uniform Exemption",
  CDC: "Cross-Dressing Clearance",
  CAC: "Child Admission",
};

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    processing: 0,
    issuedToday: 0,
    staffMembers: 0,
    new: 0,
    hold: 0,
    rejected: 0,
    complaints: 0,
    disciplinaryRecords: 0,
    activeOffenses: 0,
  });
  
  const [recentRequests, setRecentRequests] = useState<RequestData[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<ComplaintData[]>([]);
  const [allRequests, setAllRequests] = useState<RequestData[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddOffense, setShowAddOffense] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);

      // Fetch all data in parallel
      const [requestsRes, usersRes, complaintsRes, disciplinaryRes] = await Promise.all([
        fetch("/api/requests?limit=1000"),
        fetch("/api/users"),
        fetch("/api/complaints?limit=100"),
        fetch("/api/disciplinary?limit=100"),
      ]);

      const requestsData = await requestsRes.json();
      const usersData = await usersRes.json();
      const complaintsData = await complaintsRes.json();
      const disciplinaryData = await disciplinaryRes.json();

      if (requestsData.data) {
        const requests = requestsData.data;
        const today = new Date().toDateString();

        // Calculate stats
        const totalRequests = requests.length;
        const newRequests = requests.filter((r: RequestData) => r.status === "NEW").length;
        const pendingRequests = requests.filter((r: RequestData) => r.status === "NEW" || r.status === "PROCESSING").length;
        const processingRequests = requests.filter((r: RequestData) => r.status === "PROCESSING").length;
        const holdRequests = requests.filter((r: RequestData) => r.status === "HOLD").length;
        const rejectedRequests = requests.filter((r: RequestData) => r.status === "REJECTED").length;
        const issuedToday = requests.filter(
          (r: RequestData & { certificateIssuedAt?: string }) =>
            r.status === "ISSUED" && r.certificateIssuedAt && new Date(r.certificateIssuedAt).toDateString() === today
        ).length;

        setStats({
          total: totalRequests,
          pending: newRequests,
          processing: processingRequests,
          issuedToday,
          staffMembers: usersData.data?.length || 0,
          new: newRequests,
          hold: holdRequests,
          rejected: rejectedRequests,
          complaints: complaintsData.data?.length || 0,
          disciplinaryRecords: disciplinaryData.data?.length || 0,
          activeOffenses: disciplinaryData.data?.filter((r: any) => r.hasActiveOffenses).length || 0,
        });

        setRecentRequests(requests.slice(0, 6));
        setAllRequests(requests);
      }

      if (complaintsData.data) {
        setRecentComplaints(complaintsData.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  // Filter requests
  const filteredRequests = allRequests.filter((req) => {
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesType = typeFilter === "ALL" || req.requestType === typeFilter;
    const matchesSearch = !searchQuery || 
      req.controlNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestorFirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestorLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestorStudentNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  // Handle request action
  const openActionModal = (request: RequestData, action: string) => {
    setSelectedRequest(request);
    setActionType(action);
    setRemarks("");
    setActionModalOpen(true);
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
        setActionModalOpen(false);
        fetchDashboardData();
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: "#ffc400" }} />
      </div>
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
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#111c4e" }}>
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage requests, disciplinary records, and system settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">New Requests</p>
                      <p className="text-2xl font-bold">{stats.new}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Processing</p>
                      <p className="text-2xl font-bold">{stats.processing}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-yellow-500/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Issued Today</p>
                      <p className="text-2xl font-bold">{stats.issuedToday}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Offenses</p>
                      <p className="text-2xl font-bold">{stats.activeOffenses}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Complaints</p>
                      <p className="text-2xl font-bold">{stats.complaints}</p>
                    </div>
                    <MessageSquareWarning className="h-8 w-8 text-purple-500/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-gray-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">On Hold</p>
                      <p className="text-2xl font-bold">{stats.hold}</p>
                    </div>
                    <PauseCircle className="h-8 w-8 text-gray-500/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Main Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requests">Request Processing</TabsTrigger>
              <TabsTrigger value="disciplinary">Disciplinary Records</TabsTrigger>
              <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Requests */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Requests</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("requests")}>
                        View All
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <ScrollArea className="h-72">
                        <div className="space-y-3">
                          {recentRequests.map((request) => (
                            <div
                              key={request.id}
                              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActionModalOpen(true);
                              }}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  request.status === "NEW"
                                    ? "bg-blue-500"
                                    : request.status === "PROCESSING"
                                    ? "bg-yellow-500"
                                    : request.status === "ISSUED"
                                    ? "bg-green-500"
                                    : request.status === "HOLD"
                                    ? "bg-gray-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {request.requestorFirstName} {request.requestorLastName}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {request.controlNumber}
                                </p>
                              </div>
                              <StatusBadge status={request.status} />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Complaints */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Complaints</CardTitle>
                      <Link href="/complaint/manage">
                        <Button variant="ghost" size="sm">
                          View All
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : recentComplaints.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No complaints found
                      </div>
                    ) : (
                      <ScrollArea className="h-72">
                        <div className="space-y-3">
                          {recentComplaints.map((complaint) => (
                            <div
                              key={complaint.id}
                              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  complaint.status === "PENDING"
                                    ? "bg-yellow-500"
                                    : complaint.status === "UNDER_REVIEW"
                                    ? "bg-blue-500"
                                    : complaint.status === "RESOLVED"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{complaint.subject}</p>
                                <p className="text-sm text-muted-foreground">
                                  {complaint.controlNumber}
                                </p>
                              </div>
                              <Badge variant="outline">{complaint.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Status Overview</CardTitle>
                  <CardDescription>Current status distribution of all requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-3xl font-bold text-blue-500">{stats.new}</p>
                      <p className="text-sm text-muted-foreground">New</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <p className="text-3xl font-bold text-yellow-500">{stats.processing}</p>
                      <p className="text-sm text-muted-foreground">Processing</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="text-3xl font-bold text-green-500">{stats.issuedToday}</p>
                      <p className="text-sm text-muted-foreground">Issued Today</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                      <p className="text-3xl font-bold text-gray-500">{stats.hold}</p>
                      <p className="text-sm text-muted-foreground">On Hold</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <p className="text-3xl font-bold text-red-500">{stats.rejected}</p>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Request Processing Tab */}
            <TabsContent value="requests" className="space-y-6 mt-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by control number, name, or student number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                  </div>
                </CardContent>
              </Card>

              {/* Requests Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Requests ({filteredRequests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : filteredRequests.length === 0 ? (
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
                            <TableHead>College</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Processor</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.map((req) => (
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
                              <TableCell className="text-sm">
                                {req.requestorCollege || "-"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(req.createdAt).toLocaleDateString("en-PH")}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={req.status} />
                              </TableCell>
                              <TableCell className="text-sm">
                                {req.processorName || req.processor?.name || "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {req.status === "NEW" && (
                                    <Button
                                      size="sm"
                                      className="bg-yellow-500 hover:bg-yellow-600 h-8"
                                      onClick={() => openActionModal(req, "PROCESSING")}
                                    >
                                      Process
                                    </Button>
                                  )}
                                  {req.status === "PROCESSING" && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="bg-green-500 hover:bg-green-600 h-8"
                                        onClick={() => openActionModal(req, "ISSUED")}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Issue
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
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
            </TabsContent>

            {/* Disciplinary Records Tab */}
            <TabsContent value="disciplinary" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Disciplinary Records</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage student offenses with color-coded tracking
                  </p>
                </div>
                <Button onClick={() => setShowAddOffense(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Offense
                </Button>
              </div>

              <DisciplinaryRecordList onRefresh={fetchDashboardData} />

              {/* Color Legend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Color Coding Legend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                    {/* Minor Offenses */}
                    <div>
                      <h4 className="font-semibold mb-2">Minor Offenses</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ffc400" }} />
                          <span>1st Offense (Yellow)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ff9500" }} />
                          <span>2nd Offense (Orange)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#dc2626" }} />
                          <span>3rd Offense → Major (Red)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#7c3aed" }} />
                          <span>4th Offense (Violet)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ec4899" }} />
                          <span>5th Offense (Pink)</span>
                        </div>
                      </div>
                    </div>

                    {/* Major Offenses */}
                    <div>
                      <h4 className="font-semibold mb-2">Major Offenses</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#dc2626" }} />
                          <span>1st Offense (Red)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#7c3aed" }} />
                          <span>2nd Offense (Violet)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#be123c" }} />
                          <span>3rd Offense (Crimson)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#6b21a8" }} />
                          <span>4th Offense (Dark Purple)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#1e293b" }} />
                          <span>5th Offense (Black/Dark)</span>
                        </div>
                      </div>
                    </div>

                    {/* Late Categories */}
                    <div>
                      <h4 className="font-semibold mb-2">Late Categories</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ff9500" }} />
                          <span>1st Offense (Orange)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#dc2626" }} />
                          <span>2nd Offense → Major (Red)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#7c3aed" }} />
                          <span>3rd Offense (Violet)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#6366f1" }} />
                          <span>4th Offense (Indigo)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#475569" }} />
                          <span>5th Offense (Slate)</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Applies to: Late Faculty Evaluation, Late Access of ROG, Late Payment
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quick Actions Tab */}
            <TabsContent value="quick-actions" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/dashboard/admin/requests">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-6 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(17, 28, 78, 0.1)" }}>
                        <FileCheck className="h-6 w-6" style={{ color: "#111c4e" }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">Manage Requests</h4>
                        <p className="text-sm text-muted-foreground">Process all requests</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </div>
                  </motion.div>
                </Link>

                <Link href="/users">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-6 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Users2 className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">User Management</h4>
                        <p className="text-sm text-muted-foreground">Manage staff accounts</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </div>
                  </motion.div>
                </Link>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setActiveTab("disciplinary")}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Disciplinary Records</h4>
                      <p className="text-sm text-muted-foreground">Manage offenses</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                  </div>
                </motion.div>

                <Link href="/complaint/manage">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-6 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <MessageSquareWarning className="h-6 w-6 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">Manage Complaints</h4>
                        <p className="text-sm text-muted-foreground">Review complaints</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </div>
                  </motion.div>
                </Link>

                <Link href="/reports">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-6 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <BarChart3 className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">Reports</h4>
                        <p className="text-sm text-muted-foreground">View analytics</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </div>
                  </motion.div>
                </Link>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setShowAddOffense(true)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(255, 196, 0, 0.1)" }}>
                      <Plus className="h-6 w-6" style={{ color: "#ffc400" }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Add Offense</h4>
                      <p className="text-sm text-muted-foreground">Record new offense</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                  </div>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
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
                Remarks {(actionType === "HOLD" || actionType === "REJECTED") && (
                  <span className="text-red-500">*</span>
                )}
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
            <Button variant="outline" onClick={() => setActionModalOpen(false)}>
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

      {/* Add Offense Modal */}
      <OffenseEncodingForm
        open={showAddOffense}
        onOpenChange={setShowAddOffense}
        onSuccess={fetchDashboardData}
      />
    </DashboardLayout>
  );
}
