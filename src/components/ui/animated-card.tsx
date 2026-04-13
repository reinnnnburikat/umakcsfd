"use client"

import * as React from "react"
import { motion, type MotionProps } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const animatedCardVariants = cva(
  "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "border-transparent shadow-lg",
        outline: "bg-transparent shadow-none",
        glass: "glass-card border-0",
        gradient: "bg-gradient-primary text-white border-transparent",
      },
      hover: {
        none: "",
        lift: "card-hover-lift",
        glow: "card-hover-glow",
        scale: "card-hover-scale",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "lift",
      padding: "default",
    },
  }
)

// Entrance animation variants
const entranceVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
}

type EntranceVariant = keyof typeof entranceVariants

interface AnimatedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof animatedCardVariants> {
  children: React.ReactNode
  animation?: EntranceVariant
  delay?: number
  duration?: number
  asChild?: boolean
  whileHover?: MotionProps["whileHover"]
  whileTap?: MotionProps["whileTap"]
}

export function AnimatedCard({
  children,
  className,
  variant = "default",
  hover = "lift",
  padding = "default",
  animation = "slideUp",
  delay = 0,
  duration = 0.4,
  asChild = false,
  whileHover,
  whileTap,
  ...props
}: AnimatedCardProps) {
  const MotionComponent = motion.div

  const hoverEffect = React.useMemo(() => {
    if (whileHover) return whileHover
    if (hover === "lift") return { y: -4 }
    if (hover === "glow") return { boxShadow: "0 0 20px rgba(255, 196, 0, 0.3)" }
    if (hover === "scale") return { scale: 1.02 }
    return {}
  }, [hover, whileHover])

  return (
    <MotionComponent
      className={cn(animatedCardVariants({ variant, hover, padding }), className)}
      initial={entranceVariants[animation].initial}
      animate={entranceVariants[animation].animate}
      exit={entranceVariants[animation].exit}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={hover !== "none" ? hoverEffect : undefined}
      whileTap={whileTap || (hover !== "none" ? { scale: 0.98 } : undefined)}
      {...props}
    >
      {children}

      {/* Shine effect on hover for gradient cards */}
      {variant === "gradient" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>
      )}
    </MotionComponent>
  )
}

// Card Header component
interface AnimatedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function AnimatedCardHeader({ children, className, ...props }: AnimatedCardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Card Title component
interface AnimatedCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export function AnimatedCardTitle({
  children,
  className,
  as: Component = "h3",
  ...props
}: AnimatedCardTitleProps) {
  return (
    <Component
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// Card Description component
interface AnimatedCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function AnimatedCardDescription({ children, className, ...props }: AnimatedCardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
}

// Card Content component
interface AnimatedCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function AnimatedCardContent({ children, className, ...props }: AnimatedCardContentProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

// Card Footer component
interface AnimatedCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function AnimatedCardFooter({ children, className, ...props }: AnimatedCardFooterProps) {
  return (
    <div
      className={cn("flex items-center pt-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Preset card variants for common use cases

// Feature Card - for showcasing features
interface FeatureCardProps extends Omit<AnimatedCardProps, "variant" | "hover"> {
  icon?: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description, ...props }: FeatureCardProps) {
  return (
    <AnimatedCard variant="default" hover="lift" {...props}>
      {icon && (
        <motion.div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: (props.delay || 0) + 0.1, type: "spring" }}
        >
          {icon}
        </motion.div>
      )}
      <AnimatedCardHeader>
        <AnimatedCardTitle>{title}</AnimatedCardTitle>
        <AnimatedCardDescription>{description}</AnimatedCardDescription>
      </AnimatedCardHeader>
    </AnimatedCard>
  )
}

// Stat Card Mini - for quick stats
interface StatCardMiniProps extends Omit<AnimatedCardProps, "variant" | "padding"> {
  label: string
  value: string | number
  icon?: React.ReactNode
}

export function StatCardMini({ label, value, icon, ...props }: StatCardMiniProps) {
  return (
    <AnimatedCard variant="default" padding="sm" hover="scale" {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon && (
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
      </div>
    </AnimatedCard>
  )
}

export { animatedCardVariants, entranceVariants }
