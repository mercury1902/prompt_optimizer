import React from 'react';
import { X, Plus, Search, MessageSquare, Clock, ChevronRight } from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  sessions: Conversation[];
  activeSessionId?: string | null;
  isLoading?: boolean;
  onSelectSession: (sessionId: string) => void;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt?: string | Date;
  createdAt?: string | Date;
  messageCount?: number;
}

function formatRelativeTime(timestamp?: string | Date): string {
  if (!timestamp) return 'Không rõ thời gian';

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Không rõ thời gian';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'Vừa xong';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} phút trước`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} giờ trước`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} ngày trước`;

  return date.toLocaleDateString('vi-VN');
}

export const HistoryPanelWireframe: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  onNewChat,
  sessions,
  activeSessionId,
  onSelectSession,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredSessions = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sessions;
    return sessions.filter((session) => session.title.toLowerCase().includes(query));
  }, [sessions, searchTerm]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className="absolute right-0 top-0 z-50 flex h-full w-full max-w-[360px] flex-col border-l border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_92%,transparent)] shadow-[var(--app-shadow)] backdrop-blur-xl transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--app-border)] p-4">
          <h2 className="text-lg font-semibold text-[var(--app-text)]">Lịch sử trò chuyện</h2>
          <button
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_16%,var(--app-surface))] px-4 py-3 font-medium text-[var(--app-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_24%,var(--app-surface))]"
          >
            <Plus className="h-4 w-4" />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-muted)]" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-2 pl-10 pr-4 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:border-[color-mix(in_srgb,var(--accent)_50%,var(--app-border))] focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading && (
            <div className="py-6 text-center text-sm text-[var(--app-text-muted)]">Đang tải lịch sử...</div>
          )}

          {!isLoading && filteredSessions.length === 0 && (
            <div className="py-6 text-center text-sm text-[var(--app-text-muted)]">
              {sessions.length === 0 ? 'Chưa có cuộc trò chuyện nào' : 'Không tìm thấy cuộc trò chuyện'}
            </div>
          )}

          {!isLoading && filteredSessions.length > 0 && (
            <div className="space-y-2">
              {filteredSessions.map((conversation) => {
                const isActive = activeSessionId === conversation.id;
                return (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() => onSelectSession(conversation.id)}
                    className={`group flex min-h-11 w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                      isActive
                        ? 'border-[color-mix(in_srgb,var(--accent)_35%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_16%,var(--app-surface))]'
                        : 'border-transparent bg-[var(--app-surface)] hover:border-[var(--app-border)] hover:bg-[var(--app-surface-muted)]'
                    }`}
                  >
                    <div className={`rounded-lg border p-2 ${isActive ? 'border-[color-mix(in_srgb,var(--accent)_30%,var(--app-border))] bg-[color-mix(in_srgb,var(--accent)_12%,var(--app-surface))]' : 'border-[var(--app-border)] bg-[var(--app-surface-muted)]'}`}>
                      <MessageSquare className={`h-4 w-4 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--app-text-muted)]'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`truncate text-sm font-medium ${isActive ? 'text-[var(--app-text)]' : 'text-[var(--app-text)]'}`}>
                        {conversation.title || 'Cuộc trò chuyện chưa có tiêu đề'}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-[13px] text-[var(--app-text-muted)]">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(conversation.updatedAt ?? conversation.createdAt)}</span>
                        {typeof conversation.messageCount === 'number' && (
                          <>
                            <span>•</span>
                            <span>{conversation.messageCount} tin nhắn</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Notice */}
        <div className="border-t border-[var(--app-border)] bg-[var(--app-surface)] p-4">
          <p className="text-center text-xs text-[var(--app-text-muted)]">
            Dữ liệu lịch sử được tải từ phiên chat đã lưu
          </p>
        </div>
      </aside>
    </>
  );
};
