"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const wizardVariants = cva("flex", {
  variants: {
    orientation: {
      horizontal: "flex-row items-center",
      vertical: "flex-col items-start",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
})

const stepVariants = cva(
  "relative flex items-center justify-center rounded-full font-semibold transition-all duration-300 cursor-pointer",
  {
    variants: {
      size: {
        sm: "w-8 h-8 text-sm",
        default: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
      },
      status: {
        completed: "bg-[var(--csfd-success)] text-white shadow-lg",
        active: "bg-[var(--csfd-navy)] text-white shadow-lg",
        pending: "bg-muted text-muted-foreground border-2 border-dashed border-muted-foreground/30",
      },
    },
    defaultVariants: {
      size: "default",
      status: "pending",
    },
  }
)

const connectorVariants = cva("transition-all duration-500", {
  variants: {
    orientation: {
      horizontal: "h-1 flex-1 mx-2",
      vertical: "w-1 ml-5 min-h-8",
    },
    status: {
      completed: "bg-gradient-to-r from-[var(--csfd-success)] to-[var(--csfd-gold)]",
      active: "bg-gradient-to-r from-[var(--csfd-gold)] to-[var(--csfd-navy)]",
      pending: "bg-muted",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    status: "pending",
  },
})

export interface WizardStep {
  title: string
  description?: string
  icon?: LucideIcon
}

interface WizardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof wizardVariants> {
  steps: WizardStep[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  size?: "sm" | "default" | "lg"
  showLabels?: boolean
}

export function Wizard({
  steps,
  currentStep,
  onStepClick,
  orientation = "horizontal",
  size = "default",
  showLabels = true,
  className,
  ...props
}: WizardProps) {
  const getStepStatus = (index: number): "completed" | "active" | "pending" => {
    if (index < currentStep) return "completed"
    if (index === currentStep) return "active"
    return "pending"
  }

  const getConnectorStatus = (index: number): "completed" | "active" | "pending" => {
    if (index < currentStep) return "completed"
    if (index === currentStep) return "active"
    return "pending"
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Steps row */}
      <div className={cn(wizardVariants({ orientation }))}>
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const Icon = step.icon
          const isClickable = onStepClick && index <= currentStep

          return (
            <React.Fragment key={index}>
              {/* Step item */}
              <div
                className={cn(
                  "flex items-center gap-3",
                  orientation === "vertical" && "w-full"
                )}
              >
                <motion.div
                  className={cn(
                    stepVariants({ size, status }),
                    isClickable && "hover:scale-110"
                  )}
                  onClick={() => isClickable && onStepClick(index)}
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AnimatePresence mode="wait">
                    {status === "completed" ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    ) : Icon ? (
                      <motion.div
                        key="icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Icon className={cn(size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5")} />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="number"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        {index + 1}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {/* Active step glow ring */}
                  {status === "active" && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(255, 196, 0, 0.3)",
                          "0 0 0 8px rgba(255, 196, 0, 0)",
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  )}
                </motion.div>

                {/* Step labels - for vertical orientation */}
                {orientation === "vertical" && showLabels && (
                  <div className="flex-1 pb-8">
                    <motion.p
                      className={cn(
                        "font-medium text-sm",
                        status === "active" && "text-[var(--csfd-navy)] dark:text-[var(--csfd-gold)]",
                        status === "completed" && "text-[var(--csfd-success)]",
                        status === "pending" && "text-muted-foreground"
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.1 }}
                    >
                      {step.title}
                    </motion.p>
                    {step.description && (
                      <motion.p
                        className="text-xs text-muted-foreground mt-0.5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.15 }}
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </div>
                )}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <motion.div
                  className={cn(
                    connectorVariants({ orientation, status: getConnectorStatus(index) }),
                    orientation === "vertical" && "-mt-4 mb-0"
                  )}
                  initial={{ scaleX: orientation === "horizontal" ? 0 : 1, scaleY: orientation === "vertical" ? 0 : 1 }}
                  animate={{ scaleX: 1, scaleY: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step labels - for horizontal orientation */}
      {orientation === "horizontal" && showLabels && (
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index)

            return (
              <div
                key={index}
                className={cn(
                  "flex-1 text-center",
                  index === 0 && "text-left",
                  index === steps.length - 1 && "text-right"
                )}
              >
                <motion.p
                  className={cn(
                    "font-medium text-sm",
                    status === "active" && "text-[var(--csfd-navy)] dark:text-[var(--csfd-gold)]",
                    status === "completed" && "text-[var(--csfd-success)]",
                    status === "pending" && "text-muted-foreground"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                >
                  {step.title}
                </motion.p>
                {step.description && (
                  <motion.p
                    className="text-xs text-muted-foreground mt-0.5 hidden sm:block"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.15 }}
                  >
                    {step.description}
                  </motion.p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Wizard Content wrapper for step content with animations
interface WizardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
}

export function WizardContent({ currentStep, children, className, ...props }: WizardContentProps) {
  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { wizardVariants, stepVariants, connectorVariants }
