import React from 'react';
import { Zap, RefreshCw, History, Plus } from 'lucide-react';

interface ChatHeaderProps {
  apiStatus: 'checking' | 'ready' | 'error';
  onRefresh: () => void;
  onToggleHistory: () => void;
  onNewChat: () => void;
  showHistory: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  apiStatus,
  onRefresh,
  onToggleHistory,
  onNewChat,
  showHistory
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-800/50 backdrop-blur-md border-b border-gray-700/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-gray-100">ClaudeKit Chat</h1>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            {apiStatus === 'checking' && (
              <><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />Đang kết nối...</>
            )}
            {apiStatus === 'ready' && (
              <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Trợ lý AI đang hoạt động</>
            )}
            {apiStatus === 'error' && (
              <><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Lỗi kết nối API</>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {apiStatus === 'error' && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all text-sm"
            title="Xóa cache và tải lại"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
        )}
        <button
          onClick={onToggleHistory}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-sm"
        >
          <History className="w-4 h-4" />
          <span>Lịch sử</span>
        </button>
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Cuộc trò chuyện mới</span>
        </button>
      </div>
    </header>
  );
};
