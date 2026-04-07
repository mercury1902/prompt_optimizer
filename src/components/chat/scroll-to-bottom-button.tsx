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
      className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-full shadow-lg text-gray-200 hover:bg-gray-700/90 transition-all z-30"
      aria-label="Cuộn xuống dưới"
    >
      <ChevronDown className="w-4 h-4" />
      <span className="text-sm">Xuống dưới</span>
      {unreadCount && unreadCount > 0 && (
        <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
};
