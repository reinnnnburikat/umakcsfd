"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Users2,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Key,
  Shield,
  Search,
  Mail,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  MoreHorizontal,
  CheckSquare,
  XSquare,
  Ban,
  RefreshCw,
  Activity,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Sparkles,
  History,
  Calendar,
  UserCheck,
  UserX,
  Settings,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  avatarUrl?: string;
}

interface ActivityLog {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  module: string;
  recordId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FilterState {
  search: string;
  role: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Role permission matrix
const rolePermissions = {
  STUDENT: {
    label: "Student",
    color: "bg-blue-500",
    permissions: {
      viewOwnRequests: true,
      createRequests: true,
      viewOwnProfile: true,
      editOwnProfile: true,
      viewAnnouncements: true,
      submitComplaints: true,
      manageUsers: false,
      manageRequests: false,
      viewReports: false,
      manageSettings: false,
      viewAuditLogs: false,
      manageCMS: false,
    }
  },
  STAFF: {
    label: "Staff",
    color: "bg-green-500",
    permissions: {
      viewOwnRequests: true,
      createRequests: true,
      viewOwnProfile: true,
      editOwnProfile: true,
      viewAnnouncements: true,
      submitComplaints: true,
      manageUsers: false,
      manageRequests: true,
      viewReports: true,
      manageSettings: false,
      viewAuditLogs: false,
      manageCMS: false,
    }
  },
  ADMIN: {
    label: "Admin",
    color: "bg-orange-500",
    permissions: {
      viewOwnRequests: true,
      createRequests: true,
      viewOwnProfile: true,
      editOwnProfile: true,
      viewAnnouncements: true,
      submitComplaints: true,
      manageUsers: true,
      manageRequests: true,
      viewReports: true,
      manageSettings: false,
      viewAuditLogs: true,
      manageCMS: false,
    }
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    color: "bg-amber-400 text-csfd-navy",
    permissions: {
      viewOwnRequests: true,
      createRequests: true,
      viewOwnProfile: true,
      editOwnProfile: true,
      viewAnnouncements: true,
      submitComplaints: true,
      manageUsers: true,
      manageRequests: true,
      viewReports: true,
      manageSettings: true,
      viewAuditLogs: true,
      manageCMS: true,
    }
  }
};

const permissionLabels: Record<string, string> = {
  viewOwnRequests: "View Own Requests",
  createRequests: "Create Requests",
  viewOwnProfile: "View Own Profile",
  editOwnProfile: "Edit Own Profile",
  viewAnnouncements: "View Announcements",
  submitComplaints: "Submit Complaints",
  manageUsers: "Manage Users",
  manageRequests: "Manage Requests",
  viewReports: "View Reports",
  manageSettings: "Manage Settings",
  viewAuditLogs: "View Audit Logs",
  manageCMS: "Manage CMS",
};

// Password generator function
function generatePassword(length = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export default function EnhancedUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  
  // Pagination and filters
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    role: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  
  // Selection for bulk actions
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  
  // Activity log filters
  const [logFilters, setLogFilters] = useState({
    userId: "all",
    action: "all",
    dateFrom: "",
    dateTo: "",
  });
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
    status: "ACTIVE",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      router.push("/dashboard/staff");
    }
  }, [status, session, router]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.role !== "all") params.append("role", filters.role);
      if (filters.status !== "all") params.append("status", filters.status);
      params.append("sortBy", filters.sortBy);
      params.append("sortOrder", filters.sortOrder);
      
      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      
      if (data.data) {
        setUsers(data.data);
        if (data.pagination) {
          setPagination(prev => ({ ...prev, ...data.pagination }));
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams();
      params.append("limit", "50");
      if (logFilters.userId !== "all") params.append("userId", logFilters.userId);
      if (logFilters.action !== "all") params.append("action", logFilters.action);
      if (logFilters.dateFrom) params.append("dateFrom", logFilters.dateFrom);
      if (logFilters.dateTo) params.append("dateTo", logFilters.dateTo);
      
      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await response.json();
      
      if (data.data) {
        setActivityLogs(data.data);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to fetch activity logs");
    } finally {
      setLogsLoading(false);
    }
  }, [logFilters]);

  useEffect(() => {
    if (session?.user?.role && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      fetchUsers();
    }
  }, [session, fetchUsers]);

  useEffect(() => {
    if (activeTab === "activity") {
      fetchActivityLogs();
    }
  }, [activeTab, fetchActivityLogs]);

  // Generate password on mount or when autoGeneratePassword changes
  useEffect(() => {
    if (autoGeneratePassword && createModalOpen) {
      setFormData(prev => ({ ...prev, password: generatePassword() }));
    }
  }, [autoGeneratePassword, createModalOpen]);

  // Handlers
  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("User created successfully");
        setCreateModalOpen(false);
        setFormData({ name: "", email: "", password: "", role: "STAFF", status: "ACTIVE" });
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          name: formData.name,
          role: formData.role,
          status: formData.status,
          password: formData.password || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("User updated successfully");
        setEditModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users?id=${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("User deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAction = async (action: "activate" | "deactivate" | "suspend") => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedUsers,
          status: action === "activate" ? "ACTIVE" : action === "deactivate" ? "INACTIVE" : "SUSPENDED",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Successfully ${action}d ${selectedUsers.length} user(s)`);
        setSelectedUsers([]);
        setBulkActionDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error || `Failed to ${action} users`);
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast.error(`Failed to ${action} users`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
    });
    setEditModalOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const getRoleBadgeStyle = (role: string) => {
    const baseClasses = "text-white font-medium px-2.5 py-0.5 rounded-full text-xs";
    switch (role) {
      case "SUPER_ADMIN":
        return `${baseClasses} bg-amber-400 text-csfd-navy`;
      case "ADMIN":
        return `${baseClasses} bg-orange-500`;
      case "STAFF":
        return `${baseClasses} bg-green-500`;
      case "STUDENT":
        return `${baseClasses} bg-blue-500`;
      case "FACULTY":
        return `${baseClasses} bg-teal-500`;
      default:
        return `${baseClasses} bg-gray-500`;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const baseClasses = "font-medium px-2.5 py-0.5 rounded-full text-xs";
    switch (status) {
      case "ACTIVE":
        return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300`;
      case "INACTIVE":
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`;
      case "SUSPENDED":
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  const handleSort = (column: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(formData.password);
    toast.success("Password copied to clipboard");
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE_USER":
      case "CREATE":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "UPDATE_USER":
      case "UPDATE":
        return <Edit className="h-4 w-4 text-blue-500" />;
      case "DELETE_USER":
      case "DELETE":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "LOGIN":
        return <Lock className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Permissions
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const canCreateUser = isSuperAdmin;
  const canEditUser = isSuperAdmin;
  const canDeleteUser = isSuperAdmin;
  const canBulkAction = isSuperAdmin;
  const canEditPermissions = isSuperAdmin;

  // Loading state
  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-csfd-gold" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-csfd-navy dark:text-white">
              <Users2 className="h-6 w-6 text-csfd-gold" />
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && canBulkAction && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CheckSquare className="h-4 w-4" />
                    {selectedUsers.length} selected
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                    <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                    Activate All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                    <UserX className="h-4 w-4 mr-2 text-gray-500" />
                    Deactivate All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction("suspend")} className="text-red-600">
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedUsers([])}>
                    <XSquare className="h-4 w-4 mr-2" />
                    Clear Selection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {canCreateUser && (
              <Button
                onClick={() => {
                  setFormData({ name: "", email: "", password: generatePassword(), role: "STAFF", status: "ACTIVE" });
                  setAutoGeneratePassword(true);
                  setCreateModalOpen(true);
                }}
                className="bg-csfd-navy hover:bg-csfd-navy/90 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-csfd-navy/10 dark:bg-csfd-navy/20">
            <TabsTrigger value="users" className="gap-2">
              <Users2 className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {/* Filters */}
            <Card className="border-csfd-navy/20">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filters.role} onValueChange={(v) => setFilters(prev => ({ ...prev, role: v }))}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="FACULTY">Faculty</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => fetchUsers()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-csfd-navy/20">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users2 className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your filters or add a new user</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-csfd-navy/5 dark:bg-csfd-navy/10 hover:bg-csfd-navy/10 dark:hover:bg-csfd-navy/20">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedUsers.length === users.length && users.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>
                            <button
                              onClick={() => handleSort("role")}
                              className="flex items-center gap-1 hover:text-csfd-navy dark:hover:text-csfd-gold transition-colors"
                            >
                              Role
                              {filters.sortBy === "role" && (
                                filters.sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              onClick={() => handleSort("status")}
                              className="flex items-center gap-1 hover:text-csfd-navy dark:hover:text-csfd-gold transition-colors"
                            >
                              Status
                              {filters.sortBy === "status" && (
                                filters.sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead>
                            <button
                              onClick={() => handleSort("lastLoginAt")}
                              className="flex items-center gap-1 hover:text-csfd-navy dark:hover:text-csfd-gold transition-colors"
                            >
                              Last Login
                              {filters.sortBy === "lastLoginAt" && (
                                filters.sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-csfd-navy/5 dark:hover:bg-csfd-navy/10 transition-colors">
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() => handleSelectUser(user.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-csfd-gold/30">
                                  <AvatarImage src={user.avatarUrl} />
                                  <AvatarFallback className="bg-csfd-navy text-white font-medium">
                                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.name || "N/A"}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRoleBadgeStyle(user.role)}>
                                {rolePermissions[user.role as keyof typeof rolePermissions]?.label || user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeStyle(user.status)}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Clock className="h-4 w-4" />
                                {user.lastLoginAt
                                  ? new Date(user.lastLoginAt).toLocaleDateString("en-PH", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "Never"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {canEditUser && (
                                    <DropdownMenuItem onClick={() => openEditModal(user)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit User
                                    </DropdownMenuItem>
                                  )}
                                  {canEditUser && (
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedUser(user);
                                      setFormData({ ...formData, password: "" });
                                      setEditModalOpen(true);
                                    }}>
                                      <Key className="h-4 w-4 mr-2" />
                                      Reset Password
                                    </DropdownMenuItem>
                                  )}
                                  {canDeleteUser && user.id !== session?.user?.id && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => openDeleteDialog(user)}
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete User
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={pagination.page === pageNum ? "bg-csfd-navy hover:bg-csfd-navy/90" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {pagination.totalPages > 5 && <span className="px-2">...</span>}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-4">
            {/* Activity Filters */}
            <Card className="border-csfd-navy/20">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Select value={logFilters.userId} onValueChange={(v) => setLogFilters(prev => ({ ...prev, userId: v }))}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name || user.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={logFilters.action} onValueChange={(v) => setLogFilters(prev => ({ ...prev, action: v }))}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="CREATE_USER">Create User</SelectItem>
                      <SelectItem value="UPDATE_USER">Update User</SelectItem>
                      <SelectItem value="DELETE_USER">Delete User</SelectItem>
                      <SelectItem value="LOGIN">Login</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={logFilters.dateFrom}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full md:w-40"
                    placeholder="From date"
                  />
                  <Input
                    type="date"
                    value={logFilters.dateTo}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full md:w-40"
                    placeholder="To date"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Activity List */}
            <Card className="border-csfd-navy/20">
              <CardHeader className="bg-csfd-navy/5 dark:bg-csfd-navy/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-csfd-gold" />
                  Recent Activity
                </CardTitle>
                <CardDescription>User activity and audit trail</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {logsLoading ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No activity found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="divide-y max-h-[500px] overflow-y-auto custom-scrollbar">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-csfd-navy/5 dark:hover:bg-csfd-navy/10 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{log.userName || "System"}</span>
                            <span className="text-muted-foreground">
                              {log.action.replace(/_/g, " ").toLowerCase()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {log.module}
                            </Badge>
                          </div>
                          {log.newValue && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {log.newValue.substring(0, 100)}...
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(log.createdAt).toLocaleString("en-PH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {log.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                {log.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4">
            <Card className="border-csfd-navy/20">
              <CardHeader className="bg-csfd-navy/5 dark:bg-csfd-navy/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-csfd-gold" />
                      Role Permissions Matrix
                    </CardTitle>
                    <CardDescription>
                      View and manage permissions for each role
                    </CardDescription>
                  </div>
                  {canEditPermissions && (
                    <Badge variant="outline" className="bg-csfd-gold/10 text-csfd-gold border-csfd-gold/30">
                      <Settings className="h-3 w-3 mr-1" />
                      Editable
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-csfd-navy/5 dark:bg-csfd-navy/10">
                        <TableHead className="font-semibold">Permission</TableHead>
                        {Object.entries(rolePermissions).map(([key, value]) => (
                          <TableHead key={key} className="text-center font-semibold">
                            <Badge className={value.color}>{value.label}</Badge>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(permissionLabels).map(([permKey, permLabel]) => (
                        <TableRow key={permKey} className="hover:bg-csfd-navy/5 dark:hover:bg-csfd-navy/10">
                          <TableCell className="font-medium">{permLabel}</TableCell>
                          {Object.entries(rolePermissions).map(([roleKey, roleData]) => {
                            const hasPermission = roleData.permissions[permKey as keyof typeof roleData.permissions];
                            return (
                              <TableCell key={roleKey} className="text-center">
                                {canEditPermissions && roleKey !== "SUPER_ADMIN" ? (
                                  <button
                                    className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                      hasPermission
                                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                                    )}
                                  >
                                    {hasPermission ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </button>
                                ) : (
                                  <div
                                    className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center mx-auto",
                                      hasPermission
                                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                                    )}
                                  >
                                    {hasPermission ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </div>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Role Legend */}
            <Card className="border-csfd-navy/20">
              <CardHeader className="bg-csfd-navy/5 dark:bg-csfd-navy/10">
                <CardTitle className="text-lg">Role Descriptions</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(rolePermissions).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-csfd-navy/5 dark:bg-csfd-navy/10">
                      <Badge className={value.color}>{value.label}</Badge>
                      <div className="text-sm text-muted-foreground">
                        {key === "STUDENT" && "Can submit requests and view their own data"}
                        {key === "STAFF" && "Can process requests and manage assigned tasks"}
                        {key === "ADMIN" && "Full access to user management and reports"}
                        {key === "SUPER_ADMIN" && "Complete system access and configuration"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create User Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-csfd-navy dark:text-white">
              <Plus className="h-5 w-5 text-csfd-gold" />
              Create New User
            </DialogTitle>
            <DialogDescription>
              Add a new user account to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@umak.edu.ph"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="FACULTY">Faculty</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password *</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="autoGen" className="text-xs text-muted-foreground">Auto-generate</Label>
                  <Switch
                    id="autoGen"
                    checked={autoGeneratePassword}
                    onCheckedChange={setAutoGeneratePassword}
                  />
                </div>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  disabled={autoGeneratePassword}
                  className="pr-20"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={copyPasswordToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {autoGeneratePassword && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-csfd-gold" />
                  Secure password generated automatically
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="bg-csfd-navy hover:bg-csfd-navy/90 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-csfd-navy dark:text-white">
              <Edit className="h-5 w-5 text-csfd-gold" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="FACULTY">Faculty</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave blank to keep the current password
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="bg-csfd-navy hover:bg-csfd-navy/90 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete User?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account for{" "}
              <strong>{selectedUser?.name || selectedUser?.email}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Confirmation */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to perform this action on {selectedUsers.length} user(s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-csfd-navy hover:bg-csfd-navy/90"
              onClick={() => handleBulkAction("activate")}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
