import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateControlNumber(prefix: string): string {
  const random = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, "0");
  return `${prefix}-${random}`;
}

export function generateTrackingToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateQRCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: "bg-blue-500",
    PROCESSING: "bg-yellow-500",
    ISSUED: "bg-green-500",
    HOLD: "bg-gray-500",
    REJECTED: "bg-red-500",
    PENDING: "bg-blue-500",
    UNDER_REVIEW: "bg-yellow-500",
    RESOLVED: "bg-green-500",
    DISMISSED: "bg-gray-500",
    REOPENED: "bg-orange-500",
    MAJOR: "bg-red-500",
    MINOR: "bg-orange-500",
    OTHER: "bg-yellow-500",
    VALID: "bg-green-500",
    EXPIRED: "bg-amber-500",
    NOT_FOUND: "bg-red-500",
    NOT_ISSUED: "bg-blue-500",
  };
  return colors[status] || "bg-gray-500";
}

export function getStatusBadgeClass(status: string): string {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const color = getStatusColor(status);
  return `${base} ${color} text-white`;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}
