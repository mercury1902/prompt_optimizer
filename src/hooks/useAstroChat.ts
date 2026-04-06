import { useState, useCallback, useRef, useReducer } from 'react';
import type { UIMessage, ChatStatus, UseAstroChatReturn } from '../types/chat';

interface UseAstroChatOptions {
  apiPath?: string;
  initialMessages?: UIMessage[];
}

export function useAstroChat(options: UseAstroChatOptions = {}): UseAstroChatReturn {
  const { apiPath = '/api/chat', initialMessages = [] } = options;

  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [input, setInput] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);

    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStatus('streaming');

    abortRef.current = new AbortController();

    try {
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantId: string | null = null;

      if (!reader) {
        throw new Error('No response body available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages(prev => {
          if (assistantId && prev.find(m => m.id === assistantId)) {
            return prev.map(m =>
              m.id === assistantId
                ? { ...m, content: assistantContent }
                : m
            );
          }
          assistantId = crypto.randomUUID();
          return [...prev, {
            id: assistantId,
            role: 'assistant',
            content: assistantContent,
            createdAt: new Date(),
          }];
        });
      }

      setStatus('idle');
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setStatus('error');
        setError(err);
      } else {
        setStatus('idle');
      }
    }
  }, [input, messages, apiPath]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
  }, []);

  return {
    messages,
    input,
    setInput,
    status,
    handleSubmit,
    stop,
    error
  };
}
