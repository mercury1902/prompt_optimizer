import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockWithCopyProps {
  code: string;
  language?: string;
}

export const CodeBlockWithCopy: React.FC<CodeBlockWithCopyProps> = ({
  code,
  language = 'typescript',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Đã sao chép code!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code my-3 rounded-lg overflow-hidden bg-gray-950 border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-all text-xs"
        >
          {copied ? (
            <><Check className="w-3 h-3 text-green-400" /><span>Đã sao chép!</span></>
          ) : (
            <><Copy className="w-3 h-3" /><span>Sao chép</span></>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};
