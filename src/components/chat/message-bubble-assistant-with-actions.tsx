import React, { useState } from 'react';
import { Bot, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { MessageReactionsContainer } from './message-reactions-container';

interface MessageBubbleAssistantProps {
  content: string;
  messageId?: string;
}

export const MessageBubbleAssistant: React.FC<MessageBubbleAssistantProps> = ({ content, messageId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Đã sao chép vào clipboard', {
        icon: <Check className="w-4 h-4 text-green-400" />,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép. Vui lòng thử lại.');
    }
  };

  return (
    <div className="group/message flex gap-3 py-4 px-4 relative">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-100">ClaudeKit</span>
          <span className="text-xs text-gray-500">Trợ lý AI</span>
          <Sparkles className="w-3 h-3 text-purple-400" />
        </div>
        <div className="relative">
          <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[90%]">
            <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">{content}</div>
          </div>
          {/* Actions - MOBILE: below, DESKTOP: overlay */}
          <div className="
            flex items-center gap-1 mt-2
            md:mt-0 md:absolute md:-top-2 md:right-0
            opacity-100 md:opacity-0
            md:group-hover/message:opacity-100
            transition-opacity duration-200
          ">
            <div className="flex items-center gap-1 bg-gray-800/95 md:backdrop-blur-md md:border md:border-gray-700/50 md:rounded-lg md:shadow-xl p-1">
              <button
                onClick={handleCopy}
                className="p-2 md:p-1.5 hover:bg-gray-700/50 rounded-md transition-colors"
                title="Sao chép tin nhắn"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
              <button className="p-2 md:p-1.5 hover:bg-gray-700/50 rounded-md transition-colors" title="Tạo lại">
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
        {messageId && <MessageReactionsContainer messageId={messageId} />}
      </div>
    </div>
  );
};
