import { cn } from "@/lib/utils";

/**
 * Props for the CommandCardSkeleton component
 */
interface CommandCardSkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Single command card skeleton loader
 * Displays a pulsing placeholder that mimics the structure of a command card
 */
export function CommandCardSkeleton({ className }: CommandCardSkeletonProps) {
  return (
    <div
      className={cn(
        "p-4 border rounded-xl space-y-3 animate-pulse bg-white",
        "dark:bg-gray-800 dark:border-gray-700",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-14" />
      </div>
    </div>
  );
}

/**
 * Props for the CommandListSkeleton component
 */
interface CommandListSkeletonProps {
  /** Number of skeleton items to render */
  count?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * List of command card skeletons
 * Displays multiple skeleton loaders in a vertical stack
 */
export function CommandListSkeleton({
  count = 5,
  className,
}: CommandListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CommandCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Props for the ChatMessageSkeleton component
 */
interface ChatMessageSkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Chat message skeleton loader
 * Displays a pulsing placeholder for chat messages
 */
export function ChatMessageSkeleton({ className }: ChatMessageSkeletonProps) {
  return (
    <div
      className={cn(
        "flex gap-3 p-4 animate-pulse",
        className
      )}
    >
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  );
}

/**
 * Props for the ChatListSkeleton component
 */
interface ChatListSkeletonProps {
  /** Number of skeleton messages to render */
  count?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * List of chat message skeletons
 */
export function ChatListSkeleton({
  count = 3,
  className,
}: ChatListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ChatMessageSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Props for the SearchResultSkeleton component
 */
interface SearchResultSkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Search result skeleton with shimmer effect
 */
export function SearchResultSkeleton({
  className,
}: SearchResultSkeletonProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg animate-pulse bg-gray-50 dark:bg-gray-900",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
