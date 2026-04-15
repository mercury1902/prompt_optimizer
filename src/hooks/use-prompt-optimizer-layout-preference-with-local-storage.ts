import { useCallback, useEffect, useMemo, useState } from 'react';

const PROMPT_OPTIMIZER_LAYOUT_PREFERENCE_STORAGE_KEY = 'claudekit:prompt-optimizer:layout:v1';

export type PromptOptimizerDesktopNavigationMode = 'docked' | 'overlay';

interface PromptOptimizerLayoutPreference {
  desktopNavigationMode: PromptOptimizerDesktopNavigationMode;
  navigationCollapsed: boolean;
}

const DEFAULT_LAYOUT_PREFERENCE: PromptOptimizerLayoutPreference = {
  desktopNavigationMode: 'docked',
  navigationCollapsed: false,
};

function normalizeLayoutPreference(
  value: Partial<PromptOptimizerLayoutPreference> | null | undefined,
): PromptOptimizerLayoutPreference {
  if (!value) {
    return DEFAULT_LAYOUT_PREFERENCE;
  }

  const desktopNavigationMode: PromptOptimizerDesktopNavigationMode =
    value.desktopNavigationMode === 'overlay' ? 'overlay' : 'docked';

  return {
    desktopNavigationMode,
    navigationCollapsed: Boolean(value.navigationCollapsed),
  };
}

export function usePromptOptimizerLayoutPreferenceWithLocalStorage() {
  const [layoutPreference, setLayoutPreference] = useState<PromptOptimizerLayoutPreference>(
    DEFAULT_LAYOUT_PREFERENCE,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(PROMPT_OPTIMIZER_LAYOUT_PREFERENCE_STORAGE_KEY);
      if (!rawValue) {
        setLayoutPreference(DEFAULT_LAYOUT_PREFERENCE);
        return;
      }

      const parsedValue = JSON.parse(rawValue) as Partial<PromptOptimizerLayoutPreference>;
      setLayoutPreference(normalizeLayoutPreference(parsedValue));
    } catch {
      setLayoutPreference(DEFAULT_LAYOUT_PREFERENCE);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(
        PROMPT_OPTIMIZER_LAYOUT_PREFERENCE_STORAGE_KEY,
        JSON.stringify(layoutPreference),
      );
    } catch {
      // Ignore storage write failures.
    }
  }, [layoutPreference]);

  const setDesktopNavigationMode = useCallback((nextMode: PromptOptimizerDesktopNavigationMode) => {
    setLayoutPreference((previous) => ({
      ...previous,
      desktopNavigationMode: nextMode,
    }));
  }, []);

  const setNavigationCollapsed = useCallback((nextCollapsed: boolean) => {
    setLayoutPreference((previous) => ({
      ...previous,
      navigationCollapsed: nextCollapsed,
    }));
  }, []);

  const value = useMemo(
    () => ({
      layoutPreference,
      setDesktopNavigationMode,
      setNavigationCollapsed,
    }),
    [layoutPreference, setDesktopNavigationMode, setNavigationCollapsed],
  );

  return value;
}

