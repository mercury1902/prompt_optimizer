import React, { useRef, useEffect } from 'react';
import { Send, Square, Command as CommandIcon } from 'lucide-react';
import { useBilingualLanguageToggleState } from '../../hooks/use-bilingual-language-toggle-state';

export interface CommandSuggestion {
  command: string;
  reason: string;
  confidence: number;
  workflowName?: string;
  recommendationType?: 'command' | 'workflow';
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onCommandPaletteOpen: () => void;
  commandSuggestion?: CommandSuggestion | null;
  onApplyCommandSuggestion?: (command: string) => void;
  onOpenGuide?: () => void;
  onEscape?: () => void;
  isStreaming?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value = '',
  onChange = () => {},
  onSend = () => {},
  onCommandPaletteOpen = () => {},
  commandSuggestion = null,
  onApplyCommandSuggestion = () => {},
  onOpenGuide = () => {},
  onEscape = () => {},
  isStreaming = false,
  placeholder
}) => {
  const { t } = useBilingualLanguageToggleState();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onCommandPaletteOpenRef = useRef(onCommandPaletteOpen);
  const effectivePlaceholder = placeholder ?? t('chat.input.placeholder', 'Type / for commands or ask anything...');

  useEffect(() => {
    onCommandPaletteOpenRef.current = onCommandPaletteOpen;
  }, [onCommandPaletteOpen]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  useEffect(() => {
    if (value === '/') {
      onCommandPaletteOpenRef.current();
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEscape();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      onCommandPaletteOpen();
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isStreaming) {
        onSend();
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isStreaming) {
      onSend();
    }
  };

  const shouldShowSuggestion =
    !!commandSuggestion && value.trim().length > 0 && !value.trim().startsWith('/') && !isStreaming;

  const confidenceLabel = commandSuggestion
    ? `${Math.round(Math.max(0, Math.min(1, commandSuggestion.confidence)) * 100)}%`
    : '';

  return (
    <form
      onSubmit={handleSend}
      data-testid="chat-form"
      className="safe-bottom-pad sticky bottom-0 z-40 border-t border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_88%,transparent)] px-4 py-4 backdrop-blur-xl sm:px-8 md:px-10"
      role="form"
      aria-label={t('chat.input.form', 'Chat input')}
    >
      <div className="mx-auto w-full max-w-[768px]">
        {shouldShowSuggestion && commandSuggestion && (
          <div className="mb-3 rounded-xl border border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_10%,var(--app-surface))] px-4 py-3 shadow-[var(--app-shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-[var(--app-text)]">
                  {commandSuggestion.recommendationType === 'workflow'
                    ? t('chat.suggestion.workflow', 'Suggested workflow')
                    : t('chat.suggestion.command', 'Suggested command')}:{' '}
                  <code className="font-semibold text-[var(--accent)]">{commandSuggestion.command}</code>{' '}
                  <span className="text-[var(--app-text-muted)]">({confidenceLabel})</span>
                </p>
                <p className="truncate text-[11px] text-[var(--app-text-muted)]">
                  {commandSuggestion.reason}
                  {commandSuggestion.workflowName ? ` • ${commandSuggestion.workflowName}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onApplyCommandSuggestion(commandSuggestion.command)}
                  className="min-h-11 rounded-lg border border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_16%,var(--app-surface))] px-2 py-1 text-[11px] text-[var(--app-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_24%,var(--app-surface))]"
                >
                  {t('chat.suggestion.apply-command', 'Insert command')}
                </button>
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="min-h-11 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-[11px] text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
                >
                  {t('chat.suggestion.open-guide', 'Open guide')}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={onCommandPaletteOpen}
            disabled={isStreaming}
            aria-label={t('chat.input.palette-button', 'Open command palette')}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-50"
            title="Lệnh (⌘K)"
          >
            <CommandIcon className="h-4 w-4" />
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              data-testid="chat-input-textarea"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? t('chat.input.placeholder-loading', 'Waiting for response...') : effectivePlaceholder}
              disabled={isStreaming}
              aria-label={t('chat.input.textarea-label', 'Message input')}
              className="w-full min-h-[52px] max-h-[200px] resize-none rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 pr-12 text-[15px] leading-6 text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] transition-[height,border-color,box-shadow] duration-200 focus:border-[color-mix(in_srgb,var(--accent)_50%,var(--app-border))] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:opacity-50"
              rows={1}
            />
            {value.startsWith('/') && !isStreaming && (
              <div className="absolute right-3 top-3.5">
                <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_10%,var(--app-surface))] px-2 py-0.5 text-xs text-[var(--accent)]">{t('chat.input.command', 'Command')}</span>
              </div>
            )}
            {isStreaming && (
              <div className="absolute right-3 top-3.5">
                <span className="flex items-center gap-1 text-xs text-[var(--app-text-muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                  {t('chat.input.sending', 'Sending...')}
                </span>
              </div>
            )}
          </div>
          <button
            type="submit"
            data-testid="chat-submit-button"
            aria-label={isStreaming ? t('chat.input.stop', 'Stop response') : t('chat.input.send', 'Send message')}
            disabled={!value.trim() || isStreaming}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_16%,var(--app-surface))] text-[var(--app-text)] shadow-[var(--app-shadow-soft)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_25%,var(--app-surface))] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isStreaming ? (
              <Square className="w-5 h-5 fill-current" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[var(--app-text-muted)]">
          <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--app-border)] bg-[var(--app-surface)] px-1.5 py-0.5">/</kbd><span>{t('chat.input.hint.commands', 'for commands')}</span></span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--app-border)] bg-[var(--app-surface)] px-1.5 py-0.5">⌘K</kbd><span>{t('chat.input.hint.palette', 'for palette')}</span></span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--app-border)] bg-[var(--app-surface)] px-1.5 py-0.5">↵</kbd><span>{t('chat.input.hint.send', 'to send')}</span></span>
        </div>
      </div>
    </form>
  );
};
