"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";

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

export default function VerifyCertificatePage() {
  const params = useParams();
  const code = params.code as string;
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

  useEffect(() => {
    if (code) {
      verifyCode(code);
    }
  }, [code]);

  const verifyCode = async (codeToVerify: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/verify?code=${codeToVerify}`);
      const data = await response.json();
      setVerificationData(data);
    } catch (err) {
      console.error("Error verifying certificate:", err);
      setVerificationData({
        status: "ERROR",
        message: "Verification Failed",
        details: "An error occurred while verifying the certificate.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!verificationData) return null;

    switch (verificationData.status) {
      case "VALID":
        return <CheckCircle2 className="h-20 w-20 text-green-500" />;
      case "EXPIRED":
        return <Clock className="h-20 w-20 text-amber-500" />;
      case "NOT_ISSUED":
        return <Clock className="h-20 w-20 text-blue-500" />;
      case "NOT_FOUND":
        return <XCircle className="h-20 w-20 text-red-500" />;
      default:
        return <XCircle className="h-20 w-20 text-red-500" />;
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
              Verification Code: <span className="font-mono font-bold">{code}</span>
            </p>
          </div>

          {loading ? (
            <Card className="text-center py-12">
              <CardContent>
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-orange-500 mb-4" />
                <p className="text-muted-foreground">Verifying certificate...</p>
              </CardContent>
            </Card>
          ) : verificationData ? (
            <Card className={`border-2 ${getStatusColor()}`}>
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">{getStatusIcon()}</div>
                <h2 className="text-2xl font-bold mb-2">{verificationData.message}</h2>
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
                          <div className="font-medium">{verificationData.data.studentNumber}</div>
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
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <p className="text-muted-foreground">Failed to verify certificate</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
