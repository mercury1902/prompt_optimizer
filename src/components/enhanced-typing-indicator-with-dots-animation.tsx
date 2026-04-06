import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Props for the EnhancedTypingIndicator component
 */
interface EnhancedTypingIndicatorProps {
  /** Text to display before the animated dots */
  text?: string;
  /** Additional CSS classes */
  className?: string;
  /** Color theme for the dots */
  variant?: "default" | "primary" | "muted";
}

/**
 * Enhanced typing indicator with animated bouncing dots
 * Respects user's reduced motion preferences
 *
 * @example
 * ```tsx
 * // Default usage
 * <EnhancedTypingIndicator />
 *
 * // Custom text and styling
 * <EnhancedTypingIndicator
 *   text="AI is processing"
 *   variant="primary"
 *   className="py-4"
 * />
 * ```
 */
export function EnhancedTypingIndicator({
  text = "AI is thinking",
  className,
  variant = "default",
}: EnhancedTypingIndicatorProps) {
  const shouldReduceMotion = useReducedMotion();

  const dotColors = {
    default: "bg-gray-400 dark:bg-gray-500",
    primary: "bg-blue-500 dark:bg-blue-400",
    muted: "bg-gray-300 dark:bg-gray-600",
  };

  // Static dots for reduced motion preference
  if (shouldReduceMotion) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-gray-500 dark:text-gray-400",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <span className="text-sm">{text}</span>
        <span className="text-sm" aria-hidden="true">...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-gray-500 dark:text-gray-400",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="text-sm">{text}</span>
      <span className="flex gap-0.5" aria-hidden="true">
        <motion.span
          className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0,
            ease: "easeInOut",
          }}
        />
        <motion.span
          className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0.2,
            ease: "easeInOut",
          }}
        />
        <motion.span
          className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0.4,
            ease: "easeInOut",
          }}
        />
      </span>
    </div>
  );
}

/**
 * Props for the MinimalTypingIndicator component
 */
interface MinimalTypingIndicatorProps {
  /** Size of the dots */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Color theme */
  variant?: "default" | "primary" | "white";
}

/**
 * Minimal typing indicator with just animated dots
 * Perfect for compact spaces like chat bubbles
 *
 * @example
 * ```tsx
 * // Small dots for inline use
 * <MinimalTypingIndicator size="sm" />
 *
 * // Large dots for prominent display
 * <MinimalTypingIndicator size="lg" variant="primary" />
 * ```
 */
export function MinimalTypingIndicator({
  size = "md",
  className,
  variant = "default",
}: MinimalTypingIndicatorProps) {
  const shouldReduceMotion = useReducedMotion();

  const dotSizes = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  const dotColors = {
    default: "bg-gray-400 dark:bg-gray-500",
    primary: "bg-blue-500 dark:bg-blue-400",
    white: "bg-white/70",
  };

  const gapSizes = {
    sm: "gap-0.5",
    md: "gap-0.5",
    lg: "gap-1",
  };

  // Static dots for reduced motion
  if (shouldReduceMotion) {
    return (
      <div
        className={cn("flex items-center", gapSizes[size], className)}
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        <span className={cn("rounded-full", dotSizes[size], dotColors[variant])} />
        <span className={cn("rounded-full", dotSizes[size], dotColors[variant])} />
        <span className={cn("rounded-full", dotSizes[size], dotColors[variant])} />
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center", gapSizes[size], className)}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {[0, 0.2, 0.4].map((delay, index) => (
        <motion.span
          key={index}
          className={cn("rounded-full", dotSizes[size], dotColors[variant])}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
