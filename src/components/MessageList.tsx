/**
 * @deprecated Legacy neutral-theme message list.
 * Fully deprecated in favor of chat/message-bubble components.
 */

import { useEffect, useRef } from 'react';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import type { UIMessage } from '../types/chat';

interface MessageListProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center p-4"
        role="region"
        aria-label="Empty chat"
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium mb-2">Welcome to ClaudeKit Chat</p>
          <p className="text-sm">Start a conversation by typing a message below.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="max-w-3xl mx-auto">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const ref = isLast ? lastMessageRef : undefined;

          return (
            <div key={message.id} ref={ref}>
              {message.role === 'user' ? (
                <UserMessage message={message} />
              ) : (
                <AssistantMessage
                  message={message}
                  isStreaming={isStreaming}
                  isLast={isLast}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
