"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

const menuItems = [
  { label: "HOME", path: "/" },
  { label: "SERVICES", path: "/services" },
  { label: "ABOUT", path: "/about" },
  { label: "FAQs", path: "/faq" },
];

export function PublicNavbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div>
      {/* Header */}
      <header
        className="flex justify-between items-center px-6 md:px-12 py-4 shadow-md sticky top-0 z-30"
        style={{ backgroundColor: "#3d3d3d" }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <Image
            src="/logos/UMAK LOGO.png"
            alt="UMak Logo"
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
          />
          <Image
            src="/logos/CSFD LOGO.png"
            alt="CSFD Logo"
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
          />
          <span className="hidden sm:block text-sm md:text-lg text-white">
            Center for Student Formation and Discipline
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="text-white font-medium hover:opacity-80 transition-opacity"
            >
              {item.label}
            </Link>
          ))}
          {status === "authenticated" && session?.user ? (
            <button
              onClick={() => router.push(getDashboardLink())}
              className="text-white font-medium hover:opacity-80 transition-opacity"
            >
              DASHBOARD
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-white font-medium hover:opacity-80 transition-opacity"
            >
              LOG IN
            </Link>
          )}
        </nav>

        {/* Hamburger Menu Button */}
        <button
          className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
          onClick={() => setIsMenuOpen(true)}
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span className="w-full h-0.5 bg-white"></span>
            <span className="w-full h-0.5 bg-white"></span>
            <span className="w-full h-0.5 bg-white"></span>
          </div>
        </button>
      </header>

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-72 transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#111c4e" }}
      >
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
          
          {status === "authenticated" && session?.user ? (
            <>
              <button
                className="w-full text-right py-3 border-b border-white/20 text-white hover:text-yellow-400 transition-colors font-medium text-base"
                onClick={() => {
                  router.push(getDashboardLink());
                  setIsMenuOpen(false);
                }}
              >
                DASHBOARD
              </button>
              <button
                className="w-full text-right py-3 border-b border-white/20 text-red-400 hover:text-red-300 transition-colors font-medium text-base"
                onClick={() => {
                  setIsMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                LOGOUT
              </button>
            </>
          ) : (
            <button
              className="w-full text-right py-3 border-b border-white/20 text-white hover:text-yellow-400 transition-colors font-medium text-base"
              onClick={() => {
                router.push("/auth/login");
                setIsMenuOpen(false);
              }}
            >
              LOG IN
            </button>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}
