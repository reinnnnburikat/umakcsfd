"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  FileText,
  Shirt,
  Users,
  Baby,
  AlertTriangle,
  HelpCircle,
  Info,
  Phone,
  Bell,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";

// Color scheme
const COLORS = {
  primary: "#111c4e",
  accent: "#ffc400",
  success: "#1F9E55",
  danger: "#dc2626",
};

const menuItems = [
  { label: "HOME", path: "/", icon: Home },
  { label: "ABOUT", path: "/about", icon: Info },
  { label: "FAQs", path: "/faq", icon: HelpCircle },
  { label: "CONTACT", path: "/contact", icon: Phone },
];

const serviceItems = [
  { label: "Good Moral Certificate", path: "/services/gmc", icon: FileText, description: "Request certificate of good moral character" },
  { label: "Uniform Exemption", path: "/services/uer", icon: Shirt, description: "Apply for uniform exemption" },
  { label: "Cross-Dressing Clearance", path: "/services/cdc", icon: Users, description: "Request cross-dressing clearance" },
  { label: "Child Admission", path: "/services/cac", icon: Baby, description: "Apply for child admission clearance" },
  { label: "File a Complaint", path: "/complaints", icon: AlertTriangle, description: "Submit student complaints" },
];

export function PublicNavbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!session?.user?.role) return "/auth/login";
    switch (session.user.role) {
      case "SUPER_ADMIN":
        return "/dashboard/super-admin";
      case "ADMIN":
        return "/dashboard/admin";
      default:
        return "/dashboard/staff";
    }
  };

  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Main Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "py-2 shadow-lg"
            : "py-3"
        )}
        style={{
          background: isScrolled
            ? `linear-gradient(135deg, ${COLORS.primary}ee 0%, #0a1229ee 100%)`
            : `linear-gradient(135deg, ${COLORS.primary} 0%, #0a1229 100%)`,
          backdropFilter: isScrolled ? "blur(12px)" : "blur(8px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#ffc400]/30 rounded-full blur-sm group-hover:bg-[#ffc400]/50 transition-colors" />
                  <Image
                    src="/logos/UMAK LOGO.png"
                    alt="UMak Logo"
                    width={40}
                    height={40}
                    className="relative w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-white/20"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-[#ffc400]/30 rounded-full blur-sm group-hover:bg-[#ffc400]/50 transition-colors" />
                  <Image
                    src="/logos/CSFD LOGO.png"
                    alt="CSFD Logo"
                    width={40}
                    height={40}
                    className="relative w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-white/20"
                  />
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-white font-bold text-sm md:text-base tracking-wide group-hover:text-[#ffc400] transition-colors">
                  CSFD
                </span>
                <span className="text-white/50 text-[10px] md:text-xs">
                  University of Makati
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                      isActive
                        ? "text-[#ffc400]"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#ffc400] rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* Services Dropdown */}
              <DropdownMenu open={isServicesOpen} onOpenChange={setIsServicesOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      pathname.startsWith("/services") || pathname === "/complaints"
                        ? "text-[#ffc400]"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span>SERVICES</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isServicesOpen && "rotate-180"
                      )}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 bg-[#111c4e]/95 backdrop-blur-lg border-white/10 text-white"
                >
                  <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                    Available Services
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {serviceItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.path}
                        className="focus:bg-white/10 focus:text-white cursor-pointer py-3"
                        onClick={() => router.push(item.path)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-white/10">
                            <Icon className="h-4 w-4 text-[#ffc400]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-xs text-white/50">
                              {item.description}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <div className="ml-2">
                <ThemeToggle />
              </div>

              {/* Notification Bell - only show when logged in */}
              {status === "authenticated" && session?.user && (
                <div className="ml-1">
                  <NotificationBell variant="navbar" />
                </div>
              )}

              {/* Auth Button - Show Login when not authenticated, User Menu when authenticated */}
              {status === "authenticated" && session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors">
                      <Avatar className="h-8 w-8 border-2 border-white/20">
                        <AvatarImage src={session.user.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-[#ffc400] to-[#ff8c00] text-[#111c4e] font-bold text-sm">
                          {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden xl:block">{session.user.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-[#111c4e]/95 backdrop-blur-lg border-white/10 text-white"
                  >
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{session.user.name}</span>
                        <span className="text-xs text-white/50 capitalize">
                          {session.user.role?.replace("_", " ").toLowerCase()}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      className="focus:bg-white/10 focus:text-white cursor-pointer"
                      onClick={() => router.push(getDashboardLink())}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-white/10 focus:text-white cursor-pointer"
                      onClick={() => router.push("/dashboard/profile")}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      className="focus:bg-red-500/20 focus:text-red-400 cursor-pointer text-red-400"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  className="ml-2 bg-gradient-to-r from-[#ffc400] to-[#ff9500] text-[#111c4e] font-bold hover:from-[#ffc400] hover:to-[#ffaa00] transition-all"
                >
                  Login
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              
              <button
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[60px] md:h-[64px]" />

      {/* Mobile Slide-in Menu */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 transition-transform duration-300 ease-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          background: `linear-gradient(180deg, ${COLORS.primary} 0%, #0a1229 100%)`,
        }}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl pointer-events-none" />
        
        {/* Menu Header */}
        <div className="relative flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Image
              src="/logos/CSFD LOGO.png"
              alt="CSFD Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-bold text-white">CSFD</span>
          </div>
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="relative p-4 overflow-y-auto h-[calc(100%-80px)]">
          {/* User Info if logged in */}
          {status === "authenticated" && session?.user && (
            <div className="mb-6 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-[#ffc400]/50">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#ffc400] to-[#ff8c00] text-[#111c4e] font-bold">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{session.user.name}</p>
                  <p className="text-xs text-white/50 capitalize">
                    {session.user.role?.replace("_", " ").toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-[#ffc400]"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ffc400]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Services Section */}
          <div className="mt-6">
            <h3 className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              Services
            </h3>
            <div className="space-y-1">
              {serviceItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/10 text-[#ffc400]"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auth Buttons */}
          {status === "authenticated" && session?.user ? (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="space-y-2">
                {/* Notifications in Mobile Menu */}
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/10 mb-3">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-[#ffc400]" />
                    <span className="text-white">Notifications</span>
                  </div>
                  <NotificationBell variant="navbar" />
                </div>
                <button
                  onClick={() => handleNavigate(getDashboardLink())}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium text-white bg-gradient-to-r from-[#ffc400]/20 to-[#ff8c00]/20 hover:from-[#ffc400]/30 hover:to-[#ff8c00]/30 transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5 text-[#ffc400]" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t border-white/10">
              <Button
                onClick={() => handleNavigate("/login")}
                className="w-full bg-gradient-to-r from-[#ffc400] to-[#ff9500] text-[#111c4e] font-bold hover:from-[#ffc400] hover:to-[#ffaa00] transition-all"
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />
    </>
  );
}
