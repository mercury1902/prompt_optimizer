import { User } from 'lucide-react';
import { MessageContent } from './MessageContent';
import type { UIMessage } from '../types/chat';

interface UserMessageProps {
  message: UIMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div
      className="flex gap-3 sm:gap-4 py-3 px-3 sm:px-4"
      role="listitem"
      aria-label="User message"
    >
      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center">
        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
          You
        </div>
        <div className="text-gray-800 dark:text-gray-200">
          {message.content}
        </div>
      </div>
    </div>
  );
}
