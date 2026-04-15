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
          ? 'bg-brand-400/20 border border-brand-400/50 text-brand-300'
          : 'bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white'
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
