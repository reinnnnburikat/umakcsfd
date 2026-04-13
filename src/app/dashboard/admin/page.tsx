"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatsCard } from "@/components/ui/stats-card";
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
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
} from "lucide-react";

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
}

interface RequestData {
  id: string;
  controlNumber: string;
  requestType: string;
  status: string;
  requestorFirstName: string;
  requestorLastName: string;
  createdAt: string;
}

interface MonthlyData {
  month: string;
  requests: number;
  issued: number;
}

interface CertificateTypeData {
  name: string;
  value: number;
  color: string;
}

interface TrendData {
  day: string;
  requests: number;
  processed: number;
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

// Skeleton components for loading state
function StatsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-32 mt-4" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
          <Skeleton className="h-2 w-2 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-8 w-8 mx-auto rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    NEW: { variant: "default", className: "bg-blue-500 text-white hover:bg-blue-600" },
    PROCESSING: { variant: "default", className: "bg-yellow-500 text-white hover:bg-yellow-600" },
    ISSUED: { variant: "default", className: "bg-green-500 text-white hover:bg-green-600" },
    HOLD: { variant: "secondary", className: "bg-gray-500 text-white hover:bg-gray-600" },
    REJECTED: { variant: "destructive", className: "" },
  };

  const config = statusConfig[status] || { variant: "outline", className: "" };

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
}

