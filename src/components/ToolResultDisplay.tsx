import { useState } from 'react';
import { Search, Terminal, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface ExecuteCodeResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

interface ToolResultDisplayProps {
  toolName: string;
  result: unknown;
}

function WebSearchDisplay({ results }: { results: WebSearchResult[] }) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedItems(newSet);
  };

  if (!Array.isArray(results) || results.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        No search results found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
        Search Results ({results.length})
      </div>
      {results.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-start justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="font-medium text-sm text-blue-600 dark:text-blue-400 truncate">
                {item.title}
              </h4>
              <p className="text-xs text-green-600 dark:text-green-400 truncate mt-0.5">
                {item.url}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                aria-label="Open link"
              >
                <ExternalLink className="w-3 h-3 text-gray-500" />
              </a>
              {expandedItems.has(index) ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </button>
          {expandedItems.has(index) && (
            <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
                {item.snippet}
              </p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Visit page <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExecuteCodeDisplay({ result }: { result: ExecuteCodeResult }) {
  const [showStderr, setShowStderr] = useState(true);
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);

  const hasError = result.exitCode !== 0 || (result.stderr && result.stderr.trim().length > 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Code Execution
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              result.exitCode === 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            Exit {result.exitCode}
          </span>
        </div>
        <button
          onClick={() => setIsOutputExpanded(!isOutputExpanded)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          {isOutputExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {isOutputExpanded && (
        <div className="space-y-2">
          {result.stdout && (
            <div className="rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-gray-800 px-3 py-1.5">
                <span className="text-xs text-gray-400">stdout</span>
              </div>
              <div className="relative group">
                <SyntaxHighlighter
                  language="text"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '0.75rem',
                    borderRadius: '0 0 0.5rem 0.5rem',
                    fontSize: '0.75rem',
                    lineHeight: '1.5',
                    maxHeight: '300px',
                    overflow: 'auto',
                  }}
                >
                  {result.stdout}
                </SyntaxHighlighter>
                <button
                  onClick={() => navigator.clipboard.writeText(result.stdout)}
                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {result.stderr && showStderr && (
            <div className="rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-red-900/50 px-3 py-1.5 border-b border-red-800">
                <span className="text-xs text-red-300">stderr</span>
                <button
                  onClick={() => setShowStderr(false)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Hide
                </button>
              </div>
              <div className="relative group">
                <SyntaxHighlighter
                  language="text"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '0.75rem',
                    borderRadius: '0 0 0.5rem 0.5rem',
                    fontSize: '0.75rem',
                    lineHeight: '1.5',
                    maxHeight: '200px',
                    overflow: 'auto',
                    backgroundColor: '#450a0a',
                  }}
                >
                  {result.stderr}
                </SyntaxHighlighter>
                <button
                  onClick={() => navigator.clipboard.writeText(result.stderr)}
                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-red-800 text-red-200 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {result.stderr && !showStderr && (
            <button
              onClick={() => setShowStderr(true)}
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Show stderr output
            </button>
          )}

          {!result.stdout && !result.stderr && (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
              No output produced.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ToolResultDisplay({ toolName, result }: ToolResultDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getIcon = () => {
    switch (toolName) {
      case 'web_search':
        return <Search className="w-4 h-4 text-blue-500" />;
      case 'execute_code':
        return <Terminal className="w-4 h-4 text-green-500" />;
      default:
        return <Terminal className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderContent = () => {
    if (toolName === 'web_search' && Array.isArray(result)) {
      return <WebSearchDisplay results={result as WebSearchResult[]} />;
    }

    if (toolName === 'execute_code' && typeof result === 'object' && result !== null) {
      const execResult = result as ExecuteCodeResult;
      if ('stdout' in execResult || 'stderr' in execResult || 'exitCode' in execResult) {
        return <ExecuteCodeDisplay result={execResult} />;
      }
    }

    return (
      <div className="rounded-lg overflow-hidden">
        <div className="relative group">
          <SyntaxHighlighter
            language="json"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              lineHeight: '1.5',
              maxHeight: '300px',
              overflow: 'auto',
            }}
          >
            {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
          </SyntaxHighlighter>
          <button
            onClick={() =>
              navigator.clipboard.writeText(
                typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
              )
            }
            className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
          >
            Copy
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-hidden my-2"
      role="region"
      aria-label={`Tool result: ${toolName}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{toolName}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Result</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && <div className="p-3 border-t border-gray-200 dark:border-gray-700">{renderContent()}</div>}
    </div>
  );
}
