"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";

function LoginFormContent() {
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
      transition={{ duration: 0.5, delay: 0.2 }}
      onSubmit={handleSubmit}
      className="w-full max-w-md px-8"
    >
      {/* Staff/Admin Notice */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-6 p-4 rounded-lg border-2"
        style={{
          backgroundColor: "#111c4e10",
          borderColor: "#111c4e30",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full" style={{ backgroundColor: "#111c4e" }}>
            <Shield className="h-5 w-5 text-[#ffc400]" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#111c4e" }}>
              Staff Portal
            </p>
            <p className="text-xs text-muted-foreground">
              This portal is for CSFD Staff and Administrators only.
            </p>
          </div>
        </div>
      </motion.div>

      <h2
        className="text-3xl md:text-4xl font-bold mb-2 text-center"
        style={{ color: "#111c4e" }}
      >
        PORTAL LOGIN
      </h2>
      <p className="text-center text-sm text-muted-foreground mb-8">
        Enter your credentials to access the dashboard
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 rounded-lg flex items-center gap-2"
          style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      <div className="mb-5">
        <label className="block text-sm font-medium mb-2" style={{ color: "#111c4e" }}>
          Email Address
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Enter your email"
            className="w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: "#111c4e30" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = "#111c4e"}
            onBlur={(e) => e.target.style.borderColor = "#111c4e30"}
            required
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium mb-2" style={{ color: "#111c4e" }}>
          Password
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Lock className="w-5 h-5" />
          </span>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: "#111c4e30" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = "#111c4e"}
            onBlur={(e) => e.target.style.borderColor = "#111c4e30"}
            required
          />
        </div>
      </div>

      <div className="mb-6 text-right">
        <Link
          href="/auth/forgot-password"
          className="text-sm hover:opacity-80 transition-opacity"
          style={{ color: "#111c4e" }}
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-lg font-medium text-white mb-6 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ backgroundColor: "#111c4e" }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      <div className="flex items-center mb-6">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-4 text-gray-400 text-sm">or</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <div className="text-center">
        <span className="text-gray-500 text-sm">Need to request a certificate? </span>
        <Link
          href="/"
          className="text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: "#111c4e" }}
        >
          Back to Home
        </Link>
      </div>
    </motion.form>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md px-8">
      <div className="h-20 bg-muted rounded animate-pulse mb-6" />
      <div className="h-10 w-40 bg-muted rounded animate-pulse mx-auto mb-2" />
      <div className="h-4 w-60 bg-muted rounded animate-pulse mx-auto mb-8" />
      <div className="space-y-5">
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="h-12 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Welcome Section */}
      <div
        className="hidden lg:flex lg:w-[40%] relative overflow-hidden"
        style={{ backgroundColor: "#111c4e" }}
      >
        {/* Decorative Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/elementfull.png')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.8,
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111c4e]/90 via-[#111c4e]/70 to-[#0a1229]/90" />

        {/* Decorative Orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: "#ffc400" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: "#ffc400" }}
        />

        {/* Content */}
        <div className="flex items-center justify-center h-full px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left text-white max-w-md"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm p-1">
                  <img
                    src="/logos/UMAK LOGO.png"
                    alt="UMak Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm p-1">
                  <img
                    src="/logos/CSFD LOGO.png"
                    alt="CSFD Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Welcome back,
            </h1>
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "#ffc400" }}
            >
              Heron!
            </h2>

            <div className="w-20 h-1 rounded-full mb-6" style={{ backgroundColor: "#ffc400" }} />

            <p className="text-lg text-white/80 mb-4">
              University of Makati
            </p>
            <p className="text-base text-white/60">
              University of Character
            </p>

            <div className="mt-12 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-[#ffc400]" />
                <div>
                  <p className="font-semibold text-white">Secure Portal</p>
                  <p className="text-sm text-white/60">Authorized personnel only</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Section */}
      <div
        className="flex-1 bg-gray-50 flex items-center justify-center relative"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        {/* Home Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute top-6 right-6"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity px-4 py-2 rounded-lg hover:bg-gray-100"
            style={{ color: "#111c4e" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#111c4e] p-1">
            <img
              src="/logos/CSFD LOGO.png"
              alt="CSFD Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-[#111c4e]">iCSFD+</span>
        </div>

        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginFormContent />
        </Suspense>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-muted-foreground">
          <p>iCSFD+ Digital Management System &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
