// Prompt cache stub - Phase 4 will implement full version with LRU and TTL

interface CacheEntry {
  result: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedPrompt(prompt: string): unknown | null {
  const key = hashPrompt(prompt);
  const entry = cache.get(key);

  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.result;
}

export function setCachedPrompt(prompt: string, result: unknown): void {
  const key = hashPrompt(prompt);
  cache.set(key, {
    result,
    timestamp: Date.now(),
  });

  // Simple eviction: clear if too big
  if (cache.size > 1000) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

function hashPrompt(prompt: string): string {
  // Simple hash for stub
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(36);
}
