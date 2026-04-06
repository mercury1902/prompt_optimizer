import React, { useRef, useEffect } from 'react';
import { Send, Square, Command as CommandIcon } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onCommandPaletteOpen: () => void;
  isStreaming?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value = '',
  onChange = () => {},
  onSend = () => {},
  onCommandPaletteOpen = () => {},
  isStreaming = false,
  placeholder = "Nhập / để xem lệnh hoặc hỏi bất cứ điều gì..."
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onCommandPaletteOpenRef = useRef(onCommandPaletteOpen);

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

  return (
    <form onSubmit={handleSend} data-testid="chat-form" className="border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-md p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 items-end">
          <button
            type="button"
            onClick={onCommandPaletteOpen}
            disabled={isStreaming}
            className="flex-shrink-0 p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-all border border-gray-600/50 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Lệnh (⌘K)"
          >
            <CommandIcon className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? "Đang chờ phản hồi..." : placeholder}
              disabled={isStreaming}
              className="w-full min-h-[52px] max-h-[200px] rounded-xl border border-gray-600/50 bg-gray-900/80 text-gray-100 p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all disabled:opacity-50"
              rows={1}
            />
            {value.startsWith('/') && !isStreaming && (
              <div className="absolute right-3 top-3.5">
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Lệnh</span>
              </div>
            )}
            {isStreaming && (
              <div className="absolute right-3 top-3.5">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  Đang gửi...
                </span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!value.trim() || isStreaming}
            className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 disabled:text-blue-400/50 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
          >
            {isStreaming ? (
              <Square className="w-5 h-5 fill-current" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400">/</kbd><span>cho lệnh</span></span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400">⌘K</kbd><span>cho palette</span></span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400">↵</kbd><span>để gửi</span></span>
        </div>
      </div>
    </form>
  );
};
