import React, { useState } from 'react';
import { X, Download, Copy, FileText, Code } from 'lucide-react';

interface ConversationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: Date;
  }>;
}

export const ConversationExportModal: React.FC<ConversationExportModalProps> = ({
  isOpen,
  onClose,
  messages,
}) => {
  const [format, setFormat] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const exportToMarkdown = () => {
    return messages
      .map((msg) => {
        const role = msg.role === 'user' ? 'Bạn' : 'ClaudeKit';
        const time = msg.createdAt
          ? new Date(msg.createdAt).toLocaleString('vi-VN')
          : '';
        return `## ${role} (${time})\n\n${msg.content}\n`;
      })
      .join('\n---\n\n');
  };

  const exportToJSON = () => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        messageCount: messages.length,
        messages: messages.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt?.toISOString(),
        })),
      },
      null,
      2
    );
  };

  const getExportContent = () => {
    return format === 'markdown' ? exportToMarkdown() : exportToJSON();
  };

  const handleDownload = () => {
    const content = getExportContent();
    const blob = new Blob([content], {
      type: format === 'markdown' ? 'text/markdown' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.${format === 'markdown' ? 'md' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getExportContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Không thể sao chép. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-100">Xuất cuộc trò chuyện</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-2 p-1 bg-gray-800/50 rounded-xl">
            <button
              onClick={() => setFormat('markdown')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                format === 'markdown'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Markdown
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                format === 'json'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Code className="w-4 h-4" />
              JSON
            </button>
          </div>

          <div className="text-sm text-gray-400">
            <p>{messages.length} tin nhắn sẽ được xuất</p>
            <p className="text-xs mt-1">
              Kích thước ước tính: ~{(getExportContent().length / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-gray-700/50">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-200 transition-all"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Đã sao chép!' : 'Sao chép'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all"
          >
            <Download className="w-4 h-4" />
            Tải xuống
          </button>
        </div>
      </div>
    </div>
  );
};
