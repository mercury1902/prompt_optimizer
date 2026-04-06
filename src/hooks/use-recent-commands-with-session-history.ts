import { useState, useEffect, useCallback } from 'react';

const RECENTS_KEY = 'claudekit:recents';
const MAX_RECENTS = 20;

export interface RecentCommand {
  commandId: string;
  commandName: string;
  usedAt: number;
}

export interface UseRecentCommandsReturn {
  recents: RecentCommand[];
  addRecent: (commandId: string, commandName: string) => void;
  clearRecents: () => void;
}

export function useRecentCommandsWithSessionHistory(): UseRecentCommandsReturn {
  const [recents, setRecents] = useState<RecentCommand[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(RECENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
      } catch {
        // Silently fail if localStorage is not available
      }
    }
  }, [recents]);

  const addRecent = useCallback((commandId: string, commandName: string): void => {
    setRecents((prev) => {
      const filtered = prev.filter((r) => r.commandId !== commandId);
      return [
        { commandId, commandName, usedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENTS);
    });
  }, []);

  const clearRecents = useCallback((): void => {
    setRecents([]);
  }, []);

  return { recents, addRecent, clearRecents };
}
