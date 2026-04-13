"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  AlertCircle,
  Package,
  MapPin,
  Calendar,
  FileCheck,
  Send,
  Hourglass,
  CheckCircle,
  Upload,
  Sparkles,
} from "lucide-react";

interface TrackingData {
  controlNumber: string;
  requestType: string;
  status: string;
  requestorName: string;
  requestorEmail: string;
  purpose: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  certificateIssuedAt?: string;
  certificateExpiresAt?: string;
  certificateUrl?: string;
  timeline: {
    status: string;
    date: string;
    completed: boolean;
    label: string;
    description: string;
  }[];
}

// Timeline step configuration
const timelineSteps = [
  {
    id: 1,
    label: "Submitted",
    icon: Send,
    description: "Your request has been received",
  },
  {
    id: 2,
    label: "Processing",
    icon: Hourglass,
    description: "Request is being reviewed",
  },
  {
    id: 3,
    label: "Ready for Pickup",
    icon: CheckCircle,
    description: "Certificate is ready",
  },
  {
    id: 4,
    label: "Released",
    icon: Upload,
    description: "Certificate has been released",
  },
];

// Status badge configuration
const statusConfig: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  NEW: { bg: "bg-blue-500", text: "text-white", icon: Sparkles },
  PROCESSING: { bg: "bg-yellow-500", text: "text-white", icon: Hourglass },
  ISSUED: { bg: "bg-green-500", text: "text-white", icon: CheckCircle2 },
  HOLD: { bg: "bg-gray-500", text: "text-white", icon: Clock },
  REJECTED: { bg: "bg-red-500", text: "text-white", icon: AlertCircle },
};

const requestTypes: Record<string, string> = {
  GMC: "Good Moral Certificate",
  UER: "Uniform Exemption",
  CDC: "Cross-Dressing Clearance",
  CAC: "Child Admission",
};

