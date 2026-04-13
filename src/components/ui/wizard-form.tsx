"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isComplete?: boolean;
  canProceed?: boolean;
}

interface WizardFormProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit: () => Promise<void>;
  onPrevious?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
  showProgress?: boolean;
  showStepIndicators?: boolean;
  allowStepNavigation?: boolean;
  cancelHref?: string;
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const progressVariants = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1 },
  transition: { duration: 0.5, ease: "easeInOut" },
};

export function WizardForm({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  onPrevious,
  onCancel,
  isSubmitting = false,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
  showProgress = true,
  showStepIndicators = true,
  allowStepNavigation = true,
  cancelHref,
}: WizardFormProps) {
  const [direction, setDirection] = React.useState(0);
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const currentStepData = steps[currentStep];

  const handlePrevious = () => {
    if (!isFirstStep) {
      setDirection(-1);
      onStepChange(currentStep - 1);
      onPrevious?.();
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      onStepChange(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    await onSubmit();
  };

  const handleStepClick = (stepIndex: number) => {
    if (!allowStepNavigation) return;
    if (stepIndex < currentStep) {
      setDirection(-1);
      onStepChange(stepIndex);
    } else if (stepIndex === currentStep + 1 && currentStepData?.isComplete) {
      setDirection(1);
      onStepChange(stepIndex);
    }
  };

  const getStepStatus = (index: number): "completed" | "active" | "pending" => {
    if (steps[index]?.isComplete || index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "pending";
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--csfd-navy)] to-[var(--csfd-gold)] rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}

      {/* Step Indicators */}
      {showStepIndicators && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isClickable = allowStepNavigation && (index < currentStep || (index === currentStep + 1 && currentStepData?.isComplete));

              return (
                <React.Fragment key={step.id}>
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <motion.button
                      type="button"
                      onClick={() => handleStepClick(index)}
                      disabled={!isClickable}
                      className={cn(
                        "relative flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-300",
                        status === "completed" &&
                          "bg-[var(--csfd-success)] text-white shadow-lg",
                        status === "active" &&
                          "bg-[var(--csfd-navy)] text-white shadow-lg ring-4 ring-[var(--csfd-gold)]/30",
                        status === "pending" &&
                          "bg-gray-200 text-gray-500 border-2 border-dashed border-gray-300",
                        isClickable && "cursor-pointer hover:scale-110",
                        !isClickable && "cursor-default"
                      )}
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

                      {/* Active step pulse animation */}
                      {status === "active" && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: [
                              "0 0 0 0 rgba(255, 196, 0, 0.4)",
                              "0 0 0 10px rgba(255, 196, 0, 0)",
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        />
                      )}
                    </motion.button>

                    {/* Step Title */}
                    <div className="mt-2 text-center max-w-[100px]">
                      <p
                        className={cn(
                          "text-xs font-medium truncate",
                          status === "active" && "text-[var(--csfd-navy)]",
                          status === "completed" && "text-[var(--csfd-success)]",
                          status === "pending" && "text-gray-400"
                        )}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-2 h-1 relative">
                      <div className="absolute inset-0 bg-gray-200 rounded-full" />
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--csfd-success)] to-[var(--csfd-gold)] rounded-full origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{
                          scaleX:
                            getStepStatus(index) === "completed" ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Content with Animation */}
      <div className="relative overflow-hidden mb-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {steps[currentStep]?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 flex-wrap">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="min-w-[120px] px-6 py-3 rounded-lg font-medium text-base hover:bg-gray-100 transition-colors border-2"
            style={{ borderColor: "var(--csfd-navy)", color: "var(--csfd-navy)" }}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {previousLabel}
          </Button>
        )}

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-w-[120px] px-6 py-3 rounded-lg font-medium text-base transition-colors"
            style={{ backgroundColor: "#dc2626", color: "white" }}
          >
            <X className="w-4 h-4 mr-2" />
            {cancelLabel}
          </Button>
        )}

        {isLastStep ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !currentStepData?.isComplete}
            className="min-w-[160px] px-6 py-3 rounded-lg font-medium text-base transition-colors"
            style={{ backgroundColor: "var(--csfd-success)", color: "white" }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {submitLabel}
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!currentStepData?.canProceed}
            className="min-w-[120px] px-6 py-3 rounded-lg font-medium text-base transition-colors"
            style={{ backgroundColor: "var(--csfd-success)", color: "white" }}
          >
            {nextLabel}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Floating Label Input Component
interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function FloatingLabelInput({
  label,
  error,
  required,
  className,
  id,
  value,
  ...props
}: FloatingLabelInputProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const hasValue = value !== undefined && value !== "";

  return (
    <div className="relative w-full">
      <input
        id={inputId}
        value={value}
        className={cn(
          "peer w-full px-4 pt-6 pb-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 bg-white",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-[var(--csfd-navy)] focus:border-[var(--csfd-gold)] focus:ring-[var(--csfd-gold)]/20",
          className
        )}
        placeholder=" "
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base",
          "peer-focus:top-2 peer-focus:text-xs peer-focus:-translate-y-0",
          hasValue ? "top-2 text-xs -translate-y-0" : "",
          error
            ? "text-red-500 peer-focus:text-red-500"
            : "text-gray-500 peer-focus:text-[var(--csfd-navy)]"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Floating Label Select Component
interface FloatingLabelSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
}

export function FloatingLabelSelect({
  label,
  error,
  required,
  options,
  className,
  id,
  value,
  ...props
}: FloatingLabelSelectProps) {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const hasValue = value !== undefined && value !== "";

  return (
    <div className="relative w-full">
      <select
        id={selectId}
        value={value}
        className={cn(
          "peer w-full px-4 pt-6 pb-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 bg-white appearance-none cursor-pointer",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-[var(--csfd-navy)] focus:border-[var(--csfd-gold)] focus:ring-[var(--csfd-gold)]/20",
          className
        )}
        {...props}
      >
        <option value="" disabled></option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={selectId}
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base",
          hasValue ? "top-2 text-xs -translate-y-0" : "top-1/2 -translate-y-1/2 text-base",
          "peer-focus:top-2 peer-focus:text-xs peer-focus:-translate-y-0",
          error
            ? "text-red-500 peer-focus:text-red-500"
            : "text-gray-500 peer-focus:text-[var(--csfd-navy)]"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {/* Dropdown arrow */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronRight className="w-4 h-4 rotate-90 text-gray-500" />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Validation feedback component
interface ValidationFeedbackProps {
  isValid?: boolean;
  message?: string;
  showCheck?: boolean;
}

export function ValidationFeedback({
  isValid,
  message,
  showCheck = true,
}: ValidationFeedbackProps) {
  if (!message && isValid === undefined) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-1 text-xs mt-1",
        isValid ? "text-green-600" : "text-red-500"
      )}
    >
      {showCheck && (
        <span className={isValid ? "text-green-600" : "text-red-500"}>
          {isValid ? "✓" : "!"}
        </span>
      )}
      {message && <span>{message}</span>}
    </motion.div>
  );
}

export default WizardForm;
