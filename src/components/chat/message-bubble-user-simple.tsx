import React from 'react';
import { User } from 'lucide-react';

interface MessageBubbleUserProps {
  content: string;
}

export const MessageBubbleUser: React.FC<MessageBubbleUserProps> = ({ content }) => {
  return (
    <div className="group/message flex gap-3 py-4 px-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center order-2 shadow-lg shadow-blue-500/20">
        <User className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 flex flex-col items-end order-1">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%] shadow-lg shadow-blue-500/10">
          <div className="text-gray-100 leading-relaxed">{content}</div>
        </div>
        <span className="text-xs text-gray-500 mt-1">Bạn</span>
      </div>
    </div>
  );
};
