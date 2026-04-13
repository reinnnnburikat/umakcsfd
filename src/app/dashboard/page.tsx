"use client";

import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Shirt,
  Users,
  Baby,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Mock data for dashboard
const STATS = [
  { title: "Good Moral Requests", count: 101, icon: FileText, href: "/dashboard/requests/gmc", color: "text-orange-500" },
  { title: "Uniform Exemption", count: 31, icon: Shirt, href: "/dashboard/requests/uer", color: "text-blue-500" },
  { title: "Child Admission", count: 1, icon: Baby, href: "/dashboard/requests/cac", color: "text-pink-500" },
  { title: "Cross-Dressing", count: 5, icon: Users, href: "/dashboard/requests/cdc", color: "text-purple-500" },
  { title: "Complaints", count: 4, icon: AlertTriangle, href: "/dashboard/complaints", color: "text-red-500" },
];

const ANALYTICS = [
  { title: "Pending Community Service", value: 12, total: 50 },
  { title: "Rendered Community Service", value: 38, total: 50 },
  { title: "Good Moral Requests", value: 101, total: 150 },
  { title: "Issued Certificates", value: 89, total: 101 },
];

const RECENT_REQUESTS = [
  { id: "GMC-00001", name: "Juan Dela Cruz", type: "Good Moral", status: "New", date: "2024-01-15" },
  { id: "UER-00015", name: "Maria Santos", type: "Uniform Exemption", status: "Processing", date: "2024-01-15" },
  { id: "GMC-00002", name: "Pedro Reyes", type: "Good Moral", status: "Issued", date: "2024-01-14" },
  { id: "CDC-00003", name: "Ana Cruz", type: "Cross-Dressing", status: "Hold", date: "2024-01-14" },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your system.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.href} href={stat.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.count}</p>
                      </div>
                      <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analytics Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Analytics & Reports
              </CardTitle>
              <CardDescription>Monthly summary statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {ANALYTICS.map((item) => (
                <div key={item.title} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.title}</span>
                    <span className="font-medium">{item.value}/{item.total}</span>
                  </div>
                  <Progress value={(item.value / item.total) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Latest service requests submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {RECENT_REQUESTS.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-medium text-sm">
                        {request.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{request.name}</p>
                        <p className="text-xs text-muted-foreground">{request.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={request.status} />
                      <p className="text-xs text-muted-foreground mt-1">{request.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/requests">
                <Button variant="outline" className="w-full mt-4">
                  View All Requests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard/requests/gmc">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Process GMC</span>
                </Button>
              </Link>
              <Link href="/dashboard/complaints">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>View Complaints</span>
                </Button>
              </Link>
              <Link href="/dashboard/announcements">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Announcements</span>
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Reports</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Processing":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "Issued":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Hold":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {status}
    </span>
  );
}
