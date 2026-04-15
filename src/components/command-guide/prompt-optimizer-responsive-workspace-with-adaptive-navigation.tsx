import React, { useCallback, useEffect, useState } from 'react';
import { VerticalNavSidebar } from '../chat/vertical-navigation-sidebar';
import { PromptOptimizerChat } from './prompt-optimizer-chat';
import { usePromptOptimizerLayoutPreferenceWithLocalStorage } from '../../hooks/use-prompt-optimizer-layout-preference-with-local-storage';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const updateMatch = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener('change', updateMatch);

    return () => mediaQueryList.removeEventListener('change', updateMatch);
  }, [query]);

  return matches;
}

export function PromptOptimizerResponsiveWorkspaceWithAdaptiveNavigation() {
  const isDesktopViewport = useMediaQuery('(min-width: 1280px)');
  const { layoutPreference, setDesktopNavigationMode, setNavigationCollapsed } =
    usePromptOptimizerLayoutPreferenceWithLocalStorage();
  const [overlayNavigationOpen, setOverlayNavigationOpen] = useState(false);

  const isDesktopDockedSidebar =
    isDesktopViewport && layoutPreference.desktopNavigationMode === 'docked';

  useEffect(() => {
    if (isDesktopDockedSidebar) {
      setOverlayNavigationOpen(false);
    }
  }, [isDesktopDockedSidebar]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOverlayNavigationOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const closeOverlayNavigation = useCallback(() => {
    setOverlayNavigationOpen(false);
  }, []);

  const toggleNavigation = useCallback(() => {
    if (isDesktopDockedSidebar) {
      setNavigationCollapsed(!layoutPreference.navigationCollapsed);
      return;
    }

    setOverlayNavigationOpen((current) => !current);
  }, [isDesktopDockedSidebar, layoutPreference.navigationCollapsed, setNavigationCollapsed]);

  const toggleDesktopNavigationMode = useCallback(() => {
    setDesktopNavigationMode(
      layoutPreference.desktopNavigationMode === 'docked' ? 'overlay' : 'docked',
    );
  }, [layoutPreference.desktopNavigationMode, setDesktopNavigationMode]);

  return (
    <div className="relative flex min-h-[100dvh] bg-[var(--app-bg)]">
      {isDesktopDockedSidebar && (
        <div
          className={`hidden transition-[width] duration-300 xl:block ${layoutPreference.navigationCollapsed ? 'w-20' : 'w-[300px]'}`}
        >
          <VerticalNavSidebar
            currentPage="optimizer"
            collapsed={layoutPreference.navigationCollapsed}
            sticky={false}
            className="h-full max-h-none"
          />
        </div>
      )}

      <main className="app-shell-main app-shell-main-scroll relative z-10 min-w-0 flex-1">
        <div className="mx-auto w-full px-3 py-4 sm:px-5 sm:py-5 lg:max-w-[1120px] xl:max-w-[1360px] 2xl:max-w-[1500px]">
          <PromptOptimizerChat
            onToggleNavigation={toggleNavigation}
            onToggleDesktopNavigationMode={isDesktopViewport ? toggleDesktopNavigationMode : undefined}
            isDesktopNavigationDocked={isDesktopDockedSidebar}
            isNavigationCollapsed={layoutPreference.navigationCollapsed}
          />
        </div>
      </main>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          overlayNavigationOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          type="button"
          aria-label="Đóng điều hướng"
          className="absolute inset-0 bg-black/45"
          onClick={closeOverlayNavigation}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[88vw] max-w-[320px] transform transition-transform duration-300 ${
            overlayNavigationOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <VerticalNavSidebar
            currentPage="optimizer"
            mobileVisible
            sticky={false}
            collapsed={false}
            onItemClick={closeOverlayNavigation}
            className="h-full max-h-none shadow-[var(--app-shadow)]"
          />
        </div>
      </div>
    </div>
  );
}

export default PromptOptimizerResponsiveWorkspaceWithAdaptiveNavigation;

