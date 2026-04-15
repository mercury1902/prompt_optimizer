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
    <div className="relative group/code my-3 rounded-lg overflow-hidden bg-black/30 border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50 uppercase tracking-wider">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all text-xs"
        >
          {copied ? (
            <><Check className="w-3 h-3 text-green-400" /><span>Đã sao chép!</span></>
          ) : (
            <><Copy className="w-3 h-3" /><span>Sao chép</span></>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-white/80 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};
