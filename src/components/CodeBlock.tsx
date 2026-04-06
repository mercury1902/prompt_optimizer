import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { CodeBlockProps } from '../types/chat';

export function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  return (
    <div className="relative group my-3 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-800 px-3 py-1 text-xs text-gray-400">
        <span>{language}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
          aria-label="Copy code"
        >
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0 0 0.5rem 0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
