import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  History,
  Info,
  MessageCircleMore,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Send,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';
import { OptimizedResultView } from './optimized-prompt-result-view';
import {
  PromptOptimizerConversationProvider,
  usePromptOptimizerConversation,
  type PromptOptimizerMessage,
} from './prompt-optimizer-conversation-context';
import { PromptOptimizerHistoryPanel } from './prompt-optimizer-history-panel';
import { parsePromptResult } from '../../utils/prompt-response-parser';
import type {
  InputLanguagePreference,
  MultilingualOptimizedPromptResult,
  OptimizerDisplayMode,
  OptimizerPreviewMode,
  OutputLanguageMode,
  PromptOptimizerApiResponse,
} from '../../types/prompt-optimizer-multilingual';

const INPUT_LANGUAGE_OPTIONS: Array<{ value: InputLanguagePreference; label: string }> = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
];

const OUTPUT_LANGUAGE_OPTIONS: Array<{ value: OutputLanguageMode; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'both', label: 'Both' },
];

const DISPLAY_MODE_OPTIONS: Array<{ value: OptimizerDisplayMode; label: string }> = [
  { value: 'side-by-side', label: 'Side-by-side' },
  { value: 'tab-toggle', label: 'Tab toggle' },
  { value: 'inline-translation', label: 'Inline translation' },
];

const PREVIEW_MODE_OPTIONS: Array<{ value: OptimizerPreviewMode; label: string }> = [
  { value: 'english', label: 'View as English prompt' },
  { value: 'bilingual', label: 'View as Bilingual' },
];

interface PromptOptimizerChatProps {
  onToggleNavigation?: () => void;
  onToggleDesktopNavigationMode?: () => void;
  isDesktopNavigationDocked?: boolean;
  isNavigationCollapsed?: boolean;
}

function useIsMobileViewport(): boolean {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia('(max-width: 767px)');
    setIsMobileViewport(mediaQueryList.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };

    mediaQueryList.addEventListener('change', onChange);
    return () => mediaQueryList.removeEventListener('change', onChange);
  }, []);

  return isMobileViewport;
}

function PromptOptimizerTypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 text-[var(--app-text-muted)]">
      <span className="typing-dot h-2 w-2 rounded-full bg-[var(--accent)] [animation-delay:0ms]" />
      <span className="typing-dot h-2 w-2 rounded-full bg-[var(--accent)] [animation-delay:120ms]" />
      <span className="typing-dot h-2 w-2 rounded-full bg-[var(--accent)] [animation-delay:240ms]" />
    </div>
  );
}

