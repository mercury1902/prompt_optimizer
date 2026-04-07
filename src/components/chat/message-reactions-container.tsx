import React, { useState, useEffect, useCallback } from 'react';
import { MessageReactionButton } from './message-reaction-button';

interface MessageReactionsContainerProps {
  messageId: string;
}

interface ReactionState {
  helpful: number;
  notHelpful: number;
  save: number;
  userReaction: 'helpful' | 'notHelpful' | 'save' | null;
}

const REACTIONS = [
  { id: 'helpful', emoji: '👍', label: 'Hữu ích' },
  { id: 'notHelpful', emoji: '👎', label: 'Không hữu ích' },
  { id: 'save', emoji: '⭐', label: 'Lưu lại' },
] as const;

export const MessageReactionsContainer: React.FC<MessageReactionsContainerProps> = ({
  messageId,
}) => {
  const storageKey = `claudekit-reactions-${messageId}`;

  const [reactions, setReactions] = useState<ReactionState>(() => {
    if (typeof window === 'undefined') {
      return { helpful: 0, notHelpful: 0, save: 0, userReaction: null };
    }
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return { helpful: 0, notHelpful: 0, save: 0, userReaction: null };
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(reactions));
  }, [reactions, storageKey]);

  const handleReaction = useCallback((type: 'helpful' | 'notHelpful' | 'save') => {
    setReactions((prev) => {
      const wasActive = prev.userReaction === type;

      if (wasActive) {
        return {
          ...prev,
          [type]: Math.max(0, prev[type] - 1),
          userReaction: null,
        };
      }

      const newReactions = { ...prev };

      if (prev.userReaction) {
        newReactions[prev.userReaction] = Math.max(0, prev[prev.userReaction] - 1);
      }

      newReactions[type] = prev[type] + 1;
      newReactions.userReaction = type;

      return newReactions;
    });
  }, []);

  return (
    <div className="flex items-center gap-1 mt-2">
      {REACTIONS.map((reaction) => (
        <MessageReactionButton
          key={reaction.id}
          emoji={reaction.emoji}
          count={reactions[reaction.id]}
          isActive={reactions.userReaction === reaction.id}
          onClick={() => handleReaction(reaction.id)}
          label={reaction.label}
        />
      ))}
    </div>
  );
};
