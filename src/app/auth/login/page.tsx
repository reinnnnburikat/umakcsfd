"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Loader2 } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="w-full max-w-md px-8">
      <h2
        className="text-3xl md:text-4xl font-bold mb-8 text-center"
        style={{ color: "#111c4e" }}
      >
        LOGIN
      </h2>

      {error && (
        <div className="mb-6 p-4 rounded-lg flex items-center gap-2" style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
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
            placeholder="Enter your username"
            className="w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: "#111c4e" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: "#111c4e" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        className="w-full py-3 rounded-lg font-medium text-white mb-6 hover:opacity-90 transition-opacity disabled:opacity-50"
        style={{ backgroundColor: "#111c4e" }}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </span>
        ) : (
          "Submit"
        )}
      </button>

      <div className="flex items-center mb-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-gray-500 text-sm">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="text-center">
        <span className="text-gray-600">No account yet? </span>
        <Link
          href="/"
          className="px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity inline-block mt-2"
          style={{ backgroundColor: "#6c757d", color: "white" }}
        >
          Back to Home
        </Link>
      </div>
    </form>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md px-8">
      <div className="h-10 w-24 bg-muted rounded animate-pulse mx-auto mb-8" />
      <div className="space-y-6">
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="h-12 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Left Side - Welcome Section */}
      <div
        className="hidden lg:block lg:w-[30%] relative"
        style={{ backgroundColor: "#111c4e" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/elementfull.png')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        <div className="flex items-center justify-start h-full px-8 relative z-10">
          <div className="text-left text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back,</h1>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "#ffc400" }}
            >
              Heron!
            </h2>
            <p className="text-base font-light">
              University of Makati. University of Character.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Section */}
      <div
        className="flex-1 bg-gray-100 flex items-center justify-center relative"
        style={{ backgroundColor: "#f5f5f5" }}
      >
        {/* Home Link */}
        <div className="absolute top-6 right-6">
          <Link
            href="/"
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: "#111c4e" }}
          >
            ← Back to Home
          </Link>
        </div>

        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