function ThreadHeader({
  activeThreadTitle,
  threadId,
  compareMode,
  onToggleCompare,
  onNewSession,
  onToggleInfo,
  onToggleHistoryPanel,
  isHistoryPanelOpen,
  onToggleNavigation,
  onToggleDesktopNavigationMode,
  isDesktopNavigationDocked,
  isNavigationCollapsed,
}: {
  activeThreadTitle: string;
  threadId: string;
  compareMode: boolean;
  onToggleCompare: () => void;
  onNewSession: () => void;
  onToggleInfo: () => void;
  onToggleHistoryPanel: () => void;
  isHistoryPanelOpen: boolean;
  onToggleNavigation?: () => void;
  onToggleDesktopNavigationMode?: () => void;
  isDesktopNavigationDocked?: boolean;
  isNavigationCollapsed?: boolean;
}) {
  const navigationToggleLabel = isDesktopNavigationDocked
    ? (isNavigationCollapsed ? 'Mở rộng sidebar điều hướng' : 'Thu gọn sidebar điều hướng')
    : 'Mở điều hướng';

  const layoutModeToggleLabel = isDesktopNavigationDocked
    ? 'Chuyển sang overlay navigation'
    : 'Ghim sidebar trên desktop';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--app-border)] px-4 py-3 sm:px-5">
      <div className="text-sm text-[var(--app-text-muted)]">
        <h1 className="text-base font-semibold text-[var(--app-text)]">Prompt Optimizer</h1>
        <span className="font-semibold text-[var(--app-text)]">Ngữ cảnh: {activeThreadTitle}</span>
        <span className="ml-2">#{threadId}</span>
      </div>

      <div className="flex items-center gap-2">
        {onToggleNavigation && (
          <button
            type="button"
            onClick={onToggleNavigation}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)]"
            aria-label={navigationToggleLabel}
            title={navigationToggleLabel}
          >
            <PanelLeft className="h-4.5 w-4.5" />
          </button>
        )}
        {onToggleDesktopNavigationMode && (
          <button
            type="button"
            onClick={onToggleDesktopNavigationMode}
            className="hidden h-11 items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] xl:flex"
            aria-label={layoutModeToggleLabel}
            title={layoutModeToggleLabel}
          >
            {isDesktopNavigationDocked ? (
              <PanelLeftClose className="h-4.5 w-4.5" />
            ) : (
              <PanelLeftOpen className="h-4.5 w-4.5" />
            )}
            <span>{isDesktopNavigationDocked ? 'Overlay Nav' : 'Pinned Nav'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={onToggleCompare}
          className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
            compareMode
              ? 'border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_16%,var(--app-surface))] text-[var(--app-text)]'
              : 'border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)]'
          }`}
        >
          Compare Mode
        </button>
        <button
          type="button"
          onClick={onToggleInfo}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)]"
          aria-label="Giới thiệu"
        >
          <Info className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          onClick={onToggleHistoryPanel}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border text-[var(--app-text-muted)] transition-colors ${
            isHistoryPanelOpen
              ? 'border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_14%,var(--app-surface))] text-[var(--app-text)]'
              : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-muted)]'
          }`}
          aria-label="Mở lịch sử"
        >
          <History className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          data-testid="prompt-optimizer-reset"
          onClick={onNewSession}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)]"
        >
          <Plus className="h-4 w-4" />
          <span>New Session</span>
        </button>
      </div>
    </div>
  );
}

function PreferenceButtonGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-10 rounded-lg border px-3 py-2 text-xs font-semibold ${
              value === option.value
                ? 'border-[color-mix(in_srgb,var(--accent)_40%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_18%,var(--app-surface))] text-[var(--app-text)]'
                : 'border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function buildHumanReadableResultContent(result: MultilingualOptimizedPromptResult): string {
  return [
    '✅ **Optimized Prompt (EN):**',
    result.optimizedPromptEn,
    '',
    '✅ **Prompt tối ưu (VI):**',
    result.optimizedPromptVi,
    '',
    '💡 **Command đề xuất:**',
    result.suggestedCommand,
    '',
    '🎯 **Lý do:**',
    result.explanation,
  ].join('\n');
}

