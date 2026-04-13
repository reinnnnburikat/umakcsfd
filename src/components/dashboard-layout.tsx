"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  FileCheck,
  Shirt,
  Users,
  BadgeCheck,
  MessageSquareWarning,
  Settings,
  Users2,
  FileText,
  BarChart3,
  Bell,
  Megaphone,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const sidebarNavItems: SidebarNavItem[] = [
  { title: "Dashboard", href: "/dashboard/staff", icon: LayoutDashboard },
  { title: "Good Moral Requests", href: "/services/gmc/manage", icon: FileCheck },
  { title: "Uniform Exemption", href: "/services/uer/manage", icon: Shirt },
  { title: "Cross-Dressing", href: "/services/cdc/manage", icon: BadgeCheck },
  { title: "Child Admission", href: "/services/cac/manage", icon: Users },
  { title: "Complaints", href: "/complaint/manage", icon: MessageSquareWarning },
  { title: "Announcements", href: "/announcements/manage", icon: Megaphone },
  { title: "Reports", href: "/reports", icon: BarChart3 },
];

const adminNavItems: SidebarNavItem[] = [
  { title: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { title: "All Requests", href: "/dashboard/admin/requests", icon: ClipboardList },
  { title: "User Management", href: "/users", icon: Users2 },
  { title: "Announcements", href: "/announcements/manage", icon: Megaphone },
  { title: "Reports", href: "/reports", icon: BarChart3 },
];

const superAdminNavItems: SidebarNavItem[] = [
  { title: "Dashboard", href: "/dashboard/super-admin", icon: LayoutDashboard },
  { title: "All Requests", href: "/dashboard/super-admin/requests", icon: ClipboardList },
  { title: "User Management", href: "/users", icon: Users2 },
  { title: "Announcements", href: "/announcements/manage", icon: Megaphone },
  { title: "CMS", href: "/cms", icon: FileText },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
  { title: "Reports", href: "/reports", icon: BarChart3 },
];

function getNavItems(role: string | undefined): SidebarNavItem[] {
  switch (role) {
    case "SUPER_ADMIN":
      return superAdminNavItems;
    case "ADMIN":
      return adminNavItems;
    default:
      return sidebarNavItems;
  }
}

interface SidebarContentProps {
  collapsed: boolean;
  navItems: SidebarNavItem[];
  pathname: string;
  userName?: string;
  onNavClick?: () => void;
}

function SidebarContent({ collapsed, navItems, pathname, userName, onNavClick }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
            i+
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-lg">iCSFD+</div>
              <div className="text-xs text-muted-foreground">Dashboard</div>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-orange-500 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        {!collapsed && (
          <div className="text-xs text-muted-foreground mb-2">
            Logged in as <span className="font-medium text-foreground">{userName}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = getNavItems(session?.user?.role);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300 hidden md:block",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          navItems={navItems}
          pathname={pathname}
          userName={session?.user?.name}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 -right-3 h-6 w-6 rounded-full border bg-background shadow-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent
            collapsed={false}
            navItems={navItems}
            pathname={pathname}
            userName={session?.user?.name}
            onNavClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          collapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-16 px-4 md:px-6 ml-12 md:ml-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">iCSFD+</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                      {session?.user?.name?.charAt(0) || "U"}
                    </div>
                    <span className="hidden sm:inline">{session?.user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-red-600 focus:text-red-600"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
