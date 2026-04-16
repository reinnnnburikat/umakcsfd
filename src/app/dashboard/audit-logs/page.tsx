"use client";

import React from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, FileText, Settings, LogIn, Trash2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const auditLogs = [
  { id: 1, action: "User Login", user: "admin@umak.edu.ph", module: "Authentication", timestamp: "2024-01-15 10:30 AM", icon: LogIn },
  { id: 2, action: "Request Approved", user: "staff@umak.edu.ph", module: "Requests", timestamp: "2024-01-15 10:15 AM", icon: FileText },
  { id: 3, action: "User Created", user: "superadmin@umak.edu.ph", module: "Users", timestamp: "2024-01-15 09:45 AM", icon: User },
  { id: 4, action: "Settings Updated", user: "superadmin@umak.edu.ph", module: "Settings", timestamp: "2024-01-15 09:30 AM", icon: Settings },
  { id: 5, action: "Record Deleted", user: "admin@umak.edu.ph", module: "Requests", timestamp: "2024-01-15 09:00 AM", icon: Trash2 },
];

const getActionColor = (action: string) => {
  if (action.includes("Login")) return "bg-green-100 text-green-700";
  if (action.includes("Deleted")) return "bg-red-100 text-red-700";
  if (action.includes("Created") || action.includes("Approved")) return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
};

export default function AuditLogsPage() {
  return (
    <DashboardLayout>
      <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold" style={{ color: "#111c4e" }}>
            Audit Logs
          </h1>
          <p className="text-muted-foreground">System activity and change logs</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => {
                  const Icon = log.icon;
                  return (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{log.action}</p>
                            <Badge className={getActionColor(log.action)} variant="secondary">
                              {log.module}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">by {log.user}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.timestamp}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
