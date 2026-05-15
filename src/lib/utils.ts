import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID using crypto.randomUUID if available, falling back to Math.random
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Check if code is running on the server
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Check if code is running on the client
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}
/**
 * Parse JSON from AI model response, handling markdown fences and partial content
 */
export function parseAIJSON<T = any>(content: string): T | null {
  const trimmed = content.trim();
  if (!trimmed) return null;

  // Remove markdown code fences if present
  const withoutCodeFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(withoutCodeFence) as T;
  } catch {
    // If direct parse fails, try to find the first '{' and last '}'
    const firstBrace = withoutCodeFence.indexOf("{");
    const lastBrace = withoutCodeFence.lastIndexOf("}");
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const objectSlice = withoutCodeFence.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(objectSlice) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
