import { Bot } from 'lucide-react';
import { MessageContent } from './MessageContent';
import { TypingIndicator } from './TypingIndicator';
import type { UIMessage } from '../types/chat';

interface AssistantMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
  isLast?: boolean;
}

export function AssistantMessage({
  message,
  isStreaming = false,
  isLast = false,
}: AssistantMessageProps) {
  const showIndicator = isStreaming && isLast;

  return (
    <div
      className="flex gap-3 sm:gap-4 py-3 px-3 sm:px-4 bg-gray-50 dark:bg-gray-900/50"
      role="listitem"
      aria-label="Assistant message"
    >
      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 flex items-center justify-center">
        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
          Assistant
        </div>
        <div className="text-gray-800 dark:text-gray-200">
          {message.content ? (
            <MessageContent content={message.content} />
          ) : showIndicator ? (
            <TypingIndicator />
          ) : null}
        </div>
      </div>
    </div>
  );
}
