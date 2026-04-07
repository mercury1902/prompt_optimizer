import React from 'react';
import { X, Plus, Search, MessageSquare, Clock, ChevronRight } from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messageCount: number;
  isActive?: boolean;
}

const mockConversations: Conversation[] = [
  { id: '1', title: 'Thảo luận về React Hooks', timestamp: '2 giờ trước', messageCount: 12, isActive: true },
  { id: '2', title: 'Tối ưu hiệu suất website', timestamp: '5 giờ trước', messageCount: 8 },
  { id: '3', title: 'Giải thích TypeScript Generics', timestamp: 'Hôm qua', messageCount: 15 },
  { id: '4', title: 'Cấu trúc dự án Astro', timestamp: '2 ngày trước', messageCount: 6 },
  { id: '5', title: 'Best practices với Tailwind', timestamp: '3 ngày trước', messageCount: 20 },
];

export const HistoryPanelWireframe: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  onNewChat,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="absolute top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-100">Lịch sử trò chuyện</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>

        {/* Search Input (Disabled) */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              disabled
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-400 placeholder-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">Tính năng tìm kiếm đang được phát triển</p>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-1">
            {mockConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  conversation.isActive
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-lg ${conversation.isActive ? 'bg-blue-500/20' : 'bg-gray-800'}`}>
                  <MessageSquare className={`w-4 h-4 ${conversation.isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${conversation.isActive ? 'text-blue-300' : 'text-gray-200'}`}>
                    {conversation.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{conversation.timestamp}</span>
                    <span>•</span>
                    <span>{conversation.messageCount} tin nhắn</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${conversation.isActive ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Notice */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
          <p className="text-xs text-gray-500 text-center">
            Lưu trữ cuộc trò chuyện sẽ sớm được hỗ trợ
          </p>
        </div>
      </div>
    </>
  );
};
