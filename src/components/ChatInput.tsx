import { useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import type { ChatInputProps } from '../types/chat';

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isStreaming,
  onStop,
  placeholder = "Ask anything...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4"
      role="form"
      aria-label="Chat input form"
    >
      <div className="flex gap-2 max-w-3xl mx-auto items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isStreaming}
          className="flex-1 min-h-[48px] max-h-[200px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 sm:p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-base"
          aria-label="Message input"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex-shrink-0 px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors"
            aria-label="Stop generating"
          >
            <Square className="h-5 w-5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex-shrink-0 px-3 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="max-w-3xl mx-auto mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </form>
  );
}