function PromptOptimizerContent({
  onToggleNavigation,
  onToggleDesktopNavigationMode,
  isDesktopNavigationDocked = false,
  isNavigationCollapsed = false,
}: PromptOptimizerChatProps) {
  const {
    sessions,
    activeSessionId,
    activeSession,
    compareMode,
    setCompareMode,
    startNewSession,
    selectSession,
    addUserTurnWithOptimisticAssistant,
    updateAssistantMessage,
  } = usePromptOptimizerConversation();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showOutputPreferences, setShowOutputPreferences] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [retryAfterSec, setRetryAfterSec] = useState(0);
  const [inputLanguagePreference, setInputLanguagePreference] = useState<InputLanguagePreference>('auto');
  const [outputLanguageMode, setOutputLanguageMode] = useState<OutputLanguageMode>('both');
  const [displayMode, setDisplayMode] = useState<OptimizerDisplayMode>('side-by-side');
  const [previewMode, setPreviewMode] = useState<OptimizerPreviewMode>('bilingual');
  const isMobileViewport = useIsMobileViewport();
  const historyPanelContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const messages = activeSession?.messages ?? [];
  const activeThreadTitle = activeSession?.title ?? 'Phiên mới';
  const threadId = activeSession?.id.slice(-6) ?? '------';

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
  }, [input]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setShowInfo(false);
      setShowHistoryPanel(false);
      setShowOutputPreferences(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (retryAfterSec <= 0) return;
    const interval = window.setInterval(() => {
      setRetryAfterSec((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [retryAfterSec]);

  useEffect(() => {
    const touchState = {
      startX: 0,
      startY: 0,
      openedFromEdge: false,
      startedInMobileSheet: false,
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      touchState.startX = touch.clientX;
      touchState.startY = touch.clientY;
      touchState.openedFromEdge = !showHistoryPanel && touch.clientX >= window.innerWidth - 24;
      touchState.startedInMobileSheet = Boolean(
        showHistoryPanel &&
          isMobileViewport &&
          historyPanelContainerRef.current &&
          historyPanelContainerRef.current.contains(event.target as Node),
      );
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;

      if (touchState.openedFromEdge && deltaX <= -72 && Math.abs(deltaY) <= 80) {
        setShowHistoryPanel(true);
      }

      if (touchState.startedInMobileSheet && deltaY >= 72 && Math.abs(deltaX) <= 80) {
        setShowHistoryPanel(false);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isMobileViewport, showHistoryPanel]);

  const submitPrompt = useCallback(async () => {
    const normalizedInput = input.trim();
    if (!normalizedInput || isLoading || retryAfterSec > 0) return;

    const optimisticTurn = addUserTurnWithOptimisticAssistant(normalizedInput);
    setInput('');
    setShowHistoryPanel(false);

    if (!optimisticTurn) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/prompt-optimizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelMessages: optimisticTurn.modelMessages,
          inputLanguagePreference,
          outputLanguageMode,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 429) {
          const retryFromHeader = Number(response.headers.get('Retry-After') ?? '');
          const retryFromPayload = Number(payload?.retryAfterSec ?? '');
          const retryValue = Number.isFinite(retryFromHeader) && retryFromHeader > 0
            ? retryFromHeader
            : Number.isFinite(retryFromPayload) && retryFromPayload > 0
              ? retryFromPayload
              : 30;
          throw new Error(`RATE_LIMIT:${retryValue}`);
        }
        throw new Error(String(payload?.error ?? `API ${response.status}`));
      }

      const apiResult = (payload as PromptOptimizerApiResponse).result;
      const assistantContentFromApi = buildHumanReadableResultContent(apiResult);
      const parsedResult = parsePromptResult(
        apiResult.rawContent?.trim() ? apiResult.rawContent : JSON.stringify(apiResult),
      );
      parsedResult.optimizedPromptEn = apiResult.optimizedPromptEn;
      parsedResult.optimizedPromptVi = apiResult.optimizedPromptVi;
      parsedResult.optimizedPrompt = apiResult.optimizedPromptEn;
      parsedResult.suggestedCommand = apiResult.suggestedCommand;
      parsedResult.explanation = apiResult.explanation;
      parsedResult.detectedInputLanguage = apiResult.detectedInputLanguage;
      parsedResult.rawContent = apiResult.rawContent || assistantContentFromApi;

      updateAssistantMessage(optimisticTurn.sessionId, optimisticTurn.assistantMessageId, {
        content: assistantContentFromApi,
        parsedResult,
        isStreaming: false,
        isError: false,
      });
    } catch (error) {
      const fallbackMessage = error instanceof Error ? error.message : 'Không thể tối ưu prompt';
      if (fallbackMessage.startsWith('RATE_LIMIT:')) {
        const retryValue = Number(fallbackMessage.replace('RATE_LIMIT:', '')) || 30;
        setRetryAfterSec(retryValue);
        updateAssistantMessage(optimisticTurn.sessionId, optimisticTurn.assistantMessageId, {
          content: `Bạn gửi quá nhanh. Vui lòng thử lại sau ${retryValue} giây.`,
          isStreaming: false,
          isError: true,
        });
        toast.error(`Rate limit: thử lại sau ${retryValue}s`);
        return;
      }
      updateAssistantMessage(optimisticTurn.sessionId, optimisticTurn.assistantMessageId, {
        content: `Lỗi khi tối ưu prompt: ${fallbackMessage}`,
        isStreaming: false,
        isError: true,
      });
      toast.error('Tối ưu prompt thất bại');
    } finally {
      setIsLoading(false);
    }
  }, [
    addUserTurnWithOptimisticAssistant,
    input,
    inputLanguagePreference,
    isLoading,
    outputLanguageMode,
    retryAfterSec,
    updateAssistantMessage,
  ]);

  const handleCopyMessage = useCallback(async (message: PromptOptimizerMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      toast.success('Đã sao chép!');
      window.setTimeout(() => setCopiedMessageId(null), 1800);
    } catch {
      toast.error('Không thể sao chép vào clipboard');
    }
  }, []);

  const emptyState = useMemo(
    () => (
      <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--accent)]">
          <MessageCircleMore className="h-5 w-5" />
        </div>
        <p className="text-base font-semibold text-[var(--app-text)]">Bắt đầu tối ưu prompt</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--app-text-muted)]">
          Nhập prompt thô ở bên dưới, AI sẽ tối ưu và giữ ngữ cảnh theo phiên hiện tại.
        </p>
      </div>
    ),
    [],
  );

  if (!activeSession) {
    return <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">Đang tải...</div>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow)]">
      <div className="flex h-[calc(100dvh-8.5rem)] min-h-[560px]">
        <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <ThreadHeader
            activeThreadTitle={activeThreadTitle}
            threadId={threadId}
            compareMode={compareMode}
            onToggleCompare={() => setCompareMode(!compareMode)}
            onNewSession={startNewSession}
            onToggleInfo={() => setShowInfo((value) => !value)}
            onToggleHistoryPanel={() => setShowHistoryPanel((value) => !value)}
            isHistoryPanelOpen={showHistoryPanel}
            onToggleNavigation={onToggleNavigation}
            onToggleDesktopNavigationMode={onToggleDesktopNavigationMode}
            isDesktopNavigationDocked={isDesktopNavigationDocked}
            isNavigationCollapsed={isNavigationCollapsed}
          />

          {showInfo && (
            <div className="border-b border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--app-text-muted)] sm:px-5">
              <p className="font-semibold text-[var(--app-text)]">Prompt Optimizer</p>
              <p>
                Công cụ tối ưu prompt theo ngữ cảnh hội thoại. Bạn có thể nhập bằng VI/EN, xuất EN/VI/Both,
                xem preview song ngữ trước khi copy, và copy riêng EN, VI hoặc Both.
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            {messages.length === 0 && emptyState}

            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={message.role === 'user' ? 'w-full max-w-2xl' : 'w-full max-w-4xl'}>
                    {message.role === 'user' ? (
                      <div className="rounded-2xl border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--accent)_9%,var(--app-surface))] px-4 py-3 text-sm leading-6 text-[var(--app-text)]">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ) : message.isStreaming ? (
                      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)]">
                        <PromptOptimizerTypingDots />
                      </div>
                    ) : message.parsedResult ? (
                      <OptimizedResultView
                        result={message.parsedResult}
                        originalInput={message.originalInput || ''}
                        compareMode={compareMode}
                        outputLanguageMode={outputLanguageMode}
                        displayMode={displayMode}
                        previewMode={previewMode}
                      />
                    ) : (
                      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
                        <p className={`whitespace-pre-wrap text-sm leading-6 ${message.isError ? 'text-rose-500 dark:text-rose-300' : 'text-[var(--app-text)]'}`}>
                          {message.content}
                        </p>
                        {!message.isError && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(message)}
                              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)]"
                            >
                              {copiedMessageId === message.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              <span>{copiedMessageId === message.id ? 'Đã sao chép!' : 'Copy'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-4 sm:px-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label htmlFor="input-language-selector" className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                Input language
              </label>
              <select
                id="input-language-selector"
                value={inputLanguagePreference}
                onChange={(event) => setInputLanguagePreference(event.target.value as InputLanguagePreference)}
                className="min-h-10 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm text-[var(--app-text)] focus:border-[color-mix(in_srgb,var(--accent)_40%,var(--app-border))] focus:outline-none"
              >
                {INPUT_LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowOutputPreferences((value) => !value)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] hover:bg-[color-mix(in_srgb,var(--accent)_9%,var(--app-surface))]"
              >
                <Settings2 className="h-4 w-4" />
                <span>Output Preferences</span>
              </button>
            </div>

            {showOutputPreferences && (
              <div className="mb-3 space-y-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-3">
                <PreferenceButtonGroup
                  title="Prompt output language"
                  options={OUTPUT_LANGUAGE_OPTIONS}
                  value={outputLanguageMode}
                  onChange={setOutputLanguageMode}
                />
                <PreferenceButtonGroup
                  title="Display mode"
                  options={DISPLAY_MODE_OPTIONS}
                  value={displayMode}
                  onChange={setDisplayMode}
                />
                <PreferenceButtonGroup
                  title="Preview mode"
                  options={PREVIEW_MODE_OPTIONS}
                  value={previewMode}
                  onChange={setPreviewMode}
                />
              </div>
            )}

            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                data-testid="prompt-optimizer-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setShowInfo(false);
                    setShowHistoryPanel(false);
                    setShowOutputPreferences(false);
                    return;
                  }
                  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    void submitPrompt();
                  }
                }}
                rows={1}
                disabled={isLoading}
                placeholder="Nhập prompt... (Ctrl+Enter để gửi)"
                className="min-h-12 max-h-56 w-full resize-none rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:border-[color-mix(in_srgb,var(--accent)_50%,var(--app-border))] focus:outline-none"
              />
              <button
                type="button"
                data-testid="prompt-optimizer-submit"
                aria-label="Gửi prompt"
                onClick={() => void submitPrompt()}
                disabled={isLoading || !input.trim() || retryAfterSec > 0}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_16%,var(--app-surface))] text-[var(--app-text)] hover:bg-[color-mix(in_srgb,var(--accent)_22%,var(--app-surface))] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--app-text-muted)]">
              Mẹo: Esc để đóng panel, Ctrl+Enter để gửi prompt. Bilingual mặc định luôn tạo EN + VI.
            </p>
            {retryAfterSec > 0 && (
              <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                Rate limit đang bật. Bạn có thể gửi lại sau {retryAfterSec}s.
              </p>
            )}
          </div>
        </section>
      </div>

      <div
        className={`absolute inset-0 z-30 transition-[opacity,visibility] duration-300 ${
          showHistoryPanel ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div className={showHistoryPanel ? 'pointer-events-auto' : 'pointer-events-none'}>
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Đóng drawer lịch sử"
            onClick={() => setShowHistoryPanel(false)}
          />
          <div
            ref={historyPanelContainerRef}
            className={`absolute overflow-hidden border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow)] transition-transform duration-300 ${
              isMobileViewport
                ? `${showHistoryPanel ? 'translate-y-0' : 'translate-y-full'} inset-x-0 bottom-0 h-[min(78%,560px)] rounded-t-2xl border-t`
                : `${showHistoryPanel ? 'translate-x-0' : 'translate-x-full'} right-0 top-0 h-full w-[88%] max-w-sm border-l`
            }`}
          >
            {isMobileViewport && (
              <div className="flex justify-center py-2">
                <span className="h-1.5 w-12 rounded-full bg-[var(--app-border-strong)]" />
              </div>
            )}
            <PromptOptimizerHistoryPanel
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={(sessionId) => {
                selectSession(sessionId);
                setShowHistoryPanel(false);
              }}
              onNewSession={() => {
                startNewSession();
                setShowHistoryPanel(false);
              }}
              isMobile={isMobileViewport}
              onCloseMobile={() => setShowHistoryPanel(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const PromptOptimizerChat: React.FC<PromptOptimizerChatProps> = (props) => {
  return (
    <PromptOptimizerConversationProvider>
      <PromptOptimizerContent {...props} />
    </PromptOptimizerConversationProvider>
  );
};

export default PromptOptimizerChat;
