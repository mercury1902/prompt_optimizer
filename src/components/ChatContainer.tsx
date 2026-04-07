/**
 * @deprecated Use ChatFrameWithGlassmorphismAndVietnamese from components/chat/ instead.
 * This component will be removed in a future release.
 */

import { useAstroChat } from '../hooks/useAstroChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import type { UIMessage } from '../types/chat';

interface ChatContainerProps {
  apiPath?: string;
  initialMessages?: UIMessage[];
  title?: string;
}

export function ChatContainer({
  apiPath = '/api/chat',
  initialMessages = [],
  title = 'ClaudeKit Chat',
}: ChatContainerProps) {
  const { messages, input, setInput, status, handleSubmit, stop } = useAstroChat({
    apiPath,
    initialMessages,
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div
      className="flex flex-col h-full bg-white dark:bg-gray-900"
      role="main"
      aria-label={title}
    >
      <header className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-900">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
      </header>

      <MessageList messages={messages} isStreaming={isStreaming} />

      <ChatInput
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isStreaming={isStreaming}
        onStop={stop}
      />
    </div>
  );
}
