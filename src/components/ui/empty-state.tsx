"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { LucideIcon, Inbox, FileX, Search, AlertCircle, FolderOpen } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center p-8",
  {
    variants: {
      size: {
        sm: "py-8",
        default: "py-12",
        lg: "py-16",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const iconContainerVariants = cva(
  "flex items-center justify-center rounded-full mb-4",
  {
    variants: {
      variant: {
        default: "bg-muted",
        primary: "bg-primary/10 text-primary",
        success: "bg-green-500/10 text-green-500",
        warning: "bg-yellow-500/10 text-yellow-500",
        error: "bg-red-500/10 text-red-500",
        muted: "bg-muted text-muted-foreground",
      },
      iconSize: {
        sm: "w-12 h-12",
        default: "w-16 h-16",
        lg: "w-20 h-20",
      },
    },
    defaultVariants: {
      variant: "default",
      iconSize: "default",
    },
  }
)

interface EmptyStateAction {
  label: string
  onClick?: () => void
  href?: string
  icon?: LucideIcon
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive"
}

interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  iconVariant?: VariantProps<typeof iconContainerVariants>["variant"]
  iconSize?: VariantProps<typeof iconContainerVariants>["iconSize"]
  animate?: boolean
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  iconVariant = "primary",
  iconSize = "default",
  size = "default",
  animate = true,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <motion.div
      className={cn(emptyStateVariants({ size }), className)}
      initial={animate ? { opacity: 0, y: 20 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {/* Icon */}
      <motion.div
        className={cn(iconContainerVariants({ variant: iconVariant, iconSize }))}
        initial={animate ? { scale: 0 } : {}}
        animate={animate ? { scale: 1 } : {}}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        <Icon
          className={cn(
            iconSize === "sm" ? "w-6 h-6" : iconSize === "lg" ? "w-10 h-10" : "w-8 h-8"
          )}
        />
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-lg font-semibold"
        initial={animate ? { opacity: 0 } : {}}
        animate={animate ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          className="mt-1 text-sm text-muted-foreground max-w-sm"
          initial={animate ? { opacity: 0 } : {}}
          animate={animate ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      )}

      {/* Action */}
      {action && (
        <motion.div
          className="mt-4"
          initial={animate ? { opacity: 0, y: 10 } : {}}
          animate={animate ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          {action.href ? (
            <Button asChild variant={action.variant || "default"}>
              <a href={action.href}>
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </a>
            </Button>
          ) : (
            <Button onClick={action.onClick} variant={action.variant || "default"}>
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// Preset empty states for common scenarios

interface NoDataStateProps extends Omit<EmptyStateProps, "icon" | "title"> {
  entityName?: string
}

export function NoDataState({ entityName = "data", ...props }: NoDataStateProps) {
  return (
    <EmptyState
      icon={Inbox}
      title={`No ${entityName} found`}
      description={`There are no ${entityName} to display at the moment.`}
      {...props}
    />
  )
}

interface NoResultsStateProps extends Omit<EmptyStateProps, "icon" | "title"> {
  searchTerm?: string
}

export function NoResultsState({ searchTerm, ...props }: NoResultsStateProps) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        searchTerm
          ? `No results match "${searchTerm}". Try a different search term.`
          : "No results match your search criteria. Try adjusting your filters."
      }
      {...props}
    />
  )
}

type NoFilesStateProps = Omit<EmptyStateProps, "icon" | "title">

export function NoFilesState(props: NoFilesStateProps) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No files uploaded"
      description="Upload files to get started."
      {...props}
    />
  )
}

interface ErrorStateProps extends Omit<EmptyStateProps, "icon" | "title"> {
  errorMessage?: string
}

export function ErrorState({ errorMessage, ...props }: ErrorStateProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something went wrong"
      description={errorMessage || "An error occurred while loading data. Please try again."}
      iconVariant="error"
      {...props}
    />
  )
}

interface NotFoundStateProps extends Omit<EmptyStateProps, "icon" | "title"> {
  itemName?: string
}

export function NotFoundState({ itemName = "item", ...props }: NotFoundStateProps) {
  return (
    <EmptyState
      icon={FileX}
      title={`${itemName} not found`}
      description={`The ${itemName.toLowerCase()} you're looking for doesn't exist or has been removed.`}
      {...props}
    />
  )
}

// Skeleton loader for loading states
interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  variant?: "card" | "list" | "table"
}

export function SkeletonLoader({
  count = 3,
  variant = "card",
  className,
  ...props
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)} {...props}>
        {items.map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="skeleton-avatar" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-title" />
              <div className="skeleton-text w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "table") {
    return (
      <div className={cn("border rounded-lg overflow-hidden", className)} {...props}>
        <div className="bg-muted p-4 flex gap-4">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-4 w-20" />
        </div>
        {items.map((i) => (
          <div key={i} className="flex gap-4 p-4 border-t">
            <div className="skeleton h-4 flex-1" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  // Card variant (default)
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)} {...props}>
      {items.map((i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4">
          <div className="skeleton h-32 rounded-md" />
          <div className="space-y-2">
            <div className="skeleton-title" />
            <div className="skeleton-text" />
            <div className="skeleton-text w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export { emptyStateVariants, iconContainerVariants }
