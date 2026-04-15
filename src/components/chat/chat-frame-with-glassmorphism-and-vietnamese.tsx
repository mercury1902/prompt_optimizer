const BUILD_VERSION = '2026-04-14-001';
console.log('[Chat] Build version:', BUILD_VERSION);

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { MessageBubbleUser } from './message-bubble-user-simple';
import { MessageBubbleAssistant } from './message-bubble-assistant-with-actions';
import { CommandPalette } from './command-palette-with-cmdk';
import { ChatInput, type CommandSuggestion } from './chat-input-with-keyboard-shortcuts';
import { ChatHeader } from './chat-header-with-status';
import { ErrorBannerWithRetry } from './error-banner-with-retry';
import { ScrollToBottomButton } from './scroll-to-bottom-button';
import { HistoryPanelWireframe } from './history-panel-wireframe';
import {
  VirtualizedChatMessageList,
  type VirtualizedChatMessage,
  type VirtualizedChatMessageListHandle,
} from './virtualized-chat-message-list';
import { EmptyStateWithSuggestions } from './empty-state-with-suggestions';
import { commands } from '../../data/commands';
import { detectIntent, recommendCommands } from '../../lib/command-recommender';
import { getSmartRecommendation } from '../../lib/workflow-recommendation-engine';
import { appendChunkAndExtractSseEvents, extractDataPayloadFromSseEvent } from '../../utils/sse-event-parser';
import { trackCommandTelemetryEvent } from '../../lib/local-command-usage-telemetry';

interface Message extends VirtualizedChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  isTyping?: boolean;
}

interface ChatSessionSummary {
  id: string;
  title: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  messageCount?: number;
}

interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  createdAt?: string;
}

function normalizeCommandToken(commandToken: string): string {
  const trimmed = commandToken.trim();
  return trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
}

function resolveCommandName(commandToken: string): string {
  const trimmed = commandToken.trim();
  const normalizedToken = normalizeCommandToken(trimmed);

  const matched = commands.find(
    (command) =>
      command.id === normalizedToken ||
      command.name === trimmed ||
      command.name === `/${normalizedToken}`,
  );

  if (matched) {
    return matched.name;
  }

  return trimmed.startsWith('/') ? trimmed : `/${normalizedToken}`;
}

function extractLeadingCommandToken(inputText: string): string | null {
  const trimmed = inputText.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }

  const firstToken = trimmed.split(/\s+/)[0];
  return firstToken || null;
}

