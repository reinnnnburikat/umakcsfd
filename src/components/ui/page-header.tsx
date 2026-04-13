"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Home } from "lucide-react"

import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  icon?: React.ReactNode
  variant?: "default" | "gradient" | "minimal"
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  icon,
  variant = "default",
  className,
  ...props
}: PageHeaderProps) {
  return (
    <motion.header
      className={cn(
        "mb-8",
        variant === "gradient" && "rounded-xl bg-gradient-primary p-6 text-white",
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <motion.nav
          aria-label="Breadcrumb"
          className={cn(
            "mb-4 flex items-center text-sm",
            variant === "gradient" ? "text-white/70" : "text-muted-foreground"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/"
                className={cn(
                  "flex items-center hover:text-foreground transition-colors",
                  variant === "gradient" && "hover:text-white"
                )}
              >
                <Home className="h-4 w-4" />
              </Link>
            </li>
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "hover:text-foreground transition-colors",
                      variant === "gradient" && "hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      index === breadcrumbs.length - 1 && "font-medium text-foreground",
                      variant === "gradient" && index === breadcrumbs.length - 1 && "text-white"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </motion.nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          {icon && (
            <motion.div
              className={cn(
                "flex items-center justify-center rounded-lg p-3",
                variant === "gradient"
                  ? "bg-white/20"
                  : "bg-primary/10 text-primary"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {icon}
            </motion.div>
          )}

          <div>
            {/* Title */}
            <motion.h1
              className={cn(
                "text-2xl font-bold tracking-tight sm:text-3xl",
                variant === "minimal" && "text-xl sm:text-2xl"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              {title}
            </motion.h1>

            {/* Subtitle */}
            {subtitle && (
              <motion.p
                className={cn(
                  "mt-1 text-sm",
                  variant === "gradient" ? "text-white/80" : "text-muted-foreground"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <motion.div
            className="flex items-center gap-2 shrink-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

// Section Header for subsections
interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <motion.div
      className={cn("mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  )
}

// Divider with optional label
interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
}

export function Divider({ label, className, ...props }: DividerProps) {
  return (
    <div className={cn("relative my-8", className)} {...props}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-sm text-muted-foreground">
            {label}
          </span>
        </div>
      )}
    </div>
  )
}
