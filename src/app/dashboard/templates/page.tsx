"use client";

import React from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Edit, Trash2, Download } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const templates = [
  { id: 1, name: "Good Moral Certificate", type: "Certificate", lastModified: "2024-01-15" },
  { id: 2, name: "Uniform Exemption Letter", type: "Certificate", lastModified: "2024-01-14" },
  { id: 3, name: "Cross-Dressing Clearance", type: "Certificate", lastModified: "2024-01-13" },
  { id: 4, name: "Request Confirmation Email", type: "Email", lastModified: "2024-01-12" },
  { id: 5, name: "Certificate Issued Email", type: "Email", lastModified: "2024-01-11" },
];

export default function TemplatesPage() {
  return (
    <DashboardLayout>
      <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#111c4e" }}>
              Templates Management
            </h1>
            <p className="text-muted-foreground">Manage certificate and email templates</p>
          </div>
          <Button className="gap-2" style={{ backgroundColor: "#111c4e" }}>
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">{template.type} • Last modified: {template.lastModified}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