// Kanban Card Component
function KanbanColumn({
  title,
  count,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-t-4 overflow-hidden`} style={{ borderTopColor: color }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${bgColor}`}>
              <Icon className={`h-4 w-4`} style={{ color }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
          </div>
          <motion.p
            className="text-3xl font-bold text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {count}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    processing: 0,
    issuedToday: 0,
    staffMembers: 0,
    new: 0,
    hold: 0,
    rejected: 0,
  });
  const [recentRequests, setRecentRequests] = useState<RequestData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [certificateTypeData, setCertificateTypeData] = useState<CertificateTypeData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);

      // Fetch requests for stats
      const requestsRes = await fetch("/api/requests?limit=1000");
      const requestsData = await requestsRes.json();

      // Fetch users for staff count
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();

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
        });

        setRecentRequests(requests.slice(0, 6));

        // Generate monthly data for the last 6 months
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const last6Months: MonthlyData[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const month = monthNames[d.getMonth()];
          const monthRequests = requests.filter(
            (r: RequestData) => new Date(r.createdAt).getMonth() === d.getMonth()
          ).length;
          const monthIssued = requests.filter(
            (r: RequestData & { certificateIssuedAt?: string }) =>
              r.status === "ISSUED" && r.certificateIssuedAt && new Date(r.certificateIssuedAt).getMonth() === d.getMonth()
          ).length;
          last6Months.push({ month, requests: monthRequests, issued: monthIssued });
        }
        setMonthlyData(last6Months);

        // Generate certificate type distribution
        const gmcCount = requests.filter((r: RequestData) => r.requestType === "GMC").length;
        const uerCount = requests.filter((r: RequestData) => r.requestType === "UER").length;
        const cdcCount = requests.filter((r: RequestData) => r.requestType === "CDC").length;
        const cacCount = requests.filter((r: RequestData) => r.requestType === "CAC").length;

        setCertificateTypeData([
          { name: "Good Moral", value: gmcCount, color: "#111c4e" },
          { name: "Uniform Exemption", value: uerCount, color: "#ffc400" },
          { name: "Cross-Dressing", value: cdcCount, color: "#10b981" },
          { name: "Child Admission", value: cacCount, color: "#6366f1" },
        ]);

        // Generate trend data for the last 7 days
        const last7Days: TrendData[] = [];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const day = dayNames[d.getDay()];
          const dayRequests = requests.filter(
            (r: RequestData) => new Date(r.createdAt).toDateString() === d.toDateString()
          ).length;
          const dayProcessed = requests.filter(
            (r: RequestData & { processedAt?: string }) =>
              r.processedAt && new Date(r.processedAt).toDateString() === d.toDateString()
          ).length;
          last7Days.push({ day, requests: dayRequests, processed: dayProcessed });
        }
        setTrendData(last7Days);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-csfd-gold" style={{ borderBottomColor: "#ffc400" }} />
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
            <h1 className="text-2xl font-bold text-csfd-navy" style={{ color: "#111c4e" }}>
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage requests, users, and system settings
            </p>
          </div>
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
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatsCard
                title="Total Requests"
                value={stats.total}
                icon={FileCheck}
                trend={{ value: 12, direction: "up", label: "vs last month" }}
                variant="default"
                hover="lift"
              />
              <StatsCard
                title="Pending"
                value={stats.pending}
                icon={Clock}
                trend={{ value: 5, direction: "down", label: "from yesterday" }}
                variant="outline"
                hover="lift"
              />
              <StatsCard
                title="Processing"
                value={stats.processing}
                icon={TrendingUp}
                variant="outline"
                hover="lift"
              />
              <StatsCard
                title="Issued Today"
                value={stats.issuedToday}
                icon={CheckCircle}
                variant="gold"
                hover="glow"
              />
              <StatsCard
                title="Staff Members"
                value={stats.staffMembers}
                icon={Users2}
                variant="gradient"
                hover="scale"
              />
            </div>
          )}
        </motion.div>

        {/* Kanban-style Status Overview */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-csfd-gold" style={{ color: "#ffc400" }} />
                Request Status Overview
              </CardTitle>
              <CardDescription>
                Current status distribution of all requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <KanbanSkeleton />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <KanbanColumn
                    title="NEW"
                    count={stats.new}
                    icon={FileText}
                    color="#3b82f6"
                    bgColor="bg-blue-100 dark:bg-blue-900/30"
                  />
                  <KanbanColumn
                    title="PROCESSING"
                    count={stats.processing}
                    icon={TrendingUp}
                    color="#ffc400"
                    bgColor="bg-yellow-100 dark:bg-yellow-900/30"
                  />
                  <KanbanColumn
                    title="ISSUED"
                    count={stats.issuedToday}
                    icon={CheckCircle}
                    color="#10b981"
                    bgColor="bg-green-100 dark:bg-green-900/30"
                  />
                  <KanbanColumn
                    title="HOLD"
                    count={stats.hold}
                    icon={AlertCircle}
                    color="#6b7280"
                    bgColor="bg-gray-100 dark:bg-gray-900/30"
                  />
                  <KanbanColumn
                    title="REJECTED"
                    count={stats.rejected}
                    icon={AlertCircle}
                    color="#ef4444"
                    bgColor="bg-red-100 dark:bg-red-900/30"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart - Requests per Month */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Requests Overview</CardTitle>
                  <CardDescription>
                    Requests and issued certificates over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="requests"
                        name="Requests"
                        fill="#111c4e"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="issued"
                        name="Issued"
                        fill="#ffc400"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Pie Chart - Certificate Types */}
          <motion.div variants={itemVariants}>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Types</CardTitle>
                  <CardDescription>Distribution by request type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={certificateTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {certificateTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Line Chart - Trends */}
        <motion.div variants={itemVariants}>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
                <CardDescription>
                  Daily requests and processed items for the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      name="Requests"
                      stroke="#111c4e"
                      strokeWidth={2}
                      dot={{ fill: "#111c4e", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="processed"
                      name="Processed"
                      stroke="#ffc400"
                      strokeWidth={2}
                      dot={{ fill: "#ffc400", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/dashboard/admin/requests">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg text-csfd-navy" style={{ backgroundColor: "rgba(17, 28, 78, 0.1)" }}>
                          <FileCheck className="h-5 w-5" style={{ color: "#111c4e" }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Manage Requests</h4>
                          <p className="text-xs text-muted-foreground">Process all requests</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-csfd-gold transition-colors" />
                      </div>
                    </motion.div>
                  </Link>

                  <Link href="/users">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}>
                          <Users2 className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">User Management</h4>
                          <p className="text-xs text-muted-foreground">Manage staff accounts</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-csfd-gold transition-colors" />
                      </div>
                    </motion.div>
                  </Link>

                  <Link href="/announcements/manage">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255, 196, 0, 0.1)" }}>
                          <Megaphone className="h-5 w-5" style={{ color: "#ffc400" }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Announcements</h4>
                          <p className="text-xs text-muted-foreground">Manage announcements</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-csfd-gold transition-colors" />
                      </div>
                    </motion.div>
                  </Link>

                  <Link href="/reports">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                          <BarChart3 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Reports</h4>
                          <p className="text-xs text-muted-foreground">View analytics</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-csfd-gold transition-colors" />
                      </div>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest requests</CardDescription>
                  </div>
                  <Link href="/dashboard/admin/requests">
                    <Button variant="ghost" size="sm" className="text-csfd-gold gap-1" style={{ color: "#ffc400" }}>
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ActivitySkeleton />
                ) : (
                  <ScrollArea className="h-72">
                    <div className="space-y-3">
                      <AnimatePresence>
                        {recentRequests.map((request, index) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
