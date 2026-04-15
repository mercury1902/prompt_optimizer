import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollToBottomButtonProps {
  onClick: () => void;
  unreadCount?: number;
  isVisible: boolean;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  onClick,
  unreadCount,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="absolute bottom-5 right-5 z-30 flex min-h-11 items-center gap-2 rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_90%,transparent)] px-4 py-2 text-[var(--app-text)] shadow-[var(--app-shadow-soft)] backdrop-blur-xl transition-colors hover:bg-[var(--app-surface-muted)]"
      aria-label="Cuộn xuống dưới"
    >
      <ChevronDown className="w-4 h-4" />
      <span className="text-sm">Xuống dưới</span>
      {unreadCount && unreadCount > 0 && (
        <span className="ml-1 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-xs font-medium text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
};
