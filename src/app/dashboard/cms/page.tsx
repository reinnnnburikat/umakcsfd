"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FileText,
  Mail,
  List,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  History,
  Upload,
  Download,
  GripVertical,
  FileCheck,
  Loader2,
  Save,
  RefreshCw,
  X,
  Code,
  Image as ImageIcon,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Types
interface Template {
  id: string;
  name: string;
  templateType: "CERTIFICATE" | "EMAIL";
  filename?: string;
  storagePath?: string;
  placeholders?: string;
  subject?: string;
  bodyHtml?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    email: string;
  };
}

interface ManagedListItem {
  id: string;
  listType: string;
  label: string;
  value?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface TemplateHistory {
  id: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

// Placeholder variables for templates
const PLACEHOLDER_VARIABLES = [
  { name: "{{name}}", description: "Full name of the requestor" },
  { name: "{{firstName}}", description: "First name" },
  { name: "{{lastName}}", description: "Last name" },
  { name: "{{controlNumber}}", description: "Request control number" },
  { name: "{{date}}", description: "Current date" },
  { name: "{{certificateType}}", description: "Type of certificate" },
  { name: "{{purpose}}", description: "Purpose of request" },
  { name: "{{college}}", description: "College/Institute" },
  { name: "{{studentNumber}}", description: "Student number" },
  { name: "{{expiryDate}}", description: "Certificate expiry date" },
  { name: "{{status}}", description: "Request status" },
  { name: "{{remarks}}", description: "Processing remarks" },
];

// Default email templates
const DEFAULT_EMAIL_TEMPLATES = [
  {
    id: "email-submitted",
    name: "Request Submitted",
    subject: "Your Request Has Been Submitted - {{controlNumber}}",
    bodyHtml: `
      <p>Dear {{name}},</p>
      <p>Thank you for submitting your request for {{certificateType}}.</p>
      <p><strong>Control Number:</strong> {{controlNumber}}</p>
      <p><strong>Purpose:</strong> {{purpose}}</p>
      <p>Your request is now being processed. You will receive another email once your certificate is ready.</p>
      <p>Best regards,<br>CSFD Team</p>
    `,
  },
  {
    id: "email-processing",
    name: "Request Processing",
    subject: "Your Request is Being Processed - {{controlNumber}}",
    bodyHtml: `
      <p>Dear {{name}},</p>
      <p>Your request for {{certificateType}} (Control Number: {{controlNumber}}) is now being processed.</p>
      <p>We will notify you once it's ready for pickup.</p>
      <p>Best regards,<br>CSFD Team</p>
    `,
  },
  {
    id: "email-issued",
    name: "Certificate Issued",
    subject: "Your Certificate is Ready - {{controlNumber}}",
    bodyHtml: `
      <p>Dear {{name}},</p>
      <p>Great news! Your {{certificateType}} is now ready.</p>
      <p><strong>Control Number:</strong> {{controlNumber}}</p>
      <p><strong>Valid Until:</strong> {{expiryDate}}</p>
      <p>Please visit our office to claim your certificate during office hours.</p>
      <p>Best regards,<br>CSFD Team</p>
    `,
  },
  {
    id: "email-rejected",
    name: "Request Rejected",
    subject: "Request Update - {{controlNumber}}",
    bodyHtml: `
      <p>Dear {{name}},</p>
      <p>We regret to inform you that your request for {{certificateType}} (Control Number: {{controlNumber}}) has been rejected.</p>
      <p><strong>Reason:</strong> {{remarks}}</p>
      <p>If you have questions, please contact our office.</p>
      <p>Best regards,<br>CSFD Team</p>
    `,
  },
  {
    id: "email-hold",
    name: "Request On Hold",
    subject: "Request On Hold - {{controlNumber}}",
    bodyHtml: `
      <p>Dear {{name}},</p>
      <p>Your request for {{certificateType}} (Control Number: {{controlNumber}}) is currently on hold.</p>
      <p><strong>Reason:</strong> {{remarks}}</p>
      <p>Please contact our office for assistance.</p>
      <p>Best regards,<br>CSFD Team</p>
    `,
  },
];

// Sortable Item Component for Managed Lists
function SortableListItem({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: ManagedListItem;
  onEdit: (item: ManagedListItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors ${
        isDragging ? "shadow-lg border-[#ffc400]" : "hover:border-[#ffc400]/50"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.value}</p>
      </div>
      <Switch
        checked={item.isActive}
        onCheckedChange={(checked) => onToggle(item.id, checked)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(item.id)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Template Card Component
function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview,
  onHistory,
}: {
  template: Template;
  onEdit: (template: Template) => void;
  onDuplicate: (template: Template) => void;
  onDelete: (id: string) => void;
  onPreview: (template: Template) => void;
  onHistory: (template: Template) => void;
}) {
  const isEmail = template.templateType === "EMAIL";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-l-4 group" style={{ borderLeftColor: isEmail ? "#ffc400" : "#111c4e" }}>
        <CardContent className="p-0">
          {/* Preview Thumbnail */}
          <div
            className="h-32 bg-gradient-to-br flex items-center justify-center relative overflow-hidden"
            style={{
              background: isEmail
                ? "linear-gradient(135deg, #ffc400 0%, #ffdd66 100%)"
                : "linear-gradient(135deg, #111c4e 0%, #1e3a8a 100%)",
            }}
          >
            {isEmail ? (
              <Mail className="h-16 w-16 text-white/80" />
            ) : (
              <FileCheck className="h-16 w-16 text-white/80" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{template.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {isEmail ? "Email Template" : "Certificate Template"}
                </p>
              </div>
              <Badge
                variant={template.isActive ? "default" : "secondary"}
                className={template.isActive ? "bg-green-500 text-white" : ""}
              >
                {template.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {isEmail && template.subject && (
              <p className="text-sm text-muted-foreground truncate mb-2">
                Subject: {template.subject}
              </p>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <Clock className="h-3 w-3" />
              Updated {new Date(template.updatedAt).toLocaleDateString()}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(template)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPreview(template)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onDuplicate(template)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onHistory(template)}>
                    <History className="h-4 w-4 mr-2" />
                    Version History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(template.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skeleton for template cards
function TemplateCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="h-32 w-full" />
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-5 w-14" />
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CMSManagementPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Template state
  const [certificateTemplates, setCertificateTemplates] = useState<Template[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Managed lists state
  const [managedLists, setManagedLists] = useState<Record<string, ManagedListItem[]>>({});
  const [selectedListType, setSelectedListType] = useState<string>("college");
  const [editingListItem, setEditingListItem] = useState<ManagedListItem | null>(null);
  const [isListItemModalOpen, setIsListItemModalOpen] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState("");

  // Form state for template editing
  const [editForm, setEditForm] = useState({
    name: "",
    subject: "",
    bodyHtml: "",
    placeholders: "",
    isActive: true,
  });

  // Version history
  const [templateHistory, setTemplateHistory] = useState<TemplateHistory[]>([]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);

      // Fetch templates
      const certRes = await fetch("/api/templates?type=CERTIFICATE&includeInactive=true");
      const certData = await certRes.json();
      setCertificateTemplates(certData.data || []);

      const emailRes = await fetch("/api/templates?type=EMAIL&includeInactive=true");
      const emailData = await emailRes.json();
      
      // If no email templates exist, use defaults
      if (!emailData.data || emailData.data.length === 0) {
        // Create default templates as mock data
        const defaultEmails = DEFAULT_EMAIL_TEMPLATES.map((t, idx) => ({
          id: t.id,
          name: t.name,
          templateType: "EMAIL" as const,
          subject: t.subject,
          bodyHtml: t.bodyHtml,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: { name: "System", email: "system@csfd.edu.ph" },
        }));
        setEmailTemplates(defaultEmails);
      } else {
        setEmailTemplates(emailData.data);
      }

      // Fetch managed lists
      const listsRes = await fetch("/api/lists?includeInactive=true");
      const listsData = await listsRes.json();
      setManagedLists(listsData.data || {});
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  // Template handlers
  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject || "",
      bodyHtml: template.bodyHtml || "",
      placeholders: template.placeholders || "",
      isActive: template.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      const res = await fetch("/api/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTemplate.id,
          ...editForm,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Template saved successfully");
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const res = await fetch("/api/templates/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: template.id,
          newName: `${template.name} (Copy)`,
        }),
      });

      if (!res.ok) throw new Error("Failed to duplicate");

      toast.success("Template duplicated successfully");
      fetchData();
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast.error("Failed to duplicate template");
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const res = await fetch(`/api/templates?id=${templateToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Template deleted successfully");
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleHistoryTemplate = async (template: Template) => {
    setSelectedTemplate(template);
    // In a real implementation, fetch version history from API
    // For now, create mock history
    setTemplateHistory([
      {
        id: "1",
        action: "UPDATE",
        newValue: "Updated email subject",
        createdAt: template.updatedAt,
        user: template.author,
      },
      {
        id: "2",
        action: "CREATE",
        newValue: "Template created",
        createdAt: template.createdAt,
        user: template.author,
      },
    ]);
    setIsHistoryModalOpen(true);
  };

  // Managed list handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const items = managedLists[selectedListType] || [];
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sortOrder: index,
      }));

      setManagedLists((prev) => ({
        ...prev,
        [selectedListType]: newItems,
      }));

      // Save new order to API
      try {
        await fetch("/api/lists", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reorderItems: newItems.map((item) => ({
              id: item.id,
              sortOrder: item.sortOrder,
            })),
          }),
        });
        toast.success("Order updated");
      } catch (error) {
        console.error("Error reordering:", error);
        toast.error("Failed to update order");
      }
    }
  };

  const handleAddListItem = async () => {
    if (!newItemLabel.trim()) {
      toast.error("Label is required");
      return;
    }

    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listType: selectedListType,
          label: newItemLabel,
        }),
      });

      if (!res.ok) throw new Error("Failed to add");

      toast.success("Item added successfully");
      setNewItemLabel("");
      fetchData();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  const handleEditListItem = (item: ManagedListItem) => {
    setEditingListItem(item);
    setNewItemLabel(item.label);
    setIsListItemModalOpen(true);
  };

  const handleSaveListItem = async () => {
    if (!editingListItem || !newItemLabel.trim()) return;

    try {
      const res = await fetch("/api/lists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingListItem.id,
          label: newItemLabel,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Item updated successfully");
      setIsListItemModalOpen(false);
      setEditingListItem(null);
      setNewItemLabel("");
      fetchData();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleToggleListItem = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/lists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });

      setManagedLists((prev) => ({
        ...prev,
        [selectedListType]: (prev[selectedListType] || []).map((item) =>
          item.id === id ? { ...item, isActive } : item
        ),
      }));

      toast.success(isActive ? "Item activated" : "Item deactivated");
    } catch (error) {
      console.error("Error toggling item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleDeleteListItem = async (id: string) => {
    try {
      await fetch(`/api/lists?id=${id}`, { method: "DELETE" });

      setManagedLists((prev) => ({
        ...prev,
        [selectedListType]: (prev[selectedListType] || []).filter((item) => item.id !== id),
      }));

      toast.success("Item deleted");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  // Filter templates by search
  const filteredCertTemplates = certificateTemplates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredEmailTemplates = emailTemplates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // List types for managed lists
  const listTypes = [
    { value: "college", label: "Colleges/Institutes" },
    { value: "purpose", label: "Purposes" },
    { value: "complaint_type", label: "Complaint Types" },
    { value: "violation", label: "Violations" },
    { value: "course", label: "Courses" },
  ];

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#ffc400" }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#111c4e" }}>
              Content Management System
            </h1>
            <p className="text-muted-foreground">
              Manage templates, emails, and system lists
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="certificate" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="certificate" className="gap-2">
              <FileCheck className="h-4 w-4" />
              Certificate Templates
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="lists" className="gap-2">
              <List className="h-4 w-4" />
              Managed Lists
            </TabsTrigger>
          </TabsList>

          {/* Certificate Templates Tab */}
          <TabsContent value="certificate" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: "#111c4e" }}>
                Certificate Templates
              </h2>
              <Button className="gap-2" style={{ backgroundColor: "#111c4e" }}>
                <Upload className="h-4 w-4" />
                Upload Template
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <TemplateCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredCertTemplates.length === 0 ? (
              <Card className="p-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Certificate Templates</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first certificate template to get started.
                  </p>
                  <Button className="gap-2" style={{ backgroundColor: "#111c4e" }}>
                    <Upload className="h-4 w-4" />
                    Upload Template
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredCertTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={handleEditTemplate}
                      onDuplicate={handleDuplicateTemplate}
                      onDelete={(id) => {
                        setTemplateToDelete(id);
                        setIsDeleteDialogOpen(true);
                      }}
                      onPreview={handlePreviewTemplate}
                      onHistory={handleHistoryTemplate}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Email Templates Tab */}
          <TabsContent value="email" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: "#ffc400" }}>
                Email Templates
              </h2>
              <Button className="gap-2" style={{ backgroundColor: "#ffc400", color: "#111c4e" }}>
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <TemplateCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredEmailTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={handleEditTemplate}
                      onDuplicate={handleDuplicateTemplate}
                      onDelete={(id) => {
                        setTemplateToDelete(id);
                        setIsDeleteDialogOpen(true);
                      }}
                      onPreview={handlePreviewTemplate}
                      onHistory={handleHistoryTemplate}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Managed Lists Tab */}
          <TabsContent value="lists" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {listTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedListType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedListType(type.value)}
                    style={
                      selectedListType === type.value
                        ? { backgroundColor: "#111c4e" }
                        : undefined
                    }
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List Items */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" style={{ color: "#ffc400" }} />
                    {listTypes.find((t) => t.value === selectedListType)?.label}
                  </CardTitle>
                  <CardDescription>
                    Drag to reorder. Toggle to activate/deactivate.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={(managedLists[selectedListType] || []).map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-2">
                          <AnimatePresence>
                            {(managedLists[selectedListType] || []).map((item) => (
                              <SortableListItem
                                key={item.id}
                                item={item}
                                onEdit={handleEditListItem}
                                onDelete={handleDeleteListItem}
                                onToggle={handleToggleListItem}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </ScrollArea>
                    </SortableContext>
                  </DndContext>
                </CardContent>
              </Card>

              {/* Add New Item & Placeholder Reference */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add New Item</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newItem">Label</Label>
                      <Input
                        id="newItem"
                        placeholder="Enter label..."
                        value={newItemLabel}
                        onChange={(e) => setNewItemLabel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddListItem()}
                      />
                    </div>
                    <Button
                      onClick={handleAddListItem}
                      className="w-full gap-2"
                      style={{ backgroundColor: "#111c4e" }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Code className="h-4 w-4" style={{ color: "#ffc400" }} />
                      Placeholder Variables
                    </CardTitle>
                    <CardDescription>
                      Use these in email templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {PLACEHOLDER_VARIABLES.map((variable) => (
                          <div
                            key={variable.name}
                            className="flex items-start gap-2 p-2 rounded bg-muted/50"
                          >
                            <code className="text-xs font-mono px-1 py-0.5 rounded bg-[#ffc400]/20 text-[#ffc400]">
                              {variable.name}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {variable.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Template Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {selectedTemplate?.templateType === "EMAIL" ? "Email" : "Certificate"} Template
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {selectedTemplate?.templateType === "EMAIL" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={editForm.subject}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bodyHtml">Email Body (HTML)</Label>
                    <div className="flex items-center gap-2">
                      {PLACEHOLDER_VARIABLES.slice(0, 3).map((v) => (
                        <Button
                          key={v.name}
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs font-mono"
                          onClick={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              bodyHtml: prev.bodyHtml + " " + v.name,
                            }))
                          }
                        >
                          {v.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    id="bodyHtml"
                    value={editForm.bodyHtml}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, bodyHtml: e.target.value }))
                    }
                    placeholder="Enter email body HTML..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  {editForm.isActive ? "Template is currently active" : "Template is inactive"}
                </p>
              </div>
              <Switch
                checked={editForm.isActive}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" style={{ color: "#ffc400" }} />
              Template Preview
            </DialogTitle>
            <DialogDescription>{selectedTemplate?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedTemplate?.templateType === "EMAIL" && (
              <>
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium mt-1">{selectedTemplate.subject}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Body</Label>
                  <div
                    className="mt-2 p-4 rounded-lg border bg-white"
                    dangerouslySetInnerHTML={{
                      __html: selectedTemplate.bodyHtml?.replace(/\{\{name\}\}/g, "Juan Dela Cruz")
                        .replace(/\{\{controlNumber\}\}/g, "GMC-2024-001234")
                        .replace(/\{\{certificateType\}\}/g, "Good Moral Certificate")
                        .replace(/\{\{purpose\}\}/g, "Employment")
                        .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
                        .replace(/\{\{expiryDate\}\}/g, "December 31, 2024")
                        .replace(/\{\{remarks\}\}/g, "Additional documents required.") || "",
                    }}
                  />
                </div>
              </>
            )}

            {selectedTemplate?.templateType === "CERTIFICATE" && (
              <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg">
                <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Certificate template preview would be displayed here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  File: {selectedTemplate.filename || "No file uploaded"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" style={{ color: "#ffc400" }} />
              Version History
            </DialogTitle>
            <DialogDescription>{selectedTemplate?.name}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {templateHistory.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                >
                  <div
                    className={`p-2 rounded-full ${
                      entry.action === "CREATE"
                        ? "bg-green-100 text-green-600"
                        : entry.action === "UPDATE"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {entry.action === "CREATE" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : entry.action === "UPDATE" ? (
                      <Edit className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.action}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {entry.user && (
                      <p className="text-sm text-muted-foreground">
                        by {entry.user.name}
                      </p>
                    )}
                    {entry.newValue && (
                      <p className="text-sm mt-1">{entry.newValue}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit List Item Modal */}
      <Dialog open={isListItemModalOpen} onOpenChange={setIsListItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit List Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editItemLabel">Label</Label>
              <Input
                id="editItemLabel"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsListItemModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveListItem} style={{ backgroundColor: "#111c4e" }}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
