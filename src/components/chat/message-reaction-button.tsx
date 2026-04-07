import React from 'react';

interface MessageReactionButtonProps {
  emoji: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  label: string;
}

export const MessageReactionButton: React.FC<MessageReactionButtonProps> = ({
  emoji,
  count,
  isActive,
  onClick,
  label,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1 px-2 py-1 rounded-lg
        transition-all duration-200
        ${isActive
          ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
          : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
        }
      `}
      aria-label={`${label}: ${count}`}
      title={label}
    >
      <span className="text-sm">{emoji}</span>
      {count > 0 && (
        <span className="text-xs font-medium min-w-[14px] text-center">
          {count}
        </span>
      )}
    </button>
  );
};
