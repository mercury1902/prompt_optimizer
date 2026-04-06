import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, MessageSquare, Terminal, FileText, GitCompare } from 'lucide-react';
import { toast } from 'sonner';
import type { ParsedPromptResult } from '../../utils/prompt-response-parser';
import {
  storePromptForChat,
  formatOptimizedPrompt,
  extractCommand,
} from '../../utils/prompt-response-parser';

type TabType = 'optimized' | 'command' | 'compare';

interface OptimizedResultViewProps {
  result: ParsedPromptResult;
  originalInput: string;
}

export const OptimizedResultView: React.FC<OptimizedResultViewProps> = ({
  result,
  originalInput,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('optimized');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Đã sao chép');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUseInChat = () => {
    const promptToStore =
      activeTab === 'optimized'
        ? formatOptimizedPrompt(result.optimizedPrompt)
        : activeTab === 'command'
          ? extractCommand(result.suggestedCommand)
          : formatOptimizedPrompt(result.optimizedPrompt);

    storePromptForChat(promptToStore);
    toast.success('Đã lưu prompt. Chuyển về trang chủ...');

    // Redirect to home page after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const tabs = [
    { id: 'optimized' as TabType, label: 'Optimized', icon: FileText },
    { id: 'command' as TabType, label: 'Command', icon: Terminal },
    { id: 'compare' as TabType, label: 'Compare', icon: GitCompare },
  ];

  const renderOptimizedTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Prompt đã tối ưu</h4>
        <button
          onClick={() => handleCopy(formatOptimizedPrompt(result.optimizedPrompt), 'optimized')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all text-sm"
        >
          {copiedField === 'optimized' ? (
            <>
              <Check className="w-4 h-4" />
              <span>Đã copy</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Prompt</span>
            </>
          )}
        </button>
      </div>
      <div className="rounded-xl bg-gray-950/50 border border-gray-700/50 p-4">
        <SyntaxHighlighter
          language="markdown"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.6',
          }}
        >
          {formatOptimizedPrompt(result.optimizedPrompt)}
        </SyntaxHighlighter>
      </div>
    </div>
  );

  const renderCommandTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Command đề xuất</h4>
        <button
          onClick={() => handleCopy(extractCommand(result.suggestedCommand), 'command')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all text-sm"
        >
          {copiedField === 'command' ? (
            <>
              <Check className="w-4 h-4" />
              <span>Đã copy</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Command</span>
            </>
          )}
        </button>
      </div>

      {/* Command Code Block */}
      <div className="rounded-xl bg-gray-950/50 border border-purple-500/30 p-4">
        <SyntaxHighlighter
          language="bash"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.6',
          }}
        >
          {extractCommand(result.suggestedCommand)}
        </SyntaxHighlighter>
      </div>

      {/* Explanation */}
      {result.explanation && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Giải thích</h4>
          <p className="text-sm text-gray-300 leading-relaxed">{result.explanation}</p>
        </div>
      )}
    </div>
  );

  const renderCompareTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            Original
          </h4>
          <div className="rounded-xl bg-gray-950/50 border border-gray-700/50 p-4">
            <p className="text-sm text-gray-400 whitespace-pre-wrap">{originalInput}</p>
          </div>
        </div>

        {/* Optimized */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Optimized
          </h4>
          <div className="rounded-xl bg-gray-950/50 border border-green-500/30 p-4">
            <SyntaxHighlighter
              language="markdown"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: 0,
                background: 'transparent',
                fontSize: '0.875rem',
                lineHeight: '1.6',
              }}
            >
              {formatOptimizedPrompt(result.optimizedPrompt)}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>

      {/* Improvements Summary */}
      <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <h4 className="text-sm font-medium text-blue-300 mb-2">Cải thiện</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-green-400">+</span>
            <span>Thêm context rõ ràng và yêu cầu cụ thể</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">+</span>
            <span>Chỉ định output format và constraints</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">+</span>
            <span>Gợi ý command phù hợp cho workflow</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-900/70 backdrop-blur-xl overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-700/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-blue-300 border-b-2 border-blue-500 bg-blue-500/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'optimized' && renderOptimizedTab()}
        {activeTab === 'command' && renderCommandTab()}
        {activeTab === 'compare' && renderCompareTab()}
      </div>

      {/* Action Bar */}
      <div className="border-t border-gray-700/50 p-4 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Sử dụng prompt đã tối ưu để có kết quả tốt hơn với Claude Code
        </p>
        <button
          onClick={handleUseInChat}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <MessageSquare className="w-4 h-4" />
          Use in Chat
        </button>
      </div>
    </div>
  );
};

export default OptimizedResultView;
