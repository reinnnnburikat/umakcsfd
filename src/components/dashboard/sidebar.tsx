"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  FileText,
  Shirt,
  Users,
  Baby,
  AlertTriangle,
  Settings,
  User,
  Bell,
  Megaphone,
  BarChart3,
  Shield,
  Database,
  Clock,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Home,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";

// Color scheme
const COLORS = {
  primary: "#111c4e",
  accent: "#ffc400",
  success: "#1F9E55",
  danger: "#dc2626",
};

// Navigation structure grouped by category
interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Requests",
    items: [
      {
        title: "Good Moral Request",
        href: "/dashboard/requests/gmc",
        icon: FileText,
      },
      {
        title: "Uniform Exemption",
        href: "/dashboard/requests/uer",
        icon: Shirt,
      },
      {
        title: "Cross-Dressing Clearance",
        href: "/dashboard/requests/cdc",
        icon: Users,
      },
      {
        title: "Child Admission",
        href: "/dashboard/requests/cac",
        icon: Baby,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Complaints",
        href: "/dashboard/complaints",
        icon: AlertTriangle,
      },
      {
        title: "Announcements",
        href: "/dashboard/announcements",
        icon: Megaphone,
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        adminOnly: true,
      },
      {
        title: "User Management",
        href: "/dashboard/users",
        icon: User,
        adminOnly: true,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Templates",
        href: "/dashboard/templates",
        icon: FileText,
        superAdminOnly: true,
      },
      {
        title: "CMS",
        href: "/dashboard/cms",
        icon: Database,
        superAdminOnly: true,
      },
      {
        title: "Audit Logs",
        href: "/dashboard/audit-logs",
        icon: Shield,
        superAdminOnly: true,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        superAdminOnly: true,
      },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, isStaff, isAdmin, isSuperAdmin, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Filter navigation items based on user role
  const filteredNavGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.superAdminOnly) return isSuperAdmin;
      if (item.adminOnly) return isAdmin;
      return isStaff;
    }),
  })).filter((group) => group.items.length > 0);

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "ADMIN":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      default:
        return `bg-gradient-to-r from-[${COLORS.primary}] to-[#2a3a6e]`;
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen transition-all duration-300 ease-in-out relative",
          isCollapsed ? "w-[70px]" : "w-64"
        )}
        style={{
          background: `linear-gradient(180deg, ${COLORS.primary} 0%, #0a1229 100%)`,
        }}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm pointer-events-none" />
        
        {/* Header / Logo Area */}
        <div
          className={cn(
            "relative flex items-center h-16 px-3 border-b border-white/10",
            isCollapsed && "justify-center px-2"
          )}
        >
          {/* Logo with gradient background */}
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffc400] to-[#ff8c00] rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffc400] to-[#ff8c00] text-[#111c4e] font-bold text-xs shadow-lg">
                  CSFD
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm tracking-wide">iCSFD+</span>
                <span className="text-[10px] text-white/50">University of Makati</span>
              </div>
            </Link>
          )}
          
          {isCollapsed && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffc400] to-[#ff8c00] rounded-lg blur-sm opacity-50" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffc400] to-[#ff8c00] text-[#111c4e] font-bold text-xs shadow-lg">
                CSFD
              </div>
            </div>
          )}
          
          {/* Notification Bell - only show when not collapsed */}
          {!isCollapsed && (
            <div className="ml-auto mr-2">
              <NotificationBell variant="sidebar" />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200",
              isCollapsed && "relative right-0"
            )}
          >
            <div className="relative w-4 h-4">
              <Menu
                className={cn(
                  "absolute inset-0 h-4 w-4 transition-all duration-300",
                  isCollapsed ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
                )}
              />
              <X
                className={cn(
                  "absolute inset-0 h-4 w-4 transition-all duration-300",
                  isCollapsed ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"
                )}
              />
            </div>
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4 relative">
          <nav className="space-y-4">
            {filteredNavGroups.map((group, groupIndex) => (
              <div key={group.title} className="space-y-1">
                {/* Group Title */}
                {!isCollapsed && (
                  <div className="px-3 mb-2">
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                      {group.title}
                    </span>
                  </div>
                )}
                
                {/* Separator between groups */}
                {groupIndex > 0 && (
                  <div className={cn(
                    "h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2",
                    isCollapsed && "mx-2"
                  )} />
                )}
                
                {/* Nav Items */}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const isHovered = hoveredItem === item.href;

                  const NavItemContent = (
                    <Link
                      key={item.href}
                      href={item.href}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group overflow-hidden",
                        isCollapsed && "justify-center px-2",
                        isActive
                          ? "text-white"
                          : "text-white/60 hover:text-white"
                      )}
                    >
                      {/* Active State Indicator - Gold Left Border */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#ffc400] to-[#ff8c00] rounded-r-full shadow-lg shadow-[#ffc400]/30" />
                      )}
                      
                      {/* Hover Background with slide effect */}
                      <div
                        className={cn(
                          "absolute inset-0 rounded-lg transition-all duration-300 ease-out",
                          isActive
                            ? "bg-white/15"
                            : isHovered
                            ? "bg-white/10 translate-x-0"
                            : "-translate-x-full bg-white/5"
                        )}
                      />
                      
                      {/* Icon */}
                      <div className="relative z-10">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-all duration-200",
                            isActive && "text-[#ffc400]",
                            isHovered && !isActive && "translate-x-0.5"
                          )}
                        />
                      </div>
                      
                      {/* Text with slide animation */}
                      {!isCollapsed && (
                        <span
                          className={cn(
                            "relative z-10 transition-all duration-200",
                            isHovered && "translate-x-1"
                          )}
                        >
                          {item.title}
                        </span>
                      )}
                      
                      {/* Active dot indicator */}
                      {isActive && !isCollapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ffc400] animate-pulse" />
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          {NavItemContent}
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-[#111c4e] border-white/10 text-white"
                        >
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return NavItemContent;
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User Menu Section */}
        <div className="relative border-t border-white/10 p-3">
          {/* User Info */}
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg bg-white/5 backdrop-blur-sm",
              isCollapsed && "justify-center p-2"
            )}
          >
            {/* Avatar with gradient background */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffc400] to-[#ff8c00] rounded-full blur-sm opacity-50" />
              <Avatar className="relative h-9 w-9 border-2 border-white/20">
                <AvatarImage src={user?.image} alt={user?.name || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-[#ffc400] to-[#ff8c00] text-[#111c4e] font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/50 truncate capitalize">
                  {user?.role?.replace("_", " ").toLowerCase()}
                </p>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full mt-2 justify-start text-white/60 hover:text-[#dc2626] hover:bg-[#dc2626]/10 transition-all duration-200 group"
            >
              <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
              <span>Logout</span>
            </Button>
          )}
          
          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="w-full mt-2 text-white/60 hover:text-[#dc2626] hover:bg-[#dc2626]/10 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#111c4e] border-white/10 text-white"
              >
                Logout
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
