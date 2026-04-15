import React from 'react';
import { MessageSquare, BookOpen, Sparkles, History, Settings, Languages } from 'lucide-react';
import { useBilingualLanguageToggleState } from '../../hooks/use-bilingual-language-toggle-state';

interface VerticalNavSidebarProps {
  currentPage?: 'chat' | 'guide' | 'optimizer';
  onNavigate?: (page: string) => void;
  className?: string;
  collapsed?: boolean;
  mobileVisible?: boolean;
  sticky?: boolean;
  onItemClick?: () => void;
}

const navItems = [
  { id: 'chat', labelKey: 'nav.chat', icon: MessageSquare, href: '/chat' },
  { id: 'guide', labelKey: 'nav.guide', icon: BookOpen, href: '/guide/' },
  { id: 'optimizer', labelKey: 'nav.optimizer', icon: Sparkles, href: '/guide/prompt-optimizer' },
  { id: 'history', labelKey: 'nav.history', icon: History, href: '#', disabled: true },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings, href: '#', disabled: true },
];

export const VerticalNavSidebar: React.FC<VerticalNavSidebarProps> = ({
  currentPage = 'chat',
  onNavigate,
  className = '',
  collapsed,
  mobileVisible = false,
  sticky = true,
  onItemClick,
}) => {
  const { language, toggleLanguage, t } = useBilingualLanguageToggleState();
  const hasControlledCollapse = typeof collapsed === 'boolean';
  const isCollapsed = hasControlledCollapse ? Boolean(collapsed) : false;
  const textVisibilityClass = hasControlledCollapse ? (isCollapsed ? 'hidden' : '') : 'max-lg:hidden';
  const itemCompactClass = hasControlledCollapse
    ? (isCollapsed ? 'justify-center px-2' : '')
    : 'max-lg:justify-center max-lg:px-2';
  const sidebarWidthClass = hasControlledCollapse ? (isCollapsed ? 'w-20' : 'w-[300px]') : 'w-[300px] max-lg:w-20';
  const sidebarVisibilityClass = mobileVisible ? 'flex' : 'hidden md:flex';
  const stickyClass = sticky ? 'sticky top-0' : 'relative';

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof navItems)[number],
  ) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (onNavigate && item.href === '#') {
      event.preventDefault();
      onNavigate(item.id);
      return;
    }

    if (item.href.startsWith('#')) {
      event.preventDefault();

      if (item.href.length === 1) {
        return;
      }

      const target = document.querySelector(item.href);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', item.href);
      }
    }

    if (!item.disabled) {
      onItemClick?.();
    }
  };

  return (
    <aside
      className={`${stickyClass} z-30 h-[100dvh] max-h-[100dvh] shrink-0 flex-col border-r border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_92%,transparent)] backdrop-blur-xl ${sidebarVisibilityClass} ${sidebarWidthClass} ${className}`}
    >
      {/* Logo */}
      <div className={`border-b border-[var(--app-border)] p-5 ${hasControlledCollapse && isCollapsed ? 'px-3' : 'max-lg:px-3'}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface-muted)] shadow-[var(--app-shadow-soft)]">
            <span className="text-sm font-semibold text-[var(--accent)]">CK</span>
          </div>
          <div className={textVisibilityClass}>
            <h1 className="text-[15px] font-semibold text-[var(--app-text)]">ClaudeKit</h1>
            <p className="text-xs text-[var(--app-text-muted)]">{t('nav.assistant', 'Tro ly AI')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-2 overflow-y-auto p-4 ${hasControlledCollapse && isCollapsed ? 'px-2' : 'max-lg:px-2'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(event) => handleNavClick(event, item)}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={item.disabled ? 'true' : undefined}
              className={`
                flex min-h-11 items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium
                transition-colors duration-200
                ${itemCompactClass}
                ${item.disabled ? 'cursor-not-allowed opacity-45' : ''}
                ${isActive
                  ? 'border-[color-mix(in_srgb,var(--accent)_30%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_14%,var(--app-surface))] text-[var(--app-text)]'
                  : 'border-transparent text-[var(--app-text-muted)] hover:border-[var(--app-border)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className={textVisibilityClass}>{t(item.labelKey, item.id)}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`space-y-2 border-t border-[var(--app-border)] p-4 ${hasControlledCollapse && isCollapsed ? 'px-2' : 'max-lg:px-2'}`}>
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)]"
          aria-label={t('nav.toggle-language', 'Switch language')}
          title={t('nav.toggle-language', 'Switch language')}
        >
          <Languages className="h-4 w-4" />
          <span className={`text-xs font-semibold ${textVisibilityClass}`}>{language.toUpperCase()}</span>
        </button>
        <p className={`text-center text-xs text-[var(--app-text-muted)] ${textVisibilityClass}`}>
          {t('nav.version', 'ClaudeKit Chat v1.0')}
        </p>
      </div>
    </aside>
  );
};
