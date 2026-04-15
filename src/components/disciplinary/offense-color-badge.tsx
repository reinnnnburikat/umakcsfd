"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OffenseCategory } from "@prisma/client";

interface OffenseColorBadgeProps {
  category: OffenseCategory;
  count: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

// Color coding configuration
export const offenseColorConfig = {
  MINOR: {
    colors: ["#ffc400", "#ff9500", "#dc2626", "#7c3aed", "#ec4899"],
    labels: ["1st Offense", "2nd Offense", "3rd Offense (Major)", "4th Offense", "5th Offense"],
    becomesMajorAt: 3,
  },
  MAJOR: {
    colors: ["#dc2626", "#7c3aed", "#be123c", "#6b21a8", "#1e293b"],
    labels: ["1st Offense", "2nd Offense", "3rd Offense", "4th Offense", "5th Offense"],
    becomesMajorAt: 1,
  },
  LATE_FACULTY_EVALUATION: {
    colors: ["#ff9500", "#dc2626", "#7c3aed", "#6366f1", "#475569"],
    labels: ["1st Offense", "2nd Offense (Major)", "3rd Offense", "4th Offense", "5th Offense"],
    becomesMajorAt: 2,
  },
  LATE_ACCESS_ROG: {
    colors: ["#ff9500", "#dc2626", "#7c3aed", "#6366f1", "#475569"],
    labels: ["1st Offense", "2nd Offense (Major)", "3rd Offense", "4th Offense", "5th Offense"],
    becomesMajorAt: 2,
  },
  LATE_PAYMENT: {
    colors: ["#ff9500", "#dc2626", "#7c3aed", "#6366f1", "#475569"],
    labels: ["1st Offense", "2nd Offense (Major)", "3rd Offense", "4th Offense", "5th Offense"],
    becomesMajorAt: 2,
  },
  OTHER: {
    colors: ["#6b7280", "#6b7280", "#6b7280", "#6b7280", "#6b7280"],
    labels: ["1st Offense", "2nd Offense", "3rd Offense", "4th Offense", "5th Offense"],
    becomesMajorAt: 999,
  },
};

export function getOffenseColor(category: OffenseCategory, count: number): string {
  const config = offenseColorConfig[category];
  const index = Math.min(count - 1, config.colors.length - 1);
  return config.colors[Math.max(0, index)];
}

export function getOffenseLabel(category: OffenseCategory, count: number): string {
  const config = offenseColorConfig[category];
  const index = Math.min(count - 1, config.labels.length - 1);
  return config.labels[Math.max(0, index)];
}

export function OffenseColorBadge({ category, count, showLabel = true, size = "md" }: OffenseColorBadgeProps) {
  if (count === 0) return null;

  const config = offenseColorConfig[category];
  const colorIndex = Math.min(count - 1, config.colors.length - 1);
  const color = config.colors[Math.max(0, colorIndex)];
  const label = config.labels[Math.max(0, colorIndex)];
  const isMajor = count >= config.becomesMajorAt;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const getCategoryShortName = (cat: OffenseCategory): string => {
    switch (cat) {
      case "MINOR": return "Minor";
      case "MAJOR": return "Major";
      case "LATE_FACULTY_EVALUATION": return "Late Fac";
      case "LATE_ACCESS_ROG": return "Late ROG";
      case "LATE_PAYMENT": return "Late Pay";
      case "OTHER": return "Other";
      default: return cat;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`${sizeClasses[size]} font-medium cursor-help`}
            style={{ backgroundColor: color, color: isMajor || colorIndex >= 2 ? "white" : "black" }}
          >
            {showLabel ? (
              <>
                {getCategoryShortName(category)}: {count} ({label})
              </>
            ) : (
              count
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{category.replace(/_/g, " ")}</p>
            <p>{label}</p>
            {isMajor && (
              <p className="text-red-400 font-medium">Major Offense Level</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface OffenseIndicatorProps {
  category: OffenseCategory;
  count: number;
}

export function OffenseIndicator({ category, count }: OffenseIndicatorProps) {
  if (count === 0) return null;

  const color = getOffenseColor(category, count);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="w-3 h-3 rounded-full cursor-help"
            style={{ backgroundColor: color }}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{category.replace(/_/g, " ")}</p>
          <p>{count} offense(s)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface MultiOffenseIndicatorProps {
  counts: {
    minorCount: number;
    majorCount: number;
    lateFacultyCount: number;
    lateRogCount: number;
    latePaymentCount: number;
    otherCount: number;
  };
}

export function MultiOffenseIndicator({ counts }: MultiOffenseIndicatorProps) {
  const categories: { category: OffenseCategory; count: number }[] = [
    { category: OffenseCategory.MINOR, count: counts.minorCount },
    { category: OffenseCategory.MAJOR, count: counts.majorCount },
    { category: OffenseCategory.LATE_FACULTY_EVALUATION, count: counts.lateFacultyCount },
    { category: OffenseCategory.LATE_ACCESS_ROG, count: counts.lateRogCount },
    { category: OffenseCategory.LATE_PAYMENT, count: counts.latePaymentCount },
    { category: OffenseCategory.OTHER, count: counts.otherCount },
  ];

  const activeCategories = categories.filter((c) => c.count > 0);

  if (activeCategories.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">No offenses</span>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {activeCategories.map(({ category, count }) => (
        <OffenseIndicator key={category} category={category} count={count} />
      ))}
    </div>
  );
}
