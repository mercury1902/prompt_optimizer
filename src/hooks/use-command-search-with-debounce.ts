import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "./use-debounce";
import type { Command } from "../data/commands";
import {
  type KitFilter,
  filterCommands,
  getCommandCounts,
} from "../lib/command-filtering-by-kit-and-keywords";

const DEFAULT_DEBOUNCE_MS = 150;

interface UseCommandSearchOptions {
  initialKit?: KitFilter;
  initialSearch?: string;
  debounceMs?: number;
}

interface UseCommandSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  kitFilter: KitFilter;
  setKitFilter: (kit: KitFilter) => void;
  filteredCommands: Command[];
  counts: { all: number; engineer: number; marketing: number };
  isSearching: boolean;
  hasResults: boolean;
  clearSearch: () => void;
}

/**
 * Hook for searching and filtering commands with debounce
 * Provides real-time search with 150ms debounce for performance
 */
export function useCommandSearchWithDebounce(
  commands: Command[],
  options: UseCommandSearchOptions = {}
): UseCommandSearchResult {
  const {
    initialKit = "all",
    initialSearch = "",
    debounceMs = DEFAULT_DEBOUNCE_MS,
  } = options;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [kitFilter, setKitFilter] = useState<KitFilter>(initialKit);

  // Debounce the search query for performance
  const debouncedQuery = useDebounce(searchQuery, debounceMs);

  // Filter commands based on kit and debounced search query
  const filteredCommands = useMemo(() => {
    return filterCommands(commands, {
      kit: kitFilter,
      searchQuery: debouncedQuery,
    });
  }, [commands, kitFilter, debouncedQuery]);

  // Get counts for each kit tab
  const counts = useMemo(() => getCommandCounts(commands), [commands]);

  // Check if currently searching (query differs from debounced)
  const isSearching = searchQuery !== debouncedQuery;

  // Check if there are any results
  const hasResults = filteredCommands.length > 0;

  // Clear search helper
  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    kitFilter,
    setKitFilter,
    filteredCommands,
    counts,
    isSearching,
    hasResults,
    clearSearch,
  };
}
