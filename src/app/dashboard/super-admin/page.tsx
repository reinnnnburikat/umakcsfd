"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bell,
  FileText,
  Heart,
  Users,
  AlertTriangle,
  Plus,
  PenSquare,
  ClipboardList,
} from "lucide-react";

// Menu items for the slide-in menu
const menuItems = [
  { label: "HOME", path: "/dashboard/super-admin" },
  { label: "GOOD MORAL REQUEST", path: "/dashboard/admin/good-moral" },
  { label: "UNIFORM EXEMPTION REQUEST", path: "/dashboard/admin/uniform-exemption" },
  { label: "CHILD ADMISSION REQUEST", path: "/dashboard/admin/child-admission" },
  { label: "CROSS-DRESSING REQUEST", path: "/dashboard/admin/cross-dressing" },
  { label: "COMPLAINT", path: "/dashboard/admin/complaint" },
  { label: "DISCIPLINARY RECORDS", path: "/dashboard/admin/disciplinary-records" },
  { label: "ABOUT", path: "/about" },
  { label: "FAQs", path: "/faq" },
];

// Statistics cards data
const statsCards = [
  { number: "101", label: "GOOD MORAL REQUEST", icon: FileText },
  { number: "31", label: "UNIFORM EXEMPTION REQUEST", icon: Users },
  { number: "1", label: "CHILD ADMISSION REQUEST", icon: Heart },
  { number: "5", label: "CROSS-DRESSING REQUEST", icon: Users },
  { number: "4", label: "COMPLAINT", icon: AlertTriangle },
];

// Analytics stats data
const analyticsStats = [
  { number: "456", label: "Pending Community Service" },
  { number: "512", label: "Rendered Community Service" },
  { number: "2,149", label: "Good Moral Certificate Request" },
  { number: "2,140", label: "Issued Good Moral Certificate Request" },
];

// Daily summary data
const dailySummaryData = [
  { label: "Filed Complaint - Pending", value: 24, total: 24, color: "#3b82f6" },
  { label: "Filed Complaint - Received", value: 46, total: 46, color: "#3b82f6" },
  { label: "Violation Citation - Received", value: 55, total: 55, color: "#10b981" },
];

// Monthly summary data
const monthlySummaryData = [
  { label: "Filed Complaint - Pending", value: 16, total: 24, color: "#3b82f6" },
  { label: "Filed Complaint - Received", value: 46, total: 46, color: "#3b82f6" },
  { label: "Violation Citation - Received", value: 46, total: 46, color: "#10b981" },
];

// Sample announcements
const sampleAnnouncements = [
  {
    id: 1,
    headline: "Announcement Header",
    details:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Consectetur adipiscing elit quisque faucibus ex sapien vitae. Ex sapien vitae pellentesque sem placerat in id. Placerat in id cursus mi pretium tellus duis. Pretium tellus duis convallis tempus leo eu aenean.",
    postedFrom: "Jan 1, 2024",
    postedTo: "Jan 31, 2024",
  },
];

// Initialize announcements from localStorage or use sample
const getInitialAnnouncements = () => {
  if (typeof window !== "undefined") {
    const storedAnnouncements = JSON.parse(
      localStorage.getItem("announcements") || "[]"
    );
    if (storedAnnouncements.length > 0) {
      return storedAnnouncements;
    }
  }
  return sampleAnnouncements;
};

