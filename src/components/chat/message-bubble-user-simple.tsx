import React, { useState } from 'react';
import { User, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface MessageBubbleUserProps {
  content: string;
}

export const MessageBubbleUser: React.FC<MessageBubbleUserProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Đã sao chép vào clipboard', {
      icon: <Check className="w-4 h-4 text-green-400" />,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group/message flex gap-3 py-4 px-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center order-2 shadow-lg shadow-blue-500/20">
        <User className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 flex flex-col items-end order-1">
        <div className="relative">
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%] shadow-lg shadow-blue-500/10">
            <div className="text-gray-100 leading-relaxed">{content}</div>
          </div>
          {/* Actions - MOBILE: below, DESKTOP: overlay */}
          <div className="
            flex items-center gap-1 mt-2 justify-end
            md:mt-0 md:absolute md:-top-2 md:right-0
            opacity-100 md:opacity-0
            md:group-hover/message:opacity-100
            transition-opacity duration-200
          ">
            <button
              onClick={handleCopy}
              className="p-2 md:p-1.5 bg-gray-800/95 hover:bg-gray-700/50 rounded-md md:rounded-lg transition-colors"
              title="Sao chép tin nhắn"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
        </div>
        <span className="text-xs text-gray-500 mt-1">Bạn</span>
      </div>
    </div>
  );
};
