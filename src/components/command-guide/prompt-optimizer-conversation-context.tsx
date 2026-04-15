import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ParsedPromptResult } from '../../utils/prompt-response-parser';

const STORAGE_KEY = 'claudekit:prompt-optimizer:sessions:v2';
const DEFAULT_SESSION_TITLE = 'Phiên mới';

export interface PromptOptimizerMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  originalInput?: string;
  parsedResult?: ParsedPromptResult;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface PromptOptimizerSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: PromptOptimizerMessage[];
}

interface PromptOptimizerConversationContextValue {
  sessions: PromptOptimizerSession[];
  activeSessionId: string;
  activeSession: PromptOptimizerSession | null;
  compareMode: boolean;
  setCompareMode: (nextValue: boolean) => void;
  startNewSession: () => void;
  selectSession: (sessionId: string) => void;
  addUserTurnWithOptimisticAssistant: (userInput: string) => {
    sessionId: string;
    assistantMessageId: string;
    modelMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  } | null;
  updateAssistantMessage: (
    sessionId: string,
    assistantMessageId: string,
    nextMessage: Partial<PromptOptimizerMessage>,
  ) => void;
}

const PromptOptimizerConversationContext =
  createContext<PromptOptimizerConversationContextValue | null>(null);

function createSession(): PromptOptimizerSession {
  const now = Date.now();
  return {
    id: `optimizer-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: DEFAULT_SESSION_TITLE,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function deriveSessionTitleFromMessage(message: string): string {
  const normalized = message.replace(/\s+/g, ' ').trim();
  if (!normalized) return DEFAULT_SESSION_TITLE;
  return normalized.length > 48 ? `${normalized.slice(0, 45)}...` : normalized;
}

function isModelEligibleMessage(
  message: PromptOptimizerMessage,
): message is PromptOptimizerMessage & { role: 'user' | 'assistant'; content: string } {
  return (message.role === 'user' || message.role === 'assistant') && Boolean(message.content.trim());
}

export const PromptOptimizerConversationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessions, setSessions] = useState<PromptOptimizerSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { sessions?: PromptOptimizerSession[]; activeSessionId?: string };
        if (Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
          setSessions(parsed.sessions);
          setActiveSessionId(parsed.activeSessionId && parsed.sessions.some((s) => s.id === parsed.activeSessionId)
            ? parsed.activeSessionId
            : parsed.sessions[0].id);
          return;
        }
      }
    } catch {
      // Ignore malformed storage and recreate.
    }

    const session = createSession();
    setSessions([session]);
    setActiveSessionId(session.id);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || sessions.length === 0 || !activeSessionId) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions, activeSessionId }));
    } catch {
      // Ignore persistence failures.
    }
  }, [sessions, activeSessionId]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const startNewSession = useCallback(() => {
    const nextSession = createSession();
    setSessions((previousSessions) => [nextSession, ...previousSessions]);
    setActiveSessionId(nextSession.id);
  }, []);

  const addUserTurnWithOptimisticAssistant = useCallback(
    (userInput: string) => {
      if (!activeSession) return null;

      const now = Date.now();
      const userMessageId = `user-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const assistantMessageId = `assistant-${(now + 1).toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const modelMessages = activeSession.messages
        .filter((message) => !message.isStreaming && !message.isError)
        .filter(isModelEligibleMessage)
        .map((message) => ({ role: message.role, content: message.content }))
        .concat({ role: 'user' as const, content: userInput });

      setSessions((previousSessions) =>
        previousSessions.map((session) => {
          if (session.id !== activeSession.id) return session;

          const userMessage: PromptOptimizerMessage = {
            id: userMessageId,
            role: 'user',
            content: userInput,
            createdAt: now,
          };
          const assistantMessage: PromptOptimizerMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            createdAt: now,
            originalInput: userInput,
            isStreaming: true,
          };

          return {
            ...session,
            title: session.title === DEFAULT_SESSION_TITLE ? deriveSessionTitleFromMessage(userInput) : session.title,
            updatedAt: now,
            messages: [...session.messages, userMessage, assistantMessage],
          };
        }),
      );

      return {
        sessionId: activeSession.id,
        assistantMessageId,
        modelMessages,
      };
    },
    [activeSession],
  );

  const updateAssistantMessage = useCallback(
    (sessionId: string, assistantMessageId: string, nextMessage: Partial<PromptOptimizerMessage>) => {
      const now = Date.now();
      setSessions((previousSessions) =>
        previousSessions.map((session) => {
          if (session.id !== sessionId) return session;

          return {
            ...session,
            updatedAt: now,
            messages: session.messages.map((message) =>
              message.id === assistantMessageId ? { ...message, ...nextMessage } : message,
            ),
          };
        }),
      );
    },
    [],
  );

  const contextValue = useMemo<PromptOptimizerConversationContextValue>(
    () => ({
      sessions,
      activeSessionId,
      activeSession,
      compareMode,
      setCompareMode,
      startNewSession,
      selectSession,
      addUserTurnWithOptimisticAssistant,
      updateAssistantMessage,
    }),
    [
      sessions,
      activeSessionId,
      activeSession,
      compareMode,
      startNewSession,
      selectSession,
      addUserTurnWithOptimisticAssistant,
      updateAssistantMessage,
    ],
  );

  return (
    <PromptOptimizerConversationContext.Provider value={contextValue}>
      {children}
    </PromptOptimizerConversationContext.Provider>
  );
};

export function usePromptOptimizerConversation(): PromptOptimizerConversationContextValue {
  const context = useContext(PromptOptimizerConversationContext);
  if (!context) {
    throw new Error('usePromptOptimizerConversation must be used inside PromptOptimizerConversationProvider');
  }
  return context;
}