export default function SuperAdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [announcements] = useState(getInitialAnnouncements);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col overflow-x-hidden">
      {/* Navbar with Hamburger */}
      <nav
        className="text-white px-6 py-4 flex items-center justify-between sticky top-0 z-30"
        style={{ backgroundColor: "#111c4e" }}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/logos/UMAK LOGO.png"
            alt="UMAK Logo"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <Image
            src="/logos/CSFD LOGO.png"
            alt="CSFD Logo"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-sm font-medium hidden sm:block">
            Center for Student Formation and Discipline
          </span>
        </div>

        {/* Hamburger Button */}
        <button
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span
              className={`w-full h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`w-full h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-full h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </div>
        </button>
      </nav>

      {/* Main Content Area with Slide Effect */}
      <div
        className="flex-grow transition-transform duration-300 ease-in-out"
        style={{
          transform: isMenuOpen ? "translateX(-280px)" : "translateX(0)",
        }}
      >
        {/* Statistics Cards Section */}
        <section className="px-4 md:px-8 py-6 md:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {statsCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-md p-4 md:p-6 text-center border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div
                      className="text-3xl md:text-4xl font-black mb-2"
                      style={{ color: "#111c4e" }}
                    >
                      {card.number}
                    </div>
                    <div
                      className="text-xs font-bold leading-tight"
                      style={{ color: "#3d3d3d" }}
                    >
                      {card.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Announcement Section */}
        <section className="px-4 md:px-8 pb-6 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ backgroundColor: "#111c4e" }}
            >
              <h2
                className="text-xl md:text-2xl font-bold text-white mb-6"
              >
                ANNOUNCEMENT
              </h2>

              <div className="flex gap-6">
                {/* Announcement Content */}
                <div className="flex-grow">
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="flex items-start gap-4 pb-4 border-b border-white/20 last:border-b-0"
                      >
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "#ffc400" }}
                        >
                          <Bell className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <h3 className="text-base md:text-lg font-bold text-white">
                              {announcement.headline}
                            </h3>
                            <button className="px-4 py-1.5 rounded-lg text-sm font-medium border border-white/30 text-white hover:bg-white/10 transition-colors">
                              View Details
                            </button>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                            {announcement.details}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-400">
                              Posted: {announcement.postedFrom} -{" "}
                              {announcement.postedTo}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics & Reports Section */}
        <section className="px-4 md:px-8 pb-6 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ backgroundColor: "#111c4e" }}
            >
              <h2
                className="text-xl md:text-2xl font-bold text-white mb-6"
              >
                ANALYTICS & REPORTS
              </h2>

              {/* Top Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {analyticsStats.map((stat, index) => (
                  <div
                    key={index}
                    className="border border-white/30 rounded-xl p-3 md:p-4 text-center"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-xs text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Summary Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Daily Summary */}
                <div className="bg-white rounded-xl p-4 md:p-6">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Daily Summary
                  </h3>
                  <div className="space-y-4">
                    {dailySummaryData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="text-gray-800 font-medium">
                            {item.value}/{item.total}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.value / item.total) * 100}%`,
                              backgroundColor: item.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Summary */}
                <div className="bg-white rounded-xl p-4 md:p-6">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Monthly Summary
                  </h3>
                  <div className="space-y-4">
                    {monthlySummaryData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="text-gray-800 font-medium">
                            {item.value}/{item.total}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.value / item.total) * 100}%`,
                              backgroundColor: item.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Action Buttons */}
        <section className="px-4 md:px-8 pb-8">
          <div className="max-w-6xl mx-auto flex flex-col items-end gap-3">
            {/* FAB Menu Options */}
            <div
              className={`flex flex-col items-end gap-3 transition-all duration-300 ease-in-out ${
                isFabMenuOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
              onMouseEnter={() => setIsFabMenuOpen(true)}
              onMouseLeave={() => setIsFabMenuOpen(false)}
            >
              <button
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-400 transition-colors shadow-lg"
                onClick={() => router.push("/dashboard/admin/announcements/new")}
              >
                Compose an announcement
                <PenSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push("/dashboard/admin/complaint/new")}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-400 transition-colors shadow-lg"
              >
                Encode Complaint
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" />
                </div>
              </button>

              <button
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-400 transition-colors shadow-lg"
                onClick={() => router.push("/dashboard/admin/violation/new")}
              >
                Encode Violation Citation
                <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center">
                  <ClipboardList className="w-3 h-3 text-white" />
                </div>
              </button>
            </div>

            {/* Add Button */}
            <button
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg mt-2 ${
                isFabMenuOpen
                  ? "bg-gray-500 rotate-45"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}
              onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
              onMouseEnter={() => setIsFabMenuOpen(true)}
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>
        </section>
      </div>

      {/* Slide-in Menu from Right */}
      <div
        className={`fixed top-0 right-0 h-full w-72 transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#111c4e" }}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-white rotate-45 translate-y-2"></span>
              <span className="w-full h-0.5 bg-white opacity-0"></span>
              <span className="w-full h-0.5 bg-white -rotate-45 -translate-y-2"></span>
            </div>
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-6 py-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="w-full text-right py-3 border-b border-white/20 text-white hover:text-yellow-400 transition-colors font-medium text-base"
              onClick={() => {
                router.push(item.path);
                setIsMenuOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}

          {/* Logout Button */}
          <button
            className="w-full text-right py-3 border-b border-white/20 text-red-400 hover:text-red-300 transition-colors font-medium text-base"
            onClick={() => {
              setIsMenuOpen(false);
              signOut({ callbackUrl: "/" });
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Overlay for closing menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Footer */}
      <footer
        className="text-white px-6 md:px-12 py-8 md:py-10 transition-transform duration-300 ease-in-out"
        style={{
          backgroundColor: "#3d3d3d",
          transform: isMenuOpen ? "translateX(-280px)" : "translateX(0)",
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          {/* Column 1 - Contact Info */}
          <div className="flex-1">
            <h3
              className="text-lg font-bold mb-5"
              style={{ color: "#ffc400" }}
            >
              Contact us
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
                <span className="text-xs text-white/60">f</span>
              </div>
              <span>@UMak CSFD</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
                <span className="text-xs">🌐</span>
              </div>
              <span>umak.edu.ph/centers/csfd/</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
                <span className="text-xs">📞</span>
              </div>
              <span>8883-1875</span>
            </div>
          </div>

          {/* Column 2 - General Concern */}
          <div className="flex-1">
            <div className="mb-4">
              <span
                className="block text-sm underline mb-1"
                style={{ color: "#ffc400" }}
              >
                For general concern
              </span>
              <div className="flex items-center gap-2">
                <span className="text-white">✉</span>
                <span className="text-sm text-white hover:opacity-80 transition-opacity cursor-pointer">
                  csfd.umak.edu.ph
                </span>
              </div>
            </div>
          </div>

          {/* Column 3 - Complaint Concern */}
          <div className="flex-1">
            <div className="mb-4">
              <span
                className="block text-sm underline mb-1"
                style={{ color: "#ffc400" }}
              >
                For complaint concern
              </span>
              <div className="flex items-center gap-2">
                <span className="text-white">✉</span>
                <span className="text-sm text-white hover:opacity-80 transition-opacity cursor-pointer">
                  umakpsd.umak.edu.ph
                </span>
              </div>
            </div>
          </div>

          {/* Column 4 - Good Moral Certificate */}
          <div className="flex-1">
            <div className="mb-4">
              <span
                className="block text-sm underline mb-1"
                style={{ color: "#ffc400" }}
              >
                For request of good moral certificate concern
              </span>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white">✉</span>
                <span className="text-sm text-white hover:opacity-80 transition-opacity cursor-pointer">
                  csfdgoodmoral.umak.edu.ph
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white">✉</span>
                <span className="text-sm text-white hover:opacity-80 transition-opacity cursor-pointer">
                  csfdgoodmoralcertificate@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* Column 5 - Logos */}
          <div className="flex-1 flex justify-center items-center gap-4">
            <Image
              src="/logos/UMAK LOGO.png"
              alt="University of Makati"
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
            />
            <Image
              src="/logos/CSFD LOGO.png"
              alt="CSFD"
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-6xl mx-auto border-t border-white/20 mt-8 pt-6 text-center">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} University of Makati - Center for
            Student Formation and Discipline. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
