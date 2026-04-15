import React, { useState } from 'react';
import { Bot, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { MessageReactionsContainer } from './message-reactions-container';

interface MessageBubbleAssistantProps {
  content: string;
  messageId?: string;
  isTyping?: boolean;
  timestampLabel?: string;
}

export const MessageBubbleAssistant: React.FC<MessageBubbleAssistantProps> = ({
  content,
  messageId,
  isTyping = false,
  timestampLabel,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Đã sao chép vào clipboard', {
        icon: <Check className="w-4 h-4 text-green-400" />,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép. Vui lòng thử lại.');
    }
  };

  return (
    <div className="group/message message-enter px-4 py-3 sm:px-8 md:px-10">
      <div className="mx-auto flex w-full max-w-[768px] items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--accent)] shadow-[var(--app-shadow-soft)]">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--app-text)]">ClaudeKit</span>
            <span className="text-[13px] text-[var(--app-text-muted)]">Trợ lý AI</span>
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
          </div>
          <div className="relative max-w-[min(100%,680px)] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-4 text-[15px] leading-7 text-[var(--app-text)] shadow-[var(--app-shadow-soft)] transition-colors duration-200 group-hover/message:bg-[color-mix(in_srgb,var(--app-surface)_92%,var(--app-surface-muted))]">
            {isTyping ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="optimizer-skeleton-shimmer h-3 w-2/3 rounded-full" />
                  <div className="optimizer-skeleton-shimmer h-3 w-full rounded-full" />
                  <div className="optimizer-skeleton-shimmer h-3 w-4/5 rounded-full" />
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-[var(--app-text-muted)]">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)] [animation-delay:0ms]" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)] [animation-delay:120ms]" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)] [animation-delay:240ms]" />
                  <span className="ml-1">Đang trả lời...</span>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">{content}</div>
            )}
          </div>
          {!isTyping && content.trim().length > 0 && (
            <div className="mt-2 flex items-center gap-1 opacity-100 transition-opacity duration-200 md:mt-0 md:absolute md:-top-2 md:right-0 md:opacity-0 md:group-hover/message:opacity-100">
              <div className="flex items-center gap-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-1 shadow-[var(--app-shadow-soft)]">
                <button
                  onClick={handleCopy}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
                  title="Sao chép tin nhắn"
                  aria-label="Sao chép phản hồi"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
                  title="Tạo lại"
                  aria-label="Tạo lại phản hồi"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {timestampLabel && (
            <span className="mt-2 block text-[13px] text-[var(--app-text-muted)]">
              {timestampLabel}
            </span>
          )}
          {messageId && <MessageReactionsContainer messageId={messageId} />}
        </div>
      </div>
    </div>
  );
};