function formatMessageTimestamp(createdAt?: string): string | undefined {
  if (!createdAt) return undefined;

  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) return undefined;

  return parsedDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatFrameWithGlassmorphismAndVietnamese() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [commandOpen, setCommandOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'unknown'>('unknown');
  const [isRetrying, setIsRetrying] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const activeSessionIdRef = useRef<string | null>(null);
  const messageListRef = useRef<VirtualizedChatMessageListHandle>(null);

  const commandSuggestion = useMemo<CommandSuggestion | null>(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput || trimmedInput.startsWith('/')) {
      return null;
    }

    const smartRecommendation = getSmartRecommendation(trimmedInput, commands);
    if (smartRecommendation?.type === 'workflow') {
      const firstAction =
        smartRecommendation.workflow.steps.find((step) => step.command !== '/clear') ||
        smartRecommendation.workflow.steps[0];
      const suggestedCommand = resolveCommandName(firstAction?.command || '/ck:plan');

      return {
        command: suggestedCommand,
        confidence: smartRecommendation.confidence,
        reason: smartRecommendation.reason,
        workflowName: smartRecommendation.workflow.name,
        recommendationType: 'workflow',
      };
    }

    const intentMatch = detectIntent(trimmedInput);
    if (intentMatch) {
      return {
        command: resolveCommandName(intentMatch.command),
        confidence: intentMatch.confidence,
        reason: 'Khớp intent trực tiếp từ mô tả hiện tại',
        recommendationType: 'command',
      };
    }

    const rankedRecommendation = recommendCommands(trimmedInput, commands);
    if (!rankedRecommendation.primary) {
      return null;
    }

    return {
      command: rankedRecommendation.primary.command.name,
      confidence: rankedRecommendation.confidence,
      reason: rankedRecommendation.primary.reason,
      recommendationType: 'command',
    };
  }, [input]);

  const renderedMessages = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    const shouldShowTyping = isStreaming && (!lastMessage || lastMessage.role === 'user');

    if (!shouldShowTyping) {
      return messages;
    }

    return [
      ...messages,
      {
        id: 'typing-indicator',
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isTyping: true,
      },
    ];
  }, [messages, isStreaming]);

  useEffect(() => {
    console.log('[Chat] Build version:', BUILD_VERSION);
    void checkApiHealth();
  }, []);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (commandOpen) setCommandOpen(false);
      if (showHistory) setShowHistory(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [commandOpen, showHistory]);

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const body = await response.json().catch(() => ({} as { sessions?: ChatSessionSummary[] }));
      const loadedSessions = Array.isArray(body.sessions) ? body.sessions : [];

      setSessions(
        [...loadedSessions].sort((a, b) => {
          const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
          const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
          return bTime - aTime;
        }),
      );
    } catch (error) {
      console.error('[Chat] Failed to fetch sessions:', error);
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('/api/health');
      setApiStatus(response.ok ? 'ready' : 'error');
    } catch {
      setApiStatus('error');
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (isStreaming) {
      toast.info('Đang nhận phản hồi, vui lòng chờ xong rồi đổi lịch sử');
      return;
    }

    setIsLoadingHistory(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/chat?sessionId=${encodeURIComponent(sessionId)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const body = await response.json().catch(() => ({} as { messages?: StoredMessage[] }));
      const loadedMessages = Array.isArray(body.messages) ? body.messages : [];

      const normalizedMessages: Message[] = loadedMessages
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({
          id: message.id,
          role: message.role as 'user' | 'assistant',
          content: message.content,
          createdAt: message.createdAt ?? new Date().toISOString(),
        }));

      setMessages(normalizedMessages);
      setActiveSessionId(sessionId);
      setShowHistory(false);
      setIsNearBottom(true);
    } catch (error) {
      console.error('[Chat] Failed to load session history:', error);
      toast.error('Không thể tải lịch sử cuộc trò chuyện');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleToggleHistory = () => {
    const willOpen = !showHistory;
    setShowHistory(willOpen);
    if (willOpen) {
      void fetchSessions();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    setErrorMessage(null);
    setErrorType('unknown');
    const nextInput = input.trim();
    const executedCommand = extractLeadingCommandToken(nextInput);
    if (executedCommand) {
      trackCommandTelemetryEvent('run', executedCommand);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: nextInput,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const requestedSessionId = activeSessionIdRef.current;
      const sessionIdAtSendStart = activeSessionIdRef.current;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: nextInput, sessionId: requestedSessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantId: string | null = null;
      let assistantCreatedAt: string | undefined;
      let sseBuffer = '';
      let resolvedSessionId: string | null = requestedSessionId;
      let streamCompletedWithoutError = false;

      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        const decodedChunk = value ? decoder.decode(value, { stream: !done }) : decoder.decode();
        const parsedChunk = appendChunkAndExtractSseEvents(sseBuffer, decodedChunk);
        const eventsToProcess =
          done && parsedChunk.remainder.trim().length > 0
            ? [...parsedChunk.events, parsedChunk.remainder]
            : parsedChunk.events;
        sseBuffer = done ? '' : parsedChunk.remainder;

        for (const eventBlock of eventsToProcess) {
          const data = extractDataPayloadFromSseEvent(eventBlock);
          if (!data || data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data) as { type?: string; content?: string; sessionId?: string };

            if (parsed.type === 'session' && parsed.sessionId) {
              resolvedSessionId = parsed.sessionId;
              continue;
            }

            if (parsed.type === 'chunk' && parsed.content) {
              assistantContent += parsed.content;
              if (!assistantCreatedAt) {
                assistantCreatedAt = new Date().toISOString();
              }

              setMessages((prev) => {
                if (assistantId && prev.find((message) => message.id === assistantId)) {
                  return prev.map((message) =>
                    message.id === assistantId ? { ...message, content: assistantContent } : message,
                  );
                }

                assistantId = (Date.now() + 1).toString();
                return [
                  ...prev,
                  {
                    id: assistantId,
                    role: 'assistant',
                    content: assistantContent,
                    createdAt: assistantCreatedAt,
                  },
                ];
              });
            }
          } catch {
            // Ignore malformed SSE chunks
          }
        }

        if (done) {
          streamCompletedWithoutError = true;
          break;
        }
      }

      if (
        resolvedSessionId &&
        activeSessionIdRef.current === sessionIdAtSendStart &&
        resolvedSessionId !== activeSessionIdRef.current
      ) {
        setActiveSessionId(resolvedSessionId);
      }

      if (executedCommand && streamCompletedWithoutError) {
        trackCommandTelemetryEvent('success', executedCommand);
      }
    } catch (error) {
      console.error('[Chat] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const isNetworkError = errorMsg.includes('fetch') || errorMsg.includes('network');
      setErrorType(isNetworkError ? 'network' : 'server');
      setErrorMessage(`Lỗi kết nối: ${errorMsg}`);
      toast.error(`Lỗi: ${errorMsg}`);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleRetry = async () => {
    if (!errorMessage || isRetrying) return;

    setIsRetrying(true);
    await checkApiHealth();

    const lastUserMessage = messages.findLast((m) => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === 'assistant' && lastMsg.content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      setTimeout(() => {
        void handleSend();
      }, 100);
    }

    setIsRetrying(false);
  };

  const handleDismissError = () => {
    setErrorMessage(null);
    setErrorType('unknown');
  };

  const handleCommandSelect = (command: string) => {
    setInput(`${command} `);
    setCommandOpen(false);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (errorMessage) setErrorMessage(null);
  };

  const handleApplyCommandSuggestion = (command: string) => {
    const normalizedCommand = command.trim();
    if (!normalizedCommand) return;

    setInput((previousInput) => {
      const trimmed = previousInput.trim();
      if (!trimmed || trimmed.startsWith('/')) {
        return `${normalizedCommand} `;
      }
      return `${normalizedCommand} ${trimmed}`;
    });
  };

  const handleClear = () => {
    setMessages([]);
    setInput('');
    setActiveSessionId(null);
    setErrorMessage(null);
    setIsNearBottom(true);
    toast.info('Đã xóa cuộc trò chuyện');
  };

  const scrollToBottom = () => {
    messageListRef.current?.scrollToBottom('smooth');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[var(--app-bg)]">
      <div className="relative flex h-full w-full justify-center px-0 md:px-6 lg:px-10">
        <div className="relative flex h-full w-full max-w-[1140px] flex-col overflow-hidden border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_90%,transparent)] shadow-[var(--app-shadow)] md:rounded-2xl">
          <ChatHeader
            apiStatus={apiStatus}
            onRefresh={() => {
              localStorage.clear();
              window.location.reload();
            }}
            onToggleHistory={handleToggleHistory}
            onNewChat={handleClear}
            showHistory={showHistory}
          />

          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            <div className="relative flex-1">
              {errorMessage && (
                <ErrorBannerWithRetry
                  message={errorMessage}
                  type={errorType}
                  onRetry={handleRetry}
                  onDismiss={handleDismissError}
                  isRetrying={isRetrying}
                />
              )}

              {messages.length === 0 ? (
                <EmptyStateWithSuggestions
                  onSuggestionClick={(text) => {
                    setInput(text);
                    if (text === '/') setCommandOpen(true);
                  }}
                  onCommandPaletteOpen={() => setCommandOpen(true)}
                />
              ) : (
                <VirtualizedChatMessageList
                  ref={messageListRef}
                  messages={renderedMessages}
                  className="h-full overflow-y-auto pb-6 pt-3"
                  onNearBottomChange={setIsNearBottom}
                  renderMessage={(message) =>
                    message.role === 'user' ? (
                      <MessageBubbleUser
                        content={message.content}
                        messageId={message.id}
                      />
                    ) : (
                      <MessageBubbleAssistant
                        content={message.content}
                        messageId={message.id === 'typing-indicator' ? undefined : message.id}
                        isTyping={Boolean(message.isTyping)}
                        timestampLabel={formatMessageTimestamp(message.createdAt)}
                      />
                    )
                  }
                />
              )}

              <ScrollToBottomButton onClick={scrollToBottom} isVisible={!isNearBottom && messages.length > 0} />
            </div>

            <HistoryPanelWireframe
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
              onNewChat={() => {
                handleClear();
                setShowHistory(false);
              }}
              sessions={sessions}
              activeSessionId={activeSessionId}
              isLoading={isLoadingSessions || isLoadingHistory}
              onSelectSession={handleSelectSession}
            />
          </div>

          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSend={handleSend}
            onCommandPaletteOpen={() => setCommandOpen(true)}
            commandSuggestion={commandSuggestion}
            onApplyCommandSuggestion={handleApplyCommandSuggestion}
            onEscape={() => {
              setShowHistory(false);
              setCommandOpen(false);
            }}
            onOpenGuide={() => {
              const basePath = import.meta.env.BASE_URL || '/';
              const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
              window.location.href = `${normalizedBase}guide/`;
            }}
            isStreaming={isStreaming}
          />

          <CommandPalette
            open={commandOpen}
            onOpenChange={setCommandOpen}
            onSelect={handleCommandSelect}
            contextInput={input}
            interactionCount={messages.filter((message) => message.role === 'user').length}
          />
        </div>
      </div>
    </div>
  );
}
