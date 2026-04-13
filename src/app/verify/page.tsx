"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface VerificationData {
  status: string;
  message: string;
  details: string;
  data?: {
    controlNumber: string;
    requestType: string;
    requestorName: string;
    studentNumber?: string;
    college?: string;
    purpose?: string;
    issuedAt?: string;
    expiresAt?: string;
    qrCode?: string;
  };
}

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam);
      verifyCode(codeParam);
    }
  }, [searchParams]);

  const verifyCode = async (codeToVerify?: string) => {
    const verifyCode = codeToVerify || code;
    if (!verifyCode.trim()) {
      toast.error("Please enter a verification code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/verify?code=${verifyCode}`);
      const data = await response.json();
      setVerificationData(data);
    } catch (err) {
      console.error("Error verifying certificate:", err);
      toast.error("Failed to verify certificate");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!verificationData) return null;

    switch (verificationData.status) {
      case "VALID":
        return <CheckCircle2 className="h-16 w-16 text-green-500" />;
      case "EXPIRED":
        return <Clock className="h-16 w-16 text-amber-500" />;
      case "NOT_ISSUED":
        return <Clock className="h-16 w-16 text-blue-500" />;
      case "NOT_FOUND":
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <AlertTriangle className="h-16 w-16 text-amber-500" />;
    }
  };

  const getStatusColor = () => {
    if (!verificationData) return "";

    switch (verificationData.status) {
      case "VALID":
        return "border-green-500 bg-green-50 dark:bg-green-950/30";
      case "EXPIRED":
        return "border-amber-500 bg-amber-50 dark:bg-amber-950/30";
      case "NOT_ISSUED":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/30";
      case "NOT_FOUND":
        return "border-red-500 bg-red-50 dark:bg-red-950/30";
      default:
        return "border-gray-500";
    }
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
              <ShieldCheck className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Certificate Verification</h1>
            <p className="text-muted-foreground">
              Verify the authenticity of a certificate issued by CSFD.
            </p>
          </div>

          {/* Search Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter 16-character code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={16}
                    className="font-mono"
                    onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => verifyCode()}
                    disabled={loading || code.length !== 16}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-2">Verify</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Result */}
          {verificationData && (
            <Card className={`border-2 ${getStatusColor()}`}>
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">{getStatusIcon()}</div>
                <h2 className="text-xl font-bold mb-2">{verificationData.message}</h2>
                <p className="text-muted-foreground mb-6">{verificationData.details}</p>

                {verificationData.data && (
                  <div className="text-left bg-white dark:bg-gray-800 rounded-lg p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Control Number</div>
                        <div className="font-mono font-bold text-orange-500">
                          {verificationData.data.controlNumber}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Certificate Type</div>
                        <div className="font-medium">
                          {requestTypes[verificationData.data.requestType] ||
                            verificationData.data.requestType}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Name</div>
                        <div className="font-medium">{verificationData.data.requestorName}</div>
                      </div>
                      {verificationData.data.studentNumber && (
                        <div>
                          <div className="text-sm text-muted-foreground">Student Number</div>
                          <div className="font-medium">
                            {verificationData.data.studentNumber}
                          </div>
                        </div>
                      )}
                      {verificationData.data.college && (
                        <div className="col-span-2">
                          <div className="text-sm text-muted-foreground">College/Institute</div>
                          <div className="font-medium">{verificationData.data.college}</div>
                        </div>
                      )}
                      {verificationData.data.issuedAt && (
                        <div>
                          <div className="text-sm text-muted-foreground">Date Issued</div>
                          <div className="font-medium">
                            {new Date(verificationData.data.issuedAt).toLocaleDateString("en-PH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      )}
                      {verificationData.data.expiresAt && (
                        <div>
                          <div className="text-sm text-muted-foreground">Valid Until</div>
                          <div className="font-medium">
                            {new Date(verificationData.data.expiresAt).toLocaleDateString("en-PH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {verificationData.status === "EXPIRED" && (
                  <Button className="mt-6 bg-orange-500 hover:bg-orange-600">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Request New Certificate
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !verificationData && (
            <Card className="text-center py-12">
              <CardContent>
                <ShieldCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Verify a Certificate</h3>
                <p className="text-muted-foreground">
                  Enter the 16-character verification code found on the certificate
                  or scan the QR code to verify its authenticity.
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
