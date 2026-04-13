"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertCircle, Loader2, Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";

function PortalLoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/staff";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (session?.user) {
          switch (session.user.role) {
            case "SUPER_ADMIN":
              router.push("/dashboard/super-admin");
              break;
            case "ADMIN":
              router.push("/dashboard/admin");
              break;
            default:
              router.push("/dashboard/staff");
          }
        } else {
          router.push(callbackUrl);
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="w-full max-w-md"
    >
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/logos/UMAK LOGO.png"
              alt="UMak Logo"
              width={60}
              height={60}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/30"
            />
          </div>
          <div className="relative">
            <Image
              src="/logos/CSFD LOGO.png"
              alt="CSFD Logo"
              width={60}
              height={60}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/30"
            />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Staff Portal
        </h1>
        <p className="text-white/60 text-sm">
          Authorized personnel only
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg flex items-center gap-2 bg-red-500/20 text-red-200 border border-red-500/30"
        >
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-2">Email Address</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#ffc400] focus:ring-1 focus:ring-[#ffc400] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#ffc400] focus:ring-1 focus:ring-[#ffc400] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 mt-6 rounded-lg font-bold text-[#111c4e] bg-[#ffc400] hover:bg-[#ffc400]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            Sign In
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#ffc400] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white/80 text-sm font-medium">Security Notice</p>
            <p className="text-white/50 text-xs mt-1">
              This portal is restricted to authorized CSFD personnel only. All login attempts are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </motion.form>
  );
}

function PortalLoginSkeleton() {
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8 gap-4">
        <div className="w-16 h-16 bg-white/10 rounded-full animate-pulse" />
        <div className="w-16 h-16 bg-white/10 rounded-full animate-pulse" />
      </div>
      <div className="h-8 w-32 bg-white/10 rounded mx-auto mb-4 animate-pulse" />
      <div className="h-4 w-40 bg-white/10 rounded mx-auto mb-8 animate-pulse" />
      <div className="space-y-4">
        <div className="h-12 bg-white/10 rounded animate-pulse" />
        <div className="h-12 bg-white/10 rounded animate-pulse" />
        <div className="h-12 bg-[#ffc400]/20 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #111c4e 0%, #0a1229 100%)",
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-[#ffc400]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-[#ffc400]/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              iCSFD<span className="text-[#ffc400]">+</span>
            </h1>
            <p className="text-xl text-white/60 mb-8">
              Integrated CSFD Digital Management System
            </p>
            <p className="text-white/40 text-sm">
              University of Makati - Center for Student Welfare and Development
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{
          background: "linear-gradient(135deg, #0a1229 0%, #111c4e 100%)",
        }}
      >
        <Suspense fallback={<PortalLoginSkeleton />}>
          <PortalLoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
