import { useCallback, useEffect, useState } from "react";
import {
  APP_LANGUAGE_STORAGE_KEY,
  APP_LANGUAGE_EVENT_NAME,
  type AppLanguage,
  normalizeLanguage,
  readStoredLanguage,
  translate,
  updateDocumentLanguage,
  writeStoredLanguage,
} from "../lib/bilingual-language-toggle-translations";

function notifyLanguageChange(language: AppLanguage): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(APP_LANGUAGE_EVENT_NAME, {
      detail: { language },
    })
  );
}

export function setAppLanguage(language: AppLanguage): void {
  writeStoredLanguage(language);
  updateDocumentLanguage(language);
  notifyLanguageChange(language);
}

export function useBilingualLanguageToggleState() {
  const [language, setLanguageState] = useState<AppLanguage>(() => readStoredLanguage());

  useEffect(() => {
    updateDocumentLanguage(language);
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ language?: string }>;
      const nextLanguage = normalizeLanguage(customEvent.detail?.language);
      setLanguageState(nextLanguage);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APP_LANGUAGE_STORAGE_KEY) {
        return;
      }
      setLanguageState(normalizeLanguage(event.newValue));
    };

    window.addEventListener(APP_LANGUAGE_EVENT_NAME, handleLanguageChange as EventListener);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(APP_LANGUAGE_EVENT_NAME, handleLanguageChange as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    setAppLanguage(nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "vi" ? "en" : "vi");
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string, fallback?: string) => translate(language, key, fallback),
    [language]
  );

  return {
    language,
    isEnglish: language === "en",
    isVietnamese: language === "vi",
    setLanguage,
    toggleLanguage,
    t,
  };
}
