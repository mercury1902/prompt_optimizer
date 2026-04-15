import React from 'react';
import { Clock3, MessageSquareText, Plus, X } from 'lucide-react';
import type { PromptOptimizerSession } from './prompt-optimizer-conversation-context';

interface PromptOptimizerHistoryPanelProps {
  sessions: PromptOptimizerSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

function formatSessionTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffMs = now - date.getTime();

  if (diffMs < 60_000) return 'Vừa xong';
  if (diffMs < 3_600_000) return `${Math.max(1, Math.floor(diffMs / 60_000))} phút`;
  if (diffMs < 86_400_000) return `${Math.max(1, Math.floor(diffMs / 3_600_000))} giờ`;
  return date.toLocaleDateString('vi-VN');
}

function SessionList({
  sessions,
  activeSessionId,
  onSelectSession,
}: Pick<
  PromptOptimizerHistoryPanelProps,
  'sessions' | 'activeSessionId' | 'onSelectSession'
>) {
  return (
    <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
      {sessions.map((session) => {
        const lastMessage = [...session.messages].reverse().find((message) => message.role === 'assistant');
        const preview = lastMessage?.content?.replace(/\s+/g, ' ').trim() || 'Chưa có kết quả tối ưu';
        const isActive = session.id === activeSessionId;

        return (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelectSession(session.id)}
            className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
              isActive
                ? 'border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_13%,var(--app-surface))]'
                : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-muted)]'
            }`}
          >
            <p className="truncate text-sm font-semibold text-[var(--app-text)]">{session.title}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-text-muted)]">{preview}</p>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--app-text-muted)]">
              <Clock3 className="h-3.5 w-3.5" />
              <span>{formatSessionTime(session.updatedAt)}</span>
              <span>•</span>
              <span>{session.messages.length} mục</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export const PromptOptimizerHistoryPanel: React.FC<PromptOptimizerHistoryPanelProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  isMobile = false,
  onCloseMobile,
}) => {
  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--app-border)] px-3 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--app-text)]">
          <MessageSquareText className="h-4.5 w-4.5 text-[var(--accent)]" />
          <span>Lịch sử</span>
        </div>
        {isMobile && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)]"
            aria-label="Đóng lịch sử"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3 py-3">
        <button
          type="button"
          onClick={onNewSession}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_14%,var(--app-surface))] px-3 py-2 text-sm font-medium text-[var(--app-text)] hover:bg-[color-mix(in_srgb,var(--accent)_20%,var(--app-surface))]"
        >
          <Plus className="h-4 w-4" />
          <span>New Session</span>
        </button>
      </div>

      <SessionList
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSession}
      />
    </div>
  );
};
