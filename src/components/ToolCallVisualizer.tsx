import { useState } from 'react';
import { Wrench, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { ToolExecution } from '../types/chat';

interface ToolCallVisualizerProps {
  toolExecution: ToolExecution;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-600',
    label: 'Pending',
  },
  running: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
    label: 'Running',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-300 dark:border-green-700',
    label: 'Completed',
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-300 dark:border-red-700',
    label: 'Error',
  },
};

export function ToolCallVisualizer({ toolExecution }: ToolCallVisualizerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toolCallId, name, arguments: args, status, result, error, duration } = toolExecution;

  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const isRunning = status === 'running';

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  const formatArgs = (args: Record<string, unknown>) => {
    try {
      return JSON.stringify(args, null, 2);
    } catch {
      return String(args);
    }
  };

  return (
    <div
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden my-2`}
      role="region"
      aria-label={`Tool call: ${name}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:opacity-80 transition-opacity"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Wrench className={`w-4 h-4 ${config.color} flex-shrink-0`} />
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
            {name}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} border ${config.borderColor} flex-shrink-0`}>
            {config.label}
          </span>
          {duration && status !== 'pending' && status !== 'running' && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {formatDuration(duration)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusIcon className={`w-4 h-4 ${config.color} ${isRunning ? 'animate-spin' : ''}`} />
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-3 space-y-3">
            <div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Tool Call ID
              </span>
              <code className="block mt-1 text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                {toolCallId}
              </code>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Arguments
              </span>
              <pre className="mt-1 text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 overflow-x-auto">
                {formatArgs(args)}
              </pre>
            </div>

            {status === 'completed' && result !== undefined && (
              <div>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Result
                </span>
                <pre className="mt-1 text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-800 text-gray-700 dark:text-gray-300 overflow-x-auto max-h-48 overflow-y-auto">
                  {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
                </pre>
              </div>
            )}

            {status === 'error' && error && (
              <div>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  Error
                </span>
                <div className="mt-1 text-xs bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-2 rounded">
                  {error}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
