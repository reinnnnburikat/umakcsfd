/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Plus, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, isStaff } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This is a common pattern for client-side hydration detection
    // The lint warning is a false positive for this use case
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!isLoading && isAuthenticated && !isStaff) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, isStaff, router]);

  if (isLoading || !isAuthenticated || !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              <span className="flex items-center gap-1">
                ← Back to Public Site
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                3
              </span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActions />
    </div>
  );
}

function FloatingActions() {
  const [expanded, setExpanded] = useState(false);
  const { isStaff } = useAuth();

  if (!isStaff) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col-reverse items-end gap-3 z-50">
      {/* Action Buttons */}
      <div
        className={cn(
          "flex flex-col gap-3 transition-all duration-300",
          expanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <Link href="/dashboard/announcements/new">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/dashboard/complaints/new">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-purple-500 hover:bg-purple-600"
          >
            <FileText className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/dashboard/violations/new">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-red-500 hover:bg-red-600"
          >
            <AlertTriangle className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Expand Button */}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-transform duration-300",
          expanded && "rotate-45"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
