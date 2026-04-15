import React from 'react';
import { Code, BookOpen, Bug, Zap, MessageSquare } from 'lucide-react';
import { useBilingualLanguageToggleState } from '../../hooks/use-bilingual-language-toggle-state';

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
  onCommandPaletteOpen: () => void;
}

export const EmptyStateWithSuggestions: React.FC<EmptyStateProps> = ({
  onSuggestionClick,
  onCommandPaletteOpen,
}) => {
  const { t, isEnglish } = useBilingualLanguageToggleState();
  const quickSuggestions = [
    {
      icon: Code,
      label: t('chat.empty.write-code', 'Write code'),
      text: isEnglish ? 'Write a JavaScript function to...' : 'Viết một hàm JavaScript để...',
    },
    {
      icon: BookOpen,
      label: t('chat.empty.explain', 'Explain'),
      text: isEnglish ? 'Explain this concept...' : 'Giải thích khái niệm...',
    },
    {
      icon: Bug,
      label: t('chat.empty.debug', 'Debug issue'),
      text: isEnglish ? 'Help me fix this issue...' : 'Giúp tôi sửa lỗi này...',
    },
    {
      icon: Zap,
      label: t('chat.empty.quick-command', 'Quick command'),
      text: '/',
    },
  ];

  const handleSuggestionClick = (suggestion: typeof quickSuggestions[0]) => {
    if (suggestion.text === '/') {
      onCommandPaletteOpen();
    } else {
      onSuggestionClick(suggestion.text);
    }
  };

  return (
    <div className="flex h-full items-center justify-center px-4 py-8 sm:px-8">
      <div className="w-full max-w-[768px] rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[var(--app-shadow-soft)] md:p-8">
        {/* Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--accent)]">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--app-text)]">
            {t('chat.empty.title', 'Start a new conversation')}
          </h2>
          <p className="text-sm leading-6 text-[var(--app-text-muted)]">
            {t('chat.empty.subtitle', 'Pick a suggestion below or type your own question')}
          </p>
        </div>

        {/* Suggestion Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickSuggestions.map((suggestion) => {
            const Icon = suggestion.icon;

            return (
              <button
                key={suggestion.label}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  group flex min-h-11 flex-col items-center gap-2 rounded-xl border border-[var(--app-border)]
                  bg-[var(--app-surface-muted)] p-4 text-center
                  transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--app-border))]
                  hover:bg-[color-mix(in_srgb,var(--accent)_10%,var(--app-surface-muted))]
                  group
                `}
              >
                <Icon className="h-5 w-5 text-[var(--accent)]" />
                <span className="text-sm text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]">
                  {suggestion.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Keyboard Hints */}
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--app-text-muted)]">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-1.5 py-0.5 text-[var(--app-text-muted)]">/</kbd>
            <span>{t('chat.input.hint.commands', 'for commands')}</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-1.5 py-0.5 text-[var(--app-text-muted)]">⌘K</kbd>
            <span>{t('chat.input.hint.palette', 'for palette')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
