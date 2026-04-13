"use client"

import * as React from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statsCardVariants = cva(
  "relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        gradient: "bg-gradient-primary text-white border-transparent",
        gold: "bg-gradient-gold text-[var(--csfd-navy)] border-transparent",
        outline: "bg-transparent border-2",
        glass: "glass-card",
      },
      hover: {
        none: "",
        lift: "card-hover-lift",
        glow: "card-hover-glow",
        scale: "card-hover-scale",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "lift",
    },
  }
)

interface TrendData {
  value: number
  label?: string
  direction: "up" | "down"
}

interface StatsCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsCardVariants> {
  title: string
  value: number | string
  icon?: LucideIcon
  trend?: TrendData
  formatValue?: (value: number) => string
  prefix?: string
  suffix?: string
  animateValue?: boolean
}

// Animated counter component
function AnimatedCounter({
  value,
  formatValue,
  prefix = "",
  suffix = "",
}: {
  value: number
  formatValue?: (value: number) => string
  prefix?: string
  suffix?: string
}) {
  const spring = useSpring(0, { duration: 1500 })
  const display = useTransform(spring, (current) => {
    const formatted = formatValue ? formatValue(current) : Math.round(current).toLocaleString()
    return `${prefix}${formatted}${suffix}`
  })

  React.useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span className="counter-animate">{display}</motion.span>
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  formatValue,
  prefix = "",
  suffix = "",
  animateValue = true,
  variant = "default",
  hover = "lift",
  className,
  ...props
}: StatsCardProps) {
  const isGradientVariant = variant === "gradient" || variant === "gold"
  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0

  return (
    <motion.div
      className={cn(statsCardVariants({ variant, hover }), className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {/* Background decoration for gradient variants */}
      {isGradientVariant && (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="absolute transform rotate-12 scale-150">
            <div className="w-20 h-20 rounded-full bg-current blur-2xl" />
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              variant === "outline" || variant === "default" || variant === "glass"
                ? "text-muted-foreground"
                : "text-white/80"
            )}
          >
            {title}
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight">
              {typeof value === "number" && animateValue ? (
                <AnimatedCounter
                  value={numericValue}
                  formatValue={formatValue}
                  prefix={prefix}
                  suffix={suffix}
                />
              ) : (
                `${prefix}${typeof value === "number" ? (formatValue ? formatValue(value) : value.toLocaleString()) : value}${suffix}`
              )}
            </p>
          </div>

          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "flex items-center text-sm font-medium",
                  trend.direction === "up" ? "text-green-500" : "text-red-500",
                  isGradientVariant && trend.direction === "up" && "text-green-300",
                  isGradientVariant && trend.direction === "down" && "text-red-300"
                )}
              >
                {trend.direction === "up" ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {trend.value > 0 && "+"}
                {trend.value}%
              </span>
              {trend.label && (
                <span
                  className={cn(
                    "text-sm",
                    variant === "outline" || variant === "default" || variant === "glass"
                      ? "text-muted-foreground"
                      : "text-white/70"
                  )}
                >
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <motion.div
            className={cn(
              "flex items-center justify-center rounded-full p-3",
              variant === "default" && "bg-primary/10 text-primary",
              variant === "gradient" && "bg-white/20 text-white",
              variant === "gold" && "bg-[var(--csfd-navy)]/20 text-[var(--csfd-navy)]",
              variant === "outline" && "bg-muted text-muted-foreground",
              variant === "glass" && "icon-container"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        )}
      </div>

      {/* Hover effect overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </motion.div>
    </motion.div>
  )
}

// Mini stats card for compact displays
interface MiniStatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: number | string
  icon?: LucideIcon
}

export function MiniStatsCard({ title, value, icon: Icon, className, ...props }: MiniStatsCardProps) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      {...props}
    >
      {Icon && (
        <div className="flex items-center justify-center rounded-full bg-primary/10 p-2">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </motion.div>
  )
}

export { statsCardVariants }
