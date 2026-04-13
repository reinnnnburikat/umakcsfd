"use client";

import React, { useState } from "react";
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-blue-500",
      PROCESSING: "bg-yellow-500",
      ISSUED: "bg-green-500",
      HOLD: "bg-gray-500",
      REJECTED: "bg-red-500",
      SUBMITTED: "bg-blue-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const requestTypes: Record<string, string> = {
    GMC: "Good Moral Certificate",
    UER: "Uniform Exemption",
    CDC: "Cross-Dressing Clearance",
    CAC: "Child Admission",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Track Your Request</h1>
            <p className="text-muted-foreground">
              Enter your control number or tracking token to check the status of your request.
            </p>
          </div>

          {/* Search Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="search">Control Number or Tracking Token</Label>
                  <Input
                    id="search"
                    placeholder="e.g., GMC-00001 or your tracking token"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-2">Track</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tracking Results */}
          {trackingData && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Request Status</CardTitle>
                    <Badge className={`${getStatusColor(trackingData.status)} text-white`}>
                      {trackingData.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Control Number</div>
                      <div className="font-mono font-bold text-orange-500">
                        {trackingData.controlNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Request Type</div>
                      <div className="font-medium">
                        {requestTypes[trackingData.requestType] || trackingData.requestType}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Requestor</div>
                      <div className="font-medium">{trackingData.requestorName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Purpose</div>
                      <div className="font-medium">{trackingData.purpose}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Date Submitted</div>
                      <div className="font-medium">
                        {new Date(trackingData.createdAt).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Updated</div>
                      <div className="font-medium">
                        {new Date(trackingData.updatedAt).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {trackingData.remarks && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Remarks</div>
                      <div className="text-sm">{trackingData.remarks}</div>
                    </div>
                  )}

                  {trackingData.status === "ISSUED" && trackingData.certificateUrl && (
                    <div className="mt-4">
                      <Button className="bg-green-500 hover:bg-green-600">
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </Button>
                      {trackingData.certificateExpiresAt && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Valid until:{" "}
                          {new Date(trackingData.certificateExpiresAt).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingData.timeline.map((step, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.completed
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{step.label}</div>
                            {step.date && (
                              <div className="text-sm text-muted-foreground">
                                {new Date(step.date).toLocaleDateString("en-PH")}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {step.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!loading && !trackingData && !error && (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Track Your Request</h3>
                <p className="text-muted-foreground mb-4">
                  Enter your control number (e.g., GMC-00001) or the tracking token
                  sent to your email to check your request status.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
