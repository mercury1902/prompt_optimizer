import React, { useState } from 'react';
import { User, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { MessageReactionsContainer } from './message-reactions-container';

interface MessageBubbleUserProps {
  content: string;
  messageId?: string;
  timestampLabel?: string;
}

export const MessageBubbleUser: React.FC<MessageBubbleUserProps> = ({
  content,
  messageId,
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
      <div className="ml-auto flex max-w-[768px] flex-row-reverse items-start gap-3">
        <div className="order-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] shadow-[var(--app-shadow-soft)]">
          <User className="h-4 w-4" />
        </div>
        <div className="order-1 flex min-w-0 flex-1 flex-col items-end">
          <div className="relative max-w-full">
            <div className="max-w-[min(100%,680px)] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] bg-brand-400/20 px-5 py-4 text-[15px] leading-7 text-[var(--app-text)] shadow-[var(--app-shadow-soft)] transition-colors duration-200 group-hover/message:bg-[color-mix(in_srgb,var(--app-surface-muted)_82%,var(--app-surface))]">
              <div className="whitespace-pre-wrap break-words">{content}</div>
            </div>
            <div className="mt-2 flex items-center justify-end gap-1 opacity-100 transition-opacity duration-200 md:absolute md:-top-2 md:right-0 md:mt-0 md:opacity-0 md:group-hover/message:opacity-100">
              <button
                onClick={handleCopy}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)]"
                title="Sao chép tin nhắn"
                aria-label="Sao chép tin nhắn người dùng"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <span className="mt-2 text-[13px] text-[var(--app-text-muted)]">
            {timestampLabel ? `${timestampLabel} • Bạn` : 'Bạn'}
          </span>
          {messageId && <MessageReactionsContainer messageId={messageId} />}
        </div>
      </div>
    </div>
  );
};
