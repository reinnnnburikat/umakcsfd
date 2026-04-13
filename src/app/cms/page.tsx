"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings,
  FileText,
  Clock,
  Mail,
  Users,
  Shield,
  Loader2,
  Save,
  RefreshCw,
} from "lucide-react";

export default function CMSPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // CMS Content State
  const [content, setContent] = useState({
    heroTitle: "Center for Student Formation and Discipline",
    heroSubtitle: "University of Makati. University of Character.",
    aboutText: "",
    visionText: "",
    missionText: "",
    contactEmail: "csfd@umak.edu.ph",
    contactPhone: "8883-1875",
    contactAddress: "University of Makati, J.P. Rizal Extension, West Rembo, Makati City",
  });

  // System Settings State
  const [settings, setSettings] = useState({
    maxFileSize: "10",
    allowedFileTypes: "pdf,jpg,jpeg,png,doc,docx",
    certificateValidity: "6",
    officeHoursStart: "08:00",
    officeHoursEnd: "17:00",
    enableGMC: true,
    enableUER: true,
    enableCDC: true,
    enableCAC: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      // Fetch CMS content
      fetchContent();
    }
  }, [status, router]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // For now, use default values
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    setSaving(true);
    try {
      // In production, save to API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Content saved successfully");
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            CMS Panel
          </h1>
          <p className="text-muted-foreground">
            Manage website content and system settings
          </p>
        </div>

        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="h-4 w-4 mr-2" />
              Office Hours
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="services">
              <Shield className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Content</CardTitle>
                <CardDescription>
                  Manage the content displayed on the public homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={content.heroTitle}
                    onChange={(e) =>
                      setContent((prev) => ({ ...prev, heroTitle: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Input
                    id="heroSubtitle"
                    value={content.heroSubtitle}
                    onChange={(e) =>
                      setContent((prev) => ({ ...prev, heroSubtitle: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aboutText">About CSFD</Label>
                  <Textarea
                    id="aboutText"
                    value={content.aboutText}
                    onChange={(e) =>
                      setContent((prev) => ({ ...prev, aboutText: e.target.value }))
                    }
                    rows={4}
                    placeholder="Enter about text..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visionText">Vision</Label>
                  <Textarea
                    id="visionText"
                    value={content.visionText}
                    onChange={(e) =>
                      setContent((prev) => ({ ...prev, visionText: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionText">Mission</Label>
                  <Textarea
                    id="missionText"
                    value={content.missionText}
                    onChange={(e) =>
                      setContent((prev) => ({ ...prev, missionText: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={content.contactEmail}
                      onChange={(e) =>
                        setContent((prev) => ({ ...prev, contactEmail: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      value={content.contactPhone}
                      onChange={(e) =>
                        setContent((prev) => ({ ...prev, contactPhone: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactAddress">Address</Label>
                  <Textarea
                    id="contactAddress"
                    value={content.contactAddress}
                    onChange={(e) =>
                      setContent((prev) => ({ ...prev, contactAddress: e.target.value }))
                    }
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveContent} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Content
              </Button>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>File Upload Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={settings.maxFileSize}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, maxFileSize: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificateValidity">Certificate Validity (Months)</Label>
                    <Input
                      id="certificateValidity"
                      type="number"
                      value={settings.certificateValidity}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          certificateValidity: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types (comma-separated)</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.allowedFileTypes}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        allowedFileTypes: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </TabsContent>

          {/* Office Hours Tab */}
          <TabsContent value="hours" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Office Hours Configuration</CardTitle>
                <CardDescription>
                  Set the CSFD office hours displayed on public pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="officeHoursStart">Opening Time</Label>
                    <Input
                      id="officeHoursStart"
                      type="time"
                      value={settings.officeHoursStart}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          officeHoursStart: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="officeHoursEnd">Closing Time</Label>
                    <Input
                      id="officeHoursEnd"
                      type="time"
                      value={settings.officeHoursEnd}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          officeHoursEnd: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Current Office Hours: Monday – Friday, {settings.officeHoursStart} –{" "}
                    {settings.officeHoursEnd}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Templates Tab */}
          <TabsContent value="email" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Customize email notifications sent to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Request Submitted",
                    "Request Processing",
                    "Certificate Issued",
                    "Request Rejected",
                    "Request On Hold",
                  ].map((template) => (
                    <div
                      key={template}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{template}</div>
                        <div className="text-sm text-muted-foreground">
                          Click to edit template
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Availability</CardTitle>
                <CardDescription>
                  Enable or disable service request types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Good Moral Certificate (GMC)</div>
                    <div className="text-sm text-muted-foreground">
                      Certificate of good moral character
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableGMC}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, enableGMC: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Uniform Exemption (UER)</div>
                    <div className="text-sm text-muted-foreground">
                      Exemption from prescribed uniform
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableUER}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, enableUER: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Cross-Dressing Clearance (CDC)</div>
                    <div className="text-sm text-muted-foreground">
                      Clearance for cross-dressing events
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableCDC}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, enableCDC: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Child Admission Clearance (CAC)</div>
                    <div className="text-sm text-muted-foreground">
                      Clearance for bringing children to campus
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableCAC}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, enableCAC: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
