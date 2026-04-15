import React from 'react';
import { Zap, RefreshCw, History, Plus } from 'lucide-react';
import { useBilingualLanguageToggleState } from '../../hooks/use-bilingual-language-toggle-state';

interface ChatHeaderProps {
  apiStatus: 'checking' | 'ready' | 'error';
  onRefresh: () => void;
  onToggleHistory: () => void;
  onNewChat: () => void;
  showHistory: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  apiStatus,
  onRefresh,
  onToggleHistory,
  onNewChat,
  showHistory
}) => {
  const { t } = useBilingualLanguageToggleState();

  return (
    <header className="flex items-center justify-between border-b border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_92%,transparent)] px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] shadow-[var(--app-shadow-soft)]">
          <Zap className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-[var(--app-text)]">{t('chat.title', 'ClaudeKit Chat')}</h1>
          <p className="flex items-center gap-1 text-[13px] text-[var(--app-text-muted)]">
            {apiStatus === 'checking' && (
              <><span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />{t('chat.status.checking', 'Connecting...')}</>
            )}
            {apiStatus === 'ready' && (
              <><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />{t('chat.status.ready', 'AI assistant is online')}</>
            )}
            {apiStatus === 'error' && (
              <><span className="h-1.5 w-1.5 rounded-full bg-red-500" />{t('chat.status.error', 'API connection error')}</>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {apiStatus === 'error' && (
          <button
            onClick={onRefresh}
            className="flex min-h-11 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
            title={t('chat.refresh', 'Refresh')}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('chat.refresh', 'Refresh')}</span>
          </button>
        )}
        <button
          onClick={onToggleHistory}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">{t('chat.history', 'History')}</span>
        </button>
        <button
          onClick={onNewChat}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_16%,var(--app-surface))] px-3 py-2 text-sm font-medium text-[var(--app-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_22%,var(--app-surface))]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('chat.new-chat', 'New conversation')}</span>
        </button>
      </div>
    </header>
  );
};
