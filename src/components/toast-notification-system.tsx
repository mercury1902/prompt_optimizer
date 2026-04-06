import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastSlideUp } from "@/lib/animation-variants-for-framer-motion";

/**
 * Toast notification types
 */
type ToastType = "success" | "error" | "info";

/**
 * Toast notification object
 */
interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * Toast context value type
 */
interface ToastContextValue {
  /** Add a new toast notification */
  addToast: (toast: Omit<Toast, "id">) => void;
  /** Remove a toast by ID */
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Props for the ToastProvider component
 */
interface ToastProviderProps {
  children: React.ReactNode;
  /** Maximum number of toasts to show at once */
  maxToasts?: number;
}

/**
 * Provider component for toast notifications
 * Wrap your app with this to enable toast notifications
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({
  children,
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const duration = toast.duration || 3000;

      setToasts((prev) => {
        const newToasts = [...prev, { ...toast, id }];
        // Keep only the most recent maxToasts
        return newToasts.slice(-maxToasts);
      });

      // Auto-dismiss after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);

      return id;
    },
    [maxToasts, removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Props for the ToastContainer component
 */
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

/**
 * Container that renders toast notifications
 * Fixed position at bottom-right of the screen
 */
function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Props for the ToastItem component
 */
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

/**
 * Individual toast notification item
 * Animates in and out with slide and scale effects
 */
function ToastItem({ toast, onClose }: ToastItemProps) {
  // Handle reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const icons: Record<ToastType, typeof CheckCircle> = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };

  const styles: Record<ToastType, string> = {
    success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    error: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  };

  const iconColors: Record<ToastType, string> = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
  };

  const Icon = icons[toast.type];

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: "initial",
        animate: "animate",
        exit: "exit",
        variants: toastSlideUp,
        layout: true,
      };

  return (
    <motion.div
      {...motionProps}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[400px]",
        styles[toast.type]
      )}
      role="alert"
    >
      <Icon className={cn("w-5 h-5 shrink-0", iconColors[toast.type])} aria-hidden="true" />
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

/**
 * Hook to access toast notification functions
 * Must be used within a ToastProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { addToast } = useToast();
 *
 *   const handleClick = () => {
 *     addToast({
 *       message: "Operation successful!",
 *       type: "success",
 *     });
 *   };
 *
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 *
 * @throws Error if used outside of ToastProvider
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

/**
 * Convenience hook with pre-configured toast functions
 */
export function useToastHelpers() {
  const { addToast } = useToast();

  return {
    /** Show a success toast */
    success: (message: string, duration?: number) =>
      addToast({ message, type: "success", duration }),
    /** Show an error toast */
    error: (message: string, duration?: number) =>
      addToast({ message, type: "error", duration }),
    /** Show an info toast */
    info: (message: string, duration?: number) =>
      addToast({ message, type: "info", duration }),
  };
}
