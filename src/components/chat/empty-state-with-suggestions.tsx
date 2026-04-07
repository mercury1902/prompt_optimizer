import React from 'react';
import { Code, BookOpen, Bug, Zap, MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
  onCommandPaletteOpen: () => void;
}

const quickSuggestions = [
  { icon: Code, label: 'Viết code', text: 'Viết một hàm JavaScript để...', color: 'blue' },
  { icon: BookOpen, label: 'Giải thích', text: 'Giải thích khái niệm...', color: 'green' },
  { icon: Bug, label: 'Debug lỗi', text: 'Giúp tôi sửa lỗi này...', color: 'red' },
  { icon: Zap, label: 'Lệnh nhanh', text: '/', color: 'yellow' },
];

export const EmptyStateWithSuggestions: React.FC<EmptyStateProps> = ({
  onSuggestionClick,
  onCommandPaletteOpen,
}) => {
  const handleSuggestionClick = (suggestion: typeof quickSuggestions[0]) => {
    if (suggestion.text === '/') {
      onCommandPaletteOpen();
    } else {
      onSuggestionClick(suggestion.text);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="glass-card-depth-2 animated-border max-w-md w-full p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">
            Bắt đầu cuộc trò chuyện mới
          </h2>
          <p className="text-sm text-gray-400">
            Chọn gợi ý bên dưới hoặc nhập câu hỏi của bạn
          </p>
        </div>

        {/* Suggestion Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {quickSuggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            const colorClasses: Record<string, { icon: string; border: string }> = {
              blue: { icon: 'text-blue-400', border: 'hover:border-blue-500/30' },
              green: { icon: 'text-green-400', border: 'hover:border-green-500/30' },
              red: { icon: 'text-red-400', border: 'hover:border-red-500/30' },
              yellow: { icon: 'text-yellow-400', border: 'hover:border-yellow-500/30' },
            };
            const colors = colorClasses[suggestion.color];

            return (
              <button
                key={suggestion.label}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl
                  bg-gray-800/50 hover:bg-gray-700/50
                  border border-gray-700/50 ${colors.border}
                  transition-all duration-200
                  group
                `}
              >
                <Icon className={`w-5 h-5 ${colors.icon}`} />
                <span className="text-sm text-gray-300 group-hover:text-gray-100">
                  {suggestion.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Keyboard Hints */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400">/</kbd>
            <span>cho lệnh</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400">⌘K</kbd>
            <span>cho palette</span>
          </span>
        </div>
      </div>
    </div>
  );
};
