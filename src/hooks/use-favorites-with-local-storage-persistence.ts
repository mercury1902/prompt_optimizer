import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'claudekit:favorites';

export interface UseFavoritesReturn {
  favorites: string[];
  toggleFavorite: (commandId: string) => void;
  isFavorite: (commandId: string) => boolean;
  clearFavorites: () => void;
}

export function useFavoritesWithLocalStoragePersistence(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch {
        // Silently fail if localStorage is not available
      }
    }
  }, [favorites]);

  const toggleFavorite = useCallback((commandId: string): void => {
    setFavorites((prev) =>
      prev.includes(commandId)
        ? prev.filter((id) => id !== commandId)
        : [...prev, commandId]
    );
  }, []);

  const isFavorite = useCallback(
    (commandId: string): boolean => {
      return favorites.includes(commandId);
    },
    [favorites]
  );

  const clearFavorites = useCallback((): void => {
    setFavorites([]);
  }, []);

  return { favorites, toggleFavorite, isFavorite, clearFavorites };
}
