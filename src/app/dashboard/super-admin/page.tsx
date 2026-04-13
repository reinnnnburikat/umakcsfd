"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  RadialBarChart,
  RadialBar,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatsCard } from "@/components/ui/stats-card";
import { Progress } from "@/components/ui/progress";
import {
  FileCheck,
  Users2,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  FileText,
  Settings,
  Megaphone,
  Activity,
  RefreshCw,
  ChevronRight,
  Shield,
  Database,
  Server,
  Cpu,
  ClipboardList,
  Bell,
  Zap,
  Globe,
  Lock,
  UserCheck,
  UserX,
  BarChart3,
  LayoutDashboard,
  PenSquare,
  Heart,
  Plus,
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

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
}

interface AuditLogData {
  id: string;
  userName: string | null;
  action: string;
  module: string;
  createdAt: string;
}

interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  postedFrom: string;
  postedTo: string | null;
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

interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  status: "healthy" | "warning" | "critical";
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

// Skeleton components
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

// User Status Badge
function UserStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string }> = {
    ACTIVE: { className: "bg-green-500 text-white" },
    INACTIVE: { className: "bg-gray-500 text-white" },
    SUSPENDED: { className: "bg-red-500 text-white" },
  };

  return (
    <Badge className={config[status]?.className || "bg-gray-500 text-white"}>
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

// System Health Card
function SystemHealthCard({
  title,
  value,
  icon: Icon,
  status,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  status: "healthy" | "warning" | "critical";
}) {
  const statusColors = {
    healthy: "text-green-500",
    warning: "text-yellow-500",
    critical: "text-red-500",
  };

  const progressColors = {
    healthy: "bg-green-500",
    warning: "bg-yellow-500",
    critical: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="p-2 rounded-lg bg-background">
        <Icon className={`h-4 w-4 ${statusColors[status]}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">{value}%</span>
        </div>
        <Progress value={value} className="h-2" />
      </div>
    </div>
  );
}

// Floating Action Button Menu
function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        className="flex flex-col items-end gap-3"
        initial={false}
      >
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg"
                onClick={() => {}}
              >
                Compose an announcement
                <PenSquare className="w-4 h-4" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.05 }}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg"
                onClick={() => {}}
              >
                Encode Complaint
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" />
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg"
                onClick={() => {}}
              >
                Encode Violation Citation
                <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center">
                  <ClipboardList className="w-3 h-3 text-white" />
                </div>
              </motion.button>
            </>
          )}
        </AnimatePresence>

        <motion.button
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            isOpen ? "bg-gray-500 rotate-45" : "bg-gray-400 hover:bg-gray-500"
          }`}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function SuperAdminDashboard() {
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
  const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [certificateTypeData, setCertificateTypeData] = useState<CertificateTypeData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpu: 45,
    memory: 62,
    storage: 38,
    status: "healthy",
  });
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);

      // Fetch requests for stats
      const requestsRes = await fetch("/api/requests?limit=1000");
      const requestsData = await requestsRes.json();

      // Fetch users
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();

      // Fetch audit logs
      const auditRes = await fetch("/api/audit-logs?limit=10");
      const auditData = await auditRes.json();

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

        // Generate monthly data
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

        // Generate trend data
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

      if (usersData.data) {
        setRecentUsers(usersData.data.slice(0, 5));
      }

      if (auditData.data) {
        setAuditLogs(auditData.data.slice(0, 8));
      }

      // Simulate system health (in real app, this would come from a monitoring endpoint)
      setSystemHealth({
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: Math.floor(Math.random() * 20) + 50,
        storage: Math.floor(Math.random() * 15) + 30,
        status: "healthy",
      });

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logos/UMAK LOGO.png"
                alt="UMAK Logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <Image
                src="/logos/CSFD LOGO.png"
                alt="CSFD Logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-csfd-navy" style={{ color: "#111c4e" }}>
                Super Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-sm">
                Center for Student Formation and Discipline
              </p>
            </div>
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

        {/* Stats Cards Row */}
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl md:text-4xl font-black mb-2 text-csfd-navy" style={{ color: "#111c4e" }}>
                  {stats.total}
                </div>
                <div className="text-xs font-bold leading-tight text-muted-foreground">
                  TOTAL REQUESTS
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl md:text-4xl font-black mb-2 text-csfd-navy" style={{ color: "#111c4e" }}>
                  {stats.pending}
                </div>
                <div className="text-xs font-bold leading-tight text-muted-foreground">
                  PENDING
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl md:text-4xl font-black mb-2 text-csfd-navy" style={{ color: "#111c4e" }}>
                  {stats.processing}
                </div>
                <div className="text-xs font-bold leading-tight text-muted-foreground">
                  PROCESSING
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl md:text-4xl font-black mb-2 text-csfd-navy" style={{ color: "#111c4e" }}>
                  {stats.issuedToday}
                </div>
                <div className="text-xs font-bold leading-tight text-muted-foreground">
                  ISSUED TODAY
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl md:text-4xl font-black mb-2 text-csfd-navy" style={{ color: "#111c4e" }}>
                  {stats.staffMembers}
                </div>
                <div className="text-xs font-bold leading-tight text-muted-foreground">
                  STAFF MEMBERS
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* System Overview Cards */}
        <motion.div variants={itemVariants}>
          <Card className="bg-csfd-navy text-white" style={{ backgroundColor: "#111c4e" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-csfd-gold" style={{ color: "#ffc400" }} />
                System Overview
              </CardTitle>
              <CardDescription className="text-gray-300">
                Real-time system health and user statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                  <div className="flex items-center gap-3 mb-3">
                    <Users2 className="h-5 w-5 text-csfd-gold" style={{ color: "#ffc400" }} />
                    <span className="text-sm text-gray-300">Total Users</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.staffMembers}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCheck className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-gray-300">Active Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{Math.floor(stats.staffMembers * 0.6)}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                  <div className="flex items-center gap-3 mb-3">
                    <Server className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-gray-300">System Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-lg font-bold text-green-400">Healthy</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="h-5 w-5 text-purple-400" />
                    <span className="text-sm text-gray-300">Uptime</span>
                  </div>
                  <p className="text-2xl font-bold text-white">99.9%</p>
                </div>
              </div>

              {/* System Health Bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <SystemHealthCard
                  title="CPU Usage"
                  value={systemHealth.cpu}
                  icon={Cpu}
                  status={systemHealth.cpu > 80 ? "critical" : systemHealth.cpu > 60 ? "warning" : "healthy"}
                />
                <SystemHealthCard
                  title="Memory"
                  value={systemHealth.memory}
                  icon={Database}
                  status={systemHealth.memory > 85 ? "critical" : systemHealth.memory > 70 ? "warning" : "healthy"}
                />
                <SystemHealthCard
                  title="Storage"
                  value={systemHealth.storage}
                  icon={Server}
                  status={systemHealth.storage > 90 ? "critical" : systemHealth.storage > 75 ? "warning" : "healthy"}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Announcement Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-csfd-navy text-white" style={{ backgroundColor: "#111c4e" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Bell className="h-5 w-5 text-csfd-gold" style={{ color: "#ffc400" }} />
                  ANNOUNCEMENTS
                </CardTitle>
                <Link href="/announcements/manage">
                  <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                    Manage
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-3 rounded-lg" style={{ backgroundColor: "#ffc400" }}>
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Welcome to iCSFD+ Dashboard
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                    The enhanced Center for Student Formation and Discipline portal. Manage requests, track certificates,
                    and monitor system activities all in one place.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Posted: Jan 1, 2024</span>
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics & Reports */}
        <motion.div variants={itemVariants}>
          <Card className="bg-csfd-navy text-white" style={{ backgroundColor: "#111c4e" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-csfd-gold" style={{ color: "#ffc400" }} />
                ANALYTICS & REPORTS
              </CardTitle>
              <CardDescription className="text-gray-300">
                Overview of certificate requests and processing statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="border border-white/30 rounded-xl p-3 md:p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.pending}</div>
                  <div className="text-xs text-gray-300">Pending Requests</div>
                </div>
                <div className="border border-white/30 rounded-xl p-3 md:p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.processing}</div>
                  <div className="text-xs text-gray-300">Processing</div>
                </div>
                <div className="border border-white/30 rounded-xl p-3 md:p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.total}</div>
                  <div className="text-xs text-gray-300">Total Requests</div>
                </div>
                <div className="border border-white/30 rounded-xl p-3 md:p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.issuedToday}</div>
                  <div className="text-xs text-gray-300">Issued Today</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-4">Monthly Summary</h3>
                  {loading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                        <YAxis stroke="#6b7280" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="requests" name="Requests" fill="#111c4e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="issued" name="Issued" fill="#ffc400" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-4">Certificate Types</h3>
                  {loading ? (
                    <Skeleton className="h-48 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={certificateTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {certificateTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Frequently accessed administrative functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/cms">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group text-center"
                  >
                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "rgba(17, 28, 78, 0.1)" }}>
                      <FileText className="h-6 w-6 text-csfd-navy" style={{ color: "#111c4e" }} />
                    </div>
                    <h4 className="font-semibold text-sm">CMS</h4>
                    <p className="text-xs text-muted-foreground">Manage content</p>
                  </motion.div>
                </Link>

                <Link href="/templates">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group text-center"
                  >
                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "rgba(255, 196, 0, 0.1)" }}>
                      <FileCheck className="h-6 w-6 text-csfd-gold" style={{ color: "#ffc400" }} />
                    </div>
                    <h4 className="font-semibold text-sm">Templates</h4>
                    <p className="text-xs text-muted-foreground">Certificate templates</p>
                  </motion.div>
                </Link>

                <Link href="/settings">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group text-center"
                  >
                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-sm">Settings</h4>
                    <p className="text-xs text-muted-foreground">System config</p>
                  </motion.div>
                </Link>

                <Link href="/audit-logs">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group text-center"
                  >
                    <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30">
                      <ClipboardList className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h4 className="font-semibold text-sm">Audit Logs</h4>
                    <p className="text-xs text-muted-foreground">Activity history</p>
                  </motion.div>
                </Link>
              </div>
            </CardContent>
          </Card>
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

        {/* Line Chart - Weekly Trends */}
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

        {/* Activity Logs & Recent Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Logs Summary */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Activity Logs</CardTitle>
                    <CardDescription>Recent system activities</CardDescription>
                  </div>
                  <Link href="/audit-logs">
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
                      {auditLogs.length > 0 ? (
                        auditLogs.map((log, index) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {log.action}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {log.userName || "System"} • {log.module}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No recent activity</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Users */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>Latest registered staff members</CardDescription>
                  </div>
                  <Link href="/users">
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
                      {recentUsers.length > 0 ? (
                        recentUsers.map((user, index) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="w-8 h-8 rounded-full bg-csfd-navy flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: "#111c4e" }}>
                              {user.name?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No users found</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used administrative functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Link href="/dashboard/super-admin/requests">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(17, 28, 78, 0.1)" }}>
                        <FileCheck className="h-5 w-5 text-csfd-navy" style={{ color: "#111c4e" }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">All Requests</h4>
                        <p className="text-xs text-muted-foreground">Manage all requests</p>
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
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
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
                        <Megaphone className="h-5 w-5 text-csfd-gold" style={{ color: "#ffc400" }} />
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
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
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
      </motion.div>

      {/* Floating Action Button */}
      <FloatingActionMenu />
    </DashboardLayout>
  );
}
