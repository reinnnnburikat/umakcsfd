"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileCheck,
  Users2,
  Megaphone,
  BarChart3,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage requests, users, and system settings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-3xl font-bold">1,234</p>
                </div>
                <FileCheck className="h-10 w-10 text-orange-500/50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">+12%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold">45</p>
                </div>
                <Clock className="h-10 w-10 text-amber-500/50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Requires attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Issued Today</p>
                  <p className="text-3xl font-bold">23</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500/50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Certificates ready
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Staff Members</p>
                  <p className="text-3xl font-bold">8</p>
                </div>
                <Users2 className="h-10 w-10 text-blue-500/50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Active users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/admin/requests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Requests</h3>
                  <p className="text-sm text-muted-foreground">Process all service requests</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users2 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">User Management</h3>
                  <p className="text-sm text-muted-foreground">Manage staff accounts</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Reports & Analytics</h3>
                  <p className="text-sm text-muted-foreground">View statistics and reports</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Certificate Issued", user: "John Doe", time: "2 minutes ago", type: "success" },
                { action: "New Request", user: "Jane Smith", time: "5 minutes ago", type: "info" },
                { action: "Request On Hold", user: "Mike Johnson", time: "10 minutes ago", type: "warning" },
                { action: "Certificate Issued", user: "Sarah Williams", time: "15 minutes ago", type: "success" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "warning"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
