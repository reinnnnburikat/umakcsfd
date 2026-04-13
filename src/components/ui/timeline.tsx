"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check, Clock, X, AlertCircle, LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const timelineItemVariants = cva(
  "relative flex items-start gap-4 pb-8 last:pb-0",
  {
    variants: {
      alignment: {
        left: "justify-start",
        center: "justify-center",
      },
    },
    defaultVariants: {
      alignment: "left",
    },
  }
)

const timelineDotVariants = cva(
  "relative flex items-center justify-center rounded-full transition-all duration-300",
  {
    variants: {
      size: {
        sm: "w-8 h-8",
        default: "w-10 h-10",
        lg: "w-12 h-12",
      },
      status: {
        completed: "bg-[var(--csfd-success)] text-white shadow-lg",
        active: "bg-[var(--csfd-navy)] text-white shadow-lg ring-4 ring-[var(--csfd-gold)]/30",
        pending: "bg-muted text-muted-foreground border-2 border-dashed border-muted-foreground/30",
        error: "bg-red-500 text-white shadow-lg",
        warning: "bg-yellow-500 text-white shadow-lg",
      },
    },
    defaultVariants: {
      size: "default",
      status: "pending",
    },
  }
)

export interface TimelineItem {
  status: "completed" | "active" | "pending" | "error" | "warning"
  title: string
  description?: string
  date?: string | Date
  icon?: LucideIcon
  completed?: boolean
}

interface TimelineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineItemVariants> {
  items: TimelineItem[]
  size?: "sm" | "default" | "lg"
  showDate?: boolean
  animate?: boolean
}

const statusIcons: Record<string, LucideIcon> = {
  completed: Check,
  active: Clock,
  pending: Clock,
  error: X,
  warning: AlertCircle,
}

export function Timeline({
  items,
  size = "default",
  showDate = true,
  animate = true,
  alignment = "left",
  className,
  ...props
}: TimelineProps) {
  const formatDate = (date: string | Date): string => {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className={cn("relative", className)} {...props}>
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--csfd-gold)] via-[var(--csfd-navy)] to-muted" />

      {/* Timeline items */}
      {items.map((item, index) => {
        const StatusIcon = item.icon || statusIcons[item.status]
        const delay = animate ? index * 0.15 : 0

        return (
          <motion.div
            key={index}
            className={cn(timelineItemVariants({ alignment }))}
            initial={animate ? { opacity: 0, x: -20 } : {}}
            animate={animate ? { opacity: 1, x: 0 } : {}}
            transition={{ delay, duration: 0.4 }}
          >
            {/* Dot */}
            <motion.div
              className={cn(timelineDotVariants({ size, status: item.status }), "relative z-10")}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <StatusIcon
                className={cn(
                  size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"
                )}
              />

              {/* Pulse animation for active items */}
              {item.status === "active" && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-[var(--csfd-navy)]"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <motion.p
                    className={cn(
                      "font-medium",
                      item.status === "completed" && "text-[var(--csfd-success)]",
                      item.status === "active" && "text-[var(--csfd-navy)] dark:text-[var(--csfd-gold)]",
                      item.status === "error" && "text-red-500",
                      item.status === "warning" && "text-yellow-600",
                      item.status === "pending" && "text-muted-foreground"
                    )}
                    initial={animate ? { opacity: 0 } : {}}
                    animate={animate ? { opacity: 1 } : {}}
                    transition={{ delay: delay + 0.1 }}
                  >
                    {item.title}
                  </motion.p>

                  {item.description && (
                    <motion.p
                      className="text-sm text-muted-foreground mt-1"
                      initial={animate ? { opacity: 0 } : {}}
                      animate={animate ? { opacity: 1 } : {}}
                      transition={{ delay: delay + 0.2 }}
                    >
                      {item.description}
                    </motion.p>
                  )}
                </div>

                {showDate && item.date && (
                  <motion.span
                    className="text-xs text-muted-foreground whitespace-nowrap"
                    initial={animate ? { opacity: 0 } : {}}
                    animate={animate ? { opacity: 1 } : {}}
                    transition={{ delay: delay + 0.15 }}
                  >
                    {formatDate(item.date)}
                  </motion.span>
                )}
              </div>

              {/* Status badge */}
              <motion.div
                className="mt-2"
                initial={animate ? { opacity: 0, y: 5 } : {}}
                animate={animate ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: delay + 0.25 }}
              >
                <StatusBadge status={item.status} />
              </motion.div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Status badge component
function StatusBadge({ status }: { status: TimelineItem["status"] }) {
  const labels: Record<string, string> = {
    completed: "Completed",
    active: "In Progress",
    pending: "Pending",
    error: "Error",
    warning: "Warning",
  }

  const badgeStyles: Record<string, string> = {
    completed: "bg-green-500/10 text-green-600 dark:text-green-400",
    active: "bg-[var(--csfd-navy)]/10 text-[var(--csfd-navy)] dark:text-[var(--csfd-gold)]",
    pending: "bg-muted text-muted-foreground",
    error: "bg-red-500/10 text-red-600 dark:text-red-400",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        badgeStyles[status]
      )}
    >
      {labels[status]}
    </span>
  )
}

// Compact timeline for simpler displays
interface CompactTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: { status: TimelineItem["status"]; title: string }[]
}

export function CompactTimeline({ items, className, ...props }: CompactTimelineProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <motion.div
            className={cn(
              "flex items-center justify-center rounded-full w-8 h-8",
              item.status === "completed" && "bg-[var(--csfd-success)] text-white",
              item.status === "active" && "bg-[var(--csfd-navy)] text-white",
              item.status === "pending" && "bg-muted text-muted-foreground"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.status === "completed" ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-xs font-medium">{index + 1}</span>
            )}
          </motion.div>

          {/* Connector */}
          {index < items.length - 1 && (
            <motion.div
              className={cn(
                "flex-1 h-0.5 rounded-full",
                index < items.findIndex((i) => i.status === "active")
                  ? "bg-[var(--csfd-success)]"
                  : "bg-muted"
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1 + 0.05 }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export { timelineItemVariants, timelineDotVariants }