// Animated background shapes
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <motion.div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
        style={{ backgroundColor: "#ffc400" }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 -left-20 w-48 h-48 rounded-full opacity-10"
        style={{ backgroundColor: "#111c4e" }}
        animate={{
          scale: [1, 1.3, 1],
          y: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-10 right-1/4 w-32 h-32 rounded-full opacity-15"
        style={{ backgroundColor: "#ffc400" }}
        animate={{
          scale: [1, 1.4, 1],
          x: [0, 20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: i % 2 === 0 ? "#ffc400" : "#111c4e" }}
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * 400,
            opacity: 0.3 
          }}
          animate={{
            y: [null, Math.random() * -100 - 50],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// Glassmorphism search card
function GlassSearchCard({
  searchQuery,
  setSearchQuery,
  onSearch,
  loading,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onSearch: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative"
    >
      <div className="glass-card rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search" className="text-sm font-medium text-foreground/80">
              Control Number or Tracking Token
            </Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="e.g., GMC-00001 or your tracking token"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                className="h-12 pl-4 pr-12 text-base border-2 focus:border-[#ffc400] focus:ring-[#ffc400]/20 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-sm"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              onClick={onSearch}
              disabled={loading}
              className="h-12 px-8 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: "#ffc400", color: "#111c4e" }}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="ml-2">Track Request</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced timeline component
function EnhancedTimeline({ trackingData }: { trackingData: TrackingData }) {
  // Determine current step based on status
  const getCurrentStep = (status: string): number => {
    const statusMap: Record<string, number> = {
      NEW: 1,
      PROCESSING: 2,
      ISSUED: 3,
      HOLD: 2,
      REJECTED: 0,
    };
    return statusMap[status] || 1;
  };

  const currentStep = getCurrentStep(trackingData.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-2xl p-6 md:p-8"
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: "#111c4e" }}>
        <Clock className="h-5 w-5" />
        Status Timeline
      </h3>

      {/* Horizontal Timeline */}
      <div className="relative">
        {/* Timeline connector line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full hidden sm:block">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "#ffc400" }}
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>

        {/* Timeline steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
          {timelineSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep - 1;
            const isPending = index >= currentStep;
            const Icon = step.icon;

            // Get date for this step
            const getStepDate = () => {
              if (index === 0) return trackingData.createdAt;
              if (index === 1 && trackingData.processedAt) return trackingData.processedAt;
              if (index === 2 && trackingData.status === "ISSUED") return trackingData.certificateIssuedAt;
              if (index === 3 && trackingData.status === "ISSUED") return trackingData.certificateIssuedAt;
              return null;
            };
            const stepDate = getStepDate();

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
                className="flex flex-col items-center text-center"
              >
                {/* Step circle */}
                <motion.div
                  className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center z-10
                    transition-all duration-500
                    ${isCompleted ? "bg-[#1F9E55] text-white shadow-lg" : ""}
                    ${isCurrent ? "bg-[#111c4e] text-white shadow-lg ring-4 ring-[#ffc400]/30" : ""}
                    ${isPending ? "bg-muted text-muted-foreground border-2 border-dashed border-muted-foreground/30" : ""}
                  `}
                  whileHover={{ scale: 1.1 }}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Icon className={`h-5 w-5 ${isCurrent ? "animate-pulse" : ""}`} />
                  )}

                  {/* Pulse animation for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: "#111c4e" }}
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Step label */}
                <p
                  className={`mt-3 text-sm font-medium transition-colors duration-300 ${
                    isCompleted ? "text-[#1F9E55]" : isCurrent ? "text-[#111c4e]" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>

                {/* Date */}
                {stepDate && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(stepDate).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
                {isPending && (
                  <p className="mt-1 text-xs text-muted-foreground">---</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Estimated completion */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 pt-4 border-t border-border/50"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Estimated Completion:
          </span>
          <span className="font-medium" style={{ color: "#111c4e" }}>
            {trackingData.status === "ISSUED"
              ? "Completed"
              : trackingData.status === "REJECTED"
              ? "N/A"
              : "3-5 Business Days"}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Status card component
function StatusCard({ trackingData }: { trackingData: TrackingData }) {
  const config = statusConfig[trackingData.status] || statusConfig.NEW;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl p-6 md:p-8"
    >
      {/* Header with status badge */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: "#111c4e" }}>
          <FileText className="h-5 w-5" />
          Request Details
        </h3>
        <Badge className={`${config.bg} ${config.text} px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5`}>
          <StatusIcon className="h-4 w-4" />
          {trackingData.status}
        </Badge>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3 rounded-xl bg-white/30 dark:bg-white/5">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Control Number</div>
          <div className="font-mono font-bold text-lg mt-1" style={{ color: "#ffc400" }}>
            {trackingData.controlNumber}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white/30 dark:bg-white/5">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Request Type</div>
          <div className="font-medium mt-1">
            {requestTypes[trackingData.requestType] || trackingData.requestType}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white/30 dark:bg-white/5">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Requestor</div>
          <div className="font-medium mt-1">{trackingData.requestorName}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/30 dark:bg-white/5">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Purpose</div>
          <div className="font-medium mt-1">{trackingData.purpose}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/30 dark:bg-white/5">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Date Submitted</div>
          <div className="font-medium mt-1">
            {new Date(trackingData.createdAt).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white/30 dark:bg-white/5">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</div>
          <div className="font-medium mt-1">
            {new Date(trackingData.updatedAt).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Remarks */}
      {trackingData.remarks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Remarks</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {trackingData.remarks}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Download certificate button */}
      {trackingData.status === "ISSUED" && trackingData.certificateUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-border/50"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                <FileCheck className="h-5 w-5" />
                Certificate Ready for Download
              </div>
              {trackingData.certificateExpiresAt && (
                <p className="text-sm text-muted-foreground mt-1">
                  Valid until:{" "}
                  {new Date(trackingData.certificateExpiresAt).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
            <Button
              className="bg-[#1F9E55] hover:bg-[#1a8547] text-white rounded-xl px-6"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Claim location card
function ClaimLocationCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "#111c4e" }}>
        <MapPin className="h-5 w-5" />
        Claim Location
      </h3>
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#111c4e" }}
        >
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-medium">Center for Student Formation and Discipline</p>
          <p className="text-sm text-muted-foreground mt-1">
            University of Makati, JP Rizal Extension, West Rembo, Makati City
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Office Hours: Monday - Friday, 8:00 AM - 5:00 PM
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-12 text-center"
    >
      <div
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "#111c4e" }}
      >
        <Package className="h-10 w-10 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: "#111c4e" }}>
        Track Your Request
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Enter your control number (e.g., GMC-00001) or the tracking token sent to your email
        to check the status of your certificate request.
      </p>
    </motion.div>
  );
}

export default function TrackPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a control number or tracking token");
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.includes("-")) {
        params.append("controlNumber", searchQuery.toUpperCase());
      } else {
        params.append("token", searchQuery);
      }

      const response = await fetch(`/api/track?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setTrackingData(data.data);
        toast.success("Request found!");
      } else {
        setError(data.error || "Request not found");
      }
    } catch (err) {
      console.error("Error tracking request:", err);
      setError("Failed to track request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <PublicNavbar />

      <main className="flex-1 relative">
        {/* Hero Section */}
        <section
          className="relative py-16 md:py-24 overflow-hidden"
          style={{ backgroundColor: "#111c4e" }}
        >
          <AnimatedBackground />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-white max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#ffc400" }}
              >
                <Search className="h-8 w-8" style={{ color: "#111c4e" }} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              >
                Track Your Request
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-white/80"
              >
                Check the status of your certificate request in real-time
              </motion.p>

              {/* Timeline preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center justify-center gap-2 text-white/60 text-sm"
              >
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/40" />
                  Submitted
                </span>
                <span className="w-6 h-0.5 bg-white/20" />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/40" />
                  Processing
                </span>
                <span className="w-6 h-0.5 bg-white/20" />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/40" />
                  Ready
                </span>
                <span className="w-6 h-0.5 bg-white/20" />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ffc400]" />
                  Released
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Wave decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
            >
              <path
                d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                className="fill-gray-50 dark:fill-gray-900"
              />
            </svg>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Search Card */}
            <GlassSearchCard
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              loading={loading}
            />

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6"
                >
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <div className="mt-8 space-y-6">
              {trackingData ? (
                <>
                  <StatusCard trackingData={trackingData} />
                  <EnhancedTimeline trackingData={trackingData} />
                  <ClaimLocationCard />
                </>
              ) : (
                !loading && !error && <EmptyState />
              )}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
